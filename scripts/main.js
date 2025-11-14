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

    resize(state.canvas.width, state.canvas.height);
    render();
    updateAnimationLoop();

    window.addEventListener('resize', () => {
      resize();
      render();
    });
  });
})();
