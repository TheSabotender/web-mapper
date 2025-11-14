(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});

  function ensureNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  WebMapper.utils = {
    ensureNumber,
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
