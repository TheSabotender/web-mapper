(function () {
  const WebMapper = (window.WebMapper = window.WebMapper || {});
  const ui = (WebMapper.ui = WebMapper.ui || {});

  const overlay = document.getElementById('landmark-info-overlay');
  if (!overlay) {
    return;
  }

  const modal = overlay.querySelector('.landmark-info-modal');
  const title = overlay.querySelector('#landmark-info-title');
  const nameField = overlay.querySelector('#landmark-info-name');
  const descriptionField = overlay.querySelector('#landmark-info-description');
  const urlField = overlay.querySelector('#landmark-info-url');
  const readMoreButton = overlay.querySelector('#landmark-info-read-more');
  const closeButton = overlay.querySelector('#landmark-info-close');
  const editButton = overlay.querySelector('#landmark-info-edit');

  let currentReference = null;
  let isEditing = false;
  let nameInput = null;
  let descriptionInput = null;
  let urlInput = null;

  function setOverlayVisible(visible) {
    overlay.hidden = !visible;
    overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
    if (visible) {
      modal?.focus?.();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizeUrl(value) {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (/^www\./i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    if (/^(https?:|mailto:|\/|#)/i.test(trimmed)) {
      return trimmed;
    }
    return '';
  }

  function renderMarkdown(text) {
    const raw = String(text || '').trim();
    if (!raw) {
      return '';
    }

    function renderInline(content) {
      let html = escapeHtml(content);
      html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
        const safeUrl = sanitizeUrl(url);
        if (!safeUrl) {
          return label;
        }
        const escapedLabel = escapeHtml(label);
        const isAnchor = safeUrl.startsWith('#');
        const isMailto = /^mailto:/i.test(safeUrl);
        const target = isAnchor || isMailto ? '_self' : '_blank';
        const rel = target === '_blank' ? ' rel="noopener noreferrer"' : '';
        return `<a href="${safeUrl}" target="${target}"${rel}>${escapedLabel}</a>`;
      });
      html = html.replace(/\n/g, '<br>');
      return html;
    }

    const paragraphs = raw.split(/\n{2,}/g).map((paragraph) => paragraph.trim());
    return paragraphs
      .filter((paragraph) => paragraph.length > 0)
      .map((paragraph) => `<p>${renderInline(paragraph)}</p>`)
      .join('');
  }

  function getCurrentFeature() {
    if (!currentReference) return null;
    const state = WebMapper.state;
    if (!state) return null;
    const result = WebMapper.utils?.findFeatureByRef?.(state, currentReference);
    if (!result?.feature) {
      return null;
    }
    return result;
  }

  function closePanel() {
    currentReference = null;
    isEditing = false;
    nameInput = null;
    descriptionInput = null;
    urlInput = null;
    setOverlayVisible(false);
  }

  function syncReadMore(url) {
    const safeUrl = sanitizeUrl(url);
    if (!safeUrl) {
      readMoreButton.hidden = true;
      readMoreButton.setAttribute('aria-hidden', 'true');
      return;
    }
    readMoreButton.hidden = false;
    readMoreButton.setAttribute('aria-hidden', 'false');
    readMoreButton.href = safeUrl;
    const isAnchor = safeUrl.startsWith('#');
    const isMailto = /^mailto:/i.test(safeUrl);
    const target = isAnchor || isMailto ? '_self' : '_blank';
    readMoreButton.target = target;
    if (target === '_blank') {
      readMoreButton.rel = 'noopener noreferrer';
    } else {
      readMoreButton.removeAttribute('rel');
    }
  }

  function syncView() {
    const data = getCurrentFeature();
    if (!data) {
      closePanel();
      return;
    }

    const feature = data.feature;
    const featureName = feature?.name?.trim() || 'Untitled Feature';

    title.textContent = featureName;

    editButton.disabled = false;
    editButton.classList.toggle('is-active', isEditing);
    editButton.setAttribute('aria-pressed', isEditing ? 'true' : 'false');
    editButton.setAttribute(
      'aria-label',
      isEditing ? 'Save landmark changes' : 'Edit landmark'
    );
    editButton.title = isEditing ? 'Save landmark changes' : 'Edit landmark';

    if (isEditing) {
      nameField.innerHTML = '';
      descriptionField.innerHTML = '';
      urlField.innerHTML = '';

      nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'landmark-info-input';
      nameInput.value = feature?.name || '';
      nameInput.placeholder = 'Enter a name';

      descriptionInput = document.createElement('textarea');
      descriptionInput.className = 'landmark-info-input landmark-info-input--textarea';
      descriptionInput.value = feature?.description || '';
      descriptionInput.placeholder = 'Enter a description (markdown supported)';

      urlInput = document.createElement('input');
      urlInput.type = 'url';
      urlInput.className = 'landmark-info-input';
      urlInput.value = feature?.url || '';
      urlInput.placeholder = 'https://example.com';

      nameField.appendChild(nameInput);
      descriptionField.appendChild(descriptionInput);
      urlField.appendChild(urlInput);

      syncReadMore('');

      window.setTimeout(() => {
        nameInput?.focus?.();
        nameInput?.select?.();
      }, 0);
      return;
    }

    nameInput = null;
    descriptionInput = null;
    urlInput = null;

    const description = feature?.description || '';
    const descriptionHtml = renderMarkdown(description);

    nameField.textContent = featureName;

    if (descriptionHtml) {
      descriptionField.innerHTML = descriptionHtml;
      descriptionField.classList.remove('is-empty');
    } else {
      descriptionField.textContent = 'No description provided.';
      descriptionField.classList.add('is-empty');
    }

    const url = feature?.url || '';
    if (url.trim()) {
      urlField.textContent = url.trim();
      urlField.classList.remove('is-empty');
    } else {
      urlField.textContent = 'No link provided.';
      urlField.classList.add('is-empty');
    }

    syncReadMore(url);
  }

  function saveEdits() {
    const data = getCurrentFeature();
    if (!data || !nameInput || !descriptionInput || !urlInput) {
      return false;
    }

    const feature = data.feature;
    const nextName = nameInput.value.trim();
    const nextDescription = descriptionInput.value.replace(/\r\n/g, '\n').trim();
    const nextUrl = sanitizeUrl(urlInput.value);

    feature.name = nextName || 'Untitled Feature';
    feature.description = nextDescription;
    feature.url = nextUrl;

    WebMapper.saveState?.();
    WebMapper.render?.();
    WebMapper.ui?.layerPanelControls?.sync?.();

    return true;
  }

  function openPanel(reference) {
    if (!reference) return;
    currentReference = { layerId: reference.layerId, guid: reference.guid };
    isEditing = false;
    syncView();
    setOverlayVisible(true);
  }

  editButton?.addEventListener('click', () => {
    if (!currentReference) {
      return;
    }

    if (isEditing) {
      const didSave = saveEdits();
      if (!didSave) {
        return;
      }
      isEditing = false;
      syncView();
      return;
    }

    isEditing = true;
    syncView();
  });

  closeButton?.addEventListener('click', () => {
    closePanel();
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closePanel();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') {
      closePanel();
    }
  });

  ui.landmarkInfoPanel = {
    open: openPanel,
    close: closePanel,
    sync: syncView,
  };
})();
