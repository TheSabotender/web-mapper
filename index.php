<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Web Mapper</title>
  <link rel="stylesheet" href="assets/app.css">
</head>
<body>
  <div id="app-root" class="app">
    <div id="canvas-stack" class="canvas-stack">
      <canvas id="terrain-layer" class="map-layer" aria-label="Terrain layer"></canvas>
      <canvas id="features-layer" class="map-layer" aria-label="Features layer"></canvas>
      <canvas id="gui-layer" class="map-layer" aria-label="GUI layer"></canvas>
    </div>

    <?php include __DIR__ . '/partials/gui.php'; ?>
  </div>

  <?php include __DIR__ . '/partials/landmark-icon-picker.php'; ?>
  <?php include __DIR__ . '/partials/settings.php'; ?>

  <script src="scripts/utils.js"></script>
  <script src="scripts/terrain.js"></script>
  <script src="scripts/features.js"></script>
  <script src="scripts/gui/pan-controls.js"></script>
  <script src="scripts/gui/brush-controls.js"></script>
  <script src="scripts/gui/eraser-controls.js"></script>
  <script src="scripts/gui/landmark-icon-picker.js"></script>
  <script src="scripts/gui/landmark-controls.js"></script>
  <script src="scripts/gui/layer-panel.js"></script>
  <script src="scripts/gui/toolbar.js"></script>
  <script src="scripts/gui/index.js"></script>
  <script src="scripts/settings.js"></script>
  <script src="scripts/main.js"></script>
</body>
</html>
