# मोक्षोपायशास्त्रम् • Mokṣopāya Reader

A high-performance, responsive Single Page Application (SPA) designed to read, explore, and search the entire **Mokṣopāya** (मोक्षोपाय) text (~30,000 verses across 7 प्रकरणानि).

Live at: **https://mk-reader.netlify.app/**

## Features
- **All 7 प्रकरणानि (Books)**:
  1. वैराग्यप्रकरणम् (Vairāgya) — 32 सर्गाः (1,078 verses)
  2. मुमुक्षुव्यवहारप्रकरणम् (Mumukṣuvyavahāra) — 20 सर्गाः (795 verses)
  3. उत्पत्तिप्रकरणम् (Utpatti) — 140 सर्गाः (6,000 verses)
  4. स्थितिप्रकरणम् (Sthiti) — 44 सर्गाः (1,804 verses)
  5. उपशान्तिप्रकरणम् (Upaśānti) — 94 सर्गाः (4,299 verses)
  6. निर्वाणप्रकरणम् (Nirvāṇa) — 374 सर्गाः (15,330 verses)
  7. खिलप्रकरणम् (Khila) — 14 सर्गाः (602 verses)
- **Default View**: Opens directly to **1.1** (वैराग्यप्रकरणम्, सर्ग १).
- **Fast In-Browser Indexing & IndexedDB Caching**: Instantaneous navigation (<0ms) between chapters.
- **Deep Linking**: Share or bookmark any chapter or verse via hash URLs (e.g. `#1.1`, `#1.1.25`, `#3.40`).
- **Interactive Search / Filter**: Filter verses within the active Sarga by verse number or Sanskrit keywords.
- **Classical Sanskrit Typography**: Tiro Devanagari Sanskrit and Noto Serif Devanagari fonts.
- **3 Curated Themes**: Parchment (सात्त्विक), Cosmic Dark (निर्वाण), and Sepia Palm Leaf (तालपत्र).
- **Zero Dependencies**: Pure HTML5, CSS3, and modern ES6 JavaScript. No build step or node_modules needed.

## Running Locally

Since the app is built with bare web standards and uses `fetch()` to load `mk_data.txt`, run a local static server using Python:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your web browser.

## Deployment

Deploy directly to **Netlify** (or GitHub Pages / Vercel) by connecting the repository:
- **Build command**: *(none needed — leave empty)*
- **Publish directory**: `.` (or root directory)

## Keyboard Shortcuts
- `←` or `[` : Previous Sarga
- `→` or `]` : Next Sarga
- `f` or `/` : Focus verse filter
- `t` : Toggle visual theme (Parchment / Dark / Sepia)
- `Esc` : Clear search filter
