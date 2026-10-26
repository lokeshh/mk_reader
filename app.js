/**
 * मोक्षोपायशास्त्रम् • Mokṣopāya Shāstra Reader
 * Single Page Application Logic
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Version (UPDATE VERSION HERE ONLY - Single Source of Truth)
  // ---------------------------------------------------------------------------
  const APP_VERSION = '1.2.0';

  const PRAKARANA_META = [
    null,
    { id: 1, name: 'वैराग्यप्रकरणम्', en: 'Vairāgya (Dispassion)', sargaCount: 32 },
    { id: 2, name: 'मुमुक्षुव्यवहारप्रकरणम्', en: 'Mumukṣuvyavahāra (Seeker Conduct)', sargaCount: 20 },
    { id: 3, name: 'उत्पत्तिप्रकरणम्', en: 'Utpatti (Creation & Origin)', sargaCount: 140 },
    { id: 4, name: 'स्थितिप्रकरणम्', en: 'Sthiti (Existence & Preservation)', sargaCount: 44 },
    { id: 5, name: 'उपशान्तिप्रकरणम्', en: 'Upaśānti (Quiescence & Peace)', sargaCount: 94 },
    { id: 6, name: 'निर्वाणप्रकरणम्', en: 'Nirvāṇa (Liberation)', sargaCount: 374 },
    { id: 7, name: 'खिलप्रकरणम्', en: 'Khila (Supplementary Verses)', sargaCount: 14 }
  ];

  const DEV_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const DEV_TO_ASCII = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };

  function toDevanagariNum(num) {
    return String(num).replace(/[0-9]/g, d => DEV_DIGITS[d]);
  }

  function toAsciiNum(str) {
    return String(str).replace(/[०-९]/g, d => DEV_TO_ASCII[d] || d);
  }

  // ---------------------------------------------------------------------------
  // IndexedDB Cache for Instant Loading
  // ---------------------------------------------------------------------------
  const DB_NAME = 'mokshopaya_reader_db';
  const DB_STORE = 'text_store';
  const DB_KEY = 'mk_data_raw';

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(DB_STORE)) {
          db.createObjectStore(DB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function getCachedText() {
    try {
      const db = await openDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction(DB_STORE, 'readonly');
        const store = tx.objectStore(DB_STORE);
        const req = store.get(DB_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async function setCachedText(text) {
    try {
      const db = await openDatabase();
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.put(text, DB_KEY);
    } catch (e) {
      console.warn('Could not cache text in IndexedDB:', e);
    }
  }

  async function clearCachedText() {
    try {
      const db = await openDatabase();
      const tx = db.transaction(DB_STORE, 'readwrite');
      const store = tx.objectStore(DB_STORE);
      store.delete(DB_KEY);
      localStorage.removeItem('mk_data_fingerprint');
    } catch (e) {
      console.warn('Could not clear cached text in IndexedDB:', e);
    }
  }

  // ---------------------------------------------------------------------------
  // Application State
  // ---------------------------------------------------------------------------
  const state = {
    // Parsed database: prakarana -> sarga -> array of verses
    data: {},
    allVerses: [], // Flat index of all 29,908 verses for global search
    searchScope: 'sarga', // 'sarga' or 'all'
    globalMatches: [],
    globalDisplayLimit: 60,
    currentPrakarana: 1,
    currentSarga: 1,
    targetVerse: null,
    searchFilter: '',
    fontSize: parseFloat(localStorage.getItem('mk_font_size') || '1.35'),
    theme: localStorage.getItem('mk_theme') || 'parchment'
  };

  // DOM Elements cache
  const el = {};

  function initElements() {
    el.loaderOverlay = document.getElementById('loader-overlay');
    el.loaderBar = document.getElementById('loader-bar');
    el.loaderStatus = document.getElementById('loader-status');
    el.filePickerFallback = document.getElementById('file-picker-fallback');
    el.localFileInput = document.getElementById('local-file-input');

    el.prakaranaSelect = document.getElementById('prakarana-select');
    el.sargaSelect = document.getElementById('sarga-select');
    el.btnPrevSargaNav = document.getElementById('btn-prev-sarga-nav');
    el.btnNextSargaNav = document.getElementById('btn-next-sarga-nav');
    el.verseFilterInput = document.getElementById('verse-filter-input');
    el.btnClearSearch = document.getElementById('btn-clear-search');
    el.scopeSargaBtn = document.getElementById('scope-sarga-btn');
    el.scopeAllBtn = document.getElementById('scope-all-btn');

    el.btnFontDec = document.getElementById('btn-font-dec');
    el.btnFontInc = document.getElementById('btn-font-inc');
    el.btnThemeToggle = document.getElementById('btn-theme-toggle');
    el.themeMenu = document.getElementById('theme-menu');
    el.themeIcon = document.getElementById('theme-icon');
    el.themeLabel = document.getElementById('theme-label');
    el.btnInfo = document.getElementById('btn-info');

    el.bannerPrakaranaName = document.getElementById('banner-prakarana-name');
    el.bannerVerseCount = document.getElementById('banner-verse-count');
    el.currentSargaTitle = document.getElementById('current-sarga-title');
    el.bannerFilterStatus = document.getElementById('banner-filter-status');
    el.filterQueryText = document.getElementById('filter-query-text');
    el.filterMatchCount = document.getElementById('filter-match-count');
    el.btnResetFilter = document.getElementById('btn-reset-filter');

    el.versesContainer = document.getElementById('verses-container');

    el.btnBottomPrev = document.getElementById('btn-bottom-prev');
    el.btnBottomNext = document.getElementById('btn-bottom-next');
    el.bottomPrevLabel = document.getElementById('bottom-prev-label');
    el.bottomNextLabel = document.getElementById('bottom-next-label');
    el.btnBackToTop = document.getElementById('btn-back-to-top');

    el.toast = document.getElementById('toast');
    el.toastMessage = document.getElementById('toast-message');

    el.infoModal = document.getElementById('info-modal');
    el.btnCloseModal = document.getElementById('btn-close-modal');
    el.btnModalDone = document.getElementById('btn-modal-done');

    // Populate version across UI (.app-version-badge in Info button & modal)
    document.querySelectorAll('.app-version-badge').forEach((badge) => {
      badge.textContent = `v${APP_VERSION}`;
    });
  }

  // ---------------------------------------------------------------------------
  // Data Parser Engine
  // ---------------------------------------------------------------------------
  function parseMokshopayaText(rawText) {
    const lines = rawText.split(/\r?\n/);
    const database = {};
    state.allVerses = [];

    for (let p = 1; p <= 7; p++) {
      database[p] = {};
    }

    const markerRegex = /॥\s*([०-९0-9]+)\.([०-९0-9]+)\.([^\s॥]+)\s*॥$/;
    let verseLinesBuffer = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line === '***' || line === 'मोक्षोपायाः खिलाः') {
        continue;
      }

      verseLinesBuffer.push(line);

      const match = line.match(markerRegex);
      if (match) {
        const pNum = parseInt(toAsciiNum(match[1]), 10);
        const sNum = parseInt(toAsciiNum(match[2]), 10);
        const vRaw = match[3];
        const vAscii = toAsciiNum(vRaw);

        if (pNum >= 1 && pNum <= 7) {
          if (!database[pNum][sNum]) {
            database[pNum][sNum] = [];
          }

          const devRef = `${toDevanagariNum(pNum)}.${toDevanagariNum(sNum)}.${vRaw}`;
          const asciiRef = `${pNum}.${sNum}.${vAscii}`;

          // Clean lines: strip the trailing verse marker tag from the last line so
          // metadata tags (and their leading space) never leak into search or display
          const cleanLines = [...verseLinesBuffer];
          const lastIdx = cleanLines.length - 1;
          cleanLines[lastIdx] = cleanLines[lastIdx].replace(/\s*॥\s*[०-९0-9]+\.[०-९0-9]+\.[^\s॥]+\s*॥\s*$/, '').trimEnd();
          const cleanFullText = cleanLines.join('\n');

          const verseObj = {
            p: pNum,
            s: sNum,
            v: vRaw,
            vAscii: vAscii,
            refDev: devRef,
            refAscii: asciiRef,
            lines: cleanLines,
            fullText: cleanFullText
          };

          database[pNum][sNum].push(verseObj);
          state.allVerses.push(verseObj);
        }

        verseLinesBuffer = [];
      }
    }

    return database;
  }

  function extractFingerprint(response) {
    if (!response || !response.headers) return null;
    const etag = response.headers.get('ETag') || '';
    const lastMod = response.headers.get('Last-Modified') || '';
    const len = response.headers.get('Content-Length') || '';
    const fp = `${etag}|${lastMod}|${len}`;
    return fp !== '||' ? fp : null;
  }

  // ---------------------------------------------------------------------------
  // Loader & Initialization
  // ---------------------------------------------------------------------------
  async function loadData() {
    updateLoader(15, 'Checking local cache...');

    // 1. Check local IndexedDB cache & stored server fingerprint
    let text = await getCachedText();
    const cachedFingerprint = localStorage.getItem('mk_data_fingerprint');
    let isCacheValid = false;

    if (text && cachedFingerprint) {
      updateLoader(25, 'Checking for sacred text updates...');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        // Fast HEAD request to check ETag / Last-Modified / Length without downloading 7.8MB
        const headResp = await fetch('./mk_data.txt', {
          method: 'HEAD',
          cache: 'no-cache',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (headResp.ok) {
          const remoteFingerprint = extractFingerprint(headResp);

          if (remoteFingerprint && remoteFingerprint === cachedFingerprint) {
            isCacheValid = true;
          } else {
            console.log('[Mokṣopāya Reader] Fresh version of mk_data.txt detected on server:', { cached: cachedFingerprint, remote: remoteFingerprint });
          }
        }
      } catch (err) {
        // Network timeout / offline / file:// protocol - fall back safely to cached text
        console.warn('Freshness check skipped (offline or timeout), using cached text:', err);
        isCacheValid = true;
      }
    }

    if (isCacheValid) {
      updateLoader(60, 'Parsing cached मोक्षोपाय text...');
      state.data = parseMokshopayaText(text);
      finishLoading();
      return;
    }

    // 2. Fetch fresh mk_data.txt if not in cache or if server file has changed
    const downloadMsg = text ? 'Updating to new mk_data.txt (7.8 MB)...' : 'Downloading mk_data.txt (7.8 MB)...';
    updateLoader(35, downloadMsg);
    try {
      const response = await fetch('./mk_data.txt', { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const newFingerprint = extractFingerprint(response);

      text = await response.text();
      updateLoader(75, 'Parsing 29,908 verses across 7 प्रकरणानि...');
      state.data = parseMokshopayaText(text);

      await setCachedText(text);
      if (newFingerprint) {
        localStorage.setItem('mk_data_fingerprint', newFingerprint);
      }

      finishLoading();
    } catch (err) {
      console.warn('Network fetch failed:', err);
      // If we had old cached text, use it as fallback rather than failing
      if (text) {
        updateLoader(75, 'Using cached text fallback...');
        state.data = parseMokshopayaText(text);
        finishLoading();
        return;
      }
      // If running under file:// or network failed without cache, offer file picker
      el.loaderStatus.textContent = 'Unable to fetch automatically. Please select mk_data.txt:';
      el.filePickerFallback.classList.remove('hidden');
    }
  }

  function updateLoader(percent, statusText) {
    if (el.loaderBar) el.loaderBar.style.width = `${percent}%`;
    if (el.loaderStatus && statusText) el.loaderStatus.textContent = statusText;
  }

  function finishLoading() {
    updateLoader(100, 'Ready! मोक्षोपायशास्त्रे स्वागतम्');
    setTimeout(() => {
      el.loaderOverlay.classList.add('fade-out');
      setTimeout(() => {
        el.loaderOverlay.style.display = 'none';
      }, 400);

      // Initialize Prakarana Dropdown with counts
      initPrakaranaDropdown();

      // Read initial URL hash or default to 1.1
      parseUrlHash();

      // Setup listeners
      setupEventListeners();
    }, 250);
  }

  // ---------------------------------------------------------------------------
  // Navigation & Dropdown Management
  // ---------------------------------------------------------------------------
  function initPrakaranaDropdown() {
    el.prakaranaSelect.innerHTML = '';
    for (let p = 1; p <= 7; p++) {
      const meta = PRAKARANA_META[p];
      const sargas = state.data[p] || {};
      const actualSargaCount = Object.keys(sargas).length || meta.sargaCount;
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = `${toDevanagariNum(p)}. ${meta.name} (${actualSargaCount} सर्गाः)`;
      el.prakaranaSelect.appendChild(opt);
    }
  }

  function updateSargaDropdown() {
    const p = state.currentPrakarana;
    const sargas = state.data[p] || {};
    const sargaKeys = Object.keys(sargas).map(Number).sort((a, b) => a - b);

    el.sargaSelect.innerHTML = '';
    sargaKeys.forEach((s) => {
      const verses = sargas[s] || [];
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = `सर्गः ${toDevanagariNum(s)} (${toDevanagariNum(verses.length)} श्लोकाः)`;
      el.sargaSelect.appendChild(opt);
    });

    el.sargaSelect.value = state.currentSarga;
  }

  // ---------------------------------------------------------------------------
  // View Rendering
  // ---------------------------------------------------------------------------
  function renderCurrentSarga() {
    // Keep exact user query (preserving leading, trailing, and internal spaces)
    const query = state.searchFilter;

    // If global search is active and a query is typed, display global search results
    if (state.searchScope === 'all' && query.length > 0) {
      renderGlobalSearchResults(query);
      return;
    }

    const p = state.currentPrakarana;
    const s = state.currentSarga;
    const meta = PRAKARANA_META[p];
    const sargas = state.data[p] || {};
    const verses = sargas[s] || [];

    // 1. Update Header & Selectors
    el.prakaranaSelect.value = p;
    updateSargaDropdown();

    // 2. Update Banner
    el.bannerPrakaranaName.textContent = `प्रकरणम् ${toDevanagariNum(p)} • ${meta.name}`;
    el.bannerVerseCount.textContent = `${toDevanagariNum(verses.length)} श्लोकाः`;
    el.currentSargaTitle.textContent = `सर्गः ${toDevanagariNum(s)}`;
    document.title = `${meta.name} • सर्गः ${toDevanagariNum(s)} • मोक्षोपायः`;

    // 3. Filter verses if query exists within current sarga
    let displayVerses = verses;

    if (query) {
      const q = query.toLowerCase();
      displayVerses = verses.filter(v =>
        v.fullText.toLowerCase().includes(q) ||
        v.v === query ||
        v.vAscii === query
      );

      el.bannerFilterStatus.classList.remove('hidden');
      el.filterQueryText.textContent = `"${query}"`;
      el.filterMatchCount.textContent = toDevanagariNum(displayVerses.length);
    } else {
      el.bannerFilterStatus.classList.add('hidden');
    }

    // 4. Render Verses
    if (displayVerses.length === 0) {
      el.versesContainer.innerHTML = `
        <div class="no-match-message">
          <p>अस्मिन् सर्गे न को ऽपि श्लोकः सम्प्राप्तः (No verses matching "${query}" in Sarga ${toDevanagariNum(s)})</p>
          <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 14px;">
            <button id="btn-search-all-suggestion" class="btn btn-primary btn-sm">
              🔍 समग्रग्रन्थे अन्विष्यताम् (Search in all 29,908 verses)
            </button>
            <button id="btn-empty-clear" class="btn btn-subtle btn-sm">Clear Filter</button>
          </div>
        </div>
      `;
      const searchAllBtn = document.getElementById('btn-search-all-suggestion');
      if (searchAllBtn) {
        searchAllBtn.addEventListener('click', () => setSearchScope('all'));
      }
      const emptyBtn = document.getElementById('btn-empty-clear');
      if (emptyBtn) {
        emptyBtn.addEventListener('click', clearSearchFilter);
      }
    } else {
      const fragment = document.createDocumentFragment();

      displayVerses.forEach((verseObj) => {
        const stanza = document.createElement('article');
        stanza.className = 'verse-stanza';
        stanza.id = `verse-${verseObj.p}-${verseObj.s}-${verseObj.vAscii}`;
        stanza.setAttribute('data-verse', verseObj.vAscii);

        // Check if targeted by URL
        if (state.targetVerse && (state.targetVerse === verseObj.vAscii || state.targetVerse === verseObj.v)) {
          stanza.classList.add('highlighted');
        }

        const linesContainer = document.createElement('div');
        linesContainer.className = 'verse-lines';

        verseObj.lines.forEach((lineText, idx) => {
          const isLastLine = (idx === verseObj.lines.length - 1);
          const lineDiv = document.createElement('div');
          lineDiv.className = 'verse-line';

          let renderedText = lineText;
          if (query.length > 0) {
            renderedText = highlightMatch(renderedText, query);
          }

          if (isLastLine) {
            lineDiv.innerHTML = `${renderedText} <span class="verse-num" title="Verse ${verseObj.refDev} (${verseObj.refAscii}) • Click to copy link">॥&nbsp;${verseObj.refDev}&nbsp;॥</span>`;

            const numSpan = lineDiv.querySelector('.verse-num');
            if (numSpan) {
              numSpan.addEventListener('click', () => copyVerseLink(verseObj));
            }
          } else {
            lineDiv.innerHTML = renderedText;
          }

          linesContainer.appendChild(lineDiv);
        });

        // Quick floating action buttons
        const actions = document.createElement('div');
        actions.className = 'verse-quick-actions';

        const btnCopy = document.createElement('button');
        btnCopy.className = 'btn-verse-mini';
        btnCopy.title = 'Copy verse text';
        btnCopy.setAttribute('aria-label', `Copy verse ${verseObj.refAscii}`);
        btnCopy.innerHTML = '📋';
        btnCopy.addEventListener('click', (e) => {
          e.stopPropagation();
          copyVerseToClipboard(verseObj);
        });

        const btnShare = document.createElement('button');
        btnShare.className = 'btn-verse-mini';
        btnShare.title = 'Copy link';
        btnShare.setAttribute('aria-label', `Copy link to verse ${verseObj.refAscii}`);
        btnShare.innerHTML = '🔗';
        btnShare.addEventListener('click', (e) => {
          e.stopPropagation();
          copyVerseLink(verseObj);
        });

        actions.appendChild(btnCopy);
        actions.appendChild(btnShare);

        stanza.appendChild(linesContainer);
        stanza.appendChild(actions);
        fragment.appendChild(stanza);
      });

      el.versesContainer.innerHTML = '';
      el.versesContainer.appendChild(fragment);
    }

    // 5. Update Prev / Next Buttons
    updateNavigationControls();

    // 6. Handle target verse scrolling if provided
    if (state.targetVerse) {
      setTimeout(() => {
        const targetEl = document.getElementById(`verse-${p}-${s}-${state.targetVerse}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }

  // ---------------------------------------------------------------------------
  // Global Text Search (Across all 29,908 verses in all 7 Books)
  // ---------------------------------------------------------------------------
  function renderGlobalSearchResults(query) {
    const q = query.toLowerCase();

    // Fast scanning across all 29,908 verses as-is without trimming
    const matches = state.allVerses.filter(v =>
      v.fullText.toLowerCase().includes(q) ||
      v.refAscii === query ||
      v.refDev === query ||
      v.vAscii === query ||
      v.v === query
    );

    state.globalMatches = matches;

    // Update Banner for Global Search
    el.bannerPrakaranaName.textContent = 'समग्रश्लोकशोधनम् • Global Text Search';
    el.bannerVerseCount.textContent = `${toDevanagariNum(matches.length)} श्लोकाः सम्प्राप्ताः`;
    el.currentSargaTitle.textContent = `शोधपरिणामाः ("${query}")`;
    document.title = `शोधः "${query}" (${matches.length}) • मोक्षोपायः`;

    el.bannerFilterStatus.classList.remove('hidden');
    el.filterQueryText.textContent = `"${query}" (समग्रग्रन्थे / All 7 Books)`;
    el.filterMatchCount.textContent = toDevanagariNum(matches.length);

    // Bottom Navigation in Global Search Mode
    el.btnPrevSargaNav.disabled = true;
    el.btnNextSargaNav.disabled = true;
    el.btnBottomPrev.disabled = false;
    el.bottomPrevLabel.textContent = `सर्गं प्रति निवर्तताम् (Return to Sarga ${toDevanagariNum(state.currentSarga)})`;
    el.btnBottomNext.disabled = false;
    el.bottomNextLabel.textContent = 'शीर्षम् (Top) ↑';

    if (matches.length === 0) {
      el.versesContainer.innerHTML = `
        <div class="no-match-message">
          <p>समस्तग्रन्थे न को ऽपि श्लोकः सम्प्राप्तः (No verses matching "${query}" in all 7 Books)</p>
          <button id="btn-empty-clear" class="btn btn-primary btn-sm">Clear Search</button>
        </div>
      `;
      const emptyBtn = document.getElementById('btn-empty-clear');
      if (emptyBtn) emptyBtn.addEventListener('click', clearSearchFilter);
      return;
    }

    const fragment = document.createDocumentFragment();
    const countToRender = Math.min(matches.length, state.globalDisplayLimit);

    for (let i = 0; i < countToRender; i++) {
      const verseObj = matches[i];
      const stanza = document.createElement('article');
      stanza.className = 'verse-stanza';
      stanza.id = `verse-${verseObj.p}-${verseObj.s}-${verseObj.vAscii}`;

      // Global context header showing Book name, Sarga #, and direct jump button
      const contextHeader = document.createElement('div');
      contextHeader.className = 'global-verse-header';
      contextHeader.innerHTML = `
        <span>
          <span class="global-prakarana-tag">प्रकरणम् ${toDevanagariNum(verseObj.p)} (${PRAKARANA_META[verseObj.p].name})</span>
          &nbsp;•&nbsp;सर्गः ${toDevanagariNum(verseObj.s)}
        </span>
        <button class="btn-open-sarga" title="Open this sarga in full reader">
          सर्गं गच्छ (Open Chapter) →
        </button>
      `;

      const btnOpen = contextHeader.querySelector('.btn-open-sarga');
      btnOpen.addEventListener('click', () => {
        state.searchScope = 'sarga';
        if (el.scopeSargaBtn) el.scopeSargaBtn.classList.add('active');
        if (el.scopeAllBtn) el.scopeAllBtn.classList.remove('active');
        state.searchFilter = '';
        el.verseFilterInput.value = '';
        el.btnClearSearch.classList.add('hidden');
        navigateTo(verseObj.p, verseObj.s, verseObj.vAscii);
      });

      const linesContainer = document.createElement('div');
      linesContainer.className = 'verse-lines';

      verseObj.lines.forEach((lineText, idx) => {
        const isLastLine = (idx === verseObj.lines.length - 1);
        const lineDiv = document.createElement('div');
        lineDiv.className = 'verse-line';

        let renderedText = lineText;
        if (query.length > 0) {
          renderedText = highlightMatch(renderedText, query);
        }

        if (isLastLine) {
          lineDiv.innerHTML = `${renderedText} <span class="verse-num" title="Verse ${verseObj.refDev} (${verseObj.refAscii}) • Click to copy link">॥&nbsp;${verseObj.refDev}&nbsp;॥</span>`;

          const numSpan = lineDiv.querySelector('.verse-num');
          if (numSpan) {
            numSpan.addEventListener('click', () => copyVerseLink(verseObj));
          }
        } else {
          lineDiv.innerHTML = renderedText;
        }

        linesContainer.appendChild(lineDiv);
      });

      // Quick actions
      const actions = document.createElement('div');
      actions.className = 'verse-quick-actions';

      const btnCopy = document.createElement('button');
      btnCopy.className = 'btn-verse-mini';
      btnCopy.title = 'Copy verse';
      btnCopy.setAttribute('aria-label', `Copy verse ${verseObj.refAscii}`);
      btnCopy.innerHTML = '📋';
      btnCopy.addEventListener('click', (e) => {
        e.stopPropagation();
        copyVerseToClipboard(verseObj);
      });

      const btnShare = document.createElement('button');
      btnShare.className = 'btn-verse-mini';
      btnShare.title = 'Copy link';
      btnShare.setAttribute('aria-label', `Copy link to verse ${verseObj.refAscii}`);
      btnShare.innerHTML = '🔗';
      btnShare.addEventListener('click', (e) => {
        e.stopPropagation();
        copyVerseLink(verseObj);
      });

      actions.appendChild(btnCopy);
      actions.appendChild(btnShare);

      stanza.appendChild(contextHeader);
      stanza.appendChild(linesContainer);
      stanza.appendChild(actions);
      fragment.appendChild(stanza);
    }

    // "Show more" button if results exceed current batch limit
    if (matches.length > countToRender) {
      const loadMoreContainer = document.createElement('div');
      loadMoreContainer.className = 'load-more-container';
      loadMoreContainer.innerHTML = `
        <button id="btn-load-more" class="btn btn-primary btn-sm">
          अधिकानि श्लोकानि दर्शयतु (Show next batch • ${countToRender} of ${matches.length})
        </button>
      `;
      const btnMore = loadMoreContainer.querySelector('#btn-load-more');
      btnMore.addEventListener('click', () => {
        state.globalDisplayLimit += 60;
        renderGlobalSearchResults(query);
      });
      fragment.appendChild(loadMoreContainer);
    }

    el.versesContainer.innerHTML = '';
    el.versesContainer.appendChild(fragment);
  }

  function markerRegexOnly(v) {
    const escaped = String(v).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\s*॥\\s*[०-९0-9]+\\.[०-९0-9]+\\.${escaped}\\s*॥\\s*$`);
  }

  function highlightMatch(text, query) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark class="search-match">$1</mark>');
  }

  // ---------------------------------------------------------------------------
  // Navigation Transitions
  // ---------------------------------------------------------------------------
  function updateNavigationControls() {
    const p = state.currentPrakarana;
    const s = state.currentSarga;
    const sargas = state.data[p] || {};
    const maxSarga = Math.max(...Object.keys(sargas).map(Number));

    // Can go previous?
    const hasPrev = !(p === 1 && s === 1);
    el.btnPrevSargaNav.disabled = !hasPrev;
    el.btnBottomPrev.disabled = !hasPrev;

    if (hasPrev) {
      if (s > 1) {
        el.bottomPrevLabel.textContent = `सर्गः ${toDevanagariNum(s - 1)} (P ${p}.${s - 1})`;
      } else {
        const prevP = p - 1;
        const prevSargas = state.data[prevP] || {};
        const prevMaxS = Math.max(...Object.keys(prevSargas).map(Number));
        el.bottomPrevLabel.textContent = `प्रकरणम् ${toDevanagariNum(prevP)} • सर्गः ${toDevanagariNum(prevMaxS)}`;
      }
    } else {
      el.bottomPrevLabel.textContent = 'प्रारम्भः (Beginning)';
    }

    // Can go next?
    const hasNext = !(p === 7 && s === maxSarga);
    el.btnNextSargaNav.disabled = !hasNext;
    el.btnBottomNext.disabled = !hasNext;

    if (hasNext) {
      if (s < maxSarga) {
        el.bottomNextLabel.textContent = `सर्गः ${toDevanagariNum(s + 1)} (P ${p}.${s + 1})`;
      } else {
        const nextP = p + 1;
        el.bottomNextLabel.textContent = `प्रकरणम् ${toDevanagariNum(nextP)} • सर्गः १`;
      }
    } else {
      el.bottomNextLabel.textContent = 'समाप्तम् (End of Text)';
    }
  }

  function goToPreviousSarga() {
    const p = state.currentPrakarana;
    const s = state.currentSarga;

    if (s > 1) {
      navigateTo(p, s - 1);
    } else if (p > 1) {
      const prevP = p - 1;
      const prevSargas = state.data[prevP] || {};
      const prevMaxS = Math.max(...Object.keys(prevSargas).map(Number));
      navigateTo(prevP, prevMaxS);
    }
  }

  function goToNextSarga() {
    const p = state.currentPrakarana;
    const s = state.currentSarga;
    const sargas = state.data[p] || {};
    const maxSarga = Math.max(...Object.keys(sargas).map(Number));

    if (s < maxSarga) {
      navigateTo(p, s + 1);
    } else if (p < 7) {
      navigateTo(p + 1, 1);
    }
  }

  function navigateTo(pNum, sNum, vNum = null) {
    pNum = Math.max(1, Math.min(7, parseInt(pNum, 10) || 1));
    const sargas = state.data[pNum] || {};
    const maxSarga = Math.max(...Object.keys(sargas).map(Number), 1);
    sNum = Math.max(1, Math.min(maxSarga, parseInt(sNum, 10) || 1));

    state.currentPrakarana = pNum;
    state.currentSarga = sNum;
    state.targetVerse = vNum ? String(vNum) : null;

    // Update URL hash
    let hash = `#${pNum}.${sNum}`;
    if (vNum) hash += `.${vNum}`;

    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      renderCurrentSarga();
      if (!vNum) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function parseUrlHash() {
    const hash = window.location.hash.replace('#', '').trim();
    if (!hash) {
      // Default: Prakarana 1, Sarga 1
      navigateTo(1, 1);
      return;
    }

    const parts = hash.split('.');
    const p = parseInt(toAsciiNum(parts[0]), 10) || 1;
    const s = parseInt(toAsciiNum(parts[1]), 10) || 1;
    const v = parts[2] ? toAsciiNum(parts[2]) : null;

    navigateTo(p, s, v);
  }

  // ---------------------------------------------------------------------------
  // Search & Filtering
  // ---------------------------------------------------------------------------
  function setSearchScope(scope) {
    state.searchScope = scope;
    if (scope === 'all') {
      if (el.scopeAllBtn) el.scopeAllBtn.classList.add('active');
      if (el.scopeSargaBtn) el.scopeSargaBtn.classList.remove('active');
      if (el.verseFilterInput) el.verseFilterInput.placeholder = 'समस्तश्लोकेषु शोधयन्तु (All 29,908 verses)...';
    } else {
      if (el.scopeSargaBtn) el.scopeSargaBtn.classList.add('active');
      if (el.scopeAllBtn) el.scopeAllBtn.classList.remove('active');
      if (el.verseFilterInput) el.verseFilterInput.placeholder = 'Verse # or word in sarga...';
    }

    state.globalDisplayLimit = 60;
    renderCurrentSarga();
    if (el.verseFilterInput) el.verseFilterInput.focus();
  }

  function handleSearchInput(e) {
    const val = e.target.value;
    state.searchFilter = val;
    state.globalDisplayLimit = 60;
    if (val) {
      el.btnClearSearch.classList.remove('hidden');
    } else {
      el.btnClearSearch.classList.add('hidden');
    }
    renderCurrentSarga();
  }

  function clearSearchFilter() {
    state.searchFilter = '';
    state.globalDisplayLimit = 60;
    el.verseFilterInput.value = '';
    el.btnClearSearch.classList.add('hidden');
    renderCurrentSarga();
    el.verseFilterInput.focus();
  }

  // ---------------------------------------------------------------------------
  // Clipboard & Toast
  // ---------------------------------------------------------------------------
  function copyVerseToClipboard(verseObj) {
    const textToCopy = `${verseObj.fullText}\n\n[मोक्षोपायः ${verseObj.refDev}]`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast(`श्लोकः प्रतिलिखितः (Verse ${verseObj.refDev} copied)`);
    }).catch(() => {
      showToast('Copy failed. Please copy manually.');
    });
  }

  function copyVerseLink(verseObj) {
    const url = `${window.location.origin}${window.location.pathname}#${verseObj.refAscii}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast(`श्लोककडिः प्रतिलिखिता (Link #${verseObj.refAscii} copied)`);
    }).catch(() => {
      showToast(url);
    });
  }

  let toastTimeout = null;
  function showToast(msg) {
    el.toastMessage.textContent = msg;
    el.toast.classList.remove('hidden');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      el.toast.classList.add('hidden');
    }, 2800);
  }

  // ---------------------------------------------------------------------------
  // Theme & Appearance
  // ---------------------------------------------------------------------------
  function setTheme(themeName) {
    state.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('mk_theme', themeName);

    const icons = { parchment: '📜', dark: '🌌', sepia: '🍂' };
    const labels = { parchment: 'Parchment', dark: 'Dark', sepia: 'Sepia' };

    el.themeIcon.textContent = icons[themeName] || '📜';
    el.themeLabel.textContent = labels[themeName] || 'Parchment';

    // Update active class in menu
    document.querySelectorAll('.theme-option').forEach((opt) => {
      if (opt.getAttribute('data-set-theme') === themeName) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });

    el.themeMenu.classList.add('hidden');
  }

  function toggleThemeMenu() {
    el.themeMenu.classList.toggle('hidden');
  }

  function adjustFontSize(delta) {
    state.fontSize = Math.max(1.0, Math.min(2.4, state.fontSize + delta));
    document.documentElement.style.setProperty('--verse-font-size', `${state.fontSize}rem`);
    localStorage.setItem('mk_font_size', state.fontSize);
  }

  // ---------------------------------------------------------------------------
  // Event Listeners
  // ---------------------------------------------------------------------------
  function setupEventListeners() {
    // Dropdown change handlers
    el.prakaranaSelect.addEventListener('change', (e) => {
      navigateTo(e.target.value, 1);
    });

    el.sargaSelect.addEventListener('change', (e) => {
      navigateTo(state.currentPrakarana, e.target.value);
    });

    // Prev / Next button handlers
    el.btnPrevSargaNav.addEventListener('click', goToPreviousSarga);
    el.btnNextSargaNav.addEventListener('click', goToNextSarga);
    el.btnBottomPrev.addEventListener('click', () => {
      if (state.searchScope === 'all' && state.searchFilter.length > 0) {
        clearSearchFilter();
      } else {
        goToPreviousSarga();
      }
    });
    el.btnBottomNext.addEventListener('click', () => {
      if (state.searchScope === 'all' && state.searchFilter.length > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        goToNextSarga();
      }
    });

    // Scope toggle buttons
    if (el.scopeSargaBtn) {
      el.scopeSargaBtn.addEventListener('click', () => setSearchScope('sarga'));
    }
    if (el.scopeAllBtn) {
      el.scopeAllBtn.addEventListener('click', () => setSearchScope('all'));
    }

    // Scroll to top
    el.btnBackToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Search filter
    el.verseFilterInput.addEventListener('input', handleSearchInput);
    el.btnClearSearch.addEventListener('click', clearSearchFilter);
    el.btnResetFilter.addEventListener('click', clearSearchFilter);

    // Font size
    el.btnFontDec.addEventListener('click', () => adjustFontSize(-0.1));
    el.btnFontInc.addEventListener('click', () => adjustFontSize(0.1));

    // Theme
    el.btnThemeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleThemeMenu();
    });

    document.querySelectorAll('.theme-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        setTheme(btn.getAttribute('data-set-theme'));
      });
    });

    document.addEventListener('click', (e) => {
      if (!el.themeMenu.contains(e.target) && e.target !== el.btnThemeToggle) {
        el.themeMenu.classList.add('hidden');
      }
    });

    // Modal
    el.btnInfo.addEventListener('click', () => el.infoModal.classList.remove('hidden'));
    el.btnCloseModal.addEventListener('click', () => el.infoModal.classList.add('hidden'));
    el.btnModalDone.addEventListener('click', () => el.infoModal.classList.add('hidden'));
    el.infoModal.addEventListener('click', (e) => {
      if (e.target === el.infoModal) el.infoModal.classList.add('hidden');
    });

    const btnForceReload = document.getElementById('btn-force-reload-data');
    if (btnForceReload) {
      btnForceReload.addEventListener('click', async () => {
        btnForceReload.disabled = true;
        btnForceReload.textContent = 'Clearing...';
        await clearCachedText();
        window.location.reload();
      });
    }

    // Local file fallback picker
    el.localFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result;
        updateLoader(80, 'Parsing local file...');
        state.data = parseMokshopayaText(text);
        setCachedText(text);
        finishLoading();
      };
      reader.readAsText(file, 'utf-8');
    });

    // URL hash listener for browser back/forward
    window.addEventListener('hashchange', () => {
      parseUrlHash();
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        if (e.key === 'Escape') {
          clearSearchFilter();
          document.activeElement.blur();
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === '[') {
        goToPreviousSarga();
      } else if (e.key === 'ArrowRight' || e.key === ']') {
        goToNextSarga();
      } else if (e.key === 'f' || e.key === '/') {
        e.preventDefault();
        el.verseFilterInput.focus();
      } else if (e.key === 't' || e.key === 'T') {
        const themes = ['parchment', 'dark', 'sepia'];
        const nextIdx = (themes.indexOf(state.theme) + 1) % themes.length;
        setTheme(themes[nextIdx]);
      } else if (e.key === 'Escape') {
        el.infoModal.classList.add('hidden');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Bootstrap Application
  // ---------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    console.log(`[मोक्षोपायशास्त्रम्] Mokṣopāya Reader v${APP_VERSION}`);
    initElements();

    // Set saved theme & font size
    setTheme(state.theme);
    document.documentElement.style.setProperty('--verse-font-size', `${state.fontSize}rem`);

    // Load data
    loadData();
  });

})();
