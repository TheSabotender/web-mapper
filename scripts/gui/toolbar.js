(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});
  const ui = (WebMapper.ui = WebMapper.ui || {});

  ui.Toolbar = {
    init({ state, toolControls, requestRender }) {
      const buttons = Array.from(document.querySelectorAll('[data-tool]'));
      if (!buttons.length) {
        return null;
      }

      state.tool = state.tool || buttons[0].dataset.tool;

      function syncButtons() {
        buttons.forEach((button) => {
          const isActive = button.dataset.tool === state.tool;
          button.classList.toggle('is-active', isActive);
          button.setAttribute('aria-pressed', String(isActive));
        });
        toolControls?.setActiveTool?.(state.tool);
      }

      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          const { tool } = button.dataset;
          if (!tool || tool === state.tool) {
            return;
          }
          state.tool = tool;
          syncButtons();
          requestRender?.();
        });
      });

      syncButtons();

      const centerButton = document.querySelector('[data-action="center-view"]');
      centerButton?.addEventListener('click', () => {
        if (typeof WebMapper.centerView === 'function') {
          WebMapper.centerView();
        }
      });

      return {
        sync: syncButtons,
      };
    },
  };
})();
