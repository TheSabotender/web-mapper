(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});

  function setOverlayVisible(overlay, visible) {
    if (!overlay) return;
    overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
    overlay.hidden = !visible;
  }

  function bindSettings() {
    const overlay = document.getElementById('settings-overlay');
    const openButton = document.getElementById('open-settings');
    const closeButton = document.getElementById('close-settings');
    const applyButton = document.getElementById('apply-settings');
    const resetButton = document.getElementById('reset-settings');
    const widthInput = document.getElementById('settings-canvas-width');
    const heightInput = document.getElementById('settings-canvas-height');
    const showGridInput = document.getElementById('settings-show-grid');
    const animationSelect = document.getElementById('settings-animation');
    const uiScaleInput = document.getElementById('settings-ui-scale');
    const uiScaleValue = document.getElementById('settings-ui-scale-value');

    const clamp =
      WebMapper.utils?.clamp ||
      ((value, min, max) => Math.min(Math.max(value, min), max));

    function updateUiScaleDisplay(value) {
      if (!uiScaleValue) return;
      const normalized = clamp(Number(value) || 100, 25, 200);
      uiScaleValue.textContent = `${normalized}%`;
    }

    function syncForm() {
      const state = WebMapper.state;
      if (!state) return;

      widthInput.value = state.canvas?.width ?? WebMapper.defaults.canvas.width;
      heightInput.value = state.canvas?.height ?? WebMapper.defaults.canvas.height;
      showGridInput.checked = state.settings?.showGrid ?? WebMapper.defaults.settings.showGrid;
      animationSelect.value = state.settings?.animation ?? WebMapper.defaults.settings.animation;
      if (uiScaleInput) {
        const uiScale = state.settings?.uiScale ?? WebMapper.defaults.settings.uiScale;
        uiScaleInput.value = String(uiScale);
        updateUiScaleDisplay(uiScale);
      }
    }

    openButton?.addEventListener('click', () => {
      syncForm();
      setOverlayVisible(overlay, true);
    });

    closeButton?.addEventListener('click', () => setOverlayVisible(overlay, false));

    overlay?.addEventListener('click', (event) => {
      if (event.target === overlay) {
        setOverlayVisible(overlay, false);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setOverlayVisible(overlay, false);
      }
    });

    uiScaleInput?.addEventListener('input', (event) => {
      updateUiScaleDisplay(event.target.value);
    });

    applyButton?.addEventListener('click', () => {
      const state = WebMapper.state;
      if (!state) return;

      const width = Number(widthInput.value);
      const height = Number(heightInput.value);
      const uiScale = clamp(Number(uiScaleInput?.value) || 100, 25, 200);

      state.settings = state.settings || {};
      state.canvas = state.canvas || {};

      state.settings.showGrid = showGridInput.checked;
      state.settings.animation = animationSelect.value;
      state.settings.uiScale = uiScale;

      if (Number.isFinite(width) && Number.isFinite(height)) {
        state.canvas.width = width;
        state.canvas.height = height;
        if (typeof WebMapper.resize === 'function') {
          WebMapper.resize(width, height);
        }
      }

      if (typeof WebMapper.render === 'function') {
        WebMapper.render();
      }

      if (typeof WebMapper.updateAnimation === 'function') {
        WebMapper.updateAnimation();
      }

      WebMapper.ui?.applyUiScale?.(uiScale);

      setOverlayVisible(overlay, false);
    });

    resetButton?.addEventListener('click', () => {
      const defaults = WebMapper.defaults;
      if (!defaults) return;

      widthInput.value = defaults.canvas.width;
      heightInput.value = defaults.canvas.height;
      showGridInput.checked = defaults.settings.showGrid;
      animationSelect.value = defaults.settings.animation;
      if (uiScaleInput) {
        uiScaleInput.value = String(defaults.settings.uiScale);
        updateUiScaleDisplay(defaults.settings.uiScale);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', bindSettings);
})();
