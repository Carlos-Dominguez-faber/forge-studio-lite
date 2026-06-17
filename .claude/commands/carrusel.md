---
description: Genera un carrusel de Instagram (3–10 slides, 1080×1080 PNG) con HTML + estructura narrativa
argument-hint: <tema, número de slides, objetivo (lead magnet / educativo / prueba social / …)>
---

# /carrusel

Carrusel de Instagram en PNG 1080×1080 a partir de slides HTML consistentes con la
marca. **Cero generación AI** — puro HTML + CSS + Playwright screenshot ⇒ determinístico,
gratis y rápido (~5–15s para 5 slides).

El valor del carrusel está en **la historia, no en el diseño**. Por eso antes de escribir
slides eliges una **estructura narrativa** (hook → desarrollo → CTA). Lee
[`docs/estructuras-narrativas.md`](../../docs/estructuras-narrativas.md) y escoge la que
calce con el objetivo del usuario.

## Flujo guiado (OBLIGATORIO)

$0 de generación, pero igual sigue el gate de [`docs/flujo-guiado.md`](../../docs/flujo-guiado.md)
— aquí el gate es de **dirección de contenido**, no de gasto.

1. **Intake**: confirma tema, objetivo (lead magnet / educativo / prueba social / …),
   # de slides y **estructura narrativa** (`docs/estructuras-narrativas.md`). Pregunta solo lo que falte.
2. **Outline**: escribe `STORYBOARD.md` (1 sección por slide, rol: hook/punto/prueba/cta).
3. **Aprobar outline**: muestra el outline (rol + copy de cada slide) y pide OK antes de
   escribir los HTML. `AskUserQuestion`: [Aprobar y renderizar] / [Ajustar] / [Cancelar].
4. **Renderizar**: escribe los `slide-NN.html` y `npm run carrusel -- ./carousels/<slug>`.
5. **Revisar**: entrega los PNG; ofrece editar slides puntuales (edita el HTML, re-corre).

## Pipeline

```
Agente (tú):
  1. Lee brand/{brand.json,voice.json,brand.css}
  2. Lee docs/estructuras-narrativas.md → elige estructura según objetivo
  3. Slug kebab-case → ./carousels/<slug>/
  4. STORYBOARD.md (1 sección por slide, rol: hook | punto | prueba | cta)
  5. slides/source/slide-NN.html (self-contained, CSS inline desde brand.css)

TS pipeline:
  npm run carrusel -- ./carousels/<slug>   (= carousel.ts, Playwright screenshot)
```

## Reglas

- **Sin generación AI.** Solo HTML + CSS + screenshot. Cada slide es un archivo
  **self-contained**: copia los tokens de `brand/brand.css` al `<style>`, sin links
  externos a `brand.css` (los paths relativos rompen según dónde viva el proyecto).
- **Siempre 1080×1080.** `html, body, .slide` con dimensiones fijas.
- **Consistente con la voz.** Cada línea respeta `brand/voice.json`: usa `hooks`,
  nunca `avoid`. Tono según `voice.tone`.
- **Keyword-highlighting.** Resalta 1–3 palabras clave por slide con el color primario:
  `<span style="color: var(--primary);">palabra</span>`. Es lo que da el "punch" visual.
- **El hook va en slide-01; el CTA en la última.** Si tienes un logo
  (`brand/photos/logo.png`), úsalo solo en la slide de CTA.

## Variantes visuales de slide

Tres formas; puedes **mezclarlas** en un mismo carrusel (p.ej. hook typographic →
puntos typographic → CTA con foto).

### (a) Typographic (default) — texto puro
El skeleton de abajo: fondo dark + tipografía grande + keyword highlight. $0, sin imágenes.
Es el caso por defecto y el más usado.

### (b) Foto + gradiente — fotos del banco `brand/photos/`
Foto full-bleed con gradientes de marca **al frente** (duotone + fade + grain) y el texto
sobre la zona oscura inferior. Úsala para hook/CTA con presencia humana o slides "founder".
- **Banco** (gitignored, por marca): pon tus fotos en `brand/photos/`. Refiere cada una
  por su **nombre de archivo** (sin ruta). Convención de ejemplo: `founder.png`,
  `workspace.png`, `product-closeup.png` — usa los nombres reales de tus archivos.
  Elige por contexto (speaker = autoridad, escritorio = "construyendo", retrato = CTA).
- **Referencia por BARE FILENAME** (sin ruta): `<img class="photo" src="founder.png" />`.
  El pipeline copia la foto del banco al source dir antes de renderizar (`resolveBankPhotos`
  en `carousel.ts`) — funciona desde cualquier ruta del proyecto. **No** uses rutas relativas.
- **Plantilla:** copia [`templates/carousel/photo-slide.html`](../../templates/carousel/photo-slide.html),
  edita copy + `object-position` para encuadrar la cara. Mantén el orden de capas:
  `.photo` → `.duotone` → `.fade` → `.grain` → `.content`.

### (c) Stock — imágenes ilustrativas royalty-free
Para slides ilustrativos sin foto propia. Un solo flujo con dos fuentes (campo `source`),
ambas **publicables royalty-free**:
- **Config:** escribe `<project>/stock-queries.json` →
  `{ "source": "pexels"|"unsplash", "queries":[...], "count":6, "max_per_query":15, "prefix":"stock", "orientation":"square" }`.
- **Corre:** `npm run scrape-images -- ./carousels/<slug>`. Descarga a
  `slides/source/<prefix>-NN.jpg` + escribe `slides/source/<prefix>-manifest.json` (atribución + fuente + licencia).
  Los slides las referencian por **bare filename** (`<img class="photo" src="stock-01.jpg">`) — misma estética
  foto+gradiente que (b) (duotone + fade + grain encima homogenizan imágenes dispares).
- **`source: "pexels"` (default) o `"unsplash"` — license-clear, free para uso comercial.**
  Requiere `PEXELS_API_KEY` o `UNSPLASH_ACCESS_KEY` en `.env` (gratis:
  pexels.com/api · unsplash.com/developers). El manifest guarda fotógrafo + URL para atribución.

## Paso a paso

### 1. Slug
Kebab-case, máx 6 palabras. Ej: *"3 errores al hacer carruseles"* → `3-errores-hacer-carruseles`.

### 2. Estructura del proyecto
```
./carousels/<slug>/
├── STORYBOARD.md            # 1 sección H2 por slide (rol + copy) — el contrato
└── slides/source/slide-NN.html
```

### 3. Slide skeleton (self-contained 1080×1080)
```html
<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<style>
  /* tokens: copia de brand/brand.css — edítalos a tu marca */
  :root {
    --bg: #0B0F1A; --surface: #151B2B;
    --primary: #2563EB; --primary-deep: #1E40AF; --accent: #60A5FA;
    --text: #FFFFFF; --muted: #94A3B8;
    --font-display: 'Geist', -apple-system, sans-serif;
    --font-body:    'Geist', -apple-system, sans-serif;
  }
  @font-face {
    font-family: 'Geist'; font-weight: 100 900; font-display: swap;
    src: url('https://cdn.jsdelivr.net/npm/geist@1.5.1/dist/fonts/geist-sans/Geist-Variable.woff2') format('woff2-variations');
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1080px; height: 1080px; background: var(--bg); color: var(--text); font-family: var(--font-body); overflow: hidden; }
  .slide { width: 1080px; height: 1080px; padding: 96px; display: flex; flex-direction: column; justify-content: center; }
</style>
</head>
<body>
  <div class="slide"><!-- contenido por rol --></div>
</body>
</html>
```

**Layout por rol** (detalle completo en `docs/estructuras-narrativas.md`):
- **hook (slide-01)** — frase grande, máx ~12 palabras, palabra clave en `var(--primary)`.
  Toma el hook de `voice.json` `hooks[]`; arranca con tu mejor one-liner.
- **punto (slide-02..N-1)** — badge de número (`01`, `02`…) en `var(--accent)`, heading ~6 palabras, body ~25–40 palabras en `var(--muted)`.
- **prueba** — dato/cita/caso con número grande resaltado.
- **cta (slide-N)** — tagline + handle/URL (de `voice.json`/`brand.json`) + logo pequeño opcional.

### 4. Render
```bash
npm run carrusel -- ./carousels/<slug>
```
Salida: `<slug>/slides/slide-NN.png`. Costo $0, ~5–15s.

### 5. Reporta
Path de salida + slug. Opcional `open` del dir en macOS.

## Argument
$ARGUMENTS

## Estado
✅ `src/pipelines/carousel.ts` (loop Playwright). `/carrusel` es el comando canónico en español; `/carousel` funciona como alias en inglés.
