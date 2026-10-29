const gameState = {
  running: false,
  paused: false,
  selectedProvince: "",
  startTimestamp: 0,
  elapsedMs: 0,
  timerId: null,
  timerStarted: false,
  points: 0,
  errors: 0,
  totalMunicipalities: 0,
  remainingMunicipalities: [],
  currentTarget: "",
  solvedTargets: new Set(),
};

let map = null;
let geoJsonLayer = null;
let basemapLayer = null;
let loadedGeoJsonPath = null;
const MIN_MAP_ZOOM = 1;

document.addEventListener("DOMContentLoaded", () => {
  setupGameControls();
});

function setupGameControls() {
  const startBtn = document.getElementById("start-game-btn");
  const restartBtn = document.getElementById("restart-game-btn");
  const provinceSelect = document.getElementById("game-province-select");

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
    setPrompt("Избери област и натисни „Старт“.");
    setStatus("Готов за начало.");

    if (gameState.selectedProvince) {
      const geoJsonPath = typeof window.getProvinceGeoJsonPath === "function" ? window.getProvinceGeoJsonPath(gameState.selectedProvince) : null;
      if (geoJsonPath) {
        await loadGeoJsonMap(geoJsonPath);
      }
    } else {
      resetGameDisplay();
    }
  });

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
  resetRuntimeState();

  const provinceData = window.BULGARIAN_PROVINCES || window.PROVINCE_DATA || {};
  const municipalities = Array.isArray(provinceData[provinceName]) ? provinceData[provinceName] : [];
  if (municipalities.length === 0) {
    setStatus("Липсват общини за избраната област в data.js.");
    setPrompt("Няма данни за въпроси.");
    return;
  }

  const geoJsonPath = typeof window.getProvinceGeoJsonPath === "function" ? window.getProvinceGeoJsonPath(provinceName) : null;
  if (!geoJsonPath) {
    setStatus("Липсва .geojson конфигурация за областта.");
    setPrompt("Добави .geojson файл и опитай пак.");
    return;
  }

  gameState.remainingMunicipalities = shuffleArray([...municipalities]);
  gameState.totalMunicipalities = municipalities.length;
  gameState.currentTarget = gameState.remainingMunicipalities[0];
  gameState.running = true;
  startTimer();
  const startBtn = document.getElementById("start-game-btn");
  if (startBtn) startBtn.disabled = true;

  if (loadedGeoJsonPath === geoJsonPath && geoJsonLayer && basemapLayer) {
    geoJsonLayer.eachLayer((layer) => layer.unbindTooltip());
    geoJsonLayer.setStyle(getFeatureStyle);
    fitMapToProvince(geoJsonLayer.getBounds(), { padding: [20, 20] });
  } else {
    const loaded = await loadGeoJsonMap(geoJsonPath);
    if (!loaded) {
      resetRuntimeState();
      if (startBtn) startBtn.disabled = false;
      return;
    }
  }

  if (startBtn) {
    startBtn.disabled = false;
    startBtn.textContent = "Пауза";
  }

  setPrompt(`Къде е община ${gameState.currentTarget}?`);
  setStatus(`Открий всички ${gameState.totalMunicipalities} общини.`);
  updateScore();
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
    }).addTo(map);

    geoJsonLayer.addTo(map);

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
  const name = getFeatureName(feature);
  const isSolved = Array.from(gameState.solvedTargets).some(target => isPathMatchingTarget(name, target));
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
  const name = getFeatureName(layer.feature);
  const isSolved = Array.from(gameState.solvedTargets).some(target => isPathMatchingTarget(name, target));

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
  const name = getFeatureName(layer.feature);
  const isSolved = Array.from(gameState.solvedTargets).some(target => isPathMatchingTarget(name, target));

  if (isSolved) return;

  if (geoJsonLayer) {
    geoJsonLayer.resetStyle(layer);
  }
}

function onFeatureClick(e) {
  if (!gameState.running) return;

  const layer = e.target;
  const name = getFeatureName(layer.feature);
  const isSolved = Array.from(gameState.solvedTargets).some(target => isPathMatchingTarget(name, target));

  if (isSolved) return;

  const target = gameState.currentTarget;
  const isCorrect = isPathMatchingTarget(name, target);

  if (isCorrect) {
    gameState.points += 1;
    updateScore();
    setGameFeedback("Правилно!", true);
    setStatus(`Вярно! ${target}`);
    layer.bindTooltip(target, {
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
  gameState.solvedTargets.add(gameState.currentTarget);
  gameState.remainingMunicipalities = gameState.remainingMunicipalities.slice(1);
  if (gameState.remainingMunicipalities.length === 0) {
    finishGame();
    return;
  }
  gameState.currentTarget = gameState.remainingMunicipalities[0];
  setPrompt(`Къде е община ${gameState.currentTarget}?`);
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
  gameState.startTimestamp = 0;
  gameState.elapsedMs = 0;
  gameState.timerStarted = false;
  gameState.points = 0;
  gameState.errors = 0;
  gameState.totalMunicipalities = 0;
  gameState.remainingMunicipalities = [];
  gameState.currentTarget = "";
  gameState.solvedTargets.clear();
  setTimerDisplay(0);
  updateScore();
  updateErrorCount();
  setGameFeedback("");
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
  if (!Number.isFinite(currentBestMs) || timeMs < currentBestMs) {
    localStorage.setItem(keys.milliseconds, String(Math.floor(timeMs)));
    localStorage.setItem(keys.time, formatTime(timeMs));
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
