(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});

  function setOverlayVisible(overlay, visible) {
    if (!overlay) return;
    overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
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

    function syncForm() {
      const state = WebMapper.state;
      if (!state) return;

      widthInput.value = state.canvas?.width ?? WebMapper.defaults.canvas.width;
      heightInput.value = state.canvas?.height ?? WebMapper.defaults.canvas.height;
      showGridInput.checked = state.settings?.showGrid ?? WebMapper.defaults.settings.showGrid;
      animationSelect.value = state.settings?.animation ?? WebMapper.defaults.settings.animation;
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

    applyButton?.addEventListener('click', () => {
      const state = WebMapper.state;
      if (!state) return;

      const width = Number(widthInput.value);
      const height = Number(heightInput.value);

      state.settings = state.settings || {};
      state.canvas = state.canvas || {};

      state.settings.showGrid = showGridInput.checked;
      state.settings.animation = animationSelect.value;

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

      setOverlayVisible(overlay, false);
    });

    resetButton?.addEventListener('click', () => {
      const defaults = WebMapper.defaults;
      if (!defaults) return;

      widthInput.value = defaults.canvas.width;
      heightInput.value = defaults.canvas.height;
      showGridInput.checked = defaults.settings.showGrid;
      animationSelect.value = defaults.settings.animation;
    });
  }

  document.addEventListener('DOMContentLoaded', bindSettings);
})();
