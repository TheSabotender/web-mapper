(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});
  const ui = (WebMapper.ui = WebMapper.ui || {});

  ui.LandmarkControls = {
    init(context) {
      if (!context) return null;
      const references = context.references || {};
      const scaleInput = references.landmarkScale;
      const modeButtons = references.landmarkModeButtons || [];
      const imageButton = references.landmarkImageButton;
      const imagePicker = references.landmarkImagePicker;

      if (!scaleInput && !modeButtons.length && !imageButton) {
        return null;
      }

      const toolsState = (context.toolsState = context.toolsState || {});
      const defaults = { mode: 'select', scale: 1, imageName: '' };
      const landmark = (toolsState.landmark = Object.assign({}, defaults, toolsState.landmark));
      const clamp = context.clamp || ((value, min, max) => Math.min(Math.max(value, min), max));

      function syncMode() {
        const mode = landmark.mode === 'add' ? 'add' : 'select';
        landmark.mode = mode;
        modeButtons.forEach((button) => {
          const isActive = button.dataset.value === mode;
          button.classList.toggle('is-active', isActive);
          button.setAttribute('aria-pressed', String(isActive));
        });
      }

      function sync() {
        if (scaleInput) {
          const min = parseFloat(scaleInput.min) || 0.5;
          const max = parseFloat(scaleInput.max) || 3;
          const raw = Number(landmark.scale);
          const value = clamp(Number.isFinite(raw) ? raw : 1, min, max);
          scaleInput.value = String(value);
          landmark.scale = value;
          context.updateOutput?.('landmark-scale', `${Math.round(value * 100)}%`);
        }
        syncMode();
      }

      scaleInput?.addEventListener('input', (event) => {
        const min = parseFloat(scaleInput.min) || 0.5;
        const max = parseFloat(scaleInput.max) || 3;
        landmark.scale = clamp(parseFloat(event.target.value) || 1, min, max);
        sync();
        context.requestRender?.();
      });

      modeButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const { value } = button.dataset;
          if (!value || landmark.mode === value) {
            return;
          }
          landmark.mode = value;
          syncMode();
          context.requestRender?.();
        });
      });

      imageButton?.addEventListener('click', () => {
        imagePicker?.click();
      });

      imagePicker?.addEventListener('change', (event) => {
        const file = event.target.files && event.target.files[0];
        landmark.imageName = file ? file.name : '';
        context.requestRender?.();
      });

      sync();

      return {
        sync,
      };
    },
  };
})();
