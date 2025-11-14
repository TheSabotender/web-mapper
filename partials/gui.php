<?php
// partials/gui.php
?>
<div id="ui-root" class="ui-root">
  <div class="toolbar-stack" aria-live="polite">
    <div class="toolbar-stack__controls">
      <div class="tool-controls-wrapper">
        <div
          id="tool-controls"
          class="tool-controls"
          role="region"
          aria-label="Tool controls"
          aria-hidden="true"
        >
          <?php include __DIR__ . '/gui/pan-controls.php'; ?>
          <?php include __DIR__ . '/gui/brush-controls.php'; ?>
          <?php include __DIR__ . '/gui/eraser-controls.php'; ?>
          <?php include __DIR__ . '/gui/landmark-controls.php'; ?>
        </div>
      </div>
    </div>
    <?php include __DIR__ . '/gui/toolbar.php'; ?>
  </div>

  <?php include __DIR__ . '/gui/layer-panel.php'; ?>
</div>
