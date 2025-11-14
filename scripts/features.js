(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});

  function isLayerVisible(state, layerId) {
    if (!state) return true;
    const layers = state?.layers;
    if (Array.isArray(layers)) {
      const layer = layers.find((entry) => entry.id === layerId);
      if (layer) {
        return Boolean(layer.visible);
      }
    }
    const value = state?.[layerId];
    return typeof value === 'boolean' ? value : true;
  }

  function drawPaths(ctx, path, width, height) {
    ctx.save();
    ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      switch (path.type) {
          case 'road':
              ctx.strokeStyle = 'rgba(230, 194, 138, 0.75)'
              break;
          case 'river':
              ctx.strokeStyle = 'rgba(100, 149, 237, 0.75)'
		  break;
      }

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

  function drawFeatureTooltip(ctx, text, x, y, size) {
    if (!text) return;

    const fontSize = 14;
    const paddingX = 10;
    const paddingY = 6;
    const verticalOffset = Math.max(size || 24, 20) * 0.75 + 10;

    ctx.save();
    ctx.font = `${fontSize}px "Segoe UI", sans-serif`;
    const textWidth = ctx.measureText(text).width;
    const boxWidth = textWidth + paddingX * 2;
    const boxHeight = fontSize + paddingY * 2;
    const boxX = x - boxWidth / 2;
    const boxY = y - verticalOffset - boxHeight / 2;

    ctx.fillStyle = 'rgba(18, 24, 38, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(boxX, boxY, boxWidth, boxHeight);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, boxY + boxHeight / 2);
    ctx.restore();
  }

  function getIconCacheEntry(icon) {
    if (!icon) return null;

    const runtime = (WebMapper.runtime = WebMapper.runtime || {});
    const cache = (runtime.iconCache = runtime.iconCache || new Map());

    let entry = cache.get(icon);
    if (!entry) {
      const image = new Image();
      image.decoding = 'async';
      entry = { image, status: 'loading' };
      cache.set(icon, entry);

      image.onload = () => {
        entry.status = 'ready';
        WebMapper.render?.();
      };
      image.onerror = () => {
        entry.status = 'error';
        WebMapper.render?.();
      };
      image.src = icon;
    }

    return entry;
  }

  function drawIcon(ctx, icon, x, y, size) {
    const cacheEntry = getIconCacheEntry(icon);
    if (!cacheEntry || cacheEntry.status !== 'ready') {
      return false;
    }

    const drawSize = Math.max(Number(size) || 24, 12);
    const halfSize = drawSize / 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 8;
    ctx.drawImage(cacheEntry.image, x - halfSize, y - halfSize, drawSize, drawSize);
    ctx.restore();

    return true;
  }

  function drawLayerFeatures(
    ctx,
    layer,
    width,
    height,
    renderedFeatures,
    hoveredFeature,
    options = {}
  ) {
    if (!isLayerVisible(state, layerId)) return;

    const features = Array.isArray(layer?.features) ? layer.features : [];
    if (features.length === 0) {
      return;
    }

    const {
      fallbackFillStyle = 'rgba(255, 255, 255, 0.9)',
      fallbackStrokeStyle = 'rgba(0, 0, 0, 0.25)',
    } = options;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    features.forEach((feature) => {
      const position = feature?.position || {};
      const x = width * position.x;
      const y = height * position.y;
      const baseSize = Number(feature?.size) || 24;
      const size = Math.max(baseSize, 12);
      const icon = feature?.icon || '';
      const didDrawIcon = drawIcon(ctx, icon, x, y, size);

        if (!didDrawIcon) {
            ctx.save();
            ctx.fillStyle = fallbackFillStyle;
            ctx.strokeStyle = fallbackStrokeStyle;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            console.log('Drew fallback for feature:', feature);
        } else {
            console.log('Successfully drew icon:', feature);
        }

      if (feature?.guid) {
        renderedFeatures?.push({
          layerId,
          guid: feature.guid,
          x,
          y,
          size,
        });
      }

      if (hoveredFeature?.layerId === layerId && hoveredFeature?.guid === feature?.guid) {
        drawFeatureTooltip(ctx, feature?.name, x, y, size);
      }
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

    const runtime = (WebMapper.runtime = WebMapper.runtime || {});
    const renderedFeatures = [];
    const hoveredFeature = runtime.hoveredFeature || null;

    const paths = state?.paths || [];
      if (paths.length !== 0 && state.pathsVisible) {
        paths.forEach((path) => {
            drawPaths(ctx, path, width, height);
        }
    }

    const layers = state?.layers || [];
    if (layers.length !== 0) {
        layers.forEach((layer) => {
            drawLayerFeatures(ctx, layer, width, height, renderedFeatures, hoveredFeature, {
                fallbackFillStyle: 'rgba(255, 255, 255, 0.9)',
                fallbackStrokeStyle: 'rgba(0, 0, 0, 0.25)',
            });
        });
    }

    runtime.renderedFeatures = renderedFeatures;
    if (
      hoveredFeature &&
      !renderedFeatures.some(
        (entry) =>
          entry.layerId === hoveredFeature.layerId && entry.guid === hoveredFeature.guid
      )
    ) {
      runtime.hoveredFeature = null;
    }

    restore?.();
  }

  window.RenderFeatures = RenderFeatures;
  WebMapper.RenderFeatures = RenderFeatures;
})();
