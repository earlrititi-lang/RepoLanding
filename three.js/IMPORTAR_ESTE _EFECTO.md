# GUIA RAPIDA DE IMPORTACION

Esta guia es para copiar el efecto de la bandera a otra web sin liarte.

No pienses en "exportar una animacion".

Piensa en copiar un bloque completo.

## Checklist rapido

1. Copia `three.js/script.js` a tu otro proyecto.
2. Copia `three.js/image.png` a la misma carpeta o a una ruta que luego respetes.
3. Instala `three` en tu otro proyecto con `npm install three`.
4. Pega en tu HTML una caja vacia como esta:

```html
<div class="mi-bandera" data-flag-stage></div>
```

5. Pega en tu HTML o en tu entrada principal el script como modulo:

```html
<script type="module" src="./ruta-a-tu-script.js"></script>
```

6. Copia este CSS para darle una caja real:

```css
.mi-bandera {
  position: relative;
  width: 100%;
  height: 70vh;
  overflow: hidden;
}

.mi-bandera canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

7. No cambies `data-flag-stage` al principio. Dejalo igual hasta que funcione.
8. Arranca tu proyecto y comprueba que aparece la bandera.
9. Si no aparece, revisa en este orden:
   `HTML -> altura CSS -> ruta de script -> ruta de image.png -> three instalado`
10. Solo cuando ya funcione, cambia tamano, textura, luces o movimiento.

## Lo que tienes que copiar de verdad

Estas son las piezas reales del efecto:

- `script.js`
- `image.png`
- el contenedor HTML
- el CSS del contenedor
- la libreria `three`

Si falta una, el efecto ya no esta completo.

## Lo que NO basta por si solo

No basta con copiar solo `script.js`.

`script.js` no trae dentro:

- la imagen
- el hueco HTML
- la altura visible
- la libreria `three`

## La idea mas importante

La bandera no aparece porque exista una imagen.

La bandera aparece porque:

1. hay una caja en HTML
2. Three.js mete un `canvas` dentro
3. el script crea una escena 3D
4. `image.png` se pega como textura
5. la geometria se mueve en cada frame

## Si tu otra web no tiene Vite ni nada moderno

Haz esto:

1. Copia casi toda la carpeta `three.js`.
2. Deja dentro:
   - `index.html`
   - `script.js`
   - `styles.css`
   - `image.png`
   - `package.json`
   - `vite.config.js`
3. Ejecuta `npm install`
4. Ejecuta `npm run dev`
5. Cuando funcione, usa `npm run build`
6. Publica `dist/`

Ese es el camino mas facil para no romper imports ni rutas.

## Si quieres meterlo en una seccion normal

Pega algo asi:

```html
<section class="hero">
  <div class="hero-flag" data-flag-stage></div>
</section>
```

```css
.hero-flag {
  position: relative;
  width: 100%;
  height: 32rem;
  overflow: hidden;
}

.hero-flag canvas {
  display: block;
  width: 100%;
  height: 100%;
}
```

No necesita fullscreen.

Necesita una caja real con ancho y alto reales.

## Regla final

No copies "la bandera" como si fuera una sola cosa.

Copia este paquete:

- HTML
- CSS
- JS
- textura
- `three`

Eso es el efecto completo.
