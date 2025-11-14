<div id="feature-panel" class="floating-panel floating-panel--layer" role="region" aria-label="Feature layers">
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
  <div id="feature-panel-body" class="floating-panel__body layer-panel" data-layer-panel>
    <div class="layer-panel__list" data-layer-list role="listbox" aria-label="Map layers"></div>
    <button type="button" class="layer-panel__add" data-action="add-layer">
      <span>Add layer</span>
    </button>
  </div>
  <div class="floating-panel__resize-handle" data-action="resize-panel" role="presentation" aria-hidden="true"></div>
</div>
