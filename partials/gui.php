<?php
// partials/gui.php
?>
<section class="panel">
  <h2 class="panel__title">Map Controls</h2>
  <div class="panel__group">
    <label class="panel__label" for="tool-select">Active Tool</label>
    <select id="tool-select" class="panel__input">
      <option value="brush" selected>Brush</option>
      <option value="eraser">Eraser</option>
      <option value="marker">Marker</option>
    </select>
  </div>

  <div class="panel__group">
    <span class="panel__label">Terrain Presets</span>
    <div class="panel__buttons">
      <button type="button" class="button" data-terrain="grass">Grassland</button>
      <button type="button" class="button" data-terrain="water">Water</button>
      <button type="button" class="button" data-terrain="mountain">Mountain</button>
    </div>
  </div>

  <div class="panel__group">
    <span class="panel__label">Feature Layers</span>
    <label class="panel__checkbox">
      <input type="checkbox" id="toggle-roads" checked>
      <span>Roads</span>
    </label>
    <label class="panel__checkbox">
      <input type="checkbox" id="toggle-settlements" checked>
      <span>Settlements</span>
    </label>
    <label class="panel__checkbox">
      <input type="checkbox" id="toggle-points" checked>
      <span>Points of Interest</span>
    </label>
  </div>
</section>
