const gameState = {
  running: false,
  paused: false,
  starting: false,
  selectedProvince: "",
  startTimestamp: 0,
  elapsedMs: 0,
  timerId: null,
  timerStarted: false,
  points: 0,
  errors: 0,
  totalMunicipalities: 0,
  remainingMunicipalities: [],
  currentTarget: null,
  solvedTargets: new Set(),
};

let map = null;
let geoJsonLayer = null;
let basemapLayer = null;
let provinceBoundariesLayer = null;
let loadedGeoJsonPath = null;
const MIN_MAP_ZOOM = 1;
const COUNTRY_GEOJSON_PATH = "assets/geo/bulgaria.geojson";

document.addEventListener("DOMContentLoaded", () => {
  setupGameControls();
});

function setupGameControls() {
  const startBtn = document.getElementById("start-game-btn");
  const restartBtn = document.getElementById("restart-game-btn");
  const provinceSelect = document.getElementById("game-province-select");

  window.addEventListener("basemapchange", () => {
    if (!map || !basemapLayer) return;
    if (window.basemapEnabled) {
      basemapLayer.addTo(map);
      geoJsonLayer.bringToFront();
    } else {
      map.removeLayer(basemapLayer);
    }
  });

  window.addEventListener("provinceboundarieschange", () => {
    if (!map || !provinceBoundariesLayer) return;
    if (window.provinceBoundariesEnabled) {
      provinceBoundariesLayer.addTo(map);
    } else {
      map.removeLayer(provinceBoundariesLayer);
    }
  });

  gameState.selectedProvince = provinceSelect.value;
  if (startBtn && provinceSelect) {
    startBtn.disabled = !provinceSelect.value;
  }
  if (restartBtn && provinceSelect) {
    restartBtn.disabled = !provinceSelect.value;
  }

  provinceSelect.addEventListener("change", async () => {
    gameState.selectedProvince = provinceSelect.value;
    gameState.paused = false;
    if (startBtn) {
      startBtn.disabled = !provinceSelect.value;
      startBtn.textContent = "Старт";
    }
    if (restartBtn) restartBtn.disabled = !provinceSelect.value;

    resetRuntimeState();
    setPrompt(provinceSelect.value === window.BULGARIA_GAME_VALUE
      ? "Натисни „Старт“, за да играеш за цяла България."
      : "Избери област и натисни „Старт“.");
    setStatus(provinceSelect.value === window.BULGARIA_GAME_VALUE
      ? "Готов за начало — 265 общини."
      : "Готов за начало.");

    if (gameState.selectedProvince) {
      const geoJsonPath = getGameGeoJsonPath(gameState.selectedProvince);
      if (geoJsonPath) {
        await loadGeoJsonMap(geoJsonPath);
      }
    } else {
      resetGameDisplay();
    }
  });

  const initialGeoJsonPath = getGameGeoJsonPath(gameState.selectedProvince);
  if (initialGeoJsonPath) {
    loadGeoJsonMap(initialGeoJsonPath);
  }

  startBtn.addEventListener("click", async () => {
    if (gameState.running) {
      updateElapsedTime();
      gameState.running = false;
      gameState.paused = true;
      stopTimer();
      startBtn.textContent = "Продължи";
      setStatus("Играта е на пауза.");
      return;
    }

    if (gameState.paused) {
      // Resume the game
      gameState.paused = false;
      gameState.running = true;
      resumeTimer();
      startBtn.textContent = "Пауза";
      setStatus(`Продължаваме! Общо оставащи: ${gameState.remainingMunicipalities.length}`);
      return;
    }

    if (!gameState.selectedProvince || startBtn.disabled) {
      setStatus("Избери област преди старт.");
      return;
    }
    await startGame(gameState.selectedProvince);
    if (gameState.running) {
      startBtn.textContent = "Пауза";
    }
  });

  restartBtn.addEventListener("click", async () => {
    if (!gameState.selectedProvince || restartBtn.disabled) return;

    restartBtn.disabled = true;
    await startGame(gameState.selectedProvince);
    restartBtn.disabled = !gameState.selectedProvince;
  });

  // Handle tab switching in app: invalidate Leaflet map size when returning to game section
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".nav-btn");
    if (btn && ["learn-section", "records-section"].includes(btn.dataset.target)) {
      abortGame();
    }
    if (btn && btn.getAttribute("data-target") === "game-section") {
      if (map) {
        setTimeout(() => {
          map.invalidateSize();
        }, 150);
      }
    }
  });
}

async function startGame(provinceName) {
  const sessionId = ++gameSessionId;
  resetRuntimeState();

  const isCountryGame = provinceName === window.BULGARIA_GAME_VALUE;
  const provinceData = window.BULGARIAN_PROVINCES || window.PROVINCE_DATA || {};
  const municipalities = Array.isArray(provinceData[provinceName]) ? provinceData[provinceName] : [];
  if (!isCountryGame && municipalities.length === 0) {
    setStatus("Липсват общини за избраната област в data.js.");
    setPrompt("Няма данни за въпроси.");
    return;
  }

  const geoJsonPath = getGameGeoJsonPath(provinceName);
  if (!geoJsonPath) {
    setStatus("Липсва .geojson конфигурация за областта.");
    setPrompt("Добави .geojson файл и опитай пак.");
    return;
  }

  const startBtn = document.getElementById("start-game-btn");
  gameState.starting = true;

  if (loadedGeoJsonPath === geoJsonPath && geoJsonLayer && basemapLayer) {
    geoJsonLayer.eachLayer((layer) => layer.unbindTooltip());
    geoJsonLayer.setStyle(getFeatureStyle);
    fitMapToProvince(geoJsonLayer.getBounds(), { padding: [20, 20] });
  } else {
    const loaded = await loadGeoJsonMap(geoJsonPath);
    if (sessionId !== gameSessionId) return;
    if (!loaded) {
      gameState.starting = false;
      resetRuntimeState();
      if (startBtn) startBtn.disabled = false;
      return;
    }
  }

  if (sessionId !== gameSessionId) return;
  gameState.starting = false;

  const targets = [];
  if (isCountryGame) {
    geoJsonLayer.eachLayer((layer) => {
      const feature = layer.feature;
      if (feature.properties?.border_type !== "municipality") return;
      targets.push({
        name: getFeatureName(feature),
        id: feature.properties.ekatte,
        code: feature.properties.ekatte,
      });
    });
  } else {
    targets.push(...municipalities.map((name) => ({ name })));
  }

  if (targets.length !== (isCountryGame ? 265 : municipalities.length)) {
    setStatus(isCountryGame
      ? `Картата трябва да съдържа 265 общини, но съдържа ${targets.length}.`
      : "Не бяха намерени общини за избраната област.");
    setPrompt("Провери GeoJSON данните и опитай отново.");
    return;
  }

  const nameCounts = new Map();
  targets.forEach(({ name }) => nameCounts.set(name, (nameCounts.get(name) || 0) + 1));
  targets.forEach((target) => {
    target.label = nameCounts.get(target.name) > 1 ? `${target.name} (${target.code})` : target.name;
  });
  gameState.remainingMunicipalities = shuffleArray(targets);
  gameState.totalMunicipalities = targets.length;
  gameState.currentTarget = gameState.remainingMunicipalities[0];
  gameState.running = true;
  startTimer();

  if (startBtn) {
    startBtn.disabled = false;
    startBtn.textContent = "Пауза";
  }

  setPrompt(`Къде е община ${gameState.currentTarget.label}?`);
  setStatus(`Открий всички ${gameState.totalMunicipalities} общини.`);
  updateScore();
}

function getGameGeoJsonPath(provinceName) {
  if (provinceName === window.BULGARIA_GAME_VALUE) return COUNTRY_GEOJSON_PATH;
  return typeof window.getProvinceGeoJsonPath === "function"
    ? window.getProvinceGeoJsonPath(provinceName)
    : null;
}

async function loadGeoJsonMap(geoJsonPath) {
  const mapContainer = getMapContainer();
  mapContainer.classList.add("loading");

  try {
    if (map) {
      map.stop();
    }

    if (!map) {
      mapContainer.innerHTML = "";
      map = L.map(mapContainer, {
        fadeAnimation: false,
        minZoom: MIN_MAP_ZOOM,
        maxBoundsViscosity: 0.8,
      }).setView([42.7339, 25.4858], 8);
    } else {
      if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
        geoJsonLayer = null;
      }
      if (basemapLayer) {
        map.removeLayer(basemapLayer);
        basemapLayer = null;
      }
      if (provinceBoundariesLayer) {
        map.removeLayer(provinceBoundariesLayer);
        provinceBoundariesLayer = null;
      }
      loadedGeoJsonPath = null;
      map.setMaxBounds(null);
      map.invalidateSize();
    }

    const response = await fetch(geoJsonPath, { cache: "no-store" });
    if (!response.ok) throw new Error(`Грешка при зареждане (${response.status})`);
    const geoJson = await response.json();

    const features = Array.isArray(geoJson.features) ? geoJson.features : [];
    if (features.length === 0) throw new Error("GeoJSON няма features.");

    geoJsonLayer = L.geoJSON(geoJson, {
      style: getFeatureStyle,
      onEachFeature: onEachFeature
    });

    const basemapPath = geoJsonPath
      .replace(/^assets\/geo\//, "assets/provinces_basemaps/")
      .replace(/\.geojson$/i, ".jpg");
    const basemapImage = new Image();
    await new Promise((resolve, reject) => {
      basemapImage.onload = resolve;
      basemapImage.onerror = () => reject(new Error(`Базовата карта не може да се зареди: ${basemapPath}`));
      basemapImage.src = basemapPath;
      if (basemapImage.complete && basemapImage.naturalWidth > 0) resolve();
    });
    basemapLayer = L.imageOverlay(basemapPath, geoJsonLayer.getBounds(), {
      attribution: "Terrain basemap &copy; Esri",
      interactive: false,
    });
    if (window.basemapEnabled) basemapLayer.addTo(map);

    geoJsonLayer.addTo(map);
    if (geoJsonPath === COUNTRY_GEOJSON_PATH) {
      provinceBoundariesLayer = await window.addProvinceBoundariesLayer(map);
    }

    // Auto-zoom to fit the selected province
    const provinceBounds = geoJsonLayer.getBounds();
    fitMapToProvince(provinceBounds, { padding: [20, 20], animate: false });
    const southWest = provinceBounds.getSouthWest();
    const northEast = provinceBounds.getNorthEast();
    const latitudePadding = provinceBounds.getNorth() - provinceBounds.getSouth();
    const longitudePadding = provinceBounds.getEast() - provinceBounds.getWest();
    map.setMaxBounds(
      L.latLngBounds(
        [southWest.lat - latitudePadding * 0.35, southWest.lng - longitudePadding * 0.75],
        [northEast.lat + latitudePadding * 0.35, northEast.lng + longitudePadding * 0.75]
      )
    );
    loadedGeoJsonPath = geoJsonPath;
    mapContainer.classList.remove("loading");

    return true;
  } catch (error) {
    loadedGeoJsonPath = null;
    mapContainer.classList.remove("loading");
    mapContainer.innerHTML = `<p class="placeholder">GeoJSON не може да се зареди: ${error.message}</p>`;
    setStatus("Възникна проблем при зареждането на картата.");
    return false;
  }
}

function fitMapToProvince(bounds, options) {
  map.setMinZoom(MIN_MAP_ZOOM);
  const padding = L.point(options.padding || [0, 0]);
  map.setMinZoom(map.getBoundsZoom(bounds, false, padding));
  map.fitBounds(bounds, options);
}

function getFeatureName(feature, fallbackIndex) {
  const props = feature?.properties || {};
  return props.name_bg || props.name || props.NAME || props.municipality || `Община ${fallbackIndex}`;
}

// Mask is generated by Turf.js directly inside loadGeoJsonMap now

function getFeatureStyle(feature) {
  const isSolved = isFeatureSolved(feature);
  if (isSolved) {
    return {
      fillColor: '#6fb783',
      fillOpacity: 0.7,
      color: '#1f2a1f',
      weight: 2,
      className: 'municipality-boundary is-correct'
    };
  }
  return {
    fillColor: '#ffffff',
    fillOpacity: 0.25,
    color: '#718477',
    weight: 2,
    className: 'municipality-boundary'
  };
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: onFeatureClick
  });
}

function highlightFeature(e) {
  const layer = e.target;
  const isSolved = isFeatureSolved(layer.feature);

  if (isSolved || !gameState.running) return;

  layer.setStyle({
    fillColor: '#fff4b3',
    fillOpacity: 0.6,
    color: '#8dcf9b',
    weight: 2.5
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  const layer = e.target;
  const isSolved = isFeatureSolved(layer.feature);

  if (isSolved) return;

  if (geoJsonLayer) {
    geoJsonLayer.resetStyle(layer);
  }
}

function onFeatureClick(e) {
  if (!gameState.running) return;

  const layer = e.target;
  const name = getFeatureName(layer.feature);
  const isSolved = isFeatureSolved(layer.feature);

  if (isSolved) return;

  const target = gameState.currentTarget;
  const isCorrect = target.id
    ? layer.feature.properties?.ekatte === target.id
    : isPathMatchingTarget(name, target.name);

  if (isCorrect) {
    gameState.points += 1;
    updateScore();
    setGameFeedback("Правилно!", true);
    setStatus(`Вярно! ${target.name}`);
    layer.bindTooltip(target.name, {
      permanent: true,
      direction: "center",
      className: "municipality-label",
      interactive: false,
      opacity: 1
    });
    layer.openTooltip();
    markCurrentMunicipalitySolved();

    if (geoJsonLayer) {
      geoJsonLayer.setStyle(getFeatureStyle);
    }
  } else {
    gameState.errors += 1;
    updateErrorCount();
    setGameFeedback(`Грешно! Ти избра ${name || "община без име"}`);
    layer.setStyle({
      fillColor: '#f0a4a4',
      fillOpacity: 0.95,
      color: '#d77474',
      weight: 2
    });

    setTimeout(() => {
      if (geoJsonLayer) {
        geoJsonLayer.resetStyle(layer);
      }
    }, 350);
  }
}

function isPathMatchingTarget(pathId, municipalityName) {
  const pathCyr = normalizeCyr(pathId);
  const targetCyr = normalizeCyr(municipalityName);
  if (pathCyr && targetCyr && (pathCyr === targetCyr || pathCyr.includes(targetCyr) || targetCyr.includes(pathCyr))) {
    return true;
  }

  const pathLatin = normalizeLatin(pathId) || normalizeLatin(transliterateBgToLatin(pathId));
  const targetLatin = normalizeLatin(transliterateBgToLatin(municipalityName));
  if (pathLatin && targetLatin && (pathLatin === targetLatin || pathLatin.includes(targetLatin) || targetLatin.includes(pathLatin))) {
    return true;
  }

  return false;
}



function markCurrentMunicipalitySolved() {
  gameState.solvedTargets.add(getTargetKey(gameState.currentTarget));
  gameState.remainingMunicipalities = gameState.remainingMunicipalities.slice(1);
  if (gameState.remainingMunicipalities.length === 0) {
    finishGame();
    return;
  }
  gameState.currentTarget = gameState.remainingMunicipalities[0];
  setPrompt(`Къде е община ${gameState.currentTarget.label}?`);
}

function getTargetKey(target) {
  return target.id || target.name;
}

function isFeatureSolved(feature) {
  const featureKey = gameState.selectedProvince === window.BULGARIA_GAME_VALUE
    ? feature.properties?.ekatte
    : getFeatureName(feature);
  return gameState.solvedTargets.has(featureKey);
}

function transliterateBgToLatin(text) {
  const map = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sht", ъ: "a", ь: "y", ю: "yu", я: "ya" };
  return String(text || "").toLowerCase().split("").map((ch) => map[ch] ?? ch).join("");
}

function normalizeLatin(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function normalizeCyr(value) {
  return String(value || "").toLowerCase().replace(/[^а-я0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function timerLoop() {
  if (!gameState.running) return;
  updateElapsedTime();
  gameState.timerId = requestAnimationFrame(timerLoop);
}

function updateElapsedTime() {
  if (!gameState.timerStarted) return;
  gameState.elapsedMs = performance.now() - gameState.startTimestamp;
  setTimerDisplay(gameState.elapsedMs);
}

function startTimer() {
  if (gameState.timerStarted) return;
  gameState.timerStarted = true;
  gameState.startTimestamp = performance.now();
  gameState.running = true;
  gameState.timerId = requestAnimationFrame(timerLoop);
}

function resumeTimer() {
  // Shift startTimestamp so the elapsed time continues from where it was
  gameState.startTimestamp = performance.now() - gameState.elapsedMs;
  gameState.timerId = requestAnimationFrame(timerLoop);
}

function finishGame() {
  gameState.running = false;
  stopTimer();
  const startBtn = document.getElementById("start-game-btn");
  if (startBtn) startBtn.textContent = "Старт";
  setPrompt("Поздравления! Откри всички общини.");
  setStatus(`Завърши! Време: ${formatTime(gameState.elapsedMs)}`);
  saveBestRecord(gameState.elapsedMs);
}

function stopTimer() {
  if (gameState.timerId) {
    cancelAnimationFrame(gameState.timerId);
    gameState.timerId = null;
  }
}

function resetRuntimeState() {
  stopTimer();
  gameState.running = false;
  gameState.paused = false;
  gameState.starting = false;
  gameState.startTimestamp = 0;
  gameState.elapsedMs = 0;
  gameState.timerStarted = false;
  gameState.points = 0;
  gameState.errors = 0;
  gameState.totalMunicipalities = 0;
  gameState.remainingMunicipalities = [];
  gameState.currentTarget = null;
  gameState.solvedTargets.clear();
  setTimerDisplay(0);
  updateScore();
  updateErrorCount();
  setGameFeedback("");
}

let gameSessionId = 0;

function abortGame() {
  if (!gameState.running && !gameState.paused && !gameState.starting) return;

  gameSessionId += 1;
  resetRuntimeState();
  if (geoJsonLayer) {
    geoJsonLayer.eachLayer((layer) => layer.unbindTooltip());
    geoJsonLayer.setStyle(getFeatureStyle);
  }

  const startBtn = document.getElementById("start-game-btn");
  const restartBtn = document.getElementById("restart-game-btn");
  if (startBtn) {
    startBtn.disabled = !gameState.selectedProvince;
    startBtn.textContent = "Старт";
  }
  if (restartBtn) restartBtn.disabled = !gameState.selectedProvince;

  setPrompt(gameState.selectedProvince === window.BULGARIA_GAME_VALUE
    ? "Натисни „Старт“, за да играеш за цяла България."
    : "Избери област и натисни „Старт“.");
  setStatus("Играта е прекратена.");
}

function resetGameDisplay() {
  resetRuntimeState();
  setPrompt("Избери област и натисни „Старт“.");
  setStatus("Готов за начало.");

  if (map) {
    map.setMinZoom(MIN_MAP_ZOOM);
    map.setMaxBounds(null);
  }

  if (geoJsonLayer && map) {
    map.removeLayer(geoJsonLayer);
    geoJsonLayer = null;
  }

  if (basemapLayer && map) {
    map.removeLayer(basemapLayer);
    basemapLayer = null;
  }
  if (provinceBoundariesLayer && map) {
    map.removeLayer(provinceBoundariesLayer);
    provinceBoundariesLayer = null;
  }
  loadedGeoJsonPath = null;

  if (map) {
    map.setView([42.7339, 25.4858], 8);
    map.invalidateSize();
  } else {
    const container = getMapContainer();
    if (container) {
      container.innerHTML = '<p class="placeholder">Избери област и натисни "Старт".</p>';
    }
  }

  const container = getMapContainer();
  if (container) {
    container.style.setProperty('--map-bg', 'none');
  }
}

function getMapContainer() {
  return document.getElementById("map-container") || document.getElementById("svg-map-container");
}

function updateScore() {
  const scoreEl = document.getElementById("game-score");
  if (scoreEl) scoreEl.textContent = `${gameState.points} / ${gameState.totalMunicipalities}`;
}

function updateErrorCount() {
  const errorsEl = document.getElementById("game-errors");
  if (errorsEl) errorsEl.textContent = String(gameState.errors);
}

function setGameFeedback(message, isCorrect = false) {
  const feedbackEl = document.getElementById("game-feedback");
  if (feedbackEl) {
    feedbackEl.textContent = message;
    feedbackEl.classList.toggle("is-correct", isCorrect);
  }
}

function setPrompt(message) {
  const promptEl = document.getElementById("game-prompt");
  if (promptEl) promptEl.textContent = message;
}

function setStatus(message) {
  const status = document.getElementById("game-status");
  if (status) status.textContent = message;
}

function setTimerDisplay(timeMs) {
  const timer = document.getElementById("game-timer");
  if (timer) timer.textContent = formatTime(timeMs);
}

function saveBestRecord(timeMs) {
  if (!gameState.selectedProvince) {
    setStatus("Не може да се запише рекорд без избрана област.");
    return;
  }

  const keys = window.getProvinceRecordKeys(gameState.selectedProvince);
  const currentBestMs = Number.parseInt(localStorage.getItem(keys.milliseconds), 10);
  const currentBestErrors = Number.parseInt(localStorage.getItem(keys.errors), 10);

  if (!Number.isFinite(currentBestMs) || timeMs < currentBestMs) {
    localStorage.setItem(keys.milliseconds, String(Math.floor(timeMs)));
    localStorage.setItem(keys.time, formatTime(timeMs));
  }

  if (!Number.isFinite(currentBestErrors) || gameState.errors < currentBestErrors) {
    localStorage.setItem(keys.errors, String(gameState.errors));
  }

  if (typeof window.renderBestRecord === "function") {
    window.renderBestRecord();
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function formatTime(rawMs) {
  const ms = Math.max(0, Math.floor(rawMs));
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(milliseconds).padStart(3, "0")}`;
}
