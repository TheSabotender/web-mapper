(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});
  const ui = (WebMapper.ui = WebMapper.ui || {});

  ui.EraserControls = {
    init(context) {
      if (!context) return null;
      const references = context.references || {};
      const sizeInput = references.eraserSize;
      const strengthInput = references.eraserStrength;
      const softnessInput = references.eraserSoftness;

      if (!sizeInput && !strengthInput && !softnessInput) {
        return null;
      }

      const eraser = { size: 48, strength: 100, softness: 40 };
      const clamp = context.clamp || ((value, min, max) => Math.min(Math.max(value, min), max));

      function sync() {
        if (sizeInput) {
          const min = parseFloat(sizeInput.min) || 1;
          const max = parseFloat(sizeInput.max) || 200;
          const raw = Number(eraser.size);
          const value = clamp(Number.isFinite(raw) ? Math.round(raw) : min, min, max);
          sizeInput.value = String(value);
          eraser.size = value;
          context.updateOutput?.('eraser-size', `${value} px`);
        }
        if (strengthInput) {
          const value = clamp(Number(eraser.strength) || 0, 0, 100);
          strengthInput.value = String(value);
          eraser.strength = value;
          context.updateOutput?.('eraser-strength', `${value}%`);
        }
        if (softnessInput) {
          const value = clamp(Number(eraser.softness) || 0, 0, 100);
          softnessInput.value = String(value);
          eraser.softness = value;
          context.updateOutput?.('eraser-softness', `${value}%`);
        }
      }

      sizeInput?.addEventListener('input', (event) => {
        const min = parseFloat(sizeInput.min) || 1;
        const max = parseFloat(sizeInput.max) || 200;
        const value = clamp(parseFloat(event.target.value) || min, min, max);
        eraser.size = Math.round(value);
        sync();
        context.requestRender?.();
      });

      strengthInput?.addEventListener('input', (event) => {
        eraser.strength = clamp(parseFloat(event.target.value) || 0, 0, 100);
        sync();
        context.requestRender?.();
      });

      softnessInput?.addEventListener('input', (event) => {
        eraser.softness = clamp(parseFloat(event.target.value) || 0, 0, 100);
        sync();
        context.requestRender?.();
      });

      sync();

      return {
        sync,
      };
    },
  };
})();
