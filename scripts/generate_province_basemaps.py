"""Generate local Esri relief images; requires numpy, rasterio, pyproj, and shapely."""

import json
import math
import os
import tempfile
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
import rasterio
from rasterio.io import MemoryFile
from rasterio.features import rasterize
from rasterio.transform import from_bounds
from pyproj import Transformer
from shapely.geometry import shape
from shapely.ops import transform as transform_geometry


ROOT = Path(__file__).resolve().parents[1]
GEO_DIR = ROOT / "assets" / "geo"
OUTPUT_DIR = ROOT / "assets" / "provinces_basemaps"
CACHE_DIR = Path(tempfile.gettempdir()) / "bg-municipalities-shaded-relief"
TILE_URL = (
    "https://server.arcgisonline.com/ArcGIS/rest/services/"
    "World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}"
)
EARTH_RADIUS = 6_378_137
WORLD_WIDTH = 2 * math.pi * EARTH_RADIUS
TARGET_PIXELS = 1400
MAX_ZOOM = 13
WGS84_TO_MERCATOR = Transformer.from_crs("EPSG:4326", "EPSG:3857", always_xy=True)


def points(coordinates):
    if isinstance(coordinates, list) and len(coordinates) >= 2 and all(
        isinstance(value, (int, float)) for value in coordinates[:2]
    ):
        yield coordinates[0], coordinates[1]
    elif isinstance(coordinates, list):
        for item in coordinates:
            yield from points(item)


def mercator_y(latitude):
    latitude = max(-85.05112878, min(85.05112878, latitude))
    radians = math.radians(latitude)
    return EARTH_RADIUS * math.log(math.tan(math.pi / 4 + radians / 2))


def province_extent(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    coordinates = [
        point
        for feature in data.get("features", [])
        for point in points(feature["geometry"]["coordinates"])
    ]
    if not coordinates:
        raise ValueError(f"No province boundary coordinates in {path.name}")

    longitudes, latitudes = zip(*coordinates)
    west = EARTH_RADIUS * math.radians(min(longitudes))
    east = EARTH_RADIUS * math.radians(max(longitudes))
    south = mercator_y(min(latitudes))
    north = mercator_y(max(latitudes))
    return west, south, east, north


def image_tiles(extent):
    west, south, east, north = extent
    largest_dimension = max(east - west, north - south)
    zoom = min(
        MAX_ZOOM,
        max(8, math.ceil(math.log2(TARGET_PIXELS * WORLD_WIDTH / (256 * largest_dimension)))),
    )
    resolution = WORLD_WIDTH / (256 * (2**zoom))
    half_world = WORLD_WIDTH / 2
    left = math.floor((west + half_world) / resolution)
    right = math.ceil((east + half_world) / resolution)
    top = math.floor((half_world - north) / resolution)
    bottom = math.ceil((half_world - south) / resolution)
    tile_ids = {
        (zoom, tile_x // 256, tile_y // 256)
        for tile_x in range(left, right)
        for tile_y in range(top, bottom)
    }
    return zoom, resolution, (left, top, right, bottom), tile_ids


def download_tile(tile_id):
    zoom, tile_x, tile_y = tile_id
    path = CACHE_DIR / str(zoom) / str(tile_y) / f"{tile_x}.jpg"
    if path.exists() and path.stat().st_size > 100:
        return tile_id, path

    path.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(
        TILE_URL.format(z=zoom, x=tile_x, y=tile_y),
        headers={"User-Agent": "BG-Municipalities static basemap generator"},
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                content_type = response.headers.get("Content-Type", "")
                payload = response.read()
            if not content_type.startswith("image/"):
                raise ValueError(f"Unexpected tile response for {tile_id}: {content_type}")
            temporary_path = path.with_suffix(".tmp")
            temporary_path.write_bytes(payload)
            os.replace(temporary_path, path)
            return tile_id, path
        except (OSError, urllib.error.URLError):
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def read_tile(path):
    with rasterio.open(path) as dataset:
        image = dataset.read(out_dtype="uint8")
    if image.shape[0] < 3:
        raise ValueError(f"Basemap tile has fewer than 3 color channels: {path}")
    return image[:3]


def write_province_image(path, extent, tile_paths):
    zoom, _, pixel_bounds, required_tiles = image_tiles(extent)
    left, top, right, bottom = pixel_bounds
    tile_columns = [tile_x for _, tile_x, _ in required_tiles]
    tile_rows = [tile_y for _, _, tile_y in required_tiles]
    first_column, first_row = min(tile_columns), min(tile_rows)
    mosaic = np.empty(
        (3, (max(tile_rows) - first_row + 1) * 256, (max(tile_columns) - first_column + 1) * 256),
        dtype=np.uint8,
    )

    for tile_id in required_tiles:
        _, tile_x, tile_y = tile_id
        mosaic[
            :,
            (tile_y - first_row) * 256 : (tile_y - first_row + 1) * 256,
            (tile_x - first_column) * 256 : (tile_x - first_column + 1) * 256,
        ] = read_tile(tile_paths[tile_id])

    image = mosaic[
        :,
        top - first_row * 256 : bottom - first_row * 256,
        left - first_column * 256 : right - first_column * 256,
    ]
    geojson = json.loads((GEO_DIR / f"{path.stem}.geojson").read_text(encoding="utf-8"))
    province_shapes = [
        (
            transform_geometry(WGS84_TO_MERCATOR.transform, shape(feature["geometry"])),
            1,
        )
        for feature in geojson.get("features", [])
    ]
    west, south, east, north = extent
    province_mask = rasterize(
        province_shapes,
        out_shape=(image.shape[1], image.shape[2]),
        transform=from_bounds(west, south, east, north, image.shape[2], image.shape[1]),
        fill=0,
        dtype="uint8",
    )
    image[:, province_mask == 0] = np.array([246, 251, 245], dtype=np.uint8)[:, None]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with rasterio.Env():
        with rasterio.open(
            path,
            "w",
            driver="JPEG",
            width=image.shape[2],
            height=image.shape[1],
            count=3,
            dtype="uint8",
            quality=92,
        ) as output:
            output.write(image)
    return zoom, image.shape[2], image.shape[1]


def main():
    provinces = []
    required_tiles = set()
    for geojson_path in sorted(GEO_DIR.glob("*.geojson")):
        extent = province_extent(geojson_path)
        zoom, _, _, tile_ids = image_tiles(extent)
        provinces.append((geojson_path, extent, zoom))
        required_tiles.update(tile_ids)

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Downloading {len(required_tiles)} unique Esri relief tiles...")
    with ThreadPoolExecutor(max_workers=8) as executor:
        tile_paths = dict(executor.map(download_tile, required_tiles))

    print(f"Generating {len(provinces)} province basemaps...")
    for geojson_path, extent, _ in provinces:
        output_path = OUTPUT_DIR / f"{geojson_path.stem}.jpg"
        zoom, width, height = write_province_image(output_path, extent, tile_paths)
        print(f"{output_path.name}: zoom {zoom}, {width}x{height}")


if __name__ == "__main__":
    main()
