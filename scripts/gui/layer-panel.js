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
  const PANEL_ANCHORS = [
    { name: 'top-left', horizontal: 'left', vertical: 'top' },
    { name: 'top-center', horizontal: 'center', vertical: 'top' },
    { name: 'top-right', horizontal: 'right', vertical: 'top' },
    { name: 'center-left', horizontal: 'left', vertical: 'center' },
    { name: 'center', horizontal: 'center', vertical: 'center' },
    { name: 'center-right', horizontal: 'right', vertical: 'center' },
    { name: 'bottom-left', horizontal: 'left', vertical: 'bottom' },
    { name: 'bottom-center', horizontal: 'center', vertical: 'bottom' },
    { name: 'bottom-right', horizontal: 'right', vertical: 'bottom' },
  ];
  const DEFAULT_ANCHOR = 'top-right';

  function resolveAnchor(name) {
    return PANEL_ANCHORS.find((anchor) => anchor.name === name) || PANEL_ANCHORS.find((anchor) => anchor.name === DEFAULT_ANCHOR);
  }

  const DEFAULT_LAYERS = [
    { id: 'roads', name: 'Roads', visible: true, locked: false, sortIndex: 0 },
    { id: 'settlements', name: 'Settlements', visible: true, locked: false, sortIndex: 1 },
    { id: 'points', name: 'Points of Interest', visible: true, locked: false, sortIndex: 2 },
  ];

  function normalizeLayers(layers) {
    if (!Array.isArray(layers)) {
      return [];
    }

    const decorated = layers.map((layer, index) => ({
      layer,
      sortIndex: typeof layer.sortIndex === 'number' ? layer.sortIndex : index,
      originalIndex: index,
    }));

    decorated.sort((a, b) => {
      if (a.sortIndex !== b.sortIndex) {
        return a.sortIndex - b.sortIndex;
      }
      return a.originalIndex - b.originalIndex;
    });

    return decorated.map((entry, index) => {
      entry.layer.sortIndex = index;
      return entry.layer;
    });
  }

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
    const utils = WebMapper.utils || {};
    const generateGuid = typeof utils.generateGuid === 'function' ? utils.generateGuid : null;

    let layers = Array.isArray(features.layers) ? features.layers.slice() : null;
    if (!layers || layers.length === 0) {
      layers = DEFAULT_LAYERS.map((layer, index) => ({
        ...layer,
        sortIndex: typeof layer.sortIndex === 'number' ? layer.sortIndex : index,
        visible: typeof features[layer.id] === 'boolean' ? features[layer.id] : layer.visible,
      }));
    } else {
      layers = layers.map((layer, index) => {
        const id = layer?.id || (generateGuid ? generateGuid() : `layer-${index + 1}`);
        const sortIndex = typeof layer?.sortIndex === 'number' ? layer.sortIndex : index;
        return {
          id,
          name: layer?.name || `Layer ${index + 1}`,
          visible: typeof layer?.visible === 'boolean' ? layer.visible : true,
          locked: Boolean(layer?.locked),
          sortIndex,
        };
      });
    }

    layers = normalizeLayers(layers);
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

      function normalizeLayerOrder() {
        const normalized = normalizeLayers(features.layers.slice());
        features.layers.splice(0, features.layers.length, ...normalized);
      }

      function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
      }

      function ensurePositionState() {
        if (
          !panelState.position ||
          typeof panelState.position.x !== 'number' ||
          typeof panelState.position.y !== 'number'
        ) {
          panelState.position = { x: 0, y: 0 };
        }
      }

      function getAnchorPoint(anchor) {
        const horizontal =
          anchor.horizontal === 'left'
            ? PANEL_MARGIN
            : anchor.horizontal === 'center'
            ? window.innerWidth / 2
            : window.innerWidth - PANEL_MARGIN;
        const vertical =
          anchor.vertical === 'top'
            ? PANEL_MARGIN
            : anchor.vertical === 'center'
            ? window.innerHeight / 2
            : window.innerHeight - PANEL_MARGIN;
        return { x: horizontal, y: vertical };
      }

      function findClosestAnchor(rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        let best = resolveAnchor(panelState.anchor);
        let bestDistance = Infinity;
        PANEL_ANCHORS.forEach((candidate) => {
          const point = getAnchorPoint(candidate);
          const dx = centerX - point.x;
          const dy = centerY - point.y;
          const distance = dx * dx + dy * dy;
          if (distance < bestDistance) {
            best = candidate;
            bestDistance = distance;
          }
        });
        return best;
      }

      function computeAnchorOffsets(rect, anchor) {
        const offsets = { x: 0, y: 0 };
        if (anchor.horizontal === 'left') {
          offsets.x = rect.left - PANEL_MARGIN;
        } else if (anchor.horizontal === 'center') {
          const centerX = window.innerWidth / 2;
          offsets.x = rect.left + rect.width / 2 - centerX;
        } else {
          offsets.x = window.innerWidth - rect.right - PANEL_MARGIN;
        }

        if (anchor.vertical === 'top') {
          offsets.y = rect.top - PANEL_MARGIN;
        } else if (anchor.vertical === 'center') {
          const centerY = window.innerHeight / 2;
          offsets.y = rect.top + rect.height / 2 - centerY;
        } else {
          offsets.y = window.innerHeight - rect.bottom - PANEL_MARGIN;
        }

        return offsets;
      }

      function getTransformOrigin(anchor) {
        const horizontal = anchor.horizontal === 'center' ? 'center' : anchor.horizontal;
        const vertical = anchor.vertical === 'center' ? 'center' : anchor.vertical;
        return `${horizontal} ${vertical}`;
      }

      function applyAnchoredPosition(anchorName, position, rect) {
        ensurePositionState();
        const anchor = resolveAnchor(anchorName);
        const measurements = rect || panel.getBoundingClientRect();
        const width = measurements.width;
        const height = measurements.height;

        let offsetX = typeof position?.x === 'number' ? position.x : panelState.position.x;
        let offsetY = typeof position?.y === 'number' ? position.y : panelState.position.y;

        let leftValue = null;
        let rightValue = null;
        let topValue = null;
        let bottomValue = null;

        if (anchor.horizontal === 'left') {
          const maxLeft = Math.max(PANEL_MARGIN, window.innerWidth - width - PANEL_MARGIN);
          const desiredLeft = PANEL_MARGIN + offsetX;
          const clampedLeft = clamp(desiredLeft, PANEL_MARGIN, maxLeft);
          leftValue = clampedLeft;
          offsetX = Math.max(0, clampedLeft - PANEL_MARGIN);
        } else if (anchor.horizontal === 'center') {
          const centerX = window.innerWidth / 2;
          const minLeft = PANEL_MARGIN;
          const maxLeft = Math.max(PANEL_MARGIN, window.innerWidth - width - PANEL_MARGIN);
          const desiredLeft = centerX - width / 2 + offsetX;
          const clampedLeft = clamp(desiredLeft, minLeft, maxLeft);
          leftValue = clampedLeft;
          offsetX = clampedLeft - (centerX - width / 2);
        } else {
          const maxRight = Math.max(PANEL_MARGIN, window.innerWidth - width - PANEL_MARGIN);
          const desiredRight = PANEL_MARGIN + offsetX;
          const clampedRight = clamp(desiredRight, PANEL_MARGIN, maxRight);
          rightValue = clampedRight;
          offsetX = Math.max(0, clampedRight - PANEL_MARGIN);
        }

        if (anchor.vertical === 'top') {
          const maxTop = Math.max(PANEL_MARGIN, window.innerHeight - height - PANEL_MARGIN);
          const desiredTop = PANEL_MARGIN + offsetY;
          const clampedTop = clamp(desiredTop, PANEL_MARGIN, maxTop);
          topValue = clampedTop;
          offsetY = Math.max(0, clampedTop - PANEL_MARGIN);
        } else if (anchor.vertical === 'center') {
          const centerY = window.innerHeight / 2;
          const minTop = PANEL_MARGIN;
          const maxTop = Math.max(PANEL_MARGIN, window.innerHeight - height - PANEL_MARGIN);
          const desiredTop = centerY - height / 2 + offsetY;
          const clampedTop = clamp(desiredTop, minTop, maxTop);
          topValue = clampedTop;
          offsetY = clampedTop - (centerY - height / 2);
        } else {
          const maxBottom = Math.max(PANEL_MARGIN, window.innerHeight - height - PANEL_MARGIN);
          const desiredBottom = PANEL_MARGIN + offsetY;
          const clampedBottom = clamp(desiredBottom, PANEL_MARGIN, maxBottom);
          bottomValue = clampedBottom;
          offsetY = Math.max(0, clampedBottom - PANEL_MARGIN);
        }

        panel.style.left = leftValue === null ? 'auto' : `${leftValue}px`;
        panel.style.right = rightValue === null ? 'auto' : `${rightValue}px`;
        panel.style.top = topValue === null ? 'auto' : `${topValue}px`;
        panel.style.bottom = bottomValue === null ? 'auto' : `${bottomValue}px`;
        panel.style.transformOrigin = getTransformOrigin(anchor);

        panelState.anchor = anchor.name;
        panelState.position = { x: offsetX, y: offsetY };
      }

      function setAbsolutePosition(position) {
        const rect = panel.getBoundingClientRect();
        const maxX = Math.max(PANEL_MARGIN, window.innerWidth - rect.width - PANEL_MARGIN);
        const maxY = Math.max(PANEL_MARGIN, window.innerHeight - rect.height - PANEL_MARGIN);
        const clampedX = clamp(position.x, PANEL_MARGIN, maxX);
        const clampedY = clamp(position.y, PANEL_MARGIN, maxY);

        panel.style.left = `${clampedX}px`;
        panel.style.top = `${clampedY}px`;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';

        return { x: clampedX, y: clampedY };
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
        ensurePositionState();

        const rect = panel.getBoundingClientRect();
        const hasAnchor = typeof panelState.anchor === 'string';

        if (!hasAnchor) {
          const hasLegacyPosition =
            panelState.position &&
            typeof panelState.position.x === 'number' &&
            typeof panelState.position.y === 'number' &&
            (panelState.position.x !== 0 || panelState.position.y !== 0);

          const fallbackPosition = hasLegacyPosition
            ? panelState.position
            : { x: rect.left, y: rect.top };

          setAbsolutePosition(fallbackPosition);
          const updatedRect = panel.getBoundingClientRect();
          const anchor = findClosestAnchor(updatedRect);
          const offsets = computeAnchorOffsets(updatedRect, anchor);
          applyAnchoredPosition(anchor.name, offsets, updatedRect);
          return;
        }

        applyAnchoredPosition(panelState.anchor, panelState.position, rect);
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
          WebMapper.saveState?.();
          return;
        }
        const layer = findLayer(features, layerId);
        if (!layer) return;
        layer.visible = !layer.visible;
        syncFeatureVisibility(features);
        renderLayers();
        requestRender?.();
        WebMapper.saveState?.();
      }

      function toggleLayerLock(layerId) {
        if (layerId === TERRAIN_LAYER_ID) {
          const terrainLayer = getTerrainLayer(features);
          if (!terrainLayer) return;
          terrainLayer.locked = !terrainLayer.locked;
          features.terrainLocked = terrainLayer.locked;
          renderLayers();
          WebMapper.saveState?.();
          return;
        }
        const layer = findLayer(features, layerId);
        if (!layer) return;
        layer.locked = !layer.locked;
        renderLayers();
        WebMapper.saveState?.();
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

        normalizeLayerOrder();

        if (features.activeLayerId === layerId) {
          features.activeLayerId = features.layers[index]?.id || features.layers[index - 1]?.id || null;
        }

        renderLayers();
        requestRender?.();
        WebMapper.saveState?.();
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
            WebMapper.saveState?.();
          }
        }
      }

      function addLayer() {
        features.counter = (features.counter || 0) + 1;
        const utils = WebMapper.utils || {};
        const generateGuid = typeof utils.generateGuid === 'function' ? utils.generateGuid : null;
        const fallbackId = `layer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const id = generateGuid ? generateGuid() : fallbackId;
        const name = `New Layer ${features.counter}`;
        const layer = {
          id,
          name,
          visible: true,
          locked: false,
          sortIndex: features.layers.length,
        };
        features.layers.push(layer);
        normalizeLayerOrder();
        features.activeLayerId = layer.id;
        syncFeatureVisibility(features);
        renderLayers();
        requestRender?.();
        WebMapper.saveState?.();
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
        normalizeLayerOrder();
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
          item.dataset.draggable = 'true';
          item.dataset.sortIndex = String(typeof layer.sortIndex === 'number' ? layer.sortIndex : 0);
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

      function getDraggableItems() {
        if (!list) return [];
        return Array.from(
          list.querySelectorAll('.layer-panel__item[data-layer-id]:not([data-static-layer="true"])')
        );
      }

      function updateLayerOrderFromDom({ save = false, triggerRender = false } = {}) {
        const items = getDraggableItems();
        if (!items.length) {
          return false;
        }

        let changed = false;
        items.forEach((item, index) => {
          const layerId = item.dataset.layerId;
          const layer = findLayer(features, layerId);
          if (layer && layer.sortIndex !== index) {
            layer.sortIndex = index;
            changed = true;
          }
        });

        if (changed) {
          normalizeLayerOrder();
          if (triggerRender) {
            requestRender?.();
          }
          if (save) {
            WebMapper.saveState?.();
          }
        }

        return changed;
      }

      let layerDragState = null;

      function onLayerItemPointerDown(event) {
        if (event.button !== 0) return;
        const item = event.target.closest('.layer-panel__item[data-layer-id]');
        if (!item || item.dataset.staticLayer === 'true') return;
        const actionTarget = event.target.closest('button[data-action]');
        if (actionTarget && actionTarget.dataset.action !== 'select-layer') {
          return;
        }

        layerDragState = {
          pointerId: event.pointerId,
          item,
          hasMoved: false,
        };

        item.classList.add('is-grabbed');
        if (typeof item.setPointerCapture === 'function') {
          item.setPointerCapture(event.pointerId);
        }
      }

      function onLayerItemPointerMove(event) {
        if (!layerDragState || event.pointerId !== layerDragState.pointerId) return;
        event.preventDefault();

        const items = getDraggableItems();
        if (items.length <= 1) {
          return;
        }

        const currentIndex = items.indexOf(layerDragState.item);
        if (currentIndex === -1) {
          return;
        }

        const withoutCurrent = items.slice();
        withoutCurrent.splice(currentIndex, 1);

        let insertIndex = withoutCurrent.length;
        for (let i = 0; i < withoutCurrent.length; i += 1) {
          const rect = withoutCurrent[i].getBoundingClientRect();
          if (event.clientY < rect.top + rect.height / 2) {
            insertIndex = i;
            break;
          }
        }

        const referenceNode = withoutCurrent[insertIndex] ?? null;
        const nextSibling = layerDragState.item.nextElementSibling;
        if (referenceNode === nextSibling) {
          return;
        }

        list.insertBefore(layerDragState.item, referenceNode);
        const changed = updateLayerOrderFromDom({ triggerRender: true });
        if (changed) {
          layerDragState.hasMoved = true;
        }
      }

      function finalizeLayerDrag(event) {
        if (!layerDragState || event.pointerId !== layerDragState.pointerId) {
          return;
        }

        const { item, pointerId, hasMoved } = layerDragState;
        if (typeof item.releasePointerCapture === 'function') {
          try {
            item.releasePointerCapture(pointerId);
          } catch (e) {
            // Ignore release errors
          }
        }
        item.classList.remove('is-grabbed');

        const changed = updateLayerOrderFromDom({ triggerRender: true });
        const shouldCommit = hasMoved || changed;
        layerDragState = null;

        if (!shouldCommit) {
          return;
        }

        WebMapper.saveState?.();
        renderLayers();
        requestRender?.();
      }

      function onLayerItemPointerUp(event) {
        finalizeLayerDrag(event);
      }

      function onLayerItemPointerCancel(event) {
        finalizeLayerDrag(event);
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

        const rect = panel.getBoundingClientRect();
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        setAbsolutePosition({ x: rect.left, y: rect.top });

        isDragging = true;
        pointerId = event.pointerId;
        panel.classList.add('is-dragging');
        header?.setPointerCapture(pointerId);
      }

      function onDrag(event) {
        if (!isDragging || event.pointerId !== pointerId) return;
        setAbsolutePosition({ x: event.clientX - offsetX, y: event.clientY - offsetY });
      }

      function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        panel.classList.remove('is-dragging');
        if (pointerId !== null) {
          header?.releasePointerCapture(pointerId);
        }
        pointerId = null;

        const rect = panel.getBoundingClientRect();
        const anchor = findClosestAnchor(rect);
        const offsets = computeAnchorOffsets(rect, anchor);
        applyAnchoredPosition(anchor.name, offsets, rect);
        WebMapper.saveState?.();
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
        applyAnchoredPosition(panelState.anchor || DEFAULT_ANCHOR, panelState.position);
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

      list?.addEventListener('pointerdown', onLayerItemPointerDown);
      list?.addEventListener('pointermove', onLayerItemPointerMove);
      list?.addEventListener('pointerup', onLayerItemPointerUp);
      list?.addEventListener('pointercancel', onLayerItemPointerCancel);

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
