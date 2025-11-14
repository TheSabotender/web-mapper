(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});

  function ensureNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function prepareMapContext(ctx, state) {
    if (!ctx) {
      return () => {};
    }

    const view = state?.view || { x: 0, y: 0, zoom: 1 };

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(view.zoom, 0, 0, view.zoom, -view.x * view.zoom, -view.y * view.zoom);

    return () => {
      ctx.restore();
    };
  }

  WebMapper.utils = {
    ensureNumber,
    clamp,
    prepareMapContext,
    resizeCanvas(canvas, width, height) {
      const w = ensureNumber(width, canvas.clientWidth);
      const h = ensureNumber(height, canvas.clientHeight);
      canvas.width = w;
      canvas.height = h;
    },
    createLayerCanvas(id, container) {
      const canvas = document.getElementById(id);
      if (!canvas) {
        throw new Error(`Canvas with id "${id}" was not found.`);
      }

      if (container && canvas.parentElement !== container) {
        container.appendChild(canvas);
      }

      return canvas;
    },
  };
})();
