import { persistentMap } from "@nanostores/persistent";

const DEFAULTS = {
  waveCount: 10,
  waveSpeed: 1.0,
  waveThickness: 1.0,
  wavePalette: "rainbow",
  customColor1: "#4f46e5",
  customColor2: "#06b6d4",
  auroraIntensity: 1.0,
  particlesEnabled: true,
  blurAmount: 2,
};

const STORAGE_PREFIX = "visualSettings:";

function migrate() {
  if (typeof localStorage === "undefined") return;
  try {
    for (const key of Object.keys(DEFAULTS)) {
      const fullKey = STORAGE_PREFIX + key;
      const item = localStorage.getItem(fullKey);
      if (item === null) continue;
      let parsed;
      try {
        parsed = JSON.parse(item);
      } catch {
        localStorage.removeItem(fullKey);
        continue;
      }
      if (parsed !== null && typeof parsed === "object") {
        localStorage.removeItem(fullKey);
      }
    }
  } catch (e) {
    // ignore migration errors
  }
}

migrate();

const $visualSettings = persistentMap(STORAGE_PREFIX, DEFAULTS);

function setVisualSetting(key, value) {
  $visualSettings.setKey(key, value);
}

function resetVisualSettings() {
  for (const key of Object.keys(DEFAULTS)) {
    $visualSettings.setKey(key, DEFAULTS[key]);
  }
}

export {
  $visualSettings,
  setVisualSetting,
  resetVisualSettings,
  DEFAULTS,
};
