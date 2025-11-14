(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});

  function drawRoads(ctx, state, width, height) {
    if (!state?.features?.roads) return;

    ctx.save();
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(230, 194, 138, 0.75)';

    ctx.beginPath();
    ctx.moveTo(width * 0.1, height * 0.85);
    ctx.bezierCurveTo(
      width * 0.35,
      height * 0.65,
      width * 0.45,
      height * 0.95,
      width * 0.75,
      height * 0.2
    );
    ctx.stroke();

    ctx.restore();
  }

  function drawSettlements(ctx, state, width, height) {
    if (!state?.features?.settlements) return;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 2;

    const settlements = [
      { x: width * 0.25, y: height * 0.6 },
      { x: width * 0.55, y: height * 0.45 },
      { x: width * 0.7, y: height * 0.75 },
    ];

    settlements.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.restore();
  }

  function drawPointsOfInterest(ctx, state, width, height) {
    if (!state?.features?.points) return;

    ctx.save();
    ctx.fillStyle = 'rgba(79, 139, 255, 0.9)';

    const points = [
      { x: width * 0.4, y: height * 0.2, label: 'Watchtower' },
      { x: width * 0.85, y: height * 0.55, label: 'Shrine' },
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

    const utils = WebMapper.utils || {};
    let restore = null;
    if (typeof utils.prepareMapContext === 'function') {
      restore = utils.prepareMapContext(ctx, state);
    } else {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    const width = state?.canvas?.width ?? ctx.canvas.width;
    const height = state?.canvas?.height ?? ctx.canvas.height;

    drawRoads(ctx, state, width, height);
    drawSettlements(ctx, state, width, height);
    drawPointsOfInterest(ctx, state, width, height);

    restore?.();
  }

  window.RenderFeatures = RenderFeatures;
  WebMapper.RenderFeatures = RenderFeatures;
})();
