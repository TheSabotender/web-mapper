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
