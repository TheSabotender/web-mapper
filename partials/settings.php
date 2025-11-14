<?php
// partials/settings.php
?>
<div id="settings-overlay" class="settings-overlay" role="dialog" aria-modal="true" aria-hidden="true">
  <div class="settings-modal">
    <header class="settings-modal__header">
      <h2 class="settings-modal__title">Settings</h2>
      <button id="close-settings" class="button button--icon" type="button" aria-label="Close settings">&times;</button>
    </header>
    <div class="settings-modal__body">
      <form class="settings-form">
        <fieldset class="settings-form__section">
          <legend>Canvas</legend>
          <label class="settings-form__row">
            <span>Width</span>
            <input type="number" id="settings-canvas-width" min="200" value="1024">
          </label>
          <label class="settings-form__row">
            <span>Height</span>
            <input type="number" id="settings-canvas-height" min="200" value="768">
          </label>
        </fieldset>

        <fieldset class="settings-form__section">
          <legend>Rendering</legend>
          <label class="settings-form__row">
            <span>Show grid</span>
            <input type="checkbox" id="settings-show-grid" checked>
          </label>
          <label class="settings-form__row">
            <span>Animation</span>
            <select id="settings-animation">
              <option value="none" selected>Static</option>
              <option value="slow">Slow</option>
              <option value="fast">Fast</option>
            </select>
          </label>
          <label class="settings-form__row settings-form__row--range">
            <span>UI Scale</span>
            <div class="settings-form__range">
              <input
                type="range"
                id="settings-ui-scale"
                min="25"
                max="200"
                step="5"
                value="100"
                aria-describedby="settings-ui-scale-value"
              >
              <output id="settings-ui-scale-value" class="settings-form__range-value">100%</output>
            </div>
          </label>
        </fieldset>

        <div class="settings-form__actions">
          <button id="apply-settings" class="button button--primary" type="button">Apply</button>
          <button id="reset-settings" class="button" type="button">Reset</button>
        </div>
      </form>
    </div>
  </div>
</div>
