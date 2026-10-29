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

window.PROVINCE_ASSETS = PROVINCE_ASSETS;
window.PROVINCE_DATA = PROVINCE_DATA;
window.findProvinceAssetsByName = findProvinceAssetsByName;
window.getProvinceGeoJsonPath = getProvinceGeoJsonPath;
window.getProvinceRecordKeys = getProvinceRecordKeys;

document.addEventListener("DOMContentLoaded", () => {
  validateLabelMappings();
  setupNavigation();
  populateProvinceSelects();
  setupLearnSection();
  renderBestRecord();
});

function setupNavigation() {
  const buttons = Array.from(document.querySelectorAll(".nav-btn"));
  const sections = Array.from(document.querySelectorAll(".page-section"));

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      buttons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      sections.forEach((section) => {
        const isTarget = section.id === target;
        section.classList.toggle("is-visible", isTarget);
      });

      if (target === "records-section") {
        renderBestRecord();
      }
    });
  });
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
      const keys = getProvinceRecordKeys(provinceName);

      provinceCell.textContent = provinceName;
      recordCell.textContent = localStorage.getItem(keys.time) || "Няма запис";
      row.append(provinceCell, recordCell);
      recordsBody.append(row);
    });
}

function getProvinceRecordKeys(provinceName) {
  const provinceKey = `${PROVINCE_RECORD_KEY_PREFIX}${encodeURIComponent(provinceName)}`;
  return {
    time: provinceKey,
    milliseconds: `${provinceKey} (ms)`,
  };
}

window.renderBestRecord = renderBestRecord;
