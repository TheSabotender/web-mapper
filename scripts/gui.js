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

    const info = `Tool: ${state?.tool ?? 'N/A'}  |  Terrain: ${state?.terrainPreset ?? 'N/A'}`;
    const secondary = `Features → Roads: ${state?.features?.roads ? 'ON' : 'OFF'}, Settlements: ${
      state?.features?.settlements ? 'ON' : 'OFF'
    }, Points: ${state?.features?.points ? 'ON' : 'OFF'}`;

    ctx.save();
    ctx.font = '16px "Segoe UI", sans-serif';
    const infoWidth = ctx.measureText(info).width;
    ctx.font = '13px "Segoe UI", sans-serif';
    const secondaryWidth = ctx.measureText(secondary).width;
    const boxWidth = Math.max(infoWidth, secondaryWidth) + 32;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(16, 16, boxWidth, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText(info, 32, 44);

    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fillText(secondary, 32, 68);

    ctx.restore();
  }

  function bindControls() {
    const state = (WebMapper.state = WebMapper.state || {});

    const toolSelect = document.getElementById('tool-select');
    if (toolSelect) {
      state.tool = state.tool || toolSelect.value;
      toolSelect.addEventListener('change', (event) => {
        state.tool = event.target.value;
        requestRender();
      });
    }

    const terrainButtons = document.querySelectorAll('[data-terrain]');
    if (terrainButtons.length) {
      state.terrainPreset = state.terrainPreset || terrainButtons[0].dataset.terrain;
      terrainButtons.forEach((button) => {
        button.addEventListener('click', () => {
          state.terrainPreset = button.dataset.terrain;
          terrainButtons.forEach((btn) => btn.classList.toggle('is-active', btn === button));
          requestRender();
        });
      });
      terrainButtons.forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.terrain === state.terrainPreset);
      });
    }

    const featureToggles = [
      { id: 'toggle-roads', key: 'roads' },
      { id: 'toggle-settlements', key: 'settlements' },
      { id: 'toggle-points', key: 'points' },
    ];

    state.features = state.features || { roads: true, settlements: true, points: true };

    featureToggles.forEach(({ id, key }) => {
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

  document.addEventListener('DOMContentLoaded', bindControls);

  window.RenderGUI = RenderGUI;
  WebMapper.RenderGUI = RenderGUI;
})();
