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
  <div class="tool-controls__field tool-controls__field--color">
    <div class="tool-controls__control tool-controls__control--color">
      <button
        type="button"
        class="tool-controls__image-button"
        data-control="landmark-image"
        data-default-icon="assets/icons/location/castle.svg"
        aria-label="Choose landmark icon"
      >
        <span class="tool-controls__image-preview" aria-hidden="true">
          <img
            src="assets/icons/location/castle.svg"
            alt=""
            data-landmark-image-preview
          >
        </span>
        <span class="visually-hidden">Choose landmark icon</span>
      </button>
    </div>
  </div>
</div>
