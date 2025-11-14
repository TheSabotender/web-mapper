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

    let initialUiScale = null;
    let previewUiScale = null;

    function normalizeUiScale(value) {
      return clamp(Number(value) || 100, 25, 200);
    }

    function updateUiScaleDisplay(value) {
      if (!uiScaleValue) return;
      const normalized = normalizeUiScale(value);
      uiScaleValue.textContent = `${normalized}%`;
    }

    function applyUiScalePreview(value) {
      const normalized = normalizeUiScale(value);
      previewUiScale = normalized;
      WebMapper.ui?.applyUiScale?.(normalized);
    }

    function resetUiScalePreview() {
      if (previewUiScale === null) return;
      if (initialUiScale !== null) {
        WebMapper.ui?.applyUiScale?.(initialUiScale);
      }
      previewUiScale = null;
    }

    function openOverlay() {
      syncForm();
      initialUiScale = normalizeUiScale(uiScaleInput?.value);
      previewUiScale = null;
      setOverlayVisible(overlay, true);
    }

    function closeOverlay({ revertPreview = true } = {}) {
      if (revertPreview) {
        resetUiScalePreview();
      }
      setOverlayVisible(overlay, false);
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

    openButton?.addEventListener('click', openOverlay);

    closeButton?.addEventListener('click', () => closeOverlay());

    overlay?.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeOverlay();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay && !overlay.hidden) {
        closeOverlay();
      }
    });

    uiScaleInput?.addEventListener('input', (event) => {
      const value = event.target.value;
      updateUiScaleDisplay(value);
      applyUiScalePreview(value);
    });

    applyButton?.addEventListener('click', () => {
      const state = WebMapper.state;
      if (!state) return;

      const width = Number(widthInput.value);
      const height = Number(heightInput.value);
      const uiScale = normalizeUiScale(uiScaleInput?.value);

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

      WebMapper.saveState?.();

      initialUiScale = uiScale;
      previewUiScale = null;

      closeOverlay({ revertPreview: false });
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
        applyUiScalePreview(defaults.settings.uiScale);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', bindSettings);
})();
