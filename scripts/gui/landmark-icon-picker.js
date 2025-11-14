(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});
  const ui = (WebMapper.ui = WebMapper.ui || {});

  let initialized = false;
  let overlay = null;
  let closeButton = null;
  let tabButtons = [];
  let panels = [];
  let optionButtons = [];
  let keydownHandlerBound = false;
  let lastTrigger = null;
  let activeIconPath = '';
  const selectCallbacks = new Set();

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

  function setOverlayVisible(visible) {
    if (!overlay) {
      return;
    }

    overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');

    if (visible) {
      const selectedButton = highlightIcon(activeIconPath);
      if (selectedButton && typeof selectedButton.scrollIntoView === 'function') {
        selectedButton.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
      const focusTarget = selectedButton || optionButtons[0];
      window.setTimeout(() => {
        focusTarget?.focus?.();
      }, 0);
    } else {
      const focusTarget = lastTrigger;
      window.setTimeout(() => {
        focusTarget?.focus?.();
      }, 0);
      lastTrigger = null;
    }
  }

  function close() {
    if (!isOverlayVisible()) {
      return;
    }
    setOverlayVisible(false);
  }

  function open(options = {}) {
    if (!overlay) {
      return;
    }

    const { iconPath, trigger } = options;
    if (typeof iconPath === 'string' && iconPath.trim()) {
      activeIconPath = iconPath;
    }
    lastTrigger = trigger || null;
    setOverlayVisible(true);
  }

  function setSelectedIcon(iconPath) {
    if (typeof iconPath === 'string' && iconPath.trim()) {
      activeIconPath = iconPath;
      if (isOverlayVisible()) {
        highlightIcon(activeIconPath);
      }
    }
  }

  function onSelect(callback) {
    if (typeof callback !== 'function') {
      return () => {};
    }
    selectCallbacks.add(callback);
    return () => {
      selectCallbacks.delete(callback);
    };
  }

  function bindEvents() {
    closeButton?.addEventListener('click', () => {
      close();
    });

    overlay?.addEventListener('click', (event) => {
      if (event.target === overlay) {
        close();
      }
    });

    const handleKeydown = (event) => {
      if (event.key === 'Escape' && isOverlayVisible()) {
        event.preventDefault();
        close();
      }
    };

    if (!keydownHandlerBound) {
      document.addEventListener('keydown', handleKeydown);
      keydownHandlerBound = true;
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
        activeIconPath = iconPath;
        highlightIcon(activeIconPath);
        selectCallbacks.forEach((callback) => {
          callback(activeIconPath);
        });
        close();
      });
    });
  }

  function init() {
    if (initialized) {
      return api;
    }

    overlay = document.getElementById('landmark-icon-overlay');
    if (!overlay) {
      return null;
    }

    closeButton = overlay.querySelector('[data-icon-picker-close]');
    tabButtons = Array.from(overlay.querySelectorAll('[data-icon-tab]'));
    panels = Array.from(overlay.querySelectorAll('[data-icon-panel]'));
    optionButtons = Array.from(overlay.querySelectorAll('[data-icon-option]'));

    bindEvents();

    initialized = true;
    return api;
  }

  const api = {
    init,
    open,
    close,
    setSelectedIcon,
    onSelect,
    isVisible: isOverlayVisible,
  };

  ui.LandmarkIconPicker = api;
})();
