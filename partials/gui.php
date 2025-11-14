<?php
// partials/gui.php
?>
<div id="toolbar" class="toolbar" role="toolbar" aria-label="Map tools">
  <div class="toolbar__group toolbar__group--tools">
    <button
      type="button"
      class="toolbar__button"
      data-tool="pan"
      aria-pressed="false"
      aria-label="Pan"
      title="Pan"
    >
      <img src="assets/icons/target/touch.svg" class="toolbar__icon" alt="" aria-hidden="true">
    </button>
    <button
      type="button"
      class="toolbar__button is-active"
      data-tool="brush"
      aria-pressed="true"
      aria-label="Brush"
      title="Brush"
    >
      <img src="assets/icons/util/brush.svg" class="toolbar__icon" alt="" aria-hidden="true">
    </button>
    <button
      type="button"
      class="toolbar__button"
      data-tool="landmark"
      aria-pressed="false"
      aria-label="Landmark"
      title="Landmark"
    >
      <img src="assets/icons/location/castle.svg" class="toolbar__icon" alt="" aria-hidden="true">
    </button>
    <button
      type="button"
      class="toolbar__button"
      data-tool="eraser"
      aria-pressed="false"
      aria-label="Eraser"
      title="Eraser"
    >
      <img src="assets/icons/util/eraser.svg" class="toolbar__icon" alt="" aria-hidden="true">
    </button>
  </div>
  <div class="toolbar__group toolbar__group--actions">
    <button
      type="button"
      class="toolbar__button toolbar__button--icon"
      data-action="center-view"
      aria-label="Center map"
      title="Center map"
    >
      <img src="assets/icons/entity/map.svg" class="toolbar__icon" alt="" aria-hidden="true">
    </button>
    <button
      id="open-settings"
      class="toolbar__button toolbar__button--icon"
      type="button"
      aria-label="Open settings"
      title="Open settings"
    >
      <span aria-hidden="true">⚙️</span>
    </button>
  </div>
</div>

<div id="feature-panel" class="floating-panel" role="region" aria-label="Feature layers">
  <div class="floating-panel__header" data-draggable="true">
    <span class="floating-panel__title">Feature Layers</span>
    <button
      type="button"
      class="floating-panel__button"
      data-action="toggle-minimize"
      aria-expanded="true"
      aria-controls="feature-panel-body"
      aria-label="Collapse feature layers"
    >
      <span aria-hidden="true">&minus;</span>
      <span class="visually-hidden">Toggle feature layers</span>
    </button>
  </div>
  <div id="feature-panel-body" class="floating-panel__body">
    <label class="floating-panel__checkbox">
      <input type="checkbox" id="toggle-roads" checked>
      <span>Roads</span>
    </label>
    <label class="floating-panel__checkbox">
      <input type="checkbox" id="toggle-settlements" checked>
      <span>Settlements</span>
    </label>
    <label class="floating-panel__checkbox">
      <input type="checkbox" id="toggle-points" checked>
      <span>Points of Interest</span>
    </label>
  </div>
</div>
