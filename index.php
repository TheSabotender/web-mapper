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
    <header class="app__header">
      <h1 class="app__title">Web Mapper</h1>
      <button id="open-settings" class="button button--primary" type="button">
        Settings
      </button>
    </header>

    <div class="app__body">
      <aside class="app__sidebar" aria-label="Map controls">
        <?php include __DIR__ . '/partials/gui.php'; ?>
      </aside>

      <main class="app__main" aria-label="Map canvas">
        <div id="canvas-stack" class="canvas-stack">
          <canvas id="terrain-layer" class="map-layer" aria-label="Terrain layer"></canvas>
          <canvas id="features-layer" class="map-layer" aria-label="Features layer"></canvas>
          <canvas id="gui-layer" class="map-layer" aria-label="GUI layer"></canvas>
        </div>
      </main>
    </div>
  </div>

  <?php include __DIR__ . '/partials/settings.php'; ?>

  <script src="scripts/utils.js"></script>
  <script src="scripts/terrain.js"></script>
  <script src="scripts/features.js"></script>
  <script src="scripts/gui.js"></script>
  <script src="scripts/settings.js"></script>
  <script src="scripts/main.js"></script>
</body>
</html>
