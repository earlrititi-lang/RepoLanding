# GUIA RAPIDA DE IMPORTACION

Esta guia explica como llevar el efecto de la bandera a otra web sin liarte.

No pienses en esto como si fuera "exportar una animacion".

Piensa en esto como si fueras a mover un bloque completo de proyecto.

Ese bloque tiene varias piezas. Si te llevas solo una, no funciona.

La bandera no es solo una imagen.

La bandera es:

1. una caja HTML donde se dibuja la escena
2. un CSS que da tamano real a esa caja
3. un `script.js` que crea la escena 3D
4. una imagen `image.png` que se pega a la malla
5. la libreria `three`
6. Vite, que sirve el proyecto y resuelve los imports modernos

Si entiendes eso, ya entiendes la parte mas importante.

## Lo primero que tienes que tener claro

Este proyecto funciona con Vite.

Eso significa:

- `script.js` usa imports modernos
- el navegador no carga `three` desde un `<script>` clasico
- Vite se encarga de resolver `import * as THREE from "three"`
- Vite tambien resuelve bien la ruta de `image.png`

Dicho facil:

- Vite prepara el entorno
- Three.js hace el 3D
- `script.js` une todo

## Que archivos tienes que copiar de verdad

Si quieres llevar este efecto a otra web, estas son las piezas reales:

- `script.js`
- `image.png`
- el contenedor HTML
- el CSS del contenedor
- la dependencia `three`

Y si tu otro proyecto todavia no usa Vite, tambien necesitas:

- `package.json`
- `vite.config.js`

No hace falta copiar `README.md`.

No hace falta copiar archivos antiguos de `vendor`, porque ya no existen en la version actual.

## Lo que NO basta por si solo

No basta con copiar solo `script.js`.

`script.js` no trae dentro:

- la imagen de la bandera
- el hueco HTML donde se dibuja
- la altura visible del bloque
- la libreria `three`
- el entorno de Vite que resuelve el import moderno

Por eso, copiar solo el JS suele acabar en un error o en una pantalla vacia.

## La idea mas importante de toda la importacion

La bandera no aparece porque exista `image.png`.

La bandera aparece porque ocurre esta cadena:

1. HTML crea una caja vacia
2. CSS le da ancho y alto reales
3. `script.js` encuentra esa caja
4. Three.js mete un `canvas` dentro
5. se crea una escena 3D
6. `image.png` se usa como textura
7. la geometria se mueve en cada frame

Si uno de esos pasos falla, el efecto deja de existir.

## Paso a paso real para copiarlo a otra web

Hazlo en este orden.

No intentes saltarte pasos.

### Paso 1. Copia `script.js`

Copia `three.js/script.js` a la carpeta de tu otro proyecto donde quieras guardar la logica del efecto.

Ejemplo:

```text
mi-web/
  src/
    flag/
      script.js
```

Este archivo es el cerebro del efecto.

Es el que:

- crea la escena
- crea la camara
- crea las luces
- crea la malla
- carga `image.png`
- y anima la bandera

Sin este archivo no hay efecto.

### Paso 2. Copia `image.png`

Copia `three.js/image.png` a la misma carpeta que `script.js`, o a otra ruta que luego vayas a respetar.

Ejemplo simple:

```text
mi-web/
  src/
    flag/
      script.js
      image.png
```

Esto es importante porque `script.js` usa esta linea:

```js
const textureSource = new URL("./image.png", import.meta.url).href;
```

Eso significa:

"busca `image.png` al lado del propio `script.js`".

Si cambias la ubicacion del archivo y no cambias la ruta, la textura no cargara.

### Paso 3. Instala `three`

En tu otro proyecto tienes que instalar la libreria:

```powershell
npm install three
```

Sin esto, el import de `three` no se puede resolver.

### Paso 4. Si tu otra web no usa Vite, copia tambien la base del proyecto

Si tu otra web no tiene ya un entorno moderno montado, copia tambien:

- `three.js/package.json`
- `three.js/vite.config.js`

Eso te da una base minima para arrancar el efecto sin pelearte con imports rotos.

### Paso 5. Pega el contenedor HTML

Necesitas una caja vacia dentro del HTML.

Lo minimo es esto:

```html
<div class="mi-bandera" data-flag-stage></div>
```

Esta caja no muestra nada por si sola.

Su trabajo es servir de hueco para que Three.js meta dentro el `canvas`.

Explicacion para principiantes:

- esa caja es el hueco
- Three.js dibuja dentro del hueco
- si no hay hueco, no hay donde dibujar

### Paso 6. Carga `script.js` como modulo

En tu HTML tienes que cargar el script asi:

```html
<script type="module" src="./ruta-a-tu-script.js"></script>
```

La parte `type="module"` es importante.

No es decoracion.

Es lo que le dice al navegador que ese archivo usa imports modernos.

### Paso 7. Copia el CSS del contenedor

Tambien necesitas darle tamano real a la caja.

Si no lo haces, el canvas puede existir, pero no verse bien.

Este CSS sirve:

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

Esto significa:

- `position: relative` crea una caja normal y controlable
- `width: 100%` hace que ocupe todo el ancho disponible
- `height: 70vh` le da una altura visible real
- `overflow: hidden` recorta lo que sobresale
- el `canvas` se adapta exactamente a esa caja

El error mas comun del mundo es este:

- copiar el HTML
- copiar el JS
- olvidar la altura

Cuando pasa eso, el efecto parece roto, pero en realidad no tiene escenario visible.

### Paso 8. No cambies el selector al principio

No cambies `data-flag-stage` hasta que todo funcione.

Ahora mismo `script.js` busca exactamente esto:

```js
const stage = document.querySelector("[data-flag-stage]");
```

Eso significa:

- si en HTML usas `data-flag-stage`, el script encuentra la caja
- si cambias el nombre del atributo, el script deja de encontrarla

Primero haz que funcione.

Luego ya lo personalizas.

### Paso 9. Arranca el proyecto con Vite

Si ya tienes todo copiado, arranca asi:

```powershell
npm install
npm run dev
```

Vite levantara un servidor local.

Despues abre la URL que te muestre en consola.

Normalmente sera algo parecido a:

```text
http://localhost:5173
```

Si todo esta bien, deberias ver la bandera.

### Paso 10. Cuando ya funcione, construye la version final

Cuando todo se vea bien, puedes generar la version lista para publicar:

```powershell
npm run build
```

Eso crea la carpeta `dist/`.

La carpeta `dist/` es la version final lista para subir.

## Que tienes que copiar exactamente si quieres la opcion facil

Si no quieres pensar demasiado, copia estas piezas juntas:

1. `index.html`
2. `styles.css`
3. `script.js`
4. `image.png`
5. `package.json`
6. `vite.config.js`

Luego ejecuta:

```powershell
npm install
npm run dev
```

Y listo.

Este es el camino mas facil para no romper:

- imports
- rutas
- carga de `three`
- carga de la textura

## Si tu otra web YA usa Vite

En ese caso es todavia mas facil.

Solo necesitas:

1. copiar `script.js`
2. copiar `image.png`
3. instalar `three`
4. pegar el contenedor HTML
5. pegar el CSS del contenedor
6. cargar el script como modulo

No hace falta copiar `package.json` entero si tu proyecto ya esta montado.

## Si quieres meter la bandera dentro de una seccion normal

No hace falta que ocupe toda la pantalla.

Puedes meterla dentro de un hero, una cabecera o un bloque normal.

Ejemplo:

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

La idea es esta:

- la bandera no necesita fullscreen
- necesita una caja visible
- y Three.js se adapta a esa caja

## Orden correcto para revisar errores

Si no aparece nada, no toques primero las ondas, las luces ni la camara.

Revisa en este orden:

1. existe el contenedor HTML
2. el contenedor tiene altura en CSS
3. el selector del JS coincide con el HTML
4. `script.js` se esta cargando con `type="module"`
5. `three` esta instalado
6. `image.png` esta en la ruta esperada
7. Vite esta arrancado con `npm run dev`

Ese es el orden correcto.

## Errores tipicos de principiante

### Error 1. Copiar solo `script.js`

No basta.

Faltan:

- HTML
- CSS
- textura
- `three`
- y, segun el caso, Vite

### Error 2. Abrir `index.html` con doble clic

Eso no es la forma correcta aqui.

Este proyecto esta preparado para ejecutarse servido por Vite.

### Error 3. Cambiar el nombre del selector demasiado pronto

Primero haz que funcione.

Luego cambias nombres.

### Error 4. Poner `image.png` en otra carpeta y no ajustar la ruta

El script no adivina donde esta la imagen.

### Error 5. No poner altura al contenedor

Sin altura real, la escena no tiene espacio visible.

## Regla final

No copies "la bandera" como si fuera una sola cosa.

Copia este paquete:

- HTML
- CSS
- JS
- textura
- `three`
- y, si tu proyecto no lo tiene ya, la base con Vite

Eso es el efecto completo.
