(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});

  function drawGradient(ctx, width, height) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#3f80ff');
    gradient.addColorStop(0.35, '#4b9b6d');
    gradient.addColorStop(0.7, '#3c5f3b');
    gradient.addColorStop(1, '#2f2e38');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawTerrainDetails(ctx, width, height) {
    const hillCount = 6;

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#0f1c12';

    for (let i = 0; i < hillCount; i += 1) {
      const seed = i + 1;
      const hillWidth = width * (0.25 + 0.1 * Math.sin(seed * 1.3));
      const hillHeight = height * (0.12 + 0.08 * Math.cos(seed * 1.9));
      const positionFactor = (Math.sin(seed * 2.1) + 1) / 2;
      const heightFactor = (Math.cos(seed * 1.7) + 1) / 2;
      const x = positionFactor * (width - hillWidth);
      const y = height - hillHeight - heightFactor * (height * 0.2);

      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.quadraticCurveTo(x + hillWidth * 0.5, y - hillHeight, x + hillWidth, height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function drawGrid(ctx, spacing, width, height) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
      ctx.stroke();
    }

    ctx.restore();
  }

  function RenderTerrain(ctx, state) {
    if (!ctx) return;

    const utils = WebMapper.utils || {};
    let restore = null;
    if (typeof utils.prepareMapContext === 'function') {
      restore = utils.prepareMapContext(ctx, state);
    } else {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    const terrainVisible =
      state?.features?.terrainLayer?.visible ??
      (typeof state?.features?.terrain === 'boolean' ? state.features.terrain : true);
    if (!terrainVisible) {
      restore?.();
      return;
    }

    const width = state?.canvas?.width ?? ctx.canvas.width;
    const height = state?.canvas?.height ?? ctx.canvas.height;

    drawGradient(ctx, width, height);
    drawTerrainDetails(ctx, width, height);

    if (state?.settings?.showGrid) {
      drawGrid(ctx, 64, width, height);
    }

    restore?.();
  }

  window.RenderTerrain = RenderTerrain;
  WebMapper.RenderTerrain = RenderTerrain;
})();
