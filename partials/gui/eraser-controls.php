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
