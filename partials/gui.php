<?php
// partials/gui.php
?>
<div class="toolbar-stack" aria-live="polite">
  <div
    id="tool-controls"
    class="tool-controls"
    role="region"
    aria-label="Tool controls"
    aria-hidden="true"
  >
    <div class="tool-controls__panel" data-tool-panel="pan" hidden>
      <div class="tool-controls__field">
        <label class="tool-controls__label" for="pan-zoom">Zoom</label>
        <div class="tool-controls__control">
          <input
            id="pan-zoom"
            class="tool-controls__range"
            type="range"
            min="0.5"
            max="4"
            step="0.05"
            value="1"
            data-control="pan-zoom"
            aria-describedby="pan-zoom-value"
          >
          <output id="pan-zoom-value" class="tool-controls__value" data-output-for="pan-zoom">100%</output>
        </div>
      </div>
    </div>

    <div class="tool-controls__panel" data-tool-panel="brush" hidden>
      <div class="tool-controls__field">
        <label class="tool-controls__label" for="brush-size">Brush size</label>
        <div class="tool-controls__control">
          <input
            id="brush-size"
            class="tool-controls__range"
            type="range"
            min="1"
            max="200"
            step="1"
            value="48"
            data-control="brush-size"
            aria-describedby="brush-size-value"
          >
          <output id="brush-size-value" class="tool-controls__value" data-output-for="brush-size">48 px</output>
        </div>
      </div>
      <div class="tool-controls__field">
        <label class="tool-controls__label" for="brush-strength">Brush strength</label>
        <div class="tool-controls__control">
          <input
            id="brush-strength"
            class="tool-controls__range"
            type="range"
            min="0"
            max="100"
            step="1"
            value="75"
            data-control="brush-strength"
            aria-describedby="brush-strength-value"
          >
          <output id="brush-strength-value" class="tool-controls__value" data-output-for="brush-strength">75%</output>
        </div>
      </div>
      <div class="tool-controls__field">
        <label class="tool-controls__label" for="brush-softness">Edge softness</label>
        <div class="tool-controls__control">
          <input
            id="brush-softness"
            class="tool-controls__range"
            type="range"
            min="0"
            max="100"
            step="1"
            value="50"
            data-control="brush-softness"
            aria-describedby="brush-softness-value"
          >
          <output id="brush-softness-value" class="tool-controls__value" data-output-for="brush-softness">50%</output>
        </div>
      </div>
      <div class="tool-controls__field tool-controls__field--color">
        <span class="tool-controls__label" id="brush-color-label">Brush color</span>
        <div class="tool-controls__control tool-controls__control--color">
          <button
            type="button"
            class="tool-controls__color-button"
            data-control="brush-color"
            aria-labelledby="brush-color-label"
          >
            <span class="tool-controls__color-swatch" aria-hidden="true"></span>
            <span class="visually-hidden">Choose brush color</span>
          </button>
        </div>
        <input
          id="brush-color-picker"
          class="tool-controls__color-input visually-hidden"
          type="color"
          value="#4f8bff"
          data-picker-for="brush-color"
          aria-label="Brush color"
        >
      </div>
    </div>

    <div class="tool-controls__panel" data-tool-panel="eraser" hidden>
      <div class="tool-controls__field">
        <label class="tool-controls__label" for="eraser-size">Eraser size</label>
        <div class="tool-controls__control">
          <input
            id="eraser-size"
            class="tool-controls__range"
            type="range"
            min="1"
            max="200"
            step="1"
            value="48"
            data-control="eraser-size"
            aria-describedby="eraser-size-value"
          >
          <output id="eraser-size-value" class="tool-controls__value" data-output-for="eraser-size">48 px</output>
        </div>
      </div>
      <div class="tool-controls__field">
        <label class="tool-controls__label" for="eraser-strength">Eraser strength</label>
        <div class="tool-controls__control">
          <input
            id="eraser-strength"
            class="tool-controls__range"
            type="range"
            min="0"
            max="100"
            step="1"
            value="100"
            data-control="eraser-strength"
            aria-describedby="eraser-strength-value"
          >
          <output id="eraser-strength-value" class="tool-controls__value" data-output-for="eraser-strength">100%</output>
        </div>
      </div>
      <div class="tool-controls__field">
        <label class="tool-controls__label" for="eraser-softness">Edge softness</label>
        <div class="tool-controls__control">
          <input
            id="eraser-softness"
            class="tool-controls__range"
            type="range"
            min="0"
            max="100"
            step="1"
            value="40"
            data-control="eraser-softness"
            aria-describedby="eraser-softness-value"
          >
          <output id="eraser-softness-value" class="tool-controls__value" data-output-for="eraser-softness">40%</output>
        </div>
      </div>
    </div>

    <div class="tool-controls__panel" data-tool-panel="landmark" hidden>
      <div class="tool-controls__field">
        <span class="tool-controls__label" id="landmark-mode-label">Mode</span>
        <div class="tool-controls__control tool-controls__control--toggle">
          <div
            class="tool-controls__toggle"
            role="radiogroup"
            aria-labelledby="landmark-mode-label"
          >
            <button
              type="button"
              class="tool-controls__toggle-button is-active"
              data-control="landmark-mode"
              data-value="select"
              aria-pressed="true"
            >
              Select
            </button>
            <button
              type="button"
              class="tool-controls__toggle-button"
              data-control="landmark-mode"
              data-value="add"
              aria-pressed="false"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      <div class="tool-controls__field">
        <label class="tool-controls__label" for="landmark-scale">Landmark scale</label>
        <div class="tool-controls__control">
          <input
            id="landmark-scale"
            class="tool-controls__range"
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value="1"
            data-control="landmark-scale"
            aria-describedby="landmark-scale-value"
          >
          <output id="landmark-scale-value" class="tool-controls__value" data-output-for="landmark-scale">100%</output>
        </div>
      </div>
      <div class="tool-controls__field tool-controls__field--file">
        <span class="tool-controls__label" id="landmark-image-label">Landmark image</span>
        <div class="tool-controls__control tool-controls__control--file">
          <div class="tool-controls__file">
            <button
              type="button"
              class="tool-controls__file-button"
              data-control="landmark-image"
              aria-labelledby="landmark-image-label landmark-image-value"
            >
              Choose image
            </button>
            <span
              id="landmark-image-value"
              class="tool-controls__file-value"
              data-file-value="landmark-image"
            >
              None
            </span>
          </div>
        </div>
        <input
          id="landmark-image-input"
          class="visually-hidden"
          type="file"
          accept="image/*"
          data-picker-for="landmark-image"
          aria-label="Select landmark image"
        >
      </div>
    </div>
  </div>

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
        data-tool="eraser"
        aria-pressed="false"
        aria-label="Eraser"
        title="Eraser"
      >
        <img src="assets/icons/util/eraser.svg" class="toolbar__icon" alt="" aria-hidden="true">
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
