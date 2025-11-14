<?php
// partials/settings-modal.php
?>
<div id="settings-overlay" class="settings-overlay hidden">
  <div class="settings-modal">
    <div class="settings-header">
      <h2>Settings</h2>
      <button id="settings-close" class="settings-close-btn">&times;</button>
    </div>
    <div class="settings-body">      
      <section>

        <div style="margin-top: 6px;">
          <label style="display:flex; align-items:center; gap:6px; font-size:13px;">
            Audio Volume:
            <span id="audio-volume-value">50%</span>
          </label>
          <input type="range" id="audio-volume-slider" min="0" max="100" value="50" style="width:100%;">
        </div>
      </section>

    </div>
  </div>
</div>