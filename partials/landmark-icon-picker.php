<?php
$iconBasePath = realpath(__DIR__ . '/../assets/icons');
$iconBaseUrl = 'assets/icons';
$iconCategories = [];

if ($iconBasePath && is_dir($iconBasePath)) {
    $entries = scandir($iconBasePath);
    foreach ($entries as $entry) {
        if ($entry === '.' || $entry === '..') {
            continue;
        }
        $directoryPath = $iconBasePath . DIRECTORY_SEPARATOR . $entry;
        if (!is_dir($directoryPath)) {
            continue;
        }

        $svgFiles = glob($directoryPath . DIRECTORY_SEPARATOR . '*.svg') ?: [];
        if (!$svgFiles) {
            continue;
        }

        sort($svgFiles, SORT_NATURAL | SORT_FLAG_CASE);

        $icons = [];
        foreach ($svgFiles as $filePath) {
            $relativePath = str_replace($iconBasePath . DIRECTORY_SEPARATOR, '', $filePath);
            $relativePath = str_replace(DIRECTORY_SEPARATOR, '/', $relativePath);
            $iconName = pathinfo($filePath, PATHINFO_FILENAME);
            $icons[] = [
                'path' => $iconBaseUrl . '/' . $relativePath,
                'label' => ucwords(str_replace(['-', '_'], ' ', $iconName)),
            ];
        }

        if ($icons) {
            $iconCategories[] = [
                'id' => $entry,
                'label' => ucwords(str_replace(['-', '_'], ' ', $entry)),
                'icons' => $icons,
            ];
        }
    }

    usort($iconCategories, static function ($a, $b) {
        return strcasecmp($a['label'], $b['label']);
    });
}
?>
<div
  id="landmark-icon-overlay"
  class="icon-picker-overlay"
  role="dialog"
  aria-modal="true"
  aria-hidden="true"
>
  <div class="icon-picker-modal" role="document">
    <header class="icon-picker__header">
      <h2 class="icon-picker__title">Select landmark icon</h2>
      <button
        type="button"
        class="icon-picker__close button button--icon"
        aria-label="Close icon picker"
        data-icon-picker-close
      >
        &times;
      </button>
    </header>
    <?php if ($iconCategories): ?>
      <div class="icon-picker__tabs" role="tablist">
        <?php foreach ($iconCategories as $index => $category):
          $tabId = 'landmark-icon-tab-' . $category['id'];
          $panelId = 'landmark-icon-panel-' . $category['id'];
          $isActive = $index === 0;
        ?>
          <button
            type="button"
            id="<?php echo htmlspecialchars($tabId, ENT_QUOTES); ?>"
            class="icon-picker__tab<?php echo $isActive ? ' is-active' : ''; ?>"
            role="tab"
            aria-controls="<?php echo htmlspecialchars($panelId, ENT_QUOTES); ?>"
            aria-selected="<?php echo $isActive ? 'true' : 'false'; ?>"
            tabindex="<?php echo $isActive ? '0' : '-1'; ?>"
            data-icon-tab="<?php echo htmlspecialchars($category['id'], ENT_QUOTES); ?>"
          >
            <?php echo htmlspecialchars($category['label'], ENT_QUOTES); ?>
          </button>
        <?php endforeach; ?>
      </div>
      <div class="icon-picker__content">
        <?php foreach ($iconCategories as $index => $category):
          $tabId = 'landmark-icon-tab-' . $category['id'];
          $panelId = 'landmark-icon-panel-' . $category['id'];
          $isActive = $index === 0;
        ?>
          <div
            id="<?php echo htmlspecialchars($panelId, ENT_QUOTES); ?>"
            class="icon-picker__panel"
            role="tabpanel"
            aria-labelledby="<?php echo htmlspecialchars($tabId, ENT_QUOTES); ?>"
            tabindex="<?php echo $isActive ? '0' : '-1'; ?>"
            data-icon-panel="<?php echo htmlspecialchars($category['id'], ENT_QUOTES); ?>"
            <?php echo $isActive ? '' : 'hidden'; ?>
          >
            <div class="icon-picker__grid">
              <?php foreach ($category['icons'] as $icon): ?>
                <button
                  type="button"
                  class="icon-picker__option"
                  data-icon-option
                  data-icon-value="<?php echo htmlspecialchars($icon['path'], ENT_QUOTES); ?>"
                  aria-label="<?php echo htmlspecialchars($icon['label'], ENT_QUOTES); ?>"
                  aria-pressed="false"
                >
                  <span class="icon-picker__option-image">
                    <img src="<?php echo htmlspecialchars($icon['path'], ENT_QUOTES); ?>" alt="">
                  </span>
                  <span class="icon-picker__option-label"><?php echo htmlspecialchars($icon['label'], ENT_QUOTES); ?></span>
                </button>
              <?php endforeach; ?>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php else: ?>
      <p class="icon-picker__empty">No SVG icons were found in the icons directory.</p>
    <?php endif; ?>
  </div>
</div>
