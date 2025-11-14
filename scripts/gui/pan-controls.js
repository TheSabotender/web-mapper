(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});
  const ui = (WebMapper.ui = WebMapper.ui || {});

  ui.PanControls = {
    init(context) {
      if (!context) return null;
      const slider = context.references?.panZoom;
      if (!slider) {
        return null;
      }

      const toolsState = (context.toolsState = context.toolsState || {});
      const view = (context.view = context.view || { x: 0, y: 0, zoom: 1 });
      toolsState.pan = Object.assign({ zoom: view.zoom ?? 1 }, toolsState.pan);

      function sync() {
        const min = parseFloat(slider.min) || 0.5;
        const max = parseFloat(slider.max) || 4;
        const clamp = context.clamp || ((value, minValue, maxValue) => Math.min(Math.max(value, minValue), maxValue));
        const zoom = clamp(Number(view.zoom) || 1, min, max);
        slider.value = String(zoom);
        toolsState.pan.zoom = zoom;
        view.zoom = zoom;
        context.updateOutput?.('pan-zoom', `${Math.round(zoom * 100)}%`);
      }

      slider.addEventListener('input', (event) => {
        const clamp = context.clamp || ((value, minValue, maxValue) => Math.min(Math.max(value, minValue), maxValue));
        const min = parseFloat(slider.min) || 0.5;
        const max = parseFloat(slider.max) || 4;
        const value = clamp(parseFloat(event.target.value) || 1, min, max);
        const currentZoom = Number.isFinite(view.zoom) ? view.zoom : 1;
        const getCanvasSize = context.getCanvasSize || (() => ({ width: 0, height: 0 }));
        const size = getCanvasSize();
        if (size.width > 0 && size.height > 0) {
          const centerX = (view.x || 0) + (size.width * 0.5) / currentZoom;
          const centerY = (view.y || 0) + (size.height * 0.5) / currentZoom;
          view.zoom = value;
          toolsState.pan.zoom = value;
          view.x = centerX - (size.width * 0.5) / value;
          view.y = centerY - (size.height * 0.5) / value;
        } else {
          view.zoom = value;
          toolsState.pan.zoom = value;
        }
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
