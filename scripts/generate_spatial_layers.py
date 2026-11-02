import argparse
import json
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import geopandas as gpd
import shapely
from shapely.geometry import mapping


ROOT = Path(__file__).resolve().parents[1]
SPATIAL_DATA_DIR = ROOT / "assets" / "spatial_data"
PROVINCE_GEO_DIR = ROOT / "assets" / "geo"
OUTPUT_DIR = SPATIAL_DATA_DIR / "provinces"
RIVERS_SOURCE = SPATIAL_DATA_DIR / "rivers.geojson"
ROAD_SOURCE_CRS = "EPSG:32635"
GEOGRAPHIC_CRS = "EPSG:4326"
OVERPASS_QUERY = (
    '[out:json][timeout:180];'
    '(way["waterway"="river"](41.0,22.0,44.5,29.0););'
    "out geom;"
)
OVERPASS_ENDPOINTS = (
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
)


def download_rivers():
    query = urllib.parse.urlencode({"data": OVERPASS_QUERY})
    last_error = None
    for endpoint in OVERPASS_ENDPOINTS:
        request = urllib.request.Request(
            f"{endpoint}?{query}",
            headers={"User-Agent": "BG-Municipalities spatial layer generator"},
        )
        try:
            with urllib.request.urlopen(request, timeout=240) as response:
                osm_data = json.loads(response.read())
            break
        except (urllib.error.URLError, TimeoutError) as error:
            last_error = error
    else:
        raise RuntimeError("Unable to download river data from the Overpass endpoints.") from last_error

    features = []
    for element in osm_data.get("elements", []):
        coordinates = [
            [point["lon"], point["lat"]]
            for point in element.get("geometry", [])
        ]
        if len(coordinates) < 2:
            continue
        features.append({
            "type": "Feature",
            "id": f"way/{element['id']}",
            "properties": {
                **element.get("tags", {}),
                "osm_id": element["id"],
            },
            "geometry": {"type": "LineString", "coordinates": coordinates},
        })

    if not features:
        raise ValueError("The Overpass query returned no river features.")
    RIVERS_SOURCE.write_text(
        json.dumps(
            {"type": "FeatureCollection", "features": features},
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )
    print(f"Downloaded {len(features)} OSM river ways to {RIVERS_SOURCE.relative_to(ROOT)}.")


def load_lines(path, source_crs):
    features = gpd.read_file(path)
    if features.crs is None:
        features = features.set_crs(source_crs)
    else:
        features = features.set_crs(source_crs, allow_override=True)
    features = features[features.geometry.geom_type.isin(["LineString", "MultiLineString"])]
    return features.to_crs(GEOGRAPHIC_CRS)


def load_province_mask(path):
    boundaries = gpd.read_file(path)
    if boundaries.crs is None:
        boundaries = boundaries.set_crs(GEOGRAPHIC_CRS)
    else:
        boundaries = boundaries.set_crs(GEOGRAPHIC_CRS, allow_override=True)
    return shapely.union_all(boundaries.geometry.array)


def round_coordinates(value):
    if isinstance(value, (list, tuple)):
        return [round_coordinates(item) for item in value]
    if isinstance(value, float):
        return round(value, 5)
    return value


def write_feature_collection(features, path):
    records = []
    for _, row in features.iterrows():
        geometry = row.geometry
        if geometry is None or geometry.is_empty:
            continue
        geometry = shapely.force_2d(geometry).simplify(0.00002, preserve_topology=False)
        if geometry.is_empty:
            continue

        properties = {}
        for key, value in row.drop(labels="geometry").items():
            if value is None:
                continue
            if hasattr(value, "item"):
                value = value.item()
            if isinstance(value, float) and not (float("-inf") < value < float("inf")):
                continue
            properties[key] = value
        geojson_geometry = mapping(geometry)
        records.append({
            "type": "Feature",
            "properties": properties,
            "geometry": {
                **geojson_geometry,
                "coordinates": round_coordinates(geojson_geometry["coordinates"]),
            },
        })

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            {"type": "FeatureCollection", "features": records},
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )


def clip_and_write(source, mask, path, layer_name):
    clipped = gpd.clip(source, mask, keep_geom_type=True)
    if layer_name == "roads":
        clipped = clipped.sort_values("RoadClass", ascending=False)
    write_feature_collection(clipped, path)
    return len(clipped)


def main():
    parser = argparse.ArgumentParser(
        description="Download rivers and generate province-clipped GeoJSON basemap overlays."
    )
    parser.add_argument(
        "--refresh-rivers",
        action="store_true",
        help="Download a fresh river dataset from OpenStreetMap Overpass.",
    )
    args = parser.parse_args()

    if args.refresh_rivers or not RIVERS_SOURCE.exists():
        download_rivers()

    sources = {
        "roads": load_lines(SPATIAL_DATA_DIR / "road_network.geojson", ROAD_SOURCE_CRS),
        "railways": load_lines(SPATIAL_DATA_DIR / "railways.geojson", GEOGRAPHIC_CRS),
        "rivers": load_lines(RIVERS_SOURCE, GEOGRAPHIC_CRS),
    }

    regions = sorted(
        path for path in PROVINCE_GEO_DIR.glob("*.geojson")
        if path.name not in {"provinces.geojson"}
    )
    for region_path in regions:
        region_name = region_path.stem
        mask = load_province_mask(region_path)
        output_path = OUTPUT_DIR / region_name
        counts = {
            layer_name: clip_and_write(
                source,
                mask,
                output_path / f"{layer_name}.geojson",
                layer_name,
            )
            for layer_name, source in sources.items()
        }
        print(
            f"{region_name}: "
            + ", ".join(f"{layer_name}={count}" for layer_name, count in counts.items())
        )


if __name__ == "__main__":
    main()
