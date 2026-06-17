# forge-studio-lite — Generador de Carruseles

Genera carruseles de Instagram (slides 1080×1080) a partir de HTML + CSS consistentes
con tu marca, capturados por Playwright. **100% local, determinístico, $0** — sin
generación de imágenes con IA para la variante por defecto.

Es la versión mínima y regalable del estudio: solo el generador de carruseles con sus
**3 variantes**. Clónalo, instala el stack, y empieza a producir carruseles para tu marca.

```
slides/source/slide-NN.html  →  Playwright (Chromium, viewport 1080×1080)
  →  slides/slide-NN.png
```

Ese es todo el motor. El valor está en **la historia** (la estructura narrativa) y en
**la marca** (tus tokens), no en efectos. El agente escribe los slides; el TS solo
screenshea.

---

## Qué necesitas

- **Node.js 18+** (usa `fetch` global y `--env-file`).
- **Claude Code** (opcional pero recomendado) — maneja el flujo `/carrusel` por ti.
- **~250 MB** para el Chromium de Playwright.
- *(Opcional, solo variante c)* una key gratis de Pexels o Unsplash.

## Instalar

```bash
git clone <este-repo> forge-studio-lite
cd forge-studio-lite
./setup.sh
```

`setup.sh` verifica Node, corre `npm install`, instala Chromium y crea `.env`.
Equivalente manual:

```bash
npm install && npx playwright install chromium && cp .env.example .env
```

## Quickstart — renderiza el ejemplo

```bash
npm run carrusel -- examples/carousel-typographic
# → examples/carousel-typographic/slides/slide-01.png … (1080×1080)
```

(`npm run carousel -- ...` es el alias en inglés.)

---

## Las 3 variantes

| Variante | Qué es | Necesita | Ejemplo |
|---|---|---|---|
| **(a) Typographic** | Texto puro: fondo dark + tipografía grande + keyword highlight. El caso por defecto. | nada | [`examples/carousel-typographic`](examples/carousel-typographic) |
| **(b) Foto + gradiente** | Foto del banco `brand/photos/` con gradientes de marca al frente. Referencia por **bare filename** (`<img src="founder.png">`); `carousel.ts` la copia sola. | tus fotos en `brand/photos/` | [`examples/carousel-photo`](examples/carousel-photo) |
| **(c) Stock royalty-free** | Imágenes ilustrativas de Pexels/Unsplash (publicables). Escribe `stock-queries.json`, corre `npm run scrape-images`. | `PEXELS_API_KEY` o `UNSPLASH_ACCESS_KEY` | [`examples/carousel-stock`](examples/carousel-stock) |

Puedes **mezclar** variantes en un mismo carrusel (p.ej. hook typographic → puntos
typographic → CTA con foto).

---

## Dos formas de usarlo

**1. Con Claude Code (recomendado)** — pídele:

```
/carrusel 3 errores al elegir tu nicho, educativo, 5 slides
```

El agente lee `brand/`, elige una estructura narrativa de
[`docs/estructuras-narrativas.md`](docs/estructuras-narrativas.md), sigue el gate de
[`docs/flujo-guiado.md`](docs/flujo-guiado.md) (te muestra el outline y pide OK antes de
renderizar), escribe `STORYBOARD.md` + los slides HTML, y corre `npm run carrusel`.

**2. Manual** — escribe tú los `slides/source/slide-NN.html` (parte del skeleton del
ejemplo) y corre:

```bash
npm run carrusel -- ./carousels/<slug>
```

Los carruseles que generes viven en `./carousels/<slug>/` (gitignored).

---

## Personaliza tu marca

Edita estos tres archivos — son la única fuente de verdad de marca:

- **[`brand/brand.json`](brand/brand.json)** — paleta de colores + fuentes + tagline.
- **[`brand/voice.json`](brand/voice.json)** — tono, hooks, audiencia, palabras a evitar.
- **[`brand/brand.css`](brand/brand.css)** — los tokens (`--primary`, `--bg`, `--font-display`…)
  que cada slide copia inline.

Opcional: pon tu logo en `brand/assets/logo.png` y tus fotos en `brand/photos/`.
Vienen con un **starter neutral** (placeholders "YOUR BRAND", paleta azul) — reemplázalo.

> **Por qué los tokens van inline en cada slide:** cada slide debe ser auto-contenido
> para renderizar desde cualquier ruta. El agente copia los tokens de `brand.css` al
> `<style>` de cada HTML; no se enlaza `brand.css` externamente.

---

## Variante (c): keys + licencia

Saca una key gratis y ponla en `.env`:

```bash
PEXELS_API_KEY=...        # https://www.pexels.com/api/
UNSPLASH_ACCESS_KEY=...   # https://unsplash.com/developers
```

Pexels y Unsplash son **royalty-free, publicables** para uso comercial. El comando
`npm run scrape-images -- <dir>` lee `stock-queries.json`, descarga a
`slides/source/<prefix>-NN.jpg` y escribe un `*-manifest.json` con el fotógrafo + la URL
+ la licencia de cada imagen (para atribución, apreciada pero no obligatoria).

---

## Costo y velocidad

- **Variantes (a)/(b):** $0, todo local, ~5–15s para 5 slides.
- **Variante (c):** $0 de imágenes en el tier gratis de Pexels/Unsplash (rate-limited).
  Nunca hay costo por generación.

## Estructura del repo

```
src/pipelines/carousel.ts     # el motor (Playwright screenshot + copia de fotos del banco)
scripts/scrape-carousel-images.ts  # variante (c): descarga stock royalty-free
src/lib/{stock,download,paths}.ts  # helpers
brand/                        # tu marca (starter neutral — edítalo)
templates/carousel/           # plantilla de slide foto+gradiente
docs/                         # estructuras narrativas + flujo guiado
examples/                     # un ejemplo corrible por variante
.claude/commands/carrusel.md  # el "cerebro" del agente (/carrusel y alias /carousel)
```

## Licencia

MIT — ver [`LICENSE`](LICENSE). Úsalo, modifícalo y compártelo libremente.
