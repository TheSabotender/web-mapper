(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});
  const ui = (WebMapper.ui = WebMapper.ui || {});

  const debugPanel = (ui.debugPanel = ui.debugPanel || {});

  const debugPanelState = {
    panel: null,
    toolValue: null,
    activeLayerValue: null,
    terrainVisibleValue: null,
    terrainLockedValue: null,
    pathsVisibleValue: null,
    pathsLockedValue: null,
    resetButton: null,
  };

  function formatToggle(value) {
    return value ? 'ON' : 'OFF';
  }

  function cloneValue(value) {
    if (typeof structuredClone === 'function') {
      try {
        return structuredClone(value);
      } catch (error) {
        // Fall back to JSON cloning below if structuredClone fails.
      }
    }
    return JSON.parse(JSON.stringify(value));
  }

  function ensureDebugPanel() {
    if (debugPanelState.panel) {
      return debugPanelState;
    }

    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.position = 'fixed';
    panel.style.top = '16px';
    panel.style.right = '16px';
    panel.style.zIndex = '9999';
    panel.style.background = 'rgba(0, 0, 0, 0.75)';
    panel.style.color = '#ffffff';
    panel.style.font = '12px/1.5 "Segoe UI", sans-serif';
    panel.style.padding = '16px';
    panel.style.borderRadius = '12px';
    panel.style.minWidth = '220px';
    panel.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.35)';

    const title = document.createElement('div');
    title.textContent = 'Debug state';
    title.style.fontSize = '14px';
    title.style.fontWeight = '600';
    title.style.marginBottom = '12px';
    panel.appendChild(title);

    const list = document.createElement('dl');
    list.style.display = 'grid';
    list.style.gridTemplateColumns = 'auto 1fr';
    list.style.columnGap = '8px';
    list.style.rowGap = '6px';
    list.style.margin = '0 0 12px';

    function createRow(labelText) {
      const term = document.createElement('dt');
      term.textContent = labelText;
      term.style.fontWeight = '500';
      term.style.opacity = '0.8';

      const value = document.createElement('dd');
      value.textContent = '—';
      value.style.margin = '0';
      value.style.fontVariantNumeric = 'tabular-nums';

      list.appendChild(term);
      list.appendChild(value);

      return value;
    }

    const toolValue = createRow('Tool');
    const activeLayerValue = createRow('Active layer');
    const terrainVisibleValue = createRow('Terrain visible');
    const terrainLockedValue = createRow('Terrain locked');
    const pathsVisibleValue = createRow('Paths visible');
    const pathsLockedValue = createRow('Paths locked');

    panel.appendChild(list);

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = 'Reset state';
    resetButton.style.display = 'inline-flex';
    resetButton.style.alignItems = 'center';
    resetButton.style.justifyContent = 'center';
    resetButton.style.gap = '6px';
    resetButton.style.padding = '6px 12px';
    resetButton.style.border = '1px solid rgba(255, 255, 255, 0.35)';
    resetButton.style.borderRadius = '999px';
    resetButton.style.background = 'rgba(255, 255, 255, 0.08)';
    resetButton.style.color = '#ffffff';
    resetButton.style.cursor = 'pointer';
    resetButton.style.font = '600 12px "Segoe UI", sans-serif';
    resetButton.style.transition = 'background 0.2s ease, border-color 0.2s ease';

    resetButton.addEventListener('mouseenter', () => {
      resetButton.style.background = 'rgba(255, 255, 255, 0.16)';
      resetButton.style.borderColor = 'rgba(255, 255, 255, 0.45)';
    });

    resetButton.addEventListener('mouseleave', () => {
      resetButton.style.background = 'rgba(255, 255, 255, 0.08)';
      resetButton.style.borderColor = 'rgba(255, 255, 255, 0.35)';
    });

    panel.appendChild(resetButton);

    const host = document.getElementById('app-root') || document.body;
    host.appendChild(panel);

    debugPanelState.panel = panel;
    debugPanelState.toolValue = toolValue;
    debugPanelState.activeLayerValue = activeLayerValue;
    debugPanelState.terrainVisibleValue = terrainVisibleValue;
    debugPanelState.terrainLockedValue = terrainLockedValue;
    debugPanelState.pathsVisibleValue = pathsVisibleValue;
    debugPanelState.pathsLockedValue = pathsLockedValue;
    debugPanelState.resetButton = resetButton;

    return debugPanelState;
  }

  function detachDebugPanel() {
    if (debugPanelState.panel && debugPanelState.panel.parentNode) {
      debugPanelState.panel.parentNode.removeChild(debugPanelState.panel);
    }
    debugPanelState.panel = null;
    debugPanelState.toolValue = null;
    debugPanelState.activeLayerValue = null;
    debugPanelState.terrainVisibleValue = null;
    debugPanelState.terrainLockedValue = null;
    debugPanelState.pathsVisibleValue = null;
    debugPanelState.pathsLockedValue = null;
    debugPanelState.resetButton = null;
  }

  function resetStateToDefaults() {
    const state = WebMapper.state;
    const defaults = WebMapper.defaults;
    if (!state || !defaults) {
      return;
    }

    const preservedDebug = state.debug;
    const preservedView =
      state.view && typeof state.view === 'object' ? state.view : null;
    const preservedTools =
      state.tools && typeof state.tools === 'object' ? state.tools : null;

    const defaultsClone = cloneValue(defaults);

    Object.entries(defaultsClone).forEach(([key, value]) => {
      if (key === 'view' || key === 'tools') {
        return;
      }
      state[key] = value;
    });

    if (preservedView) {
      const defaultView =
        defaultsClone.view && typeof defaultsClone.view === 'object'
          ? defaultsClone.view
          : { x: 0, y: 0, zoom: 1 };
      Object.keys(preservedView).forEach((key) => {
        delete preservedView[key];
      });
      Object.assign(preservedView, defaultView);
      state.view = preservedView;
    } else if (defaultsClone.view) {
      state.view = defaultsClone.view;
    } else {
      state.view = { x: 0, y: 0, zoom: 1 };
    }

    state.debug = preservedDebug;

    if (preservedTools) {
      const defaultTools =
        defaultsClone.tools && typeof defaultsClone.tools === 'object'
          ? defaultsClone.tools
          : {};
      Object.keys(preservedTools).forEach((key) => {
        delete preservedTools[key];
      });
      Object.assign(preservedTools, defaultTools);
      state.tools = preservedTools;
    } else if (defaultsClone.tools) {
      state.tools = defaultsClone.tools;
    }

    if (!state.tools || typeof state.tools !== 'object') {
      state.tools = {};
    }

    WebMapper.ui?.toolControls?.setActiveTool?.(state.tool);
    WebMapper.ui?.toolControls?.sync?.();
    WebMapper.ui?.layerPanelControls?.sync?.();
    WebMapper.ui?.applyUiScale?.(
      state.settings?.uiScale ?? defaultsClone?.settings?.uiScale ?? 100
    );

    if (typeof WebMapper.updateAnimation === 'function') {
      WebMapper.updateAnimation();
    }

    if (typeof WebMapper.render === 'function') {
      WebMapper.render();
    }

    if (typeof WebMapper.saveState === 'function') {
      WebMapper.saveState();
    }
  }

  function updateDebugPanel(state) {
    if (!state?.debug) {
      detachDebugPanel();
      return;
    }

    const panelElements = ensureDebugPanel();
    if (!panelElements.resetButton.__webMapperBound) {
      panelElements.resetButton.addEventListener('click', () => {
        resetStateToDefaults();
        debugPanel.update(WebMapper.state);
      });
      panelElements.resetButton.__webMapperBound = true;
    }

    panelElements.toolValue.textContent = state.tool ?? 'N/A';
    panelElements.activeLayerValue.textContent = state.activeLayerId ?? 'N/A';
    panelElements.terrainVisibleValue.textContent = formatToggle(
      Boolean(state.terrainVisible)
    );
    panelElements.terrainLockedValue.textContent = formatToggle(
      Boolean(state.terrainLocked)
    );
    panelElements.pathsVisibleValue.textContent = formatToggle(
      Boolean(state.pathsVisible)
    );
    panelElements.pathsLockedValue.textContent = formatToggle(
      Boolean(state.pathsLocked)
    );
  }

  debugPanel.update = updateDebugPanel;
  debugPanel.resetStateToDefaults = resetStateToDefaults;
})();
