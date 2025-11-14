(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});
  const ui = (WebMapper.ui = WebMapper.ui || {});

  function requestRender() {
    if (typeof WebMapper.render === 'function') {
      WebMapper.render();
    }
  }

  function formatToggle(value) {
    return value ? 'ON' : 'OFF';
  }

  function RenderGUI(ctx, state) {
    WebMapper.ui?.debugPanel?.update?.(state);

    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (!state?.debug) {
      return;
    }

    const activeTool = state?.tool ?? 'N/A';
    const activeLayer = state?.activeLayerId ?? 'N/A';
    const terrainVisible = Boolean(state?.terrainVisible);
    const terrainLocked = Boolean(state?.terrainLocked);
    const pathsVisible = Boolean(state?.pathsVisible);
    const pathsLocked = Boolean(state?.pathsLocked);

    const lines = [
      { font: '16px "Segoe UI", sans-serif', text: `Tool: ${activeTool}` },
      { font: '13px "Segoe UI", sans-serif', text: `Active layer: ${activeLayer}` },
      {
        font: '13px "Segoe UI", sans-serif',
        text: `Terrain → Visible: ${formatToggle(terrainVisible)} · Locked: ${formatToggle(
          terrainLocked
        )}`,
      },
      {
        font: '13px "Segoe UI", sans-serif',
        text: `Paths → Visible: ${formatToggle(pathsVisible)} · Locked: ${formatToggle(
          pathsLocked
        )}`,
      },
    ];

    ctx.save();

    const paddingX = 16;
    const paddingY = 16;
    const lineSpacing = 20;
    let maxWidth = 0;

    lines.forEach((line) => {
      ctx.font = line.font;
      const width = ctx.measureText(line.text).width;
      if (width > maxWidth) {
        maxWidth = width;
      }
    });

    const boxWidth = maxWidth + paddingX * 2;
    const boxHeight = paddingY * 2 + lineSpacing * lines.length;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(16, 16, boxWidth, boxHeight);

    let currentY = 16 + paddingY + 4;
    lines.forEach((line, index) => {
      ctx.font = line.font;
      ctx.fillStyle = index === 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(line.text, 16 + paddingX, currentY);
      currentY += lineSpacing;
    });

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
    const layerPanel = ui.LayerPanel?.init?.({ state, requestRender });
    if (layerPanel) {
      ui.layerPanelControls = layerPanel;
    }
    const uiScale = state.settings?.uiScale ?? WebMapper.defaults?.settings?.uiScale ?? 100;
    ui.applyUiScale(uiScale);
  }

  document.addEventListener('DOMContentLoaded', bindControls);

  window.RenderGUI = RenderGUI;
  WebMapper.RenderGUI = RenderGUI;
})();
