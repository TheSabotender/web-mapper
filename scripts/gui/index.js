(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});
  const ui = (WebMapper.ui = WebMapper.ui || {});

  function requestRender() {
    if (typeof WebMapper.render === 'function') {
      WebMapper.render();
    }
  }

  function RenderGUI(ctx, state) {
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (!state?.debug) {
      return;
    }

    const activeTool = state?.tool ?? 'N/A';
    const features = state?.features ?? {};
    const featureSummary = [
      `Roads: ${features.roads ? 'ON' : 'OFF'}`,
      `Settlements: ${features.settlements ? 'ON' : 'OFF'}`,
      `Points: ${features.points ? 'ON' : 'OFF'}`,
    ].join(', ');

    ctx.save();
    ctx.font = '16px "Segoe UI", sans-serif';
    const toolLabel = `Tool: ${activeTool}`;
    const featureLabel = `Layers → ${featureSummary}`;
    const toolWidth = ctx.measureText(toolLabel).width;
    ctx.font = '13px "Segoe UI", sans-serif';
    const featureWidth = ctx.measureText(featureLabel).width;
    const boxWidth = Math.max(toolWidth, featureWidth) + 32;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(16, 16, boxWidth, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText(toolLabel, 32, 44);

    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText(featureLabel, 32, 68);

    ctx.restore();
  }

  function getCanvasSize() {
    const defaults = WebMapper.defaults || {};
    const state = WebMapper.state || {};
    return {
      width: state.canvas?.width ?? defaults.canvas?.width ?? 0,
      height: state.canvas?.height ?? defaults.canvas?.height ?? 0,
    };
  }

  function bindToolControls(state) {
    const container = document.getElementById('tool-controls');
    if (!container) {
      return null;
    }

    const panels = Array.from(container.querySelectorAll('[data-tool-panel]'));
    if (!panels.length) {
      return null;
    }

    const outputs = new Map(
      Array.from(container.querySelectorAll('[data-output-for]')).map((output) => [
        output.dataset.outputFor,
        output,
      ])
    );

    const references = {
      panZoom: container.querySelector('[data-control="pan-zoom"]'),
      brushSize: container.querySelector('[data-control="brush-size"]'),
      brushStrength: container.querySelector('[data-control="brush-strength"]'),
      brushSoftness: container.querySelector('[data-control="brush-softness"]'),
      brushColorButton: container.querySelector('[data-control="brush-color"]'),
      brushColorPicker: container.querySelector('[data-picker-for="brush-color"]'),
      eraserSize: container.querySelector('[data-control="eraser-size"]'),
      eraserStrength: container.querySelector('[data-control="eraser-strength"]'),
      eraserSoftness: container.querySelector('[data-control="eraser-softness"]'),
      landmarkScale: container.querySelector('[data-control="landmark-scale"]'),
      landmarkModeButtons: Array.from(container.querySelectorAll('[data-control="landmark-mode"]')),
      landmarkImageButton: container.querySelector('[data-control="landmark-image"]'),
    };

    const utils = WebMapper.utils || {};
    const clamp =
      typeof utils.clamp === 'function'
        ? utils.clamp
        : (value, min, max) => Math.min(Math.max(value, min), max);

    const view = (state.view = Object.assign({ x: 0, y: 0, zoom: 1 }, state.view));
    const toolsState = (state.tools = state.tools || {});

    function updateOutput(name, text) {
      const output = outputs.get(name);
      if (output) {
        output.textContent = text;
      }
    }

    const context = {
      state,
      view,
      toolsState,
      container,
      panels,
      references,
      clamp,
      requestRender,
      updateOutput,
      getCanvasSize,
    };

    const modules = [
      ui.PanControls?.init?.(context),
      ui.BrushControls?.init?.(context),
      ui.EraserControls?.init?.(context),
      ui.LandmarkControls?.init?.(context),
    ].filter(Boolean);

    let isTransitioning = false;
    let pendingTool = null;

    function activatePanel(tool) {
      panels.forEach((panel) => {
        const isActive = panel.dataset.toolPanel === tool;
        panel.hidden = !isActive;
      });
    }

    function syncPanels() {
      modules.forEach((module) => module?.sync?.());
    }

    function showTool(tool, animate = false) {
      if (!tool) return;
      activatePanel(tool);
      container.dataset.activeTool = tool;
      container.classList.add('is-visible');
      container.setAttribute('aria-hidden', 'false');
      syncPanels();
      if (animate) {
        container.classList.add('is-entering');
        requestAnimationFrame(() => {
          container.classList.remove('is-entering');
        });
      }
    }

    function setActiveTool(tool) {
      if (!tool) return;
      const currentTool = container.dataset.activeTool;
      if (!currentTool) {
        showTool(tool, true);
        return;
      }

      if (currentTool === tool && !isTransitioning) {
        syncPanels();
        return;
      }

      pendingTool = tool;

      if (isTransitioning) {
        return;
      }

      isTransitioning = true;
      container.setAttribute('aria-hidden', 'true');
      container.classList.add('is-leaving');
    }

    container.addEventListener('transitionend', (event) => {
      if (event.target !== container || event.propertyName !== 'opacity') {
        return;
      }

      if (!isTransitioning) {
        return;
      }

      container.classList.remove('is-leaving');
      const nextTool = pendingTool || container.dataset.activeTool;
      pendingTool = null;
      isTransitioning = false;
      showTool(nextTool, true);
    });

    const api = {
      setActiveTool,
      sync: syncPanels,
    };

    ui.toolControls = api;
    return api;
  }

  ui.applyUiScale = (percent) => {
    const value = Number(percent);
    if (!Number.isFinite(value)) {
      document.documentElement.style.setProperty('--ui-scale', '1');
      return;
    }
    const normalized = Math.min(200, Math.max(25, value)) / 100;
    document.documentElement.style.setProperty('--ui-scale', String(normalized));
  };

  function bindControls() {
    const state = (WebMapper.state = WebMapper.state || {});
    const toolControls = bindToolControls(state);
    ui.Toolbar?.init?.({ state, toolControls, requestRender });
    ui.LayerPanel?.init?.({ state, requestRender });
    const uiScale = state.settings?.uiScale ?? WebMapper.defaults?.settings?.uiScale ?? 100;
    ui.applyUiScale(uiScale);
  }

  document.addEventListener('DOMContentLoaded', bindControls);

  window.RenderGUI = RenderGUI;
  WebMapper.RenderGUI = RenderGUI;
})();
