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
      const imagePreview = imageButton?.querySelector('[data-landmark-image-preview]');

      const iconPicker = ui.LandmarkIconPicker?.init?.();

      if (!scaleInput && !modeButtons.length && !imageButton) {
        return null;
      }

      const defaultIcon = imageButton?.dataset.defaultIcon || 'assets/icons/location/castle.svg';      
      const landmark = { mode: 'select', scale: 1, iconPath: defaultIcon };
      const clamp =
        context.clamp || ((value, min, max) => Math.min(Math.max(value, min), max));

      if (landmark.imageName && !landmark.iconPath) {
        landmark.iconPath = landmark.imageName;
      }
      if (!landmark.iconPath) {
        landmark.iconPath = defaultIcon;
      }
      if ('imageName' in landmark) {
        delete landmark.imageName;
      }

      function getIconPath() {
        const value =
          typeof landmark.iconPath === 'string' && landmark.iconPath.trim().length
            ? landmark.iconPath
            : defaultIcon;
        landmark.iconPath = value;
        return value;
      }

      function updatePreview() {
        const iconPath = getIconPath();
        if (imagePreview) {
          imagePreview.src = iconPath;
        }
        iconPicker?.setSelectedIcon?.(iconPath);
      }

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
        updatePreview();
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
        iconPicker?.open?.({ iconPath: getIconPath(), trigger: imageButton });
      });

      const unsubscribeIconPicker = iconPicker?.onSelect?.((iconPath) => {
        if (!iconPath) {
          return;
        }
        landmark.iconPath = iconPath;
        sync();
        context.requestRender?.();
      });

      sync();

      return {
        sync,
        destroy() {
          unsubscribeIconPicker?.();
        },
      };
    },
  };
})();
