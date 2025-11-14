(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});
  const ui = (WebMapper.ui = WebMapper.ui || {});

  ui.BrushControls = {
    init(context) {
      if (!context) return null;
      const references = context.references || {};
      const sizeInput = references.brushSize;
      const strengthInput = references.brushStrength;
      const softnessInput = references.brushSoftness;
      const colorButton = references.brushColorButton;
      const colorPicker = references.brushColorPicker;

      if (!sizeInput && !strengthInput && !softnessInput && !colorButton) {
        return null;
      }

      const toolsState = (context.toolsState = context.toolsState || {});
      const defaults = { size: 48, strength: 75, softness: 50, color: '#4f8bff' };
      const brush = (toolsState.brush = Object.assign({}, defaults, toolsState.brush));
      const clamp = context.clamp || ((value, min, max) => Math.min(Math.max(value, min), max));

      function setColor(value) {
        if (colorButton) {
          colorButton.style.setProperty('--swatch-color', value);
        }
        if (colorPicker) {
          colorPicker.value = value;
        }
      }

      function sync() {
        if (sizeInput) {
          const min = parseFloat(sizeInput.min) || 1;
          const max = parseFloat(sizeInput.max) || 200;
          const raw = Number(brush.size);
          const value = clamp(Number.isFinite(raw) ? Math.round(raw) : min, min, max);
          sizeInput.value = String(value);
          brush.size = value;
          context.updateOutput?.('brush-size', `${value} px`);
        }
        if (strengthInput) {
          const value = clamp(Number(brush.strength) || 0, 0, 100);
          strengthInput.value = String(value);
          brush.strength = value;
          context.updateOutput?.('brush-strength', `${value}%`);
        }
        if (softnessInput) {
          const value = clamp(Number(brush.softness) || 0, 0, 100);
          softnessInput.value = String(value);
          brush.softness = value;
          context.updateOutput?.('brush-softness', `${value}%`);
        }
        if (colorButton) {
          const fallbackColor = '#4f8bff';
          const color =
            typeof brush.color === 'string' && /^#([0-9a-f]{6})$/i.test(brush.color)
              ? brush.color
              : fallbackColor;
          brush.color = color;
          setColor(color);
        }
      }

      function handleColorChange(value) {
        if (typeof value !== 'string' || !/^#([0-9a-f]{6})$/i.test(value)) {
          return;
        }
        brush.color = value;
        setColor(value);
        context.requestRender?.();
      }

      sizeInput?.addEventListener('input', (event) => {
        const min = parseFloat(sizeInput.min) || 1;
        const max = parseFloat(sizeInput.max) || 200;
        const value = clamp(parseFloat(event.target.value) || min, min, max);
        brush.size = Math.round(value);
        sync();
        context.requestRender?.();
      });

      strengthInput?.addEventListener('input', (event) => {
        brush.strength = clamp(parseFloat(event.target.value) || 0, 0, 100);
        sync();
        context.requestRender?.();
      });

      softnessInput?.addEventListener('input', (event) => {
        brush.softness = clamp(parseFloat(event.target.value) || 0, 0, 100);
        sync();
        context.requestRender?.();
      });

      colorButton?.addEventListener('click', () => {
        colorPicker?.click();
      });

      colorPicker?.addEventListener('input', (event) => {
        handleColorChange(event.target.value);
        sync();
      });

      colorPicker?.addEventListener('change', (event) => {
        handleColorChange(event.target.value);
        sync();
      });

      sync();

      return {
        sync,
      };
    },
  };
})();
