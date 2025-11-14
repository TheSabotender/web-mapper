<div class="tool-controls__panel" data-tool-panel="landmark" hidden>
  <div class="tool-controls__field">
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
