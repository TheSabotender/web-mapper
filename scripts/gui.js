(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});

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

  function bindToolButtons(state) {
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

    bindToolButtons(state);
    bindFeatureToggles(state);
    bindFeaturePanel(state);
    bindCenterViewButton();
  }

  document.addEventListener('DOMContentLoaded', bindControls);

  window.RenderGUI = RenderGUI;
  WebMapper.RenderGUI = RenderGUI;
})();
