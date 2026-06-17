# Ejemplo · Carrusel foto + gradiente — variante (b)

Demuestra la **variante (b)**: foto full-bleed del banco `brand/photos/` con los
gradientes de marca al frente (duotone + fade + grain) y el texto sobre la zona
oscura inferior. $0, sin generación AI.

## Prerrequisito (importante)

Las fotos del banco son **tuyas** y están gitignored — este ejemplo NO trae ninguna.
Antes de renderizar, pon una foto cuadrada en el banco con el nombre que el slide
referencia:

```bash
# copia cualquier foto cuadrada (idealmente 1080×1080 o mayor) como founder.png
cp /ruta/a/tu-foto.jpg brand/photos/founder.png
```

El slide la referencia por **bare filename** (`<img class="photo" src="founder.png" />`).
`carousel.ts` (`resolveBankPhotos`) la copia del banco al source dir antes de
screenshootear — funciona desde cualquier ruta del proyecto.

## Cómo renderizar

Desde la raíz del repo:

```bash
npm run carrusel -- examples/carousel-photo
```

Salida: `slides/slide-01.png` (1080×1080). En consola verás
`⤷ photo founder.png (from brand/photos)` confirmando la copia.

> Si no pones `founder.png` en `brand/photos/`, el slide renderiza igual pero con la
> zona de la foto vacía (solo los gradientes). Pon la foto para ver el efecto completo.

## Cómo se arma una slide foto

Copia la plantilla [`templates/carousel/photo-slide.html`](../../templates/carousel/photo-slide.html),
edita el copy + el `object-position` de `.photo` para encuadrar la cara, y mantén el
orden de capas: `.photo` → `.duotone` → `.fade` → `.grain` → `.content`.
