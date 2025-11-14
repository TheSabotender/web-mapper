(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});

  function drawRoads(ctx, state) {
    if (!state?.features?.roads) return;

    ctx.save();
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(230, 194, 138, 0.75)';

    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width * 0.1, ctx.canvas.height * 0.85);
    ctx.bezierCurveTo(
      ctx.canvas.width * 0.35,
      ctx.canvas.height * 0.65,
      ctx.canvas.width * 0.45,
      ctx.canvas.height * 0.95,
      ctx.canvas.width * 0.75,
      ctx.canvas.height * 0.2
    );
    ctx.stroke();

    ctx.restore();
  }

  function drawSettlements(ctx, state) {
    if (!state?.features?.settlements) return;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 2;

    const settlements = [
      { x: ctx.canvas.width * 0.25, y: ctx.canvas.height * 0.6 },
      { x: ctx.canvas.width * 0.55, y: ctx.canvas.height * 0.45 },
      { x: ctx.canvas.width * 0.7, y: ctx.canvas.height * 0.75 },
    ];

    settlements.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }

  function drawPointsOfInterest(ctx, state) {
    if (!state?.features?.points) return;

    ctx.save();
    ctx.fillStyle = 'rgba(79, 139, 255, 0.9)';

    const points = [
      { x: ctx.canvas.width * 0.4, y: ctx.canvas.height * 0.2, label: 'Watchtower' },
      { x: ctx.canvas.width * 0.85, y: ctx.canvas.height * 0.55, label: 'Shrine' },
    ];

    points.forEach(({ x, y, label }) => {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText(label, x + 10, y - 10);
      ctx.fillStyle = 'rgba(79, 139, 255, 0.9)';
    });

    ctx.restore();
  }

  function RenderFeatures(ctx, state) {
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    drawRoads(ctx, state);
    drawSettlements(ctx, state);
    drawPointsOfInterest(ctx, state);
  }

  window.RenderFeatures = RenderFeatures;
  WebMapper.RenderFeatures = RenderFeatures;
})();
