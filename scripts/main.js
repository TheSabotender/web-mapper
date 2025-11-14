(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});
  const runtime = (WebMapper.runtime = WebMapper.runtime || {});
  runtime.renderedFeatures = Array.isArray(runtime.renderedFeatures)
    ? runtime.renderedFeatures
    : [];

  const STORAGE_KEY = 'webMapperStateV1';

  const defaults = (WebMapper.defaults = WebMapper.defaults || {
    canvas: { width: 1280, height: 720 },
    settings: { showGrid: true, animation: 'slow', uiScale: 100 },
    activeLayerId: 'roads',
    tool: 'pan',
    view: { x: 0, y: 0, zoom: 1 },
    terrainVisible: true,
    terrainLocked: false,
    pathsVisible: true,
    pathsLocked: false,
    paths: [
      {
        id: 'road002', type: 'river', width: 12, points: [
          { inX: 0, inY: 0, x: 0, y: 0, outX: 0.5, outY: 0.2 },
          { inX: 0.5, inY: 0.2, x: 4, y: 4, outX: 4.2, outY: 4.2 }
        ]
      },
      {
        id: 'road001', type: 'road', width: 8, points: [
          { inX: 0.35, inY: 0.65, x: 0.45, y: 0.95, outX: 0.75, outY: 0.2 },
          { inX: 1.35, inY: 0.65, x: 1.45, y: 0.95, outX: 1.75, outY: 0.2 }
        ]     
      }
    ],    
    layers: [      
      {
              id: 'settlements',
              name: 'Settlements',
              visible: true,
              locked: false,
              sortIndex: 1,
              features: [
                  {
                      guid: 'settlement-emerald-haven',
                      icon: 'assets/icons/location/castle.svg',
                      position: { x: 0.25, y: 0.6 },
                      size: 32,
                      name: 'Emerald Haven',
                      description: 'A bustling riverside town known for its verdant terraces.',
                      url: '#emerald-haven',
                  },
                  {
                      guid: 'settlement-crimson-hold',
                      icon: 'assets/icons/location/bastion.svg',
                      position: { x: 0.55, y: 0.45 },
                      size: 36,
                      name: 'Crimson Hold',
                      description: 'A fortified keep perched on the hill overlooking the valley.',
                      url: '#crimson-hold',
                  },
                  {
                      guid: 'settlement-moonlit-harbor',
                      icon: 'assets/icons/location/village.svg',
                      position: { x: 0.7, y: 0.75 },
                      size: 30,
                      name: 'Moonlit Harbor',
                      description: 'A lively port famous for its night markets and lantern festivals.',
                      url: '#moonlit-harbor',
                  },
              ],
          },
      {
              id: 'points',
              name: 'Points of Interest',
              visible: true,
              locked: false,
              sortIndex: 2,
              features: [
                  {
                      guid: 'poi-watchtower',
                      icon: 'assets/icons/location/tower.svg',
                      position: { x: 0.4, y: 0.2 },
                      size: 28,
                      name: 'Azure Watchtower',
                      description: 'A lone watchtower keeping vigil over the northern frontier.',
                      url: '#azure-watchtower',
                  },
                  {
                      guid: 'poi-shrine',
                      icon: 'assets/icons/location/hut.svg',
                      position: { x: 0.85, y: 0.55 },
                      size: 28,
                      name: 'Lotus Shrine',
                      description: 'A secluded shrine said to bless travellers with safe passage.',
                      url: '#lotus-shrine',
                  },
              ],
          },
      ],
  });

  function loadState() {
      try {
          const params = new URLSearchParams(window.location.search);
          WebMapper.debug = params.has('debug');

      if (typeof localStorage === 'undefined') {
        return structuredClone(defaults);
      }
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) return structuredClone(defaults);

      const parsedState = JSON.parse(raw);

      if (!parsedState.paths || !Array.isArray(parsedState.paths)) {
        parsedState.paths = structuredClone(defaults.paths);
      }

      if (!parsedState.layers || !Array.isArray(parsedState.layers)) {
        parsedState.layers = structuredClone(defaults.layers);
      }

      return parsedState;
    } catch (e) {
      console.warn('Failed to load saved state:', e);
      return structuredClone(defaults);
    }
  }

  const state = (WebMapper.state = WebMapper.state || {});
  Object.assign(state, loadState());
  state.canvas = Object.assign({}, defaults.canvas, state.canvas);
  state.settings = Object.assign({}, defaults.settings, state.settings);

  const sourceLayers = Array.isArray(state.layers)
    ? state.layers
    : defaults.layers;
    
  const layersWithMetadata = sourceLayers.map((layer, index) => ({
    layer: { ...layer },
    originalIndex: index,
  }));

  layersWithMetadata.forEach((entry, index) => {
    const { layer } = entry;
    layer.sortIndex = typeof layer.sortIndex === 'number' ? layer.sortIndex : index;
  });

  layersWithMetadata.sort((a, b) => {
    if (a.layer.sortIndex !== b.layer.sortIndex) {
      return a.layer.sortIndex - b.layer.sortIndex;
    }
    return a.originalIndex - b.originalIndex;
  });

  state.layers = layersWithMetadata.map((entry, index) => {
    entry.layer.sortIndex = index;
    return entry.layer;
  });

  if (typeof state.activeLayerId === 'undefined') {
    state.activeLayerId = defaults.activeLayerId;
  }
  
  state.tool = state.tool || defaults.tool;

  function saveState() {
    try {
      if (typeof localStorage === 'undefined') {
        return;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }

  WebMapper.loadState = loadState;
  WebMapper.saveState = saveState;

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-stack');
    if (!container) return;

    const terrainCanvas = WebMapper.utils.createLayerCanvas('terrain-layer', container);
    const featuresCanvas = WebMapper.utils.createLayerCanvas('features-layer', container);
    const guiCanvas = WebMapper.utils.createLayerCanvas('gui-layer', container);
    const contexts = {
      terrain: terrainCanvas.getContext('2d'),
      features: featuresCanvas.getContext('2d'),
      gui: guiCanvas.getContext('2d'),
    };

    const utils = WebMapper.utils || {};
    const clamp =
      typeof utils.clamp === 'function' ? utils.clamp : (value, min, max) => Math.min(Math.max(value, min), max);
    const view = (state.view = Object.assign({ x: 0, y: 0, zoom: 1 }, state.view));
    let isPanning = false;
    let activePointerId = null;
    let pointerCaptureTarget = null;
    let startPointer = { x: 0, y: 0, viewX: 0, viewY: 0, zoom: 1 };

    function getWorldSize() {
      return {
        width: state.canvas?.width ?? terrainCanvas.width,
        height: state.canvas?.height ?? terrainCanvas.height,
      };
    }

    function getViewportSize() {
      return {
        width: terrainCanvas.width / view.zoom,
        height: terrainCanvas.height / view.zoom,
      };
    }

    function centerView() {
      const world = getWorldSize();
      const viewport = getViewportSize();
      view.x = world.width * 0.5 - viewport.width * 0.5;
      view.y = world.height * 0.5 - viewport.height * 0.5;
    }

    function resize(width, height) {
      const rect = container.getBoundingClientRect();
      const targetWidth = Math.max(320, Math.floor(width ?? rect.width) || defaults.canvas.width);
      const targetHeight = Math.max(240, Math.floor(height ?? rect.height) || defaults.canvas.height);

      WebMapper.utils.resizeCanvas(terrainCanvas, targetWidth, targetHeight);
      WebMapper.utils.resizeCanvas(featuresCanvas, targetWidth, targetHeight);
      WebMapper.utils.resizeCanvas(guiCanvas, targetWidth, targetHeight);

      state.canvas.width = targetWidth;
      state.canvas.height = targetHeight;
    }

    function render() {
      container.classList.toggle('is-pan-tool', state.tool === 'pan');
      container.classList.toggle('is-panning-active', isPanning);
      WebMapper.ui?.toolControls?.setActiveTool?.(state.tool);
      window.RenderTerrain?.(contexts.terrain, state);
      window.RenderFeatures?.(contexts.features, state);
      window.RenderGUI?.(contexts.gui, state);
    }

    let animationTimer = null;
    function updateAnimationLoop() {
      if (animationTimer) {
        window.clearInterval(animationTimer);
        animationTimer = null;
      }

      if (state.settings.animation === 'none') {
        return;
      }

      const interval = state.settings.animation === 'fast' ? 1000 / 30 : 1000 / 12;
      animationTimer = window.setInterval(render, interval);
    }

    WebMapper.resize = (width, height) => {
      resize(width, height);
      render();
    };
    WebMapper.render = render;
    WebMapper.updateAnimation = () => {
      updateAnimationLoop();
      render();
    };

    function shouldStartPan(event) {
      if (event.button === 1) {
        return true;
      }
      return event.button === 0 && state.tool === 'pan';
    }

    function setHoveredFeature(next) {
      const current = runtime.hoveredFeature;
      const isSame =
        current?.layerId === next?.layerId && current?.guid === next?.guid;
      if (isSame) {
        return;
      }

      runtime.hoveredFeature = next || null;
      render();
    }

    function updateHoveredFeatureFromPointer(event) {
      const renderedFeatures = runtime.renderedFeatures;
      if (!Array.isArray(renderedFeatures) || renderedFeatures.length === 0) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const worldX = view.x + pointerX / view.zoom;
      const worldY = view.y + pointerY / view.zoom;

      const nextHover = renderedFeatures.find((entry) => {
        const size = Number(entry.size) || 24;
        const halfSize = Math.max(size * 0.6, 12);
        return (
          Math.abs(worldX - entry.x) <= halfSize &&
          Math.abs(worldY - entry.y) <= halfSize
        );
      });

      if (!nextHover) {
        setHoveredFeature(null);
      } else {
        setHoveredFeature({ layerId: nextHover.layerId, guid: nextHover.guid });
      }
    }

    function startPan(event) {
      isPanning = true;
      activePointerId = event.pointerId;
      startPointer = {
        x: event.clientX,
        y: event.clientY,
        viewX: view.x,
        viewY: view.y,
        zoom: view.zoom,
      };
      container.classList.add('is-panning-active');
    }

    function endPan() {
      isPanning = false;
      container.classList.remove('is-panning-active');
      if (
        pointerCaptureTarget &&
        typeof pointerCaptureTarget.releasePointerCapture === 'function' &&
        activePointerId !== null
      ) {
        const hasCapture =
          typeof pointerCaptureTarget.hasPointerCapture === 'function'
            ? pointerCaptureTarget.hasPointerCapture(activePointerId)
            : true;
        if (hasCapture) {
          pointerCaptureTarget.releasePointerCapture(activePointerId);
        }
      }
      activePointerId = null;
      pointerCaptureTarget = null;
      setHoveredFeature(null);
      render();
    }

    container.addEventListener('pointerdown', (event) => {
      if (!shouldStartPan(event)) {
        updateHoveredFeatureFromPointer(event);
        return;
      }

      event.preventDefault();
      startPan(event);
      setHoveredFeature(null);

      pointerCaptureTarget = event.target;
      if (pointerCaptureTarget && typeof pointerCaptureTarget.setPointerCapture === 'function') {
        pointerCaptureTarget.setPointerCapture(event.pointerId);
      }
    });

    container.addEventListener(
      'pointermove',
      (event) => {
        const isActivePan = isPanning && event.pointerId === activePointerId;
        if (isActivePan) {
          event.preventDefault();

          const deltaX = event.clientX - startPointer.x;
          const deltaY = event.clientY - startPointer.y;
          view.x = startPointer.viewX - deltaX / startPointer.zoom;
          view.y = startPointer.viewY - deltaY / startPointer.zoom;
          render();
          return;
        }

        if (!isPanning) {
          updateHoveredFeatureFromPointer(event);
        }
      },
      { passive: false }
    );

    container.addEventListener('pointerup', (event) => {
      if (event.pointerId !== activePointerId) {
        if (!isPanning) {
          updateHoveredFeatureFromPointer(event);
        }
        return;
      }
      endPan();
    });

    container.addEventListener('pointercancel', (event) => {
      if (event.pointerId !== activePointerId) {
        if (!isPanning) {
          updateHoveredFeatureFromPointer(event);
        }
        return;
      }
      endPan();
    });

    container.addEventListener('pointerleave', () => {
      if (!isPanning) {
        setHoveredFeature(null);
      }
    });

    container.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();

        const delta = -event.deltaY;
        const zoomFactor = delta > 0 ? 1.1 : 0.9;
        const newZoom = clamp(view.zoom * zoomFactor, 0.5, 4);
        const rect = container.getBoundingClientRect();
        const pointerX = event.clientX - rect.left;
        const pointerY = event.clientY - rect.top;
        const worldX = view.x + pointerX / view.zoom;
        const worldY = view.y + pointerY / view.zoom;

        view.zoom = newZoom;
        view.x = worldX - pointerX / view.zoom;
        view.y = worldY - pointerY / view.zoom;
        render();
      },
      { passive: false }
    );

    resize(state.canvas.width, state.canvas.height);
    render();
    updateAnimationLoop();

    WebMapper.centerView = () => {
      centerView();
      render();
    };

    window.addEventListener('resize', () => {
      resize();
      render();
    });
  });
})();
