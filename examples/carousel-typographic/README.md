# Ejemplo · Carrusel typographic — variante (a)

Carrusel de Instagram listo para renderizar. Demuestra el pipeline `/carrusel`
end-to-end con la **variante (a) typographic** (texto puro, sin imágenes, $0).

## Qué demuestra

- **Contrato del pipeline:** `slides/source/slide-NN.html` → `slides/slide-NN.png`.
  El TS solo screenshea con Playwright a 1080×1080; el diseño vive 100% en el HTML.
- **HTML self-contained:** cada slide trae sus brand tokens inline en `<style>` y los
  `@font-face` (Geist + Geist Mono vía CDN jsdelivr) — sin links a `brand.css`, para
  que funcione desde cualquier ruta.
- **Estructura narrativa:** hook → 3 puntos (un error por slide) → CTA.
  Ver `STORYBOARD.md` como contrato de la copy slide por slide.

El contenido es neutral (un carrusel *sobre cómo hacer carruseles*). Reemplaza la copy
y los tokens `:root` por los de tu marca.

## Cómo renderizar

Desde la raíz del repo:

```bash
npm run carrusel -- examples/carousel-typographic
```

(También funciona el alias en inglés `npm run carousel -- ...`.)

Salida: `slides/slide-01.png` … `slide-05.png`, cada uno 1080×1080.
Tiempo: ~5–15s · Costo: $0 (todo local, sin generación AI).

> En un checkout limpio sin `.env`, el carrusel no necesita variables de entorno —
> puedes correr el pipeline directo: `npx tsx src/pipelines/carousel.ts examples/carousel-typographic`

## Previsualizar el HTML directo

Cada slide es una página HTML válida standalone; ábrela en el navegador para iterar
el diseño antes de renderizar:

```bash
open examples/carousel-typographic/slides/source/slide-01.html
```
