<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Web Mapper</title>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
    integrity="sha512-pb/MbmfWRbMxwAn7nUDmywjcGBDrLIvlaQt1zAr72Xd1LSeX776BFqe7i/Dr7guPmyAnbcW2kwiVdc+XWYZ1yQ=="
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
  >
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

  <?php include __DIR__ . '/partials/settings.php'; ?>

  <script src="scripts/utils.js"></script>
  <script src="scripts/terrain.js"></script>
  <script src="scripts/features.js"></script>
  <script src="scripts/gui.js"></script>
  <script src="scripts/settings.js"></script>
  <script src="scripts/main.js"></script>
</body>
</html>
