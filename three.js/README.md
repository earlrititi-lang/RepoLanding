# Bandera ondulante en Three.js


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

### Tamano de la tela y ajuste responsive

En `script.js`:

```js
var clothWidth = 9.6;
var clothHeight = 5.55;
```

Si la imagen es mas panoramica, subir el ancho.
Si es mas vertical, subir la altura.

La bandera ya no depende de un encuadre fijo. En `resize()` se calcula el
tamano visible de la camara y se aplica un `coverScale` para que la malla
cubra el viewport de forma responsive.

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
- `leftRelease`, `rightRelease` y `verticalRelease` endurecen los bordes.

Si el efecto queda exagerado, bajar primero los multiplicadores de `zOffset`.

### Encuadre

En `script.js`:

```js
camera.position.set(0.45, 0.1, 11.6);
```

La camara cambia el encuadre general.
La posicion base de `root` ahora se calcula automaticamente en `resize()`.

## Bordes rigidos

El efecto ya no deja que toda la tela se comporte igual.

- El borde izquierdo actua como anclaje.
- El borde derecho sigue vivo, pero el extremo ya no se dobla tanto.
- El borde superior e inferior estan amortiguados para que la silueta se vea
  mas firme.

Esto se resuelve con mascaras suaves dentro de `deformFlag()`, no con una sola
onda global.

## Sombra mas realista

La sombra ya no es un rectangulo oscuro debajo de la bandera.

Ahora se construye con dos capas:

- una sombra ancha y difusa para el volumen general
- una sombra de contacto mas compacta para anclar visualmente la tela

Ambas usan una textura generada por canvas con degradado radial. Es una buena
solucion docente porque:

- se entiende facil
- no necesita un suelo 3D receptor
- y da un resultado mas natural que un plano uniforme

Ademas, la sombra vive en un grupo separado pero ahora copia toda la rotacion
de `root`. Eso permite ensenar dos ideas a la vez:

- la sombra puede heredar el movimiento del paño
- y aun asi seguir teniendo capas, escala y opacidad controladas aparte

## Por que hay dos formas de cargar la textura

Si la pagina se abre por `http://localhost` o por un dominio normal, se usa:

```js
"./image.png"
```

Si se abre directamente por `file://`, muchos navegadores bloquean texturas en
WebGL. Para evitarlo, `vendor/flag-texture.js` inyecta la imagen como base64.

## Explicación


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
