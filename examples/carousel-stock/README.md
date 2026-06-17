# Ejemplo · Carrusel stock royalty-free — variante (c)

Demuestra la **variante (c)**: imágenes ilustrativas descargadas de Pexels (default)
o Unsplash — ambas **publicables royalty-free** — compuestas con la misma estética
foto+gradiente que la variante (b).

## Prerrequisito: una API key gratis

Variante (c) es la única que necesita `.env`. Saca una key gratis y ponla en `.env`:

```bash
# Pexels (default):   https://www.pexels.com/api/
# Unsplash:           https://unsplash.com/developers
PEXELS_API_KEY=tu_key_aqui
```

## Cómo funciona

1. **Config** — [`stock-queries.json`](./stock-queries.json) define `source`, `queries`,
   `count`, etc. Este ejemplo usa `source: "pexels"`.
2. **Descarga** — desde la raíz del repo:
   ```bash
   npm run scrape-images -- examples/carousel-stock
   ```
   Baja las imágenes a `slides/source/stock-NN.jpg` y escribe
   `slides/source/stock-manifest.json` con fotógrafo + URL + licencia (para atribución).
3. **Render** — el slide referencia la imagen por bare filename (`src="stock-01.jpg"`):
   ```bash
   npm run carrusel -- examples/carousel-stock
   ```
   Salida: `slides/slide-01.png` (1080×1080).

> Sin `PEXELS_API_KEY`, el paso 2 falla con un error claro
> (`PEXELS_API_KEY not set in .env (get one free at pexels.com/api)`). Los pasos de
> render (variantes a/b) no necesitan ninguna key.

## Licencia y atribución

Pexels y Unsplash son license-clear para uso comercial. El `stock-manifest.json` guarda
el fotógrafo y la URL de cada imagen por si quieres acreditar (apreciado, no obligatorio).
