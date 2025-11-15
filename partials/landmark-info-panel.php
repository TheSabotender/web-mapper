<div
  id="landmark-info-overlay"
  class="landmark-info-overlay"
  role="presentation"
  aria-hidden="true"
  hidden
>
  <div
    class="landmark-info-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="landmark-info-title"
    tabindex="-1"
  >
    <header class="landmark-info-modal__header">
      <h2 id="landmark-info-title" class="landmark-info-modal__title">Landmark</h2>
      <div class="landmark-info-modal__header-actions">
        <button
          id="landmark-info-edit"
          class="button button--icon"
          type="button"
          aria-label="Edit landmark"
          title="Edit landmark"
        >📝</button>
        <button
          id="landmark-info-close"
          class="button button--icon"
          type="button"
          aria-label="Close landmark details"
          title="Close landmark details"
        >&times;</button>
      </div>
    </header>
    <div class="landmark-info-modal__body">
      <div class="landmark-info-field">
        <span class="landmark-info-field__label">Name</span>
        <div id="landmark-info-name" class="landmark-info-field__value"></div>
      </div>
      <div class="landmark-info-field">
        <span class="landmark-info-field__label">Description</span>
        <div
          id="landmark-info-description"
          class="landmark-info-field__value landmark-info-field__value--description"
        ></div>
      </div>
      <div class="landmark-info-field landmark-info-field--url">
        <span class="landmark-info-field__label">Link</span>
        <div id="landmark-info-url" class="landmark-info-field__value"></div>
      </div>
      <div class="landmark-info-actions">
        <a
          id="landmark-info-read-more"
          class="button button--primary"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >Read More</a>
      </div>
    </div>
  </div>
</div>
