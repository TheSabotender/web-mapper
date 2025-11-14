(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});

  function ensureNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function generateGuid() {
    if (typeof crypto !== 'undefined') {
      if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
      if (typeof crypto.getRandomValues === 'function') {
        const array = crypto.getRandomValues(new Uint8Array(16));
        array[6] = (array[6] & 0x0f) | 0x40;
        array[8] = (array[8] & 0x3f) | 0x80;
        const byteToHex = (byte) => byte.toString(16).padStart(2, '0');
        return (
          byteToHex(array[0]) +
          byteToHex(array[1]) +
          byteToHex(array[2]) +
          byteToHex(array[3]) +
          '-' +
          byteToHex(array[4]) +
          byteToHex(array[5]) +
          '-' +
          byteToHex(array[6]) +
          byteToHex(array[7]) +
          '-' +
          byteToHex(array[8]) +
          byteToHex(array[9]) +
          '-' +
          byteToHex(array[10]) +
          byteToHex(array[11]) +
          byteToHex(array[12]) +
          byteToHex(array[13]) +
          byteToHex(array[14]) +
          byteToHex(array[15])
        );
      }
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
      const random = Math.floor(Math.random() * 16);
      const value = char === 'x' ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    });
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
    generateGuid,
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
