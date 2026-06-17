---
description: Generate an Instagram carousel (3–10 slides, 1080×1080 PNGs)
argument-hint: <prompt describing the topic — number of slides, hook>
---

# /carousel

Generate an Instagram carousel of 1080×1080 PNGs from brand-consistent HTML slides.

> **Guided flow**: follow the gate in [`docs/flujo-guiado.md`](../../docs/flujo-guiado.md)
> (intake → approve outline → render → review). The gate here is content direction ($0).
> Canonical Spanish version with the detailed flow: `/carrusel`.

## Pipeline

1. **Load brand** — read `brand/brand.json`, `brand/voice.json`, `brand/brand.css`.
2. **Script** — write a `STORYBOARD.md` with one section per slide (hook → 3–7 points → CTA).
3. **Compose** — write one self-contained HTML file per slide under `slides/source/slide-NN.html`.
4. **Render** — run `npm run carrusel -- ./carousels/<slug>` to screenshot every slide to PNG via Playwright.

## Visual variants

Three slide forms (mix freely in one carousel). Full detail in the canonical `/carrusel`:
- **(a) Typographic** (default) — dark bg + big type + keyword highlight. No images.
- **(b) Photo + gradient** — full-bleed photo from `brand/photos/` with brand gradients in
  front (duotone + fade + grain), text over the dark bottom zone. Reference a bank photo by
  **bare filename** (`<img class="photo" src="founder.png" />`); `carousel.ts` copies it
  into `slides/source/` automatically. Start from [`templates/carousel/photo-slide.html`](../../templates/carousel/photo-slide.html).
- **(c) Stock (royalty-free)** — illustrative images from Pexels (default) or Unsplash, both
  publish-grade. Write `<project>/stock-queries.json`, run
  `npm run scrape-images -- ./carousels/<slug>` → downloads to `slides/source/<prefix>-NN.jpg`
  + a `*-manifest.json` with photographer + source + license. Needs `PEXELS_API_KEY` or
  `UNSPLASH_ACCESS_KEY` in `.env` (free keys at pexels.com/api · unsplash.com/developers).

## Rules

- **No AI image generation.** Pure HTML + CSS + Playwright screenshot. (Saves cost, fully deterministic.) Photo/stock slides composite a local image (no generation).
- **Always 1080×1080.**
- **Brand-consistent.** Every slide uses the colors and fonts from `brand/brand.css`. Inline the CSS tokens into each HTML — do not link external stylesheets.
- **Voice-consistent.** Every line of copy obeys `brand/voice.json`: respect `tone`, prefer `hooks`, never use `avoid` words.
- **One project dir.** All artifacts live under `./carousels/<slug>/` (slug = kebab-case derived from the prompt).

## Step-by-step

### 1. Pick a slug
From the user prompt, derive a kebab-case slug, max 6 words. Example: prompt *"3 mistakes people make on carousels"* → slug `3-carousel-mistakes`.

### 2. Create the project structure
```
./carousels/<slug>/
├── STORYBOARD.md
└── slides/
    └── source/
        ├── slide-01.html
        ├── slide-02.html
        └── ...
```

### 3. Write `STORYBOARD.md`
One H2 section per slide. Each section names the slide role (hook | point | cta) and the copy. This is the contract — the HTML files implement it.

### 4. Write `slides/source/slide-NN.html`

Each slide is a **self-contained 1080×1080 page**. Skeleton (copy this pattern, then customize per slide role):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  /* ── brand tokens (copy from brand/brand.css) ── */
  :root {
    --bg: #0B0F1A; --surface: #151B2B;
    --primary: #2563EB; --primary-deep: #1E40AF; --accent: #60A5FA;
    --secondary: #1E293B; --text: #FFFFFF; --muted: #94A3B8;
    --font-display: 'Geist', -apple-system, sans-serif;
    --font-body:    'Geist', -apple-system, sans-serif;
  }
  @font-face {
    font-family: 'Geist';
    font-style: normal;
    font-weight: 100 900;
    font-display: swap;
    src: url('https://cdn.jsdelivr.net/npm/geist@1.5.1/dist/fonts/geist-sans/Geist-Variable.woff2') format('woff2-variations');
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 1080px; height: 1080px;
    background: var(--bg); color: var(--text);
    font-family: var(--font-body);
    overflow: hidden;
  }
  /* slide-specific layout below */
  .slide { width: 1080px; height: 1080px; padding: 96px; display: flex; flex-direction: column; justify-content: center; }
  /* ... */
</style>
</head>
<body>
  <div class="slide">
    <!-- slide content -->
  </div>
</body>
</html>
```

**Layout guidance by slide role:**

- **hook (slide-01)** — big bold statement, max ~12 words, primary color accent on a key word, high-contrast typographic punch. Pull the hook from your `brand/voice.json` `hooks[]`.
- **point (slide-02..N-1)** — number badge top-left (`01`, `02`...), heading (~6 words), body (~25–40 words). Use accent color for numbers, white for heading, muted for body.
- **cta (slide-N)** — tagline + handle/URL from `brand.json`/`voice.json`. Example: `"<your tagline>" + "@yourhandle"`.

**Logo overlay**: to put a logo only on the CTA slide, drop `logo.png` into `brand/photos/` and reference it by **bare filename** (`<img src="logo.png" />`) — `carousel.ts` auto-copies it, same as photos, so it works from any path. (Avoid fragile relative paths to `brand/assets/`.)

### 5. Render
```bash
npm run carrusel -- ./carousels/<slug>
```

Expected output: `<slug>/slides/slide-NN.png` files. Time: ~5–15s for 5 slides. Cost: $0 (purely local).

### 6. Report back
Tell the user the output path and the slug. Optionally `open` the dir on macOS.

## Output

`./carousels/<slug>/slides/slide-NN.png` (1080×1080, ~$0 actual cost — pipeline is fully local; ~5–15s render time)

## Argument

$ARGUMENTS

## Implementation status

✅ `src/pipelines/carousel.ts` (Playwright screenshot loop) implemented. `/carousel` ≡ `/carrusel`.
