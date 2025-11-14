// assets/main.js

const STORAGE_KEY = 'webMapperStateV1';

const DEFAULT_STATE = {
  settings: {
    audioVolume: '0.5',
    audioMuted: false,
    qualityLevel: 1
  },
  map: 
  {
    name: 'starterMap'
  }
};

let state = null;

function uid(prefix) {
  return prefix + '-' + Math.random().toString(36).slice(2, 9);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);

    if (!parsed.settings) parsed.settings = {};

    if (!parsed.settings.tabBarPosition) parsed.settings.tabBarPosition = 'bottom';
    if (typeof parsed.settings.backgroundUrl !== 'string') parsed.settings.backgroundUrl = '';
    if (!parsed.settings.backgroundMode) parsed.settings.backgroundMode = 'envelop';
    if (typeof parsed.settings.backgroundOpacity !== 'number') parsed.settings.backgroundOpacity = 1;
    if (typeof parsed.settings.backgroundColor !== 'string') parsed.settings.backgroundColor = '#1e1f22';
    if (typeof parsed.settings.backgroundVideoMuted !== 'boolean') parsed.settings.backgroundVideoMuted = true;

    if (!parsed.tabs || !parsed.tabs.length) {
      parsed.tabs = structuredClone(DEFAULT_STATE.tabs);
      parsed.activeTabId = parsed.tabs[0].id;
    }

    return parsed;
  } catch (e) {
    console.warn('Failed to load state:', e);
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

function renderAll(context) {
  renderTerrain(context);
  renderFeatures(context);
  renderGUI(context);
}

document.addEventListener('DOMContentLoaded', () => {
  const context = {
    elements: {
      appRoot: document.getElementById('app-root'),      
      settingsOverlay: document.getElementById('settings-overlay'),
      settingsClose: document.getElementById('settings-close'),
      exportJsonBtn: document.getElementById('export-json-btn'),
      importJsonFile: document.getElementById('import-json-file'),
      audioVolumeSlider: document.getElementById('audio-volume-slider'),
      audioVolumeValue: document.getElementById('audio-volume-value'),      
    },
    getState: () => state,
    setState: value => {
      state = value;
    },
    getDefaultState: () => structuredClone(DEFAULT_STATE),
    uid,
    saveState: () => saveState(),
    loadState: () => loadState(),
    renderAll: () => renderAll(context),
    renderTerrain: () => renderTerrain(context),
    renderFeatures: () => renderFeatures(context),
    renderGUI: () => renderGUI(context),
    renderSettings: () => renderSettings(context),
    messages: Messages
  };

  state = loadState();

    if (state.map) {
        setupMap(context);
    }
  
  setupSettings(context);

  renderAll(context);
});
