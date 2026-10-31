const PROVINCE_ASSETS = {
  Благоевград: {
    border: "Bulgaria_Blagoevgrad_Province_location_map.svg",
    label: "Blagoevgrad_Oblast_map.png",
  },
  Бургас: {
    border: "Bulgaria_Burgas_Province_location_map.svg",
    label: "Burgas_Oblast_map.png",
  },
  Варна: {
    border: "Bulgaria_Varna_Province_location_map.svg",
    label: "Varna_Oblast_map.png",
  },
  Велико_Търново: {
    border: "Bulgaria_Veliko_Tarnovo_Province_location_map.svg",
    label: "VelikoTarnovo_Oblast_map.png",
  },
  Видин: {
    border: "Bulgaria_Vidin_Province_location_map.svg",
    label: "Vidin_Oblast_map.png",
  },
  Враца: {
    border: "Bulgaria_Vratsa_Province_location_map.svg",
    label: "Vraca_Oblast_map.png",
  },
  Габрово: {
    border: "Bulgaria_Gabrovo_Province_location_map.svg",
    label: "Gabrovo_Oblast_map_bg.png",
  },
  Добрич: {
    border: "Bulgaria_Dobrich_Province_location_map.svg",
    label: "Dobric_Oblast_map.png",
  },
  Кърджали: {
    border: "Bulgaria_Kardzhali_Province_location_map.svg",
    label: "Kardzali_Oblast_map.png",
  },
  Кюстендил: {
    border: "Bulgaria_Kyustendil_Province_location_map.svg",
    label: "Kyustendil_Oblast_map.png",
  },
  Ловеч: {
    border: "Bulgaria_Lovech_Province_location_map.svg",
    label: "Lovec_Oblast_map.png",
  },
  Монтана: {
    border: "Bulgaria_Montana_Province_location_map.svg",
    label: "Montana_Oblast_map.png",
  },
  Пазарджик: {
    border: "Bulgaria_Pazardzhik_Province_location_map.svg",
    label: "Pazardzik_Oblast_map.png",
  },
  Перник: {
    border: "Bulgaria_Pernik_Province_location_map.svg",
    label: "Pernik_Oblast_map.png",
  },
  Плевен: {
    border: "Bulgaria_Pleven_Province_location_map.svg",
    label: "Pleven_Oblast_map.png",
  },
  Пловдив: {
    border: "Bulgaria_Plovdiv_Province_location_map.svg",
    label: "Plovdiv_Oblast_map.png",
  },
  Разград: {
    border: "Bulgaria_Razgrad_Province_location_map.svg",
    label: "Razgrad_Oblast_map.png",
  },
  Русе: {
    border: "Bulgaria_Ruse_Province_location_map.svg",
    label: "Ruse_Oblast_map.png",
  },
  Силистра: {
    border: "Bulgaria_Silistra_Province_location_map.svg",
    label: "Silistra_Oblast_map.png",
  },
  Сливен: {
    border: "Bulgaria_Sliven_Province_location_map.svg",
    label: "Sliven_Oblast_map.png",
  },
  Смолян: {
    border: "Bulgaria_Smolyan_Province_location_map.svg",
    label: "Smolian_Oblast_map.png",
  },
  София_град: {
    border: "Bulgaria_Sofiya_Province_location_map.svg",
    label: "Sofia_Municipality_Oblast_map.png",
  },
  Софийска_област: {
    border: "Bulgaria_Sofiyska_Province_location_map.svg",
    label: "Sofia_Oblast_map.png",
  },
  Стара_Загора: {
    border: "Bulgaria_Stara_Zagora_Province_location_map.svg",
    label: "StaraZagora_Oblast_map.png",
  },
  Търговище: {
    border: "Bulgaria_Targovishte_Province_location_map.svg",
    label: "Targoviste_Oblast_map.png",
  },
  Хасково: {
    border: "Bulgaria_Haskovo_Province_location_map.svg",
    label: "Haskovo_Oblast_map.png",
  },
  Шумен: {
    border: "Bulgaria_Shumen_Province_location_map.svg",
    label: "Sumen_Oblast_map.png",
  },
  Ямбол: {
    border: "Bulgaria_Yambol_Province_location_map.svg",
    label: "Yambol_Oblast_map.png",
  },
};

const PROVINCE_RECORD_KEY_PREFIX = "Личен рекорд - ";
window.BULGARIA_GAME_VALUE = "__bulgaria__";
const PROVINCE_DATA = window.BULGARIAN_PROVINCES || {};
const GEOJSON_BASE_PATH = "assets/geo";
const PROVINCE_GEOJSON = {
  Благоевград: "blagoevgrad.geojson",
  Бургас: "burgas.geojson",
  Варна: "varna.geojson",
  "Велико Търново": "veliko_tarnovo.geojson",
  Видин: "vidin.geojson",
  Враца: "vratsa.geojson",
  Габрово: "gabrovo.geojson",
  Добрич: "dobrich.geojson",
  Кърджали: "kardzhali.geojson",
  Кюстендил: "kyustendil.geojson",
  Ловеч: "lovech.geojson",
  Монтана: "montana.geojson",
  Пазарджик: "pazardzhik.geojson",
  Перник: "pernik.geojson",
  Плевен: "pleven.geojson",
  Пловдив: "plovdiv.geojson",
  Разград: "razgrad.geojson",
  Русе: "ruse.geojson",
  Силистра: "silistra.geojson",
  Сливен: "sliven.geojson",
  Смолян: "smolyan.geojson",
  "Софийска област": "sofiyska_oblast.geojson",
  "София-град": "sofiya_grad.geojson",
  "Стара Загора": "stara_zagora.geojson",
  Търговище: "targovishte.geojson",
  Хасково: "haskovo.geojson",
  Шумен: "shumen.geojson",
  Ямбол: "yambol.geojson",
};
const AVAILABLE_LABEL_FILES = new Set([
  "Blagoevgrad_Oblast_map.png",
  "Burgas_Oblast_map.png",
  "Dobric_Oblast_map.png",
  "Gabrovo_Oblast_map_bg.png",
  "Haskovo_Oblast_map.png",
  "Kardzali_Oblast_map.png",
  "Kyustendil_Oblast_map.png",
  "Lovec_Oblast_map.png",
  "Montana_Oblast_map.png",
  "Pazardzik_Oblast_map.png",
  "Pernik_Oblast_map.png",
  "Pleven_Oblast_map.png",
  "Plovdiv_Oblast_map.png",
  "Razgrad_Oblast_map.png",
  "Ruse_Oblast_map.png",
  "Silistra_Oblast_map.png",
  "Sliven_Oblast_map.png",
  "Smolian_Oblast_map.png",
  "Sofia_Municipality_Oblast_map.png",
  "Sofia_Oblast_map.png",
  "StaraZagora_Oblast_map.png",
  "Sumen_Oblast_map.png",
  "Targoviste_Oblast_map.png",
  "Varna_Oblast_map.png",
  "VelikoTarnovo_Oblast_map.png",
  "Vidin_Oblast_map.png",
  "Vraca_Oblast_map.png",
  "Yambol_Oblast_map.png",
]);

const state = {
  selectedProvinceLearn: "",
};

const BASEMAP_STORAGE_KEY = "bg-municipalities-basemap-enabled";
const PROVINCE_BOUNDARIES_STORAGE_KEY = "bg-municipalities-province-boundaries-enabled";
const PROVINCE_BOUNDARIES_PATH = "assets/geo/provinces.geojson";
window.basemapEnabled = localStorage.getItem(BASEMAP_STORAGE_KEY) !== "false";
window.provinceBoundariesEnabled = localStorage.getItem(PROVINCE_BOUNDARIES_STORAGE_KEY) !== "false";

let learnMap = null;
let learnGeoJsonLayer = null;
let learnBasemapLayer = null;
let learnProvinceBoundariesLayer = null;
let provinceBoundariesPromise = null;
let selectedLearnMunicipality = null;
let learnMapLoadPromise = null;
let learnMunicipalityNameCounts = new Map();

window.PROVINCE_ASSETS = PROVINCE_ASSETS;
window.PROVINCE_DATA = PROVINCE_DATA;
window.findProvinceAssetsByName = findProvinceAssetsByName;
window.getProvinceGeoJsonPath = getProvinceGeoJsonPath;
window.getProvinceRecordKeys = getProvinceRecordKeys;
window.addProvinceBoundariesLayer = addProvinceBoundariesLayer;

document.addEventListener("DOMContentLoaded", () => {
  validateLabelMappings();
  setupNavigation();
  setupBasemapControls();
  populateProvinceSelects();
  setupLearnSection();
  renderBestRecord();
});

function setupBasemapControls() {
  const basemapControls = [
    document.getElementById("learn-basemap-toggle"),
    document.getElementById("game-basemap-toggle"),
  ];

  basemapControls.forEach((control) => {
    control.checked = window.basemapEnabled;
    control.addEventListener("change", () => {
      window.basemapEnabled = control.checked;
      localStorage.setItem(BASEMAP_STORAGE_KEY, String(window.basemapEnabled));
      basemapControls.forEach((otherControl) => {
        otherControl.checked = window.basemapEnabled;
      });
      window.dispatchEvent(new Event("basemapchange"));
    });
  });

  window.addEventListener("basemapchange", () => {
    if (!learnMap || !learnBasemapLayer) return;
    if (window.basemapEnabled) {
      learnBasemapLayer.addTo(learnMap);
      learnGeoJsonLayer.bringToFront();
    } else {
      learnMap.removeLayer(learnBasemapLayer);
    }
  });

  const boundaryControls = [
    document.getElementById("learn-province-boundaries-toggle"),
    document.getElementById("game-province-boundaries-toggle"),
  ].filter(Boolean);
  const gameProvinceSelect = document.getElementById("game-province-select");
  const gameBoundaryControl = document.getElementById("game-province-boundaries-control");
  const updateGameBoundaryControl = () => {
    gameBoundaryControl.hidden = gameProvinceSelect.value !== window.BULGARIA_GAME_VALUE;
  };
  updateGameBoundaryControl();
  gameProvinceSelect.addEventListener("change", updateGameBoundaryControl);

  boundaryControls.forEach((control) => {
    control.checked = window.provinceBoundariesEnabled;
    control.addEventListener("change", () => {
      window.provinceBoundariesEnabled = control.checked;
      localStorage.setItem(PROVINCE_BOUNDARIES_STORAGE_KEY, String(window.provinceBoundariesEnabled));
      boundaryControls.forEach((otherControl) => {
        otherControl.checked = window.provinceBoundariesEnabled;
      });
      window.dispatchEvent(new Event("provinceboundarieschange"));
    });
  });

  window.addEventListener("provinceboundarieschange", () => {
    if (!learnMap || !learnProvinceBoundariesLayer) return;
    if (window.provinceBoundariesEnabled) {
      learnProvinceBoundariesLayer.addTo(learnMap);
    } else {
      learnMap.removeLayer(learnProvinceBoundariesLayer);
    }
  });
}

async function addProvinceBoundariesLayer(map) {
  if (!provinceBoundariesPromise) {
    provinceBoundariesPromise = fetch(PROVINCE_BOUNDARIES_PATH, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Грешка при зареждане на границите на областите (${response.status})`);
        return response.json();
      })
      .then((geoJson) => {
        if (!Array.isArray(geoJson.features) || geoJson.features.length !== 28) {
          throw new Error("Очакват се границите на 28 области.");
        }
        return geoJson;
      })
      .catch((error) => {
        provinceBoundariesPromise = null;
        throw error;
      });
  }

  const geoJson = await provinceBoundariesPromise;
  if (!map.getPane("provinceBoundaries")) {
    map.createPane("provinceBoundaries").style.zIndex = "640";
  }
  const layer = L.geoJSON(geoJson, {
    pane: "provinceBoundaries",
    interactive: false,
    style: {
      color: "#315b43",
      opacity: 0.95,
      weight: 1.75,
      fill: false,
    },
  });
  if (window.provinceBoundariesEnabled) layer.addTo(map);
  return layer;
}

function setupNavigation() {
  const buttons = Array.from(document.querySelectorAll(".nav-btn"));
  const sections = Array.from(document.querySelectorAll(".page-section"));

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      if (target !== "learn-section" &&
          document.querySelector('.nav-btn.is-active')?.dataset.target === "learn-section") {
        resetLearnSection();
      }

      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      sections.forEach((section) => {
        const isTarget = section.id === target;
        section.classList.toggle("is-visible", isTarget);
      });

      if (target === "records-section") {
        renderBestRecord();
      }

      if (target === "learn-section") {
        setTimeout(() => {
          if (learnMap) {
            learnMap.invalidateSize();
            fitLearnMapToCountry();
          } else {
            setupLearnMunicipalityMap();
          }
        }, 150);
      }
    });
  });
}

function resetLearnSection() {
  const select = document.getElementById("province-select");
  select.value = "";
  state.selectedProvinceLearn = "";
  renderLabelImage("", document.getElementById("label-image-container"));

  if (selectedLearnMunicipality && learnGeoJsonLayer) {
    selectedLearnMunicipality.unbindTooltip();
    learnGeoJsonLayer.resetStyle(selectedLearnMunicipality);
    selectedLearnMunicipality = null;
  }
  document.getElementById("learn-municipality-name").textContent = "Избери община на картата.";

  if (learnMap && learnGeoJsonLayer) {
    fitLearnMapToCountry();
  }
}

function populateProvinceSelects() {
  const dataProvinceNames = Object.keys(PROVINCE_DATA);
  const assetProvinceNames = Object.keys(PROVINCE_ASSETS).map((name) => name.replaceAll("_", " "));
  const provinceNames = (dataProvinceNames.length > 0 ? dataProvinceNames : assetProvinceNames).sort((a, b) =>
    a.localeCompare(b, "bg")
  );
  const selects = [document.getElementById("province-select"), document.getElementById("game-province-select")];

  selects.forEach((select) => {
    provinceNames.forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      select.append(option);
    });
  });
}

function setupLearnSection() {
  const select = document.getElementById("province-select");
  const container = document.getElementById("label-image-container");

  select.addEventListener("change", () => {
    state.selectedProvinceLearn = select.value;
    renderLabelImage(state.selectedProvinceLearn, container);
  });
}

function setupLearnMunicipalityMap() {
  if (learnMap || learnMapLoadPromise) return;

  const container = document.getElementById("learn-map-container");
  container.classList.add("loading");
  learnMapLoadPromise = loadLearnMunicipalityMap(container).finally(() => {
    learnMapLoadPromise = null;
  });
}

async function loadLearnMunicipalityMap(container) {
  try {
    const response = await fetch("assets/geo/bulgaria.geojson", { cache: "no-store" });
    if (!response.ok) throw new Error(`Грешка при зареждане на общините (${response.status})`);
    const geoJson = await response.json();
    const features = Array.isArray(geoJson.features)
      ? geoJson.features.filter((feature) => feature.properties?.border_type === "municipality")
      : [];
    if (features.length !== 265) {
      throw new Error(`Очакват се 265 общини, но са намерени ${features.length}.`);
    }

    learnMunicipalityNameCounts = new Map();
    features.forEach((feature) => {
      const name = getLearnMunicipalityBaseName(feature);
      learnMunicipalityNameCounts.set(name, (learnMunicipalityNameCounts.get(name) || 0) + 1);
    });

    container.replaceChildren();
    learnMap = L.map(container, { fadeAnimation: false }).setView([42.7339, 25.4858], 6);
    learnGeoJsonLayer = L.geoJSON({ ...geoJson, features }, {
      style: getLearnMunicipalityStyle,
      onEachFeature: setupLearnMunicipalityFeature,
    }).addTo(learnMap);

    const basemapPath = "assets/provinces_basemaps/bulgaria.jpg";
    const basemapImage = new Image();
    await new Promise((resolve, reject) => {
      basemapImage.onload = resolve;
      basemapImage.onerror = () => reject(new Error(`Базовата карта не може да се зареди: ${basemapPath}`));
      basemapImage.src = basemapPath;
      if (basemapImage.complete && basemapImage.naturalWidth > 0) resolve();
    });

    learnBasemapLayer = L.imageOverlay(basemapPath, learnGeoJsonLayer.getBounds(), {
      attribution: "Terrain basemap &copy; Esri",
      interactive: false,
    });
    if (window.basemapEnabled) learnBasemapLayer.addTo(learnMap);
    learnProvinceBoundariesLayer = await addProvinceBoundariesLayer(learnMap);
    learnGeoJsonLayer.bringToFront();
    learnGeoJsonLayer.eachLayer((layer) => {
      const path = layer.getElement();
      if (path) path.setAttribute("tabindex", "0");
    });
    container.classList.remove("loading");
    fitLearnMapToCountry();
  } catch (error) {
    container.classList.remove("loading");
    container.replaceChildren();
    const message = document.createElement("p");
    message.className = "placeholder";
    message.textContent = `Картата не може да се зареди: ${error.message}`;
    container.append(message);
    document.getElementById("learn-municipality-name").textContent = "Картата не е достъпна.";
  }
}

function getLearnMunicipalityStyle() {
  return {
    fillColor: "#ffffff",
    fillOpacity: 0.25,
    color: "#718477",
    weight: 2,
    className: "municipality-boundary",
  };
}

function setupLearnMunicipalityFeature(feature, layer) {
  layer.on({
    mouseover: () => {
      showLearnMunicipalityName(feature);
      if (selectedLearnMunicipality !== layer) {
        layer.setStyle({ fillColor: "#fff1b8", fillOpacity: 0.6, color: "#8dcf9b", weight: 2.5 });
        layer.bringToFront();
      }
    },
    mouseout: () => {
      if (selectedLearnMunicipality !== layer && learnGeoJsonLayer) {
        learnGeoJsonLayer.resetStyle(layer);
      }
      showSelectedLearnMunicipalityName();
    },
    click: () => selectLearnMunicipality(feature, layer),
    keypress: (event) => {
      if (event.originalEvent.key === "Enter" || event.originalEvent.key === " ") {
        L.DomEvent.preventDefault(event.originalEvent);
        selectLearnMunicipality(feature, layer);
      }
    },
  });
}

function selectLearnMunicipality(feature, layer) {
  if (selectedLearnMunicipality && learnGeoJsonLayer) {
    selectedLearnMunicipality.unbindTooltip();
    learnGeoJsonLayer.resetStyle(selectedLearnMunicipality);
  }
  selectedLearnMunicipality = layer;
  layer.setStyle({
    fillColor: "#6fb783",
    fillOpacity: 0.7,
    color: "#1f2a1f",
    weight: 3,
  });
  layer.bindTooltip(getLearnMunicipalityName(feature), {
    permanent: true,
    direction: "center",
    className: "municipality-label",
    interactive: false,
    opacity: 1,
  }).openTooltip();
  layer.bringToFront();
  showLearnMunicipalityName(feature);
}

function getLearnMunicipalityBaseName(feature) {
  const properties = feature.properties || {};
  return properties.name_bg || properties.name || "Община без име";
}

function getLearnMunicipalityName(feature) {
  const name = getLearnMunicipalityBaseName(feature);
  const properties = feature.properties || {};
  return learnMunicipalityNameCounts.get(name) > 1 && properties.ekatte
    ? `${name} (${properties.ekatte})`
    : name;
}

function showLearnMunicipalityName(feature) {
  document.getElementById("learn-municipality-name").textContent =
    `Община ${getLearnMunicipalityName(feature)}`;
}

function showSelectedLearnMunicipalityName() {
  const nameElement = document.getElementById("learn-municipality-name");
  if (!selectedLearnMunicipality) {
    nameElement.textContent = "Избери община на картата.";
    return;
  }
  showLearnMunicipalityName(selectedLearnMunicipality.feature);
}

function fitLearnMapToCountry() {
  if (!learnMap || !learnGeoJsonLayer) return;
  const bounds = learnGeoJsonLayer.getBounds();
  const padding = L.point(20, 20);
  const countryZoom = learnMap.getBoundsZoom(bounds, false, padding);
  learnMap.setMinZoom(countryZoom);
  learnMap.fitBounds(bounds, { padding: [20, 20], animate: false });
}

function renderLabelImage(provinceName, container) {
  container.innerHTML = "";

  if (!provinceName) {
    container.innerHTML = '<p class="placeholder">Избери област, за да заредиш изображение.</p>';
    container.style.setProperty('--map-bg', 'none');
    return;
  }

  const mapping = findProvinceAssetsByName(provinceName);
  if (!mapping) {
    container.innerHTML = `<p class="placeholder">Липсва файлова конфигурация за област: <code>${provinceName}</code></p>`;
    container.style.setProperty('--map-bg', 'none');
    return;
  }
  
  if (mapping.border) {
    container.style.setProperty('--map-bg', `url('assets/borders/${mapping.border}')`);
  } else {
    container.style.setProperty('--map-bg', 'none');
  }

  const imagePath = `assets/labels/${mapping.label}`;
  const image = document.createElement("img");
  image.className = "label-image";
  image.alt = `Карта с етикети на област ${provinceName.replaceAll("_", " ")}`;
  image.src = imagePath;

  image.addEventListener("load", () => {
    image.classList.add("fade-in");
  });

  image.addEventListener("error", () => {
    container.innerHTML = `<p class="placeholder">Липсва PNG файл: <code>${imagePath}</code></p>`;
  });

  container.appendChild(image);
}

function findProvinceAssetsByName(provinceName) {
  if (!provinceName) return null;
  if (PROVINCE_ASSETS[provinceName]) return PROVINCE_ASSETS[provinceName];

  const normalizedTarget = normalizeProvinceName(provinceName);
  const matchedKey = Object.keys(PROVINCE_ASSETS).find((key) => normalizeProvinceName(key) === normalizedTarget);
  return matchedKey ? PROVINCE_ASSETS[matchedKey] : null;
}

function normalizeProvinceName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "");
}

function validateLabelMappings() {
  Object.entries(PROVINCE_ASSETS).forEach(([province, mapping]) => {
    if (!AVAILABLE_LABEL_FILES.has(mapping.label)) {
      console.warn(`[Липсващ PNG] Провери assets/labels за област "${province}": ${mapping.label}`);
    }
  });
}

function getProvinceGeoJsonPath(provinceName) {
  const fileName = PROVINCE_GEOJSON[provinceName];
  return fileName ? `${GEOJSON_BASE_PATH}/${fileName}` : null;
}

function renderBestRecord() {
  const recordsBody = document.getElementById("records-body");
  if (!recordsBody) return;

  recordsBody.replaceChildren();
  Object.keys(PROVINCE_DATA)
    .sort((a, b) => a.localeCompare(b, "bg"))
    .forEach((provinceName) => {
      const row = document.createElement("tr");
      const provinceCell = document.createElement("td");
      const recordCell = document.createElement("td");
      const errorsCell = document.createElement("td");
      const keys = getProvinceRecordKeys(provinceName);

      provinceCell.textContent = provinceName;
      recordCell.textContent = localStorage.getItem(keys.time) || "Няма запис";
      const savedErrors = localStorage.getItem(keys.errors);
      errorsCell.textContent = savedErrors !== null ? savedErrors : "Няма запис";
      row.append(provinceCell, recordCell, errorsCell);
      recordsBody.append(row);
    });

  const countryRow = document.createElement("tr");
  const countryCell = document.createElement("td");
  const countryRecordCell = document.createElement("td");
  const countryErrorsCell = document.createElement("td");
  const countryKeys = getProvinceRecordKeys(window.BULGARIA_GAME_VALUE);

  countryCell.textContent = "България (265 общини)";
  countryRecordCell.textContent = localStorage.getItem(countryKeys.time) || "Няма запис";
  const countrySavedErrors = localStorage.getItem(countryKeys.errors);
  countryErrorsCell.textContent = countrySavedErrors !== null ? countrySavedErrors : "Няма запис";
  countryRow.append(countryCell, countryRecordCell, countryErrorsCell);
  recordsBody.append(countryRow);
}

function getProvinceRecordKeys(provinceName) {
  const provinceKey = `${PROVINCE_RECORD_KEY_PREFIX}${encodeURIComponent(provinceName)}`;
  return {
    time: provinceKey,
    milliseconds: `${provinceKey} (ms)`,
    errors: `${provinceKey} (errors)`,
  };
}

window.renderBestRecord = renderBestRecord;
