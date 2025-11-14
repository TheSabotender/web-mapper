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

      const overlay = document.getElementById('landmark-icon-overlay');
      const closeButton = overlay?.querySelector('[data-icon-picker-close]');
      const tabButtons = overlay ? Array.from(overlay.querySelectorAll('[data-icon-tab]')) : [];
      const panels = overlay ? Array.from(overlay.querySelectorAll('[data-icon-panel]')) : [];
      const optionButtons = overlay ? Array.from(overlay.querySelectorAll('[data-icon-option]')) : [];

      if (!scaleInput && !modeButtons.length && !imageButton) {
        return null;
      }

      const toolsState = (context.toolsState = context.toolsState || {});
      const defaultIcon = imageButton?.dataset.defaultIcon || 'assets/icons/location/castle.svg';
      const defaults = { mode: 'select', scale: 1, iconPath: defaultIcon };
      const landmark = (toolsState.landmark = Object.assign({}, defaults, toolsState.landmark));
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

      function isOverlayVisible() {
        return overlay?.getAttribute('aria-hidden') === 'false';
      }

      function activateTab(categoryId) {
        if (!tabButtons.length || !panels.length) {
          return;
        }

        const targetId = categoryId || tabButtons[0]?.dataset.iconTab;
        tabButtons.forEach((tab) => {
          const isActive = tab.dataset.iconTab === targetId;
          tab.classList.toggle('is-active', isActive);
          tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
          tab.setAttribute('tabindex', isActive ? '0' : '-1');
        });
        panels.forEach((panel) => {
          const isActive = panel.dataset.iconPanel === targetId;
          if (isActive) {
            panel.removeAttribute('hidden');
            panel.setAttribute('tabindex', '0');
          } else {
            panel.setAttribute('hidden', '');
            panel.setAttribute('tabindex', '-1');
          }
        });
      }

      function highlightIcon(iconPath) {
        if (!optionButtons.length) {
          return null;
        }

        let selectedButton = null;
        let targetCategory = null;
        optionButtons.forEach((button) => {
          const isSelected = button.dataset.iconValue === iconPath;
          button.classList.toggle('is-selected', isSelected);
          button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
          if (isSelected) {
            selectedButton = button;
            const panel = button.closest('[data-icon-panel]');
            targetCategory = panel?.dataset.iconPanel || targetCategory;
          }
        });

        if (targetCategory) {
          activateTab(targetCategory);
        }

        return selectedButton;
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
        if (isOverlayVisible()) {
          highlightIcon(iconPath);
        }
      }

      function setOverlayVisible(visible) {
        if (!overlay) {
          return;
        }
        overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
        if (visible) {
          const iconPath = getIconPath();
          const selectedButton = highlightIcon(iconPath);
          if (selectedButton && typeof selectedButton.scrollIntoView === 'function') {
            selectedButton.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          }
          const focusTarget = selectedButton || optionButtons[0];
          window.setTimeout(() => {
            focusTarget?.focus?.();
          }, 0);
        } else {
          window.setTimeout(() => {
            imageButton?.focus?.();
          }, 0);
        }
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
        setOverlayVisible(true);
      });

      closeButton?.addEventListener('click', () => {
        setOverlayVisible(false);
      });

      overlay?.addEventListener('click', (event) => {
        if (event.target === overlay) {
          setOverlayVisible(false);
        }
      });

      const handleKeydown = (event) => {
        if (event.key === 'Escape' && isOverlayVisible()) {
          event.preventDefault();
          setOverlayVisible(false);
        }
      };
      if (overlay && !overlay.dataset.keydownBound) {
        document.addEventListener('keydown', handleKeydown);
        overlay.dataset.keydownBound = 'true';
      }

      tabButtons.forEach((tab) => {
        tab.addEventListener('click', () => {
          const categoryId = tab.dataset.iconTab;
          activateTab(categoryId);
          const panel = panels.find((panelEl) => panelEl.dataset.iconPanel === categoryId);
          const firstOption = panel?.querySelector('[data-icon-option]');
          firstOption?.focus?.();
        });
      });

      optionButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const iconPath = button.dataset.iconValue;
          if (!iconPath) {
            return;
          }
          landmark.iconPath = iconPath;
          sync();
          context.requestRender?.();
          setOverlayVisible(false);
        });
      });

      sync();

      return {
        sync,
      };
    },
  };
})();
