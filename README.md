# Offsett Review
### Web → Magazine PDF Engine · Personal Edition

A client-side PWA that fetches up to three public article URLs, extracts their content using Mozilla Readability, typesets them into a high-end editorial layout using Paged.js, and outputs a print-ready A4 PDF — formatted for offline reading on iPad.

---

## Files

```
offsett-review/
├── index.html      — App shell + all logic (self-contained)
├── manifest.json   — PWA manifest (install to home screen)
├── sw.js           — Service worker (offline support)
└── README.md       — This file
```

---

## Local Use (Quickest Path)

**Option A — Open directly in browser**
```
Just open index.html in Chrome or Safari.
No build step. No server required.
```

**Option B — Local server (recommended for full PWA features)**
```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .

# Then open: http://localhost:8080
```

---

## Deploy to GitHub Pages (Free, Permanent URL)

1. Create a new GitHub repository (public)
2. Upload all three files to the root
3. Go to Settings → Pages → Source: `main` branch, `/` (root)
4. Your app is live at `https://yourusername.github.io/repo-name`

**Install as PWA on iPad:**
- Open the GitHub Pages URL in Safari
- Tap Share → Add to Home Screen
- Tap "Add"
- It now runs standalone, offline-capable

---

## How to Use

1. Paste 1–3 public article URLs into the inputs
   - URLs are validated live (private IPs are blocked)
   - Green dot = valid, red dot = blocked/malformed
2. Tap **Generate Magazine**
3. Watch the progress steps:
   - Validating URLs
   - Fetching via CORS proxy (allorigins.win)
   - Extracting article content (Readability.js)
   - Sanitizing HTML (DOMPurify)
   - Building magazine layout (Paged.js)
   - Opening print dialog
4. A new window opens with the typeset magazine
5. On iPad: tap the Share icon → Save to Files (or print, AirDrop, etc.)

---

## Magazine Output

**Cover page** — Dark, editorial masthead with article titles listed  
**Table of contents** — With leader dots and page numbers  
**Articles** — Each starts on a new page with feature header  

**Column layout** — Auto-toggled by word count:
- < 1,200 words → Single centred column (portrait-optimised)
- ≥ 1,200 words → Two columns with rule (landscape-optimised)

**Typography features:**
- Drop cap on first paragraph of each article
- Running heads (article title left, page number right)
- Indented paragraphs (editorial convention, no blank lines between)
- Blockquote pull-quote styling with decorative opening mark
- Figcaption in mono at reduced size

**Page size:** A4 (best for iPad screen ratio and general readability)

---

## Architecture

```
URL Input
  └── validateURL()           — SSRF protection, blocks private IPs
        └── fetchViaProxy()   — allorigins.win CORS proxy
              └── extractArticle()  — Readability.js + DOMPurify
                    └── buildMagazineHTML()  — Paged.js layout
                          └── window.print()  — Native iOS print dialog
```

**Security layers:**
- Private IP ranges blocked before any fetch
- All HTML sanitized via DOMPurify (allowlist-only tags/attrs)
- No eval, no dynamic script injection
- Content never touches live DOM unsanitized

---

## Limitations

- **Paywalled articles** will not extract (by design — Readability sees only what's public)
- **JavaScript-heavy SPAs** (e.g. React apps) may not render via proxy — static HTML sites work best
- **allorigins.win** is a free public CORS proxy — not for sensitive URLs
- **PDF generation** uses the browser's native print dialog — on iPad this is Print → Save to Files (2 taps)
- **Images** are inlined from their original URLs — if an image URL is broken, it is silently dropped

---

## Future (Product Path)

Replace `allorigins.win` with a single Cloudflare Worker:

```js
// worker.js — deploy free on Cloudflare Workers
export default {
  async fetch(request) {
    const url = new URL(request.url).searchParams.get('url');
    // Add your own SSRF validation here
    const res = await fetch(url, { headers: { 'User-Agent': 'OffsetReader/1.0' }});
    const html = await res.text();
    return new Response(JSON.stringify({ contents: html }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}
```

This gives you a free, controlled, auditable proxy with no third-party data exposure.

---

## Credits

- **Readability.js** — Mozilla Foundation
- **DOMPurify** — Cure53
- **Paged.js** — Pagedmedia.org / W3C Paged Media polyfill
- **Playfair Display** — Clive Crous & Kaja Reinki (Google Fonts)
- **EB Garamond** — Georg Duffner (Google Fonts)
- **DM Mono** — Colophon Foundry (Google Fonts)
