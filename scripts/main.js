(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});

  const defaults = (WebMapper.defaults = WebMapper.defaults || {
    canvas: { width: 1280, height: 720 },
    settings: { showGrid: true, animation: 'none' },
    features: { roads: true, settlements: true, points: true },
    tool: 'brush',
  });

  const state = (WebMapper.state = WebMapper.state || {});
  state.canvas = Object.assign({}, defaults.canvas, state.canvas);
  state.settings = Object.assign({}, defaults.settings, state.settings);
  state.features = Object.assign({}, defaults.features, state.features);
  state.tool = state.tool || defaults.tool;
  if (typeof state.debug === 'undefined') {
    const params = new URLSearchParams(window.location.search);
    state.debug = params.has('debug');
  }

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
      render();
    }

    container.addEventListener('pointerdown', (event) => {
      if (!shouldStartPan(event)) {
        return;
      }

      event.preventDefault();
      startPan(event);

      pointerCaptureTarget = event.target;
      if (pointerCaptureTarget && typeof pointerCaptureTarget.setPointerCapture === 'function') {
        pointerCaptureTarget.setPointerCapture(event.pointerId);
      }
    });

    container.addEventListener(
      'pointermove',
      (event) => {
        if (!isPanning || event.pointerId !== activePointerId) {
          return;
        }

        event.preventDefault();

        const deltaX = event.clientX - startPointer.x;
        const deltaY = event.clientY - startPointer.y;
        view.x = startPointer.viewX - deltaX / startPointer.zoom;
        view.y = startPointer.viewY - deltaY / startPointer.zoom;
        render();
      },
      { passive: false }
    );

    container.addEventListener('pointerup', (event) => {
      if (event.pointerId !== activePointerId) {
        return;
      }
      endPan();
    });

    container.addEventListener('pointercancel', (event) => {
      if (event.pointerId !== activePointerId) {
        return;
      }
      endPan();
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
