(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});

  function drawGradient(ctx) {
    const { width, height } = ctx.canvas;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#3f80ff');
    gradient.addColorStop(0.35, '#4b9b6d');
    gradient.addColorStop(0.7, '#3c5f3b');
    gradient.addColorStop(1, '#2f2e38');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawTerrainDetails(ctx) {
    const { width, height } = ctx.canvas;
    const hillCount = 6;

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#0f1c12';

    for (let i = 0; i < hillCount; i += 1) {
      const hillWidth = width * (0.25 + Math.random() * 0.25);
      const hillHeight = height * (0.1 + Math.random() * 0.2);
      const x = Math.random() * (width - hillWidth);
      const y = height - hillHeight - Math.random() * (height * 0.2);

      ctx.beginPath();
      ctx.moveTo(x, height);
      ctx.quadraticCurveTo(x + hillWidth * 0.5, y - hillHeight, x + hillWidth, height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function drawGrid(ctx, spacing) {
    const { width, height } = ctx.canvas;
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

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawGradient(ctx);
    drawTerrainDetails(ctx);

    if (state?.settings?.showGrid) {
      drawGrid(ctx, 64);
    }
  }

  window.RenderTerrain = RenderTerrain;
  WebMapper.RenderTerrain = RenderTerrain;
})();
