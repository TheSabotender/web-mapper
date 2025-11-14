(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});
  const ui = (WebMapper.ui = WebMapper.ui || {});

  const VISIBILITY_ICONS = {
    true: 'assets/icons/proficiency/proficient.svg',
    false: 'assets/icons/proficiency/unskilled.svg',
  };

  const LOCK_ICONS = {
    true: 'assets/icons/game/lock.svg',
    false: 'assets/icons/game/unlock.svg',
  };

  const REMOVE_ICON = 'assets/icons/util/trash.svg';
  const TERRAIN_LAYER_ID = 'terrain';
  const TERRAIN_LAYER = { id: TERRAIN_LAYER_ID, name: 'Terrain', visible: true, locked: false };
  const MIN_HEIGHT = 220;
  const PANEL_MARGIN = 16;

  const DEFAULT_LAYERS = [
    { id: 'roads', name: 'Roads', visible: true, locked: false },
    { id: 'settlements', name: 'Settlements', visible: true, locked: false },
    { id: 'points', name: 'Points of Interest', visible: true, locked: false },
  ];

  function ensureTerrainLayer(features) {
    const stored = features?.terrainLayer;
    const visibleValue =
      typeof stored?.visible === 'boolean'
        ? stored.visible
        : typeof features?.[TERRAIN_LAYER_ID] === 'boolean'
        ? features[TERRAIN_LAYER_ID]
        : TERRAIN_LAYER.visible;
    const lockedValue = typeof stored?.locked === 'boolean' ? stored.locked : Boolean(features?.terrainLocked);

    const terrainLayer = {
      ...TERRAIN_LAYER,
      visible: Boolean(visibleValue),
      locked: Boolean(lockedValue),
    };

    features.terrainLayer = terrainLayer;
    features[TERRAIN_LAYER_ID] = terrainLayer.visible;
    features.terrain = terrainLayer.visible;
    features.terrainLocked = terrainLayer.locked;
    return terrainLayer;
  }

  function ensureLayerState(state) {
    const features = (state.features = state.features || {});

    let layers = Array.isArray(features.layers) ? features.layers.slice() : null;
    if (!layers || layers.length === 0) {
      layers = DEFAULT_LAYERS.map((layer) => ({
        ...layer,
        visible: typeof features[layer.id] === 'boolean' ? features[layer.id] : layer.visible,
      }));
    } else {
      layers = layers.map((layer, index) => ({
        id: layer.id || `layer-${index + 1}`,
        name: layer.name || `Layer ${index + 1}`,
        visible: typeof layer.visible === 'boolean' ? layer.visible : true,
        locked: Boolean(layer.locked),
      }));
    }

    features.layers = layers;
    ensureTerrainLayer(features);
    if (typeof features.counter !== 'number' || features.counter < layers.length) {
      features.counter = layers.length;
    }

    if (!features.activeLayerId || !layers.some((layer) => layer.id === features.activeLayerId)) {
      features.activeLayerId = layers[0]?.id || null;
    }

    syncFeatureVisibility(features);
    return features;
  }

  function syncFeatureVisibility(features) {
    if (!features || !Array.isArray(features.layers)) return;
    features.layers.forEach((layer) => {
      features[layer.id] = Boolean(layer.visible);
    });
    const terrainLayer = ensureTerrainLayer(features);
    if (terrainLayer) {
      features[TERRAIN_LAYER_ID] = Boolean(terrainLayer.visible);
      features.terrain = Boolean(terrainLayer.visible);
      features.terrainLocked = Boolean(terrainLayer.locked);
    }
  }

  function findLayer(features, layerId) {
    if (!features || !Array.isArray(features.layers)) return null;
    return features.layers.find((layer) => layer.id === layerId) || null;
  }

  function getTerrainLayer(features) {
    if (!features) return null;
    return ensureTerrainLayer(features);
  }

  ui.LayerPanel = {
    init({ state, requestRender }) {
      const panel = document.getElementById('feature-panel');
      if (!panel) {
        return null;
      }

      const header = panel.querySelector('.floating-panel__header');
      const toggleButton = panel.querySelector('[data-action="toggle-minimize"]');
      const icon = toggleButton?.querySelector('span[aria-hidden="true"]');
      const list = panel.querySelector('[data-layer-list]');
      const addButton = panel.querySelector('[data-action="add-layer"]');
      const resizeHandle = panel.querySelector('[data-action="resize-panel"]');

      const features = ensureLayerState(state);
      const uiState = (state.ui = state.ui || {});
      const panelState = (uiState.featurePanel = uiState.featurePanel || {});

      function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
      }

      function clampPosition(position) {
        const rect = panel.getBoundingClientRect();
        const maxX = Math.max(PANEL_MARGIN, window.innerWidth - rect.width - PANEL_MARGIN);
        const maxY = Math.max(PANEL_MARGIN, window.innerHeight - rect.height - PANEL_MARGIN);
        return {
          x: clamp(position.x, PANEL_MARGIN, maxX),
          y: clamp(position.y, PANEL_MARGIN, maxY),
        };
      }

      function applyPosition(position) {
        const clamped = clampPosition(position);
        panel.style.right = 'auto';
        panel.style.left = `${clamped.x}px`;
        panel.style.top = `${clamped.y}px`;
        panelState.position = clamped;
      }

      function applyHeight(height) {
        if (panelState.minimized) {
          return;
        }
        const maxHeight = Math.max(MIN_HEIGHT, window.innerHeight - PANEL_MARGIN * 2);
        const clamped = clamp(height, MIN_HEIGHT, maxHeight);
        panel.style.height = `${clamped}px`;
        panelState.height = clamped;
      }

      function ensureHeight() {
        if (panelState.minimized) {
          panel.style.height = '';
          return;
        }
        const current = typeof panelState.height === 'number' ? panelState.height : panel.getBoundingClientRect().height;
        applyHeight(Math.max(current, MIN_HEIGHT));
      }

      function ensurePosition() {
        ensureHeight();
        const rect = panel.getBoundingClientRect();
        const defaultPosition = {
          x: window.innerWidth - rect.width - PANEL_MARGIN,
          y: PANEL_MARGIN,
        };
        const position = panelState.position || defaultPosition;
        applyPosition(position);
      }

      function syncMinimized() {
        const minimized = Boolean(panelState.minimized);
        panel.classList.toggle('is-minimized', minimized);
        toggleButton?.setAttribute('aria-expanded', String(!minimized));
        toggleButton?.setAttribute(
          'aria-label',
          minimized ? 'Expand feature layers' : 'Collapse feature layers'
        );
        if (icon) {
          icon.textContent = minimized ? '+' : '\u2212';
        }
        if (minimized) {
          panel.style.height = '';
        } else {
          ensureHeight();
        }
      }

      function setActiveLayer(layerId) {
        if (!layerId) return;
        if (layerId === TERRAIN_LAYER_ID) return;
        if (features.activeLayerId === layerId) return;
        const layer = findLayer(features, layerId);
        if (!layer) return;
        features.activeLayerId = layerId;
        renderLayers();
      }

      function toggleLayerVisibility(layerId) {
        if (layerId === TERRAIN_LAYER_ID) {
          const terrainLayer = getTerrainLayer(features);
          if (!terrainLayer) return;
          terrainLayer.visible = !terrainLayer.visible;
          syncFeatureVisibility(features);
          renderLayers();
          requestRender?.();
          return;
        }
        const layer = findLayer(features, layerId);
        if (!layer) return;
        layer.visible = !layer.visible;
        syncFeatureVisibility(features);
        renderLayers();
        requestRender?.();
      }

      function toggleLayerLock(layerId) {
        if (layerId === TERRAIN_LAYER_ID) {
          const terrainLayer = getTerrainLayer(features);
          if (!terrainLayer) return;
          terrainLayer.locked = !terrainLayer.locked;
          features.terrainLocked = terrainLayer.locked;
          renderLayers();
          return;
        }
        const layer = findLayer(features, layerId);
        if (!layer) return;
        layer.locked = !layer.locked;
        renderLayers();
      }

      function removeLayer(layerId) {
        if (layerId === TERRAIN_LAYER_ID) return;
        const index = features.layers.findIndex((layer) => layer.id === layerId);
        if (index === -1) return;
        if (features.layers[index].locked) return;

        const [removed] = features.layers.splice(index, 1);
        if (removed) {
          delete features[removed.id];
        }

        if (features.activeLayerId === layerId) {
          features.activeLayerId = features.layers[index]?.id || features.layers[index - 1]?.id || null;
        }

        renderLayers();
        requestRender?.();
      }

      function renameLayer(layerId) {
        if (layerId === TERRAIN_LAYER_ID) return;
        const layer = findLayer(features, layerId);
        if (!layer || layer.locked) return;

        const currentName = layer.name || '';
        const newName = window.prompt('Rename layer', currentName);
        if (typeof newName === 'string') {
          const trimmed = newName.trim();
          if (trimmed && trimmed !== currentName) {
            layer.name = trimmed;
            renderLayers();
          }
        }
      }

      function addLayer() {
        features.counter = (features.counter || 0) + 1;
        const id = `layer-${features.counter}`;
        const name = `New Layer ${features.counter}`;
        const layer = { id, name, visible: true, locked: false };
        features.layers.push(layer);
        features.activeLayerId = layer.id;
        syncFeatureVisibility(features);
        renderLayers();
        requestRender?.();
      }

      const MAX_NAME_LENGTH = 28;

      function formatLayerName(name) {
        const baseName = typeof name === 'string' ? name.trim() : '';
        if (!baseName) {
          return '';
        }
        if (baseName.length <= MAX_NAME_LENGTH) {
          return baseName;
        }
        const sliceEnd = Math.max(0, MAX_NAME_LENGTH - 2);
        return `${baseName.slice(0, sliceEnd)}..`;
      }

      function createIconButton({ action, layerId, icon, pressed, label, disabled }) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'layer-panel__icon-button';
        button.dataset.action = action;
        button.dataset.layerId = layerId;
        if (typeof pressed === 'boolean') {
          button.setAttribute('aria-pressed', String(pressed));
        }
        button.setAttribute('aria-label', label);
        button.title = label;
        if (disabled) {
          button.disabled = true;
        }

        const img = document.createElement('img');
        img.src = icon;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        button.appendChild(img);
        return button;
      }

      function renderLayers() {
        if (!list) return;
        list.innerHTML = '';

        const fragment = document.createDocumentFragment();
        const terrainLayer = getTerrainLayer(features);
        if (terrainLayer) {
          const terrainItem = document.createElement('div');
          terrainItem.className = 'layer-panel__item layer-panel__item--terrain';
          terrainItem.dataset.layerId = TERRAIN_LAYER_ID;
          terrainItem.dataset.staticLayer = 'true';
          terrainItem.setAttribute('role', 'option');
          terrainItem.setAttribute('aria-selected', 'false');
          terrainItem.id = `layer-option-${TERRAIN_LAYER_ID}`;
          terrainItem.tabIndex = -1;

          if (terrainLayer.locked) {
            terrainItem.classList.add('is-locked');
          }

          const terrainVisibilityButton = createIconButton({
            action: 'toggle-visibility',
            layerId: TERRAIN_LAYER_ID,
            icon: terrainLayer.visible ? VISIBILITY_ICONS.true : VISIBILITY_ICONS.false,
            pressed: terrainLayer.visible,
            label: `${terrainLayer.visible ? 'Hide' : 'Show'} terrain layer`,
          });

          const terrainLockButton = createIconButton({
            action: 'toggle-lock',
            layerId: TERRAIN_LAYER_ID,
            icon: terrainLayer.locked ? LOCK_ICONS.true : LOCK_ICONS.false,
            pressed: terrainLayer.locked,
            label: `${terrainLayer.locked ? 'Unlock' : 'Lock'} terrain layer`,
          });

          const terrainLabel = document.createElement('span');
          terrainLabel.className = 'layer-panel__label';
          terrainLabel.textContent = TERRAIN_LAYER.name;

          terrainItem.append(terrainVisibilityButton, terrainLockButton, terrainLabel);
          fragment.appendChild(terrainItem);
        }

        features.layers.forEach((layer) => {
          const item = document.createElement('div');
          item.className = 'layer-panel__item';
          item.dataset.layerId = layer.id;
          item.setAttribute('role', 'option');
          item.setAttribute('aria-selected', String(features.activeLayerId === layer.id));
          item.id = `layer-option-${layer.id}`;
          item.tabIndex = 0;

          if (features.activeLayerId === layer.id) {
            item.classList.add('is-active');
          }

          if (layer.locked) {
            item.classList.add('is-locked');
          }

          const visibilityButton = createIconButton({
            action: 'toggle-visibility',
            layerId: layer.id,
            icon: layer.visible ? VISIBILITY_ICONS.true : VISIBILITY_ICONS.false,
            pressed: layer.visible,
            label: `${layer.visible ? 'Hide' : 'Show'} layer ${layer.name}`,
          });

          const lockButton = createIconButton({
            action: 'toggle-lock',
            layerId: layer.id,
            icon: layer.locked ? LOCK_ICONS.true : LOCK_ICONS.false,
            pressed: layer.locked,
            label: `${layer.locked ? 'Unlock' : 'Lock'} layer ${layer.name}`,
          });

          const nameButton = document.createElement('button');
          nameButton.type = 'button';
          nameButton.className = 'layer-panel__name-button';
          nameButton.dataset.action = 'select-layer';
          nameButton.dataset.layerId = layer.id;
          nameButton.setAttribute('aria-label', `Select layer ${layer.name}`);
          nameButton.title = layer.name;
          const nameSpan = document.createElement('span');
          nameSpan.textContent = formatLayerName(layer.name);
          nameButton.appendChild(nameSpan);

          const removeButton = createIconButton({
            action: 'remove-layer',
            layerId: layer.id,
            icon: REMOVE_ICON,
            label: `Remove layer ${layer.name}`,
            disabled: layer.locked,
          });

          item.append(visibilityButton, lockButton, nameButton, removeButton);
          fragment.appendChild(item);
        });

        list.appendChild(fragment);

        if (features.activeLayerId) {
          list.setAttribute('aria-activedescendant', `layer-option-${features.activeLayerId}`);
        } else {
          list.removeAttribute('aria-activedescendant');
        }
      }

      let isDragging = false;
      let pointerId = null;
      let offsetX = 0;
      let offsetY = 0;

      function toggleMinimized() {
        panelState.minimized = !panelState.minimized;
        syncMinimized();
      }

      function beginDrag(event) {
        if (event.button !== 0) return;
        if (event.target.closest('[data-action]')) return;

        const position = panelState.position || {
          x:
            parseFloat(panel.style.left) ||
            window.innerWidth - panel.getBoundingClientRect().width - PANEL_MARGIN,
          y: parseFloat(panel.style.top) || PANEL_MARGIN,
        };

        isDragging = true;
        pointerId = event.pointerId;
        offsetX = event.clientX - position.x;
        offsetY = event.clientY - position.y;
        panel.classList.add('is-dragging');
        header?.setPointerCapture(pointerId);
      }

      function onDrag(event) {
        if (!isDragging) return;
        applyPosition({ x: event.clientX - offsetX, y: event.clientY - offsetY });
      }

      function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        panel.classList.remove('is-dragging');
        if (pointerId !== null) {
          header?.releasePointerCapture(pointerId);
        }
        pointerId = null;
      }

      let isResizing = false;
      let resizePointerId = null;
      let startY = 0;
      let startHeight = 0;

      function onResizePointerDown(event) {
        if (event.button !== 0) return;
        if (panelState.minimized) return;

        isResizing = true;
        resizePointerId = event.pointerId;
        startY = event.clientY;
        startHeight = panel.getBoundingClientRect().height;
        resizeHandle?.setPointerCapture(resizePointerId);
        panel.classList.add('is-resizing');
        event.preventDefault();
      }

      function onResizePointerMove(event) {
        if (!isResizing || event.pointerId !== resizePointerId) return;
        const delta = event.clientY - startY;
        applyHeight(startHeight + delta);
        applyPosition(panelState.position || { x: panel.offsetLeft, y: panel.offsetTop });
      }

      function onResizePointerEnd(event) {
        if (!isResizing || event.pointerId !== resizePointerId) return;
        isResizing = false;
        panel.classList.remove('is-resizing');
        resizeHandle?.releasePointerCapture(resizePointerId);
        resizePointerId = null;
      }

      toggleButton?.addEventListener('click', toggleMinimized);

      header?.addEventListener('pointerdown', beginDrag);
      header?.addEventListener('pointermove', onDrag);
      header?.addEventListener('pointerup', endDrag);
      header?.addEventListener('pointercancel', endDrag);
      header?.addEventListener('dblclick', (event) => {
        if (event.target.closest('[data-action]')) return;
        toggleMinimized();
      });

      resizeHandle?.addEventListener('pointerdown', onResizePointerDown);
      resizeHandle?.addEventListener('pointermove', onResizePointerMove);
      resizeHandle?.addEventListener('pointerup', onResizePointerEnd);
      resizeHandle?.addEventListener('pointercancel', onResizePointerEnd);

      list?.addEventListener('click', (event) => {
        const actionTarget = event.target.closest('button[data-action]');
        if (!actionTarget) {
          const item = event.target.closest('.layer-panel__item');
          if (!item) return;
          if (item.dataset.staticLayer === 'true') return;
          setActiveLayer(item.dataset.layerId);
          return;
        }

        const { action, layerId } = actionTarget.dataset;
        if (!layerId) return;

        switch (action) {
          case 'toggle-visibility':
            toggleLayerVisibility(layerId);
            break;
          case 'toggle-lock':
            toggleLayerLock(layerId);
            break;
          case 'select-layer':
            setActiveLayer(layerId);
            break;
          case 'remove-layer':
            removeLayer(layerId);
            break;
          default:
            break;
        }
      });

      list?.addEventListener('dblclick', (event) => {
        const toggleButton = event.target.closest('button[data-action]');
        if (toggleButton && toggleButton.dataset.action !== 'select-layer') {
          return;
        }

        const item = event.target.closest('.layer-panel__item');
        if (!item) return;
        if (item.dataset.staticLayer === 'true') return;
        renameLayer(item.dataset.layerId);
      });

      list?.addEventListener('keydown', (event) => {
        const item = event.target.closest('.layer-panel__item');
        if (!item) return;
        if (item.dataset.staticLayer === 'true') return;
        const layerId = item.dataset.layerId;
        if (!layerId) return;

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setActiveLayer(layerId);
        }
      });

      addButton?.addEventListener('click', addLayer);

      window.addEventListener('resize', () => {
        ensurePosition();
      });

      ensurePosition();
      syncMinimized();
      renderLayers();

      return {
        sync: () => {
          ensurePosition();
          syncMinimized();
          renderLayers();
        },
      };
    },
  };
})();
