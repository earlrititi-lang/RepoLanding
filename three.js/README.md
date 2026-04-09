# Bandera ondulante en Three.js

Esta carpeta ya no usa una copia antigua de `three.min.js` cargada a mano.

Ahora el proyecto esta actualizado a un flujo moderno:

- `three` se instala desde npm
- `script.js` usa `import * as THREE from "three"`
- la demo se arranca con Vite
- la compilacion genera una carpeta `dist/` lista para publicar

La idea del efecto no ha cambiado. Lo que ha cambiado es la forma correcta de montarlo hoy.

## Que hace realmente este proyecto

Este efecto no anima un PNG.

Lo que hace de verdad es esto:

1. Crea una malla 3D plana.
2. Divide esa malla en muchos segmentos.
3. Coloca `image.png` encima como textura.
4. Mueve los vertices de la malla en cada frame.
5. Recalcula las normales para que la luz lea bien los pliegues.

Explicado para muy principiantes:

- la imagen es la piel
- la geometria es el cuerpo
- la animacion ocurre en el cuerpo
- la luz hace visibles los pliegues

Si alguien entiende eso, ya entiende el corazon del efecto.

## Versiones actuales usadas

El proyecto queda apoyado en:

- `three` `0.183.2`
- `vite` `8.0.8`

Con esta base la demo deja de depender de APIs antiguas como:

- `renderer.outputEncoding`
- `texture.encoding`
- `window.THREE`

Ahora usa la API moderna:

- `renderer.outputColorSpace = THREE.SRGBColorSpace`
- `texture.colorSpace = THREE.SRGBColorSpace`

## Como arrancarlo en local

Desde la carpeta `three.js`:

```powershell
npm install
npm run dev
```

Vite levantara un servidor local y servira el proyecto correctamente.

Esto importa porque Three.js y las texturas deben cargarse desde un entorno web real. Abrir `index.html` con doble clic ya no es la via correcta en esta version actualizada.

## Como generar la version lista para publicar

```powershell
npm run build
```

Eso crea `dist/`.

La carpeta `dist/` es la que puedes subir a un hosting estatico o copiar a otro proyecto si quieres usar la demo ya empaquetada.

## Estructura importante del proyecto

- `index.html`: contiene el nodo del DOM donde se inserta el canvas.
- `script.js`: crea la escena, carga la textura y anima la bandera.
- `styles.css`: define el fondo y el area visible del canvas.
- `image.png`: imagen usada como textura.
- `package.json`: dependencias y scripts.
- `vite.config.js`: configuracion minima de Vite.

## Que ha desaparecido respecto a la version antigua

Ya no hace falta:

- `vendor/three.min.js`
- `vendor/flag-texture.js`
- cargar scripts clasicos con `<script src="..."></script>`

El motivo es simple:

- Three.js ahora entra por npm
- Vite resuelve imports y assets
- `new URL("./image.png", import.meta.url)` resuelve la textura correctamente en desarrollo y en build

## HTML minimo que necesita el efecto

El proyecto sigue necesitando un contenedor. Ese contenedor es el punto donde Three.js inyecta el canvas.

El HTML minimo es este:

```html
<div class="fullscreen-stage" data-flag-stage></div>
<script type="module" src="./script.js"></script>
```

La idea importante es esta:

`script.js` busca un nodo con `[data-flag-stage]`.

Si lo encuentra, monta la escena.

Si no lo encuentra, no hace nada.

Eso permite reutilizar el mismo script sin romper otras paginas.

## CSS minimo que necesita el efecto

El error mas comun al mover este efecto a otra web es olvidar que el canvas necesita un area real.

Un CSS minimo valido es:

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

Si el contenedor no tiene altura real, el efecto no tendra un espacio visible donde dibujarse.

## Guia literal de copiar y pegar en otra web

Esta es la parte mas importante para alguien que no quiere complicarse.

Si quieres llevar esta bandera a otra web, no tienes que “exportar una animacion”.

Tienes que copiar un pequeno bloque de proyecto.

Piensa asi:

- el HTML pone el hueco
- el CSS da el tamano
- el JS crea la escena 3D
- `image.png` es la imagen de la bandera
- `three` es el motor que hace funcionar todo

Si falta una de esas piezas, la bandera no aparece o aparece mal.

### Lo que tienes que sacar de esta carpeta

Si vas a recrear el efecto en otra web usando el codigo fuente, tienes que copiar esto:

1. `three.js/script.js`
2. `three.js/image.png`
3. las reglas necesarias de `three.js/styles.css`
4. la dependencia `three` del `package.json`

Y si tu nueva web todavia no usa Vite ni otro empaquetador moderno, lo mas facil es copiar tambien:

5. `three.js/package.json`
6. `three.js/vite.config.js`

Dicho todavia mas simple:

- `script.js` es el cerebro
- `image.png` es la piel visual
- el bloque de CSS es la caja donde vive el canvas
- `three` es el motor

### Lo que NO tienes que copiar

No hace falta copiar:

- la carpeta `dist/` si vas a trabajar con el codigo fuente
- archivos antiguos de `vendor`
- el `README.md`

No mezcles dos caminos a la vez.

Haz una sola cosa:

- o copias el codigo fuente y trabajas con `npm`
- o compilas y copias `dist/`

Las dos cosas a la vez solo sirven para liarte.

### Caso mas facil: tu otra web ya usa Vite

Este es el caso mas limpio.

Haz esto:

1. Crea una carpeta nueva dentro de tu proyecto, por ejemplo `src/flag/`.
2. Copia dentro `script.js` e `image.png`.
3. Instala `three` con `npm install three`.
4. Añade en tu HTML o en tu componente el contenedor con `data-flag-stage`.
5. Copia el CSS del contenedor.
6. Carga el script desde esa nueva ruta.

Ejemplo de estructura:

```text
mi-web/
  src/
    flag/
      script.js
      image.png
```

### Caso facil para principiantes: tu otra web no tiene nada montado

Si la otra web es muy basica y no tiene Vite, Webpack ni nada parecido, no intentes meter este `script.js` moderno “a pelo” sin entorno.

La forma mas facil es esta:

1. Copia toda la carpeta `three.js` o recrea una carpeta nueva solo para la bandera.
2. Deja dentro:
   - `index.html`
   - `script.js`
   - `styles.css`
   - `image.png`
   - `package.json`
   - `vite.config.js`
3. Ejecuta `npm install`
4. Ejecuta `npm run dev`
5. Trabaja ahi hasta que lo veas bien
6. Cuando funcione, usa `npm run build`
7. Publica lo que genera `dist/`

La razon es muy simple:

este proyecto ya esta preparado para un flujo moderno.

Intentar saltarte ese flujo sin saber lo que haces suele acabar en imports rotos, rutas mal resueltas o texturas que no cargan.

### El HTML exacto que tienes que copiar

Lo minimo que tienes que pegar en la otra web es esto:

```html
<div class="mi-bandera" data-flag-stage></div>
<script type="module" src="./ruta-a-tu-script.js"></script>
```

Explicacion para muy principiantes:

- ese `div` es la caja vacia donde aparecera la bandera
- la bandera no existe en HTML al principio
- `script.js` crea un `canvas` dentro de esa caja
- ese `canvas` es donde Three.js dibuja la escena

Si quitas el `div`, no hay donde dibujar.

Si quitas el script, no hay quien cree la escena.

### El CSS exacto que tienes que copiar

Tambien necesitas una caja visible.

Esto sirve:

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

Explicacion para muy principiantes:

- `width: 100%` hace que ocupe todo el ancho disponible
- `height: 70vh` le da altura real
- `overflow: hidden` recorta lo que sobresalga
- el `canvas` ocupa toda la caja

Si no das altura a `.mi-bandera`, el efecto no tendra espacio real donde verse.

### La frase mas importante de toda la integracion

No copies “la bandera”.

Copia estas cuatro cosas juntas:

1. el contenedor HTML
2. el CSS del contenedor
3. el `script.js`
4. la textura `image.png`

Y ademas asegúrate de tener instalada la libreria `three`.

Si te falta una sola pieza, ya no estas copiando el efecto completo.

### Como cambiar el nombre del contenedor sin romper nada

Si no quieres usar `data-flag-stage`, puedes cambiarlo, pero tienes que tocar dos sitios:

1. el HTML
2. la linea del selector en `script.js`

Ahora mismo el script busca esto:

```js
const stage = document.querySelector("[data-flag-stage]");
```

Si en tu HTML usas otra clase o atributo, esa linea tiene que apuntar a tu nuevo selector.

Si no coinciden, el script no encontrara la caja y no dibujara nada.

### Como incrustarlo dentro de una seccion normal de una web

No hace falta que la bandera ocupe toda la pantalla.

Puedes meterla, por ejemplo, en un hero:

```html
<section class="hero">
  <div class="hero-flag" data-flag-stage></div>
</section>
```

Y el CSS:

```css
.hero {
  position: relative;
}

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

La idea es muy simple:

- la bandera no necesita fullscreen
- necesita una caja con ancho y alto reales
- Three.js se adapta a esa caja

### Que archivo debes tocar primero cuando algo no sale

Si la bandera no aparece, revisa en este orden:

1. HTML: existe el contenedor
2. CSS: el contenedor tiene altura
3. JS: el selector coincide con el HTML
4. ruta de `image.png`
5. `three` esta instalado

Ese es el orden correcto.

No empieces tocando las ondas ni las luces si todavia no se ve ni la bandera.

### Error tipico de principiante numero uno

Copiar solo `script.js`.

Eso no basta.

`script.js` no trae dentro:

- la imagen
- el hueco HTML
- la altura visible
- ni la libreria `three`

Por eso el efecto completo no es “un archivo JS”.

Es un pequeno conjunto de piezas que tienen que entrar juntas.

## Como llevar el efecto a otra web

Hay dos formas razonables.

### Opcion 1. Llevarte la carpeta compilada

Es la opcion mas sencilla para un alumno.

1. Ejecuta `npm run build`.
2. Copia el contenido de `dist/`.
3. Publicalo en tu hosting o integralo en otra web.

Ventaja:

- no hace falta que el alumno entienda npm ni Vite a fondo

Inconveniente:

- si quiere tocar el efecto, tendra que volver al codigo fuente

### Opcion 2. Llevarte el codigo fuente

Es la opcion correcta si el alumno quiere modificar la escena.

Necesita copiar o recrear:

- el contenedor HTML
- `script.js`
- `styles.css` o al menos el CSS del contenedor
- `image.png`
- `package.json`
- `vite.config.js`

Despues, en la nueva web:

```powershell
npm install
npm run dev
```

## Que hace cada pieza principal

### `WebGLRenderer`

Es quien dibuja la escena en un canvas.

Sin renderer no se ve nada.

### `Scene`

Es la caja grande que contiene todo lo 3D:

- luces
- malla
- sombra

### `PerspectiveCamera`

Define desde donde se mira la escena y con que perspectiva.

Se usa camara en perspectiva porque da profundidad y hace que la bandera se sienta menos plana.

### `PlaneGeometry`

Es la tela base.

No basta con un rectangulo simple. Hace falta una malla con bastantes segmentos, porque los pliegues salen de mover vertices.

Pocos segmentos significa pliegues toscos.

Muchos segmentos significa pliegues mas suaves.

### `TextureLoader`

Carga `image.png` y la pega sobre la malla.

La textura no es la animacion. Solo es la imagen que viaja pegada a la geometria.

### `MeshStandardMaterial`

Este material responde a la luz.

Eso es importante porque una tela ondulada sin luz adecuada se ve mucho mas plana y mucho menos creible.

### `computeVertexNormals()`

Esta parte es clave.

Cada frame cambian los vertices.

Cuando cambia la forma, tambien tiene que cambiar la forma en la que la luz interpreta la superficie.

Por eso se recalculan las normales.

Explicado muy simple:

- mover vertices cambia la forma
- recalcular normales actualiza como la luz entiende esa forma

## Como nace el ondulado

El ondulado no sale de una sola onda.

Sale de combinar varias:

- una onda principal para el gran volumen
- una secundaria para romper uniformidad
- una vibracion rapida para el temblor fino
- pulsos lentos para sugerir cambios de viento
- pequenas variaciones para evitar que parezca mecanico

Esto es importante para clase porque ensena una idea util:

los movimientos naturales suelen salir de sumar varias deformaciones pequenas, no de una formula unica perfecta.

## Por que el borde izquierdo esta mas quieto

Una bandera real no se mueve igual en todos los puntos.

En esta demo:

- la izquierda actua como zona anclada
- el centro tiene mas libertad
- la punta tiene su propio latigazo

Eso hace que el movimiento parezca tela y no una plancha de goma.

## Como funciona la parte responsive

La escena no se dibuja con un tamano fijo.

`resize()` hace tres trabajos:

1. mide el tamano real del contenedor en el DOM
2. actualiza renderer y camara
3. recalcula la escala de la bandera para cubrir bien el area visible

Eso hace que el efecto siga viendose bien aunque cambie el viewport o el bloque donde esta incrustado.

## Lo que un alumno puede tocar sin romperlo facil

- `clothWidth`
- `clothHeight`
- `widthSegments`
- `heightSegments`
- `camera.position`
- el selector del contenedor
- el tamano del contenedor en CSS
- la textura `image.png`

## Lo que conviene tocar con cuidado

- los multiplicadores de las ondas
- la intensidad de las luces
- la posicion de la sombra

## Lo que no conviene tocar al principio

- la copia de `basePositions`
- el bucle de animacion
- `computeVertexNormals()`
- la secuencia general de crear renderer, escena, camara, luces y malla

Esas piezas son la estructura del efecto. Si alguien las cambia sin entenderlas, puede romperlo y no sabra por que.

## Errores tipicos al moverlo a otra web

### Copiar solo el JS

No basta.

Tambien hacen falta:

- un contenedor real
- CSS con altura
- la textura
- las dependencias del proyecto

### No dar altura al contenedor

Sin altura visible, no hay escenario donde dibujar.

### Pensar que la imagen ya trae el movimiento

No.

La imagen es estatica. Lo que se mueve es la malla.

### Reducir demasiado los segmentos

El efecto seguira vivo, pero la tela se vera rigida y poco natural.

### Tocar todas las ondas a la vez

Si se sube todo sin control, deja de parecer tela y empieza a parecer gelatina.

## Comprobaciones utiles

Para compilar y comprobar que la demo esta bien montada:

```powershell
npm run build
```

Si ese comando pasa, la base del proyecto esta correcta.

## Resumen muy corto para clase

Esta demo hace una bandera ondulante deformando una geometria 3D a la que se le pega una textura.

La version actualizada del proyecto usa Three.js moderno por npm y Vite para desarrollo y build.

La manera correcta de reutilizarlo hoy es pensar en estos bloques:

- contenedor HTML
- CSS con tamano real
- escena Three.js
- textura
- build final con Vite
