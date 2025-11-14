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

  function bindToolControls(state) {
    const container = document.getElementById('tool-controls');
    if (!container) {
      return null;
    }

    const panels = Array.from(container.querySelectorAll('[data-tool-panel]'));
    if (!panels.length) {
      return null;
    }

    const utils = WebMapper.utils || {};
    const clamp =
      typeof utils.clamp === 'function'
        ? utils.clamp
        : (value, min, max) => Math.min(Math.max(value, min), max);

    const stateView = (state.view = state.view || { x: 0, y: 0, zoom: 1 });
    const toolsState = (state.tools = state.tools || {});
    toolsState.pan = Object.assign({ zoom: stateView.zoom ?? 1 }, toolsState.pan);
    toolsState.brush = Object.assign(
      { size: 48, strength: 75, softness: 50, color: '#4f8bff' },
      toolsState.brush
    );
    toolsState.eraser = Object.assign(
      { size: 48, strength: 100, softness: 40 },
      toolsState.eraser
    );
    toolsState.landmark = Object.assign(
      { mode: 'select', scale: 1, imageName: '' },
      toolsState.landmark
    );

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
      landmarkModeButtons: Array.from(
        container.querySelectorAll('[data-control="landmark-mode"]')
      ),
      landmarkImageButton: container.querySelector('[data-control="landmark-image"]'),
      landmarkImagePicker: container.querySelector('[data-picker-for="landmark-image"]'),
      landmarkImageValue: container.querySelector('[data-file-value="landmark-image"]'),
    };

    function updateOutput(name, text) {
      const output = outputs.get(name);
      if (output) {
        output.textContent = text;
      }
    }

    function syncLandmarkMode() {
      let mode = toolsState.landmark.mode;
      if (mode !== 'select' && mode !== 'add') {
        mode = 'select';
        toolsState.landmark.mode = mode;
      }
      references.landmarkModeButtons.forEach((button) => {
        const isActive = button.dataset.value === mode;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
    }

    function syncControlValues() {
      const view = state.view || stateView;

      if (references.panZoom) {
        const min = parseFloat(references.panZoom.min) || 0.5;
        const max = parseFloat(references.panZoom.max) || 4;
        const zoom = clamp(Number(view.zoom) || 1, min, max);
        references.panZoom.value = String(zoom);
        toolsState.pan.zoom = zoom;
        view.zoom = zoom;
        updateOutput('pan-zoom', `${Math.round(zoom * 100)}%`);
      }

      const brush = toolsState.brush;
      if (references.brushSize) {
        const min = parseFloat(references.brushSize.min) || 1;
        const max = parseFloat(references.brushSize.max) || 200;
        const raw = Number(brush.size);
        const value = clamp(Number.isFinite(raw) ? Math.round(raw) : min, min, max);
        references.brushSize.value = String(value);
        updateOutput('brush-size', `${value} px`);
        brush.size = value;
      }
      if (references.brushStrength) {
        const value = clamp(Number(brush.strength) || 0, 0, 100);
        references.brushStrength.value = String(value);
        updateOutput('brush-strength', `${value}%`);
        brush.strength = value;
      }
      if (references.brushSoftness) {
        const value = clamp(Number(brush.softness) || 0, 0, 100);
        references.brushSoftness.value = String(value);
        updateOutput('brush-softness', `${value}%`);
        brush.softness = value;
      }
      if (references.brushColorButton) {
        const fallbackColor = '#4f8bff';
        const color =
          typeof brush.color === 'string' && /^#([0-9a-f]{6})$/i.test(brush.color)
            ? brush.color
            : fallbackColor;
        brush.color = color;
        references.brushColorButton.style.setProperty('--swatch-color', color);
        if (references.brushColorPicker) {
          references.brushColorPicker.value = color;
        }
      }

      const eraser = toolsState.eraser;
      if (references.eraserSize) {
        const min = parseFloat(references.eraserSize.min) || 1;
        const max = parseFloat(references.eraserSize.max) || 200;
        const raw = Number(eraser.size);
        const value = clamp(Number.isFinite(raw) ? Math.round(raw) : min, min, max);
        references.eraserSize.value = String(value);
        updateOutput('eraser-size', `${value} px`);
        eraser.size = value;
      }
      if (references.eraserStrength) {
        const value = clamp(Number(eraser.strength) || 0, 0, 100);
        references.eraserStrength.value = String(value);
        updateOutput('eraser-strength', `${value}%`);
        eraser.strength = value;
      }
      if (references.eraserSoftness) {
        const value = clamp(Number(eraser.softness) || 0, 0, 100);
        references.eraserSoftness.value = String(value);
        updateOutput('eraser-softness', `${value}%`);
        eraser.softness = value;
      }

      if (references.landmarkScale) {
        const min = parseFloat(references.landmarkScale.min) || 0.5;
        const max = parseFloat(references.landmarkScale.max) || 3;
        const raw = Number(toolsState.landmark.scale);
        const value = clamp(Number.isFinite(raw) ? raw : 1, min, max);
        references.landmarkScale.value = String(value);
        updateOutput('landmark-scale', `${Math.round(value * 100)}%`);
        toolsState.landmark.scale = value;
      }

      syncLandmarkMode();

      if (references.landmarkImageValue) {
        const name = toolsState.landmark.imageName || 'None';
        references.landmarkImageValue.textContent = name;
      }
    }

    let isTransitioning = false;
    let pendingTool = null;

    function activatePanel(tool) {
      panels.forEach((panel) => {
        const isActive = panel.dataset.toolPanel === tool;
        panel.hidden = !isActive;
      });
    }

    function showTool(tool, animate = false) {
      if (!tool) return;
      activatePanel(tool);
      container.dataset.activeTool = tool;
      container.classList.add('is-visible');
      container.setAttribute('aria-hidden', 'false');
      syncControlValues();
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
        syncControlValues();
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

    references.panZoom?.addEventListener('input', (event) => {
      const min = parseFloat(event.target.min) || 0.5;
      const max = parseFloat(event.target.max) || 4;
      const value = clamp(parseFloat(event.target.value) || 1, min, max);
      toolsState.pan.zoom = value;
      stateView.zoom = value;
      if (state.view) {
        state.view.zoom = value;
      }
      syncControlValues();
      requestRender();
    });

    references.brushSize?.addEventListener('input', (event) => {
      const min = parseFloat(event.target.min) || 1;
      const max = parseFloat(event.target.max) || 200;
      const value = clamp(parseFloat(event.target.value) || min, min, max);
      toolsState.brush.size = Math.round(value);
      syncControlValues();
      requestRender();
    });

    references.brushStrength?.addEventListener('input', (event) => {
      toolsState.brush.strength = clamp(parseFloat(event.target.value) || 0, 0, 100);
      syncControlValues();
      requestRender();
    });

    references.brushSoftness?.addEventListener('input', (event) => {
      toolsState.brush.softness = clamp(parseFloat(event.target.value) || 0, 0, 100);
      syncControlValues();
      requestRender();
    });

    const handleBrushColorChange = (value) => {
      if (typeof value !== 'string' || !/^#([0-9a-f]{6})$/i.test(value)) {
        return;
      }
      toolsState.brush.color = value;
      syncControlValues();
      requestRender();
    };

    references.brushColorButton?.addEventListener('click', () => {
      references.brushColorPicker?.click();
    });

    references.brushColorPicker?.addEventListener('input', (event) => {
      handleBrushColorChange(event.target.value);
    });
    references.brushColorPicker?.addEventListener('change', (event) => {
      handleBrushColorChange(event.target.value);
    });

    references.eraserSize?.addEventListener('input', (event) => {
      const min = parseFloat(event.target.min) || 1;
      const max = parseFloat(event.target.max) || 200;
      const value = clamp(parseFloat(event.target.value) || min, min, max);
      toolsState.eraser.size = Math.round(value);
      syncControlValues();
      requestRender();
    });

    references.eraserStrength?.addEventListener('input', (event) => {
      toolsState.eraser.strength = clamp(parseFloat(event.target.value) || 0, 0, 100);
      syncControlValues();
      requestRender();
    });

    references.eraserSoftness?.addEventListener('input', (event) => {
      toolsState.eraser.softness = clamp(parseFloat(event.target.value) || 0, 0, 100);
      syncControlValues();
      requestRender();
    });

    references.landmarkScale?.addEventListener('input', (event) => {
      const min = parseFloat(event.target.min) || 0.5;
      const max = parseFloat(event.target.max) || 3;
      toolsState.landmark.scale = clamp(parseFloat(event.target.value) || 1, min, max);
      syncControlValues();
      requestRender();
    });

    references.landmarkModeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const { value } = button.dataset;
        if (!value || toolsState.landmark.mode === value) {
          return;
        }
        toolsState.landmark.mode = value;
        syncLandmarkMode();
        requestRender();
      });
    });

    references.landmarkImageButton?.addEventListener('click', () => {
      references.landmarkImagePicker?.click();
    });

    references.landmarkImagePicker?.addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      toolsState.landmark.imageName = file ? file.name : '';
      syncControlValues();
      requestRender();
    });

    syncControlValues();

    const api = {
      setActiveTool,
      sync: syncControlValues,
    };

    ui.toolControls = api;
    return api;
  }

  function bindToolButtons(state, toolControls) {
    const toolButtons = Array.from(document.querySelectorAll('[data-tool]'));
    if (!toolButtons.length) {
      return;
    }

    state.tool = state.tool || toolButtons[0].dataset.tool;

    function syncButtons() {
      toolButtons.forEach((button) => {
        const isActive = button.dataset.tool === state.tool;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
      toolControls?.setActiveTool?.(state.tool);
    }

    syncButtons();

    toolButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const { tool } = button.dataset;
        if (!tool || tool === state.tool) return;
        state.tool = tool;
        syncButtons();
        requestRender();
      });
    });
  }

  function bindFeatureToggles(state) {
    const toggles = [
      { id: 'toggle-roads', key: 'roads' },
      { id: 'toggle-settlements', key: 'settlements' },
      { id: 'toggle-points', key: 'points' },
    ];

    state.features = state.features || { roads: true, settlements: true, points: true };

    toggles.forEach(({ id, key }) => {
      const checkbox = document.getElementById(id);
      if (!checkbox) return;

      if (typeof state.features[key] === 'undefined') {
        state.features[key] = checkbox.checked;
      }

      checkbox.checked = state.features[key];
      checkbox.addEventListener('change', () => {
        state.features[key] = checkbox.checked;
        requestRender();
      });
    });
  }

  function bindFeaturePanel(state) {
    const panel = document.getElementById('feature-panel');
    if (!panel) return;

    const header = panel.querySelector('.floating-panel__header');
    const toggleButton = panel.querySelector('[data-action="toggle-minimize"]');
    const icon = toggleButton?.querySelector('span[aria-hidden="true"]');
    const uiState = (state.ui = state.ui || {});
    const panelState = (uiState.featurePanel = uiState.featurePanel || {});
    const margin = 16;
    let isDragging = false;
    let pointerId = null;
    let offsetX = 0;
    let offsetY = 0;

    function clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    function clampPosition(position) {
      const rect = panel.getBoundingClientRect();
      const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
      const maxY = Math.max(margin, window.innerHeight - rect.height - margin);
      return {
        x: clamp(position.x, margin, maxX),
        y: clamp(position.y, margin, maxY),
      };
    }

    function applyPosition(position) {
      const clamped = clampPosition(position);
      panel.style.right = 'auto';
      panel.style.left = `${clamped.x}px`;
      panel.style.top = `${clamped.y}px`;
      panelState.position = clamped;
    }

    function ensurePosition() {
      const rect = panel.getBoundingClientRect();
      const defaultPosition = {
        x: window.innerWidth - rect.width - 32,
        y: 32,
      };
      const position = panelState.position || defaultPosition;
      applyPosition(position);
    }

    function syncMinimized() {
      const minimized = Boolean(panelState.minimized);
      panel.classList.toggle('is-minimized', minimized);
      toggleButton?.setAttribute('aria-expanded', String(!minimized));
      toggleButton?.setAttribute(
        'aria-label',
        minimized ? 'Expand feature layers' : 'Collapse feature layers'
      );
      if (icon) {
        icon.textContent = minimized ? '+' : '\u2212';
      }
    }

    ensurePosition();
    syncMinimized();

    function toggleMinimized() {
      panelState.minimized = !panelState.minimized;
      syncMinimized();
    }

    toggleButton?.addEventListener('click', toggleMinimized);

    header?.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      if (event.target.closest('[data-action]')) return;

      const position = panelState.position || {
        x: parseFloat(panel.style.left) || window.innerWidth - panel.offsetWidth - 32,
        y: parseFloat(panel.style.top) || 32,
      };

      isDragging = true;
      pointerId = event.pointerId;
      offsetX = event.clientX - position.x;
      offsetY = event.clientY - position.y;
      panel.classList.add('is-dragging');
      header.setPointerCapture(pointerId);
    });

    header?.addEventListener('pointermove', (event) => {
      if (!isDragging) return;
      applyPosition({ x: event.clientX - offsetX, y: event.clientY - offsetY });
    });

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      panel.classList.remove('is-dragging');
      if (pointerId !== null) {
        header?.releasePointerCapture(pointerId);
      }
      pointerId = null;
    }

    header?.addEventListener('pointerup', endDrag);
    header?.addEventListener('pointercancel', endDrag);

    header?.addEventListener('dblclick', (event) => {
      if (event.target.closest('[data-action]')) return;
      toggleMinimized();
    });

    window.addEventListener('resize', () => {
      if (!panelState.position) return;
      applyPosition(panelState.position);
    });
  }

  function bindCenterViewButton() {
    const button = document.querySelector('[data-action="center-view"]');
    if (!button) return;

    button.addEventListener('click', () => {
      if (typeof WebMapper.centerView === 'function') {
        WebMapper.centerView();
      }
    });
  }

  function bindControls() {
    const state = (WebMapper.state = WebMapper.state || {});

    const toolControls = bindToolControls(state);
    bindToolButtons(state, toolControls);
    bindFeatureToggles(state);
    bindFeaturePanel(state);
    bindCenterViewButton();
  }

  document.addEventListener('DOMContentLoaded', bindControls);

  window.RenderGUI = RenderGUI;
  WebMapper.RenderGUI = RenderGUI;
})();
