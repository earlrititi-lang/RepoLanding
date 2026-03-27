# Bandera ondulante en Three.js

Esta carpeta esta preparada para usarse como ejemplo docente.

## Que hace este efecto

No anima una imagen directamente. Hace esto:

1. Crea una malla plana con muchos segmentos.
2. Pega `image.png` como textura sobre esa malla.
3. Mueve los vertices de la malla en cada frame.
4. Recalcula las normales para que la luz responda a los pliegues.

Esa es la idea importante para los alumnos: la sensacion de tela sale de la
geometria, no de escalar un PNG.

## Archivos importantes

- `index.html`: contenedor minimo y orden de carga de scripts.
- `styles.css`: stage fullscreen y fondo azulado.
- `script.js`: renderer, escena, luces, malla, textura y deformacion.
- `image.png`: imagen que se coloca sobre la tela.
- `vendor/three.min.js`: libreria Three.js.
- `vendor/flag-texture.js`: fallback para abrir la demo por `file://`.

## Como importarlo a otro proyecto

### Opcion 1: copiar el ejemplo casi tal cual

Copiar:

- un contenedor como `<div data-flag-stage></div>`
- `script.js`
- `image.png`
- `three.min.js`

Y despues adaptar el CSS del contenedor.

### Opcion 2: integrarlo dentro de una seccion existente

Si ya existe una seccion en la pagina, el proceso es:

1. Darle un selector al contenedor final.
2. Cambiar en `script.js` la linea:

```js
var stage = document.querySelector("[data-flag-stage]");
```

por el selector de ese proyecto.

3. Asegurarse de que ese contenedor tenga tamano real en CSS.

Por ejemplo:

```css
.mi-bandera {
  position: relative;
  width: 100%;
  height: 70vh;
  overflow: hidden;
}
```

4. Cargar Three.js antes de `script.js`.

## Parametros que mas interesa tocar

### Tamano de la tela

En `script.js`:

```js
var clothWidth = 9.6;
var clothHeight = 5.55;
```

Si la imagen es mas panoramica, subir el ancho.
Si es mas vertical, subir la altura.

### Suavidad del movimiento

En `script.js`:

```js
var widthSegments = 132;
var heightSegments = 78;
```

Mas segmentos = pliegues mas suaves, pero mas coste.

### Intensidad del efecto

Dentro de `deformFlag()`:

- `bellyWave` controla el gran pliegue principal.
- `flutterWave` controla la vibracion rapida.
- `tipFlick` controla el latigazo del borde libre.

Si el efecto queda exagerado, bajar primero los multiplicadores de `zOffset`.

### Encuadre

En `script.js`:

```js
camera.position.set(0.45, 0.1, 11.6);
root.position.set(-4.7, -0.08, 0);
```

La camara cambia el encuadre general.
`root.position` mueve toda la bandera dentro del plano.

## Por que hay dos formas de cargar la textura

Si la pagina se abre por `http://localhost` o por un dominio normal, se usa:

```js
"./image.png"
```

Si se abre directamente por `file://`, muchos navegadores bloquean texturas en
WebGL. Para evitarlo, `vendor/flag-texture.js` inyecta la imagen como base64.

## Recomendacion para clase

Explicarlo en este orden:

1. HTML: solo necesitamos un contenedor.
2. CSS: ese contenedor necesita tamano.
3. Three.js: renderer, escena, camara y luces.
4. Malla: una `PlaneGeometry` con suficientes segmentos.
5. Textura: la imagen se "pega" sobre la malla.
6. Animacion: mover vertices, no el PNG.
7. Normales: si no se recalculan, la luz deja de verse bien.

## Verificacion

Para comprobar que el JS no tiene errores:

```powershell
node --check three.js\script.js
```
