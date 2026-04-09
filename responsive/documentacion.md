# Documento maestro de responsividad

Esta guia explica la responsividad de forma practica, ordenada y bastante completa sin volverse innecesariamente larga. La idea es que sirva como documento base para entender por que una web se rompe, como se corrige y que decisiones suelen dar mejor resultado.

La idea central de todo el documento es esta: una web responsive no es una web mas pequena. Es una web capaz de reorganizarse cuando cambia el espacio.

---

## Indice

- [1. Que es realmente una web responsive](#1-que-es-realmente-una-web-responsive)
- [2. La idea correcta: no se encoge, se reorganiza](#2-la-idea-correcta-no-se-encoge-se-reorganiza)
- [3. Por que una web se rompe cuando no es responsive](#3-por-que-una-web-se-rompe-cuando-no-es-responsive)
- [4. Las bases que hacen que una web responda bien](#4-las-bases-que-hacen-que-una-web-responda-bien)
- [5. Las 6 reglas de esta demo explicadas a fondo](#5-las-6-reglas-de-esta-demo-explicadas-a-fondo)
- [6. Unidades y medidas que conviene entender](#6-unidades-y-medidas-que-conviene-entender)
- [7. Contenedores y anchos maximos](#7-contenedores-y-anchos-maximos)
- [8. Tipografia responsive](#8-tipografia-responsive)
- [9. Layouts con Flexbox y Grid](#9-layouts-con-flexbox-y-grid)
- [10. Breakpoints bien elegidos](#10-breakpoints-bien-elegidos)
- [11. Navbar responsive y menu hamburguesa](#11-navbar-responsive-y-menu-hamburguesa)
- [12. Imagenes, video y media embebida](#12-imagenes-video-y-media-embebida)
- [13. Formularios responsive](#13-formularios-responsive)
- [14. Header sticky, anclas y scroll](#14-header-sticky-anclas-y-scroll)
- [15. El papel real de JavaScript](#15-el-papel-real-de-javascript)
- [16. Errores tipicos que destrozan una web](#16-errores-tipicos-que-destrozan-una-web)
- [17. Proceso practico para convertir una web a responsive](#17-proceso-practico-para-convertir-una-web-a-responsive)
- [18. Checklist final de revision](#18-checklist-final-de-revision)
- [19. Codigo extraido del navbar hamburguesa](#19-codigo-extraido-del-navbar-hamburguesa)
- [20. Idea final](#20-idea-final)

---

## 1. Que es realmente una web responsive

Una web responsive es una web que se adapta al espacio disponible sin perder claridad, legibilidad ni usabilidad. Esto significa que debe funcionar bien en movil, tablet, portatil y escritorio grande, pero tambien significa algo mas importante: no puede depender de un solo ancho de pantalla para verse bien.

Una web no es responsive solo porque "quepa" dentro de la pantalla. Tambien tiene que:

- mantener una lectura comoda,
- conservar la jerarquia visual,
- permitir pulsar botones con facilidad,
- evitar que el contenido se salga,
- y sostener una navegacion clara.

Una web responsive no es una version encogida de la web de escritorio. Tampoco es una web que se ve "aceptable" en una captura o en un ancho concreto del inspector. Es una web flexible, y esa flexibilidad tiene que estar pensada desde la estructura.

---

## 2. La idea correcta: no se encoge, se reorganiza

Este es el concepto mas importante del documento. Muchisima gente intenta resolver el responsive haciendo una web para escritorio y luego reduciendo margenes, fuentes, paddings y anchos hasta que todo entre en movil. Ese enfoque suele producir layouts apretados, menus imposibles, columnas ridiculas y una interfaz que parece estar sobreviviendo a duras penas.

La idea correcta es otra: la web no se encoge sin mas, la web se reorganiza.

Eso significa, por ejemplo:

- tres tarjetas en escritorio pasan a dos o una en pantallas menores,
- el navbar horizontal puede convertirse en hamburguesa,
- un formulario de dos columnas puede volver a una,
- y una seccion con dos paneles puede apilarse.

La responsividad de verdad no intenta conservar la misma fotografia en todos los anchos. Intenta conservar el orden, la jerarquia y la facilidad de uso aunque la distribucion cambie.

---

## 3. Por que una web se rompe cuando no es responsive

Una web se rompe cuando fue pensada como un bloque rigido. Los sintomas mas comunes suelen ser:

- scroll horizontal,
- texto pegado a los bordes,
- cards demasiado estrechas,
- imagenes que empujan el layout,
- navbar que ya no cabe,
- botones incomodos,
- formularios amontonados,
- y headers sticky que tapan las anclas.

Detras de esos sintomas casi siempre hay una mezcla de errores basicos:

- anchos fijos grandes,
- alturas fijas en bloques con contenido variable,
- exceso de `px` para estructura,
- falta de wrap,
- grids demasiado rigidas,
- y un abuso de `position: absolute`.

Por eso una web no deja de ser responsive por un detalle aislado. Deja de ser responsive cuando la base no fue construida para aceptar cambios de espacio.

---

## 4. Las bases que hacen que una web responda bien

Hay una serie de principios que resuelven la mayoria de webs normales si se aplican bien.

### 4.1 Empezar por lo estrecho

Trabajar primero la version estrecha suele ser mucho mas estable que empezar por un escritorio grande y luego intentar apretarlo. Si una interfaz funciona bien en una sola columna, despues es mucho mas facil abrirla a dos o tres.

### 4.2 Usar contenedores fluidos

El contenido principal no debe medir siempre lo mismo. Necesita ser flexible en pequeno y tener un limite en grande. Eso protege el movil y protege la lectura en escritorio.

### 4.3 Dejar que los bloques puedan apilarse

Si el layout depende de que siempre quepan tres columnas, tarde o temprano se rompe. Las columnas deben poder pasar a dos y a una sin que el bloque pierda sentido.

### 4.4 Ajustar la tipografia con limites

No hace falta que todo cambie de tamano constantemente, pero los titulares grandes y algunos espacios amplios suelen necesitar una escala mas flexible. La meta no es que todo varie mucho. La meta es que la lectura siga siendo comoda.

### 4.5 Usar pocos breakpoints

Una web sana no necesita veinte puntos de corte. Necesita unos pocos cambios estructurales con una razon clara. Si hacen falta demasiados, normalmente la base no era tan flexible como parecia.

### 4.6 Dejar que CSS haga el trabajo estructural

La parte responsive real debe vivir en CSS. JavaScript puede mejorar comportamientos, pero no deberia cargar con la responsabilidad de sostener el layout.

---

## 5. Las 6 reglas de esta demo explicadas a fondo

La plantilla de esta carpeta aplica seis reglas bastante utiles porque son concretas y faciles de justificar.

### 5.1 El contenedor principal usa `min(72rem, calc(100% - 1.25rem))`

Esta formula hace dos trabajos al mismo tiempo. Por un lado deja que el contenido sea fluido en pantallas pequenas. Por otro lado frena el crecimiento en pantallas grandes. `100%` significa usar el ancho disponible. `calc(100% - 1.25rem)` deja aire lateral. `72rem` actua como tope. `min(...)` elige el valor mas pequeno.

La traduccion practica es esta:

- en movil, el contenido usa casi todo el ancho pero no toca los bordes;
- en escritorio, deja de crecer cuando el ancho ya seria excesivo.

Eso evita dos problemas muy comunes: el scroll horizontal en pequeno y las lineas demasiado largas en grande.

Un error clasico seria este:

```css
.container {
  width: 1200px;
}
```

Un patron mucho mas sano es este:

```css
.container {
  width: min(72rem, calc(100% - 2rem));
  margin-inline: auto;
}
```

La leccion importante no es memorizar `72rem`. Es entender la logica:

- ancho flexible,
- aire lateral,
- techo maximo,
- y centrado automatico.

### 5.2 La tipografia principal usa `clamp()` para crecer sin saltos bruscos

`clamp()` permite que un valor cambie con el ancho de pantalla sin salirse de un rango util. Tiene esta forma:

```css
clamp(minimo, ideal, maximo)
```

Ejemplo:

```css
h1 {
  font-size: clamp(2.8rem, 11vw, 4.8rem);
}
```

Esto significa:

- nunca bajes de `2.8rem`,
- intenta crecer de forma proporcional al ancho,
- y no sobrepases `4.8rem`.

La ventaja es que no necesitas una cadena larga de media queries para cada titulo. El cambio es continuo y mucho mas natural. Sin este tipo de control suele pasar que el titular revienta en movil o que queda demasiado pequeno en grande.

`clamp()` no arregla una jerarquia mala, pero mejora mucho una jerarquia bien pensada.

### 5.3 Las tarjetas usan `repeat(auto-fit, minmax(...))` cuando encaja

Este patron de Grid es muy util porque ya incorpora la adaptacion en la propia regla. Ejemplo:

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}
```

Traduccion simple:

- crea tantas columnas como quepan,
- no hagas ninguna mas pequena de `15rem`,
- y reparte el resto del espacio.

Eso hace que el mismo HTML se adapte solo:

- si cabe una tarjeta, queda una;
- si caben dos, quedan dos;
- si caben tres, quedan tres.

Este patron es muy bueno para cards de servicios, testimonios, galerias, paneles y bloques repetitivos.

### 5.4 Las secciones complejas cambian de una columna a dos o tres solo en breakpoints claros

No todos los bloques deben resolver el responsive igual. Un grid de tarjetas repetitivas y un hero con dos zonas de peso diferente no piden la misma estrategia.

Los bloques repetitivos suelen funcionar muy bien con Grid flexible. Los bloques estructurales suelen necesitar un cambio mas dirigido, por ejemplo:

- un hero que pasa de una columna a dos,
- un bloque de contacto que divide copy y formulario,
- una seccion con panel principal y bloque auxiliar.

La regla buena es que el breakpoint exista porque el contenido lo necesita, no porque el numero suene familiar.

### 5.5 El header sticky no tapa las anclas porque las secciones usan `scroll-margin-top`

Cuando un header se queda fijo arriba y se navega con enlaces tipo `#contacto`, el navegador lleva la seccion a la parte superior. Si el header ocupa esa zona, el titulo queda tapado. La solucion limpia es `scroll-margin-top`.

```css
section {
  scroll-margin-top: 7rem;
}
```

Eso no cambia la estructura general del layout. Solo anade un margen virtual cuando el navegador hace scroll hacia la ancla. Es un detalle pequeno, pero mejora mucho la experiencia.

### 5.6 El JS no intenta hacer responsive; solo mejora menu, estado activo y pequenas ayudas

Este punto conviene dejarlo muy claro. CSS hace la parte responsive real:

- contenedores fluidos,
- media queries,
- wrap,
- tipografia adaptable,
- columnas,
- cambios de visibilidad por ancho.

JavaScript deberia limitarse a la interaccion:

- abrir y cerrar menu,
- cerrar al volver a desktop,
- cerrar con `Escape`,
- cerrar al hacer clic fuera,
- marcar un enlace activo,
- y pequenos detalles de apoyo.

Si la web depende de mucho JavaScript para no romperse, el problema suele estar en la base del CSS.

---

## 6. Unidades y medidas que conviene entender

Una parte importante del responsive consiste en elegir bien las unidades.

### `px`

Se usa bien para detalles pequenos y controlados:

- bordes,
- radios concretos,
- grosores,
- offsets,
- sombras.

No conviene basar toda la estructura en `px` fijos.

### `rem`

Es muy util para:

- tipografia,
- espaciados,
- anchos maximos,
- breakpoints.

Da una sensacion de escala mas coherente que montar todo con `px`.

### `%`

Sirve para anchos relativos y elementos fluidos dentro de un contenedor.

### `fr`

Es una unidad de Grid para repartir espacio sobrante. Funciona muy bien cuando varias columnas deben compartir el espacio disponible.

### `vw`

Puede ser util en formulas fluidas, pero usado solo puede descontrolarse. Por eso suele ser mejor dentro de `clamp()` que por libre.

### `clamp()`

Es una formula de control. Mezcla:

- un limite inferior,
- una parte fluida,
- y un limite superior.

Va especialmente bien en titulares y espacios amplios.

La regla general es sencilla: usa unidades fijas en detalles pequenos y unidades mas flexibles en estructura y tipografia importante.

---

## 7. Contenedores y anchos maximos

Un buen contenedor principal puede mejorar una web entera. Un mal contenedor puede arruinarla aunque el resto del CSS este bastante bien.

Un contenedor sano hace estas cosas:

- centra el contenido,
- deja aire lateral en pequeno,
- limita el ancho de lectura en grande,
- y evita que el layout se convierta en una fila interminable.

El patron mas util para la mayoria de webs normales es este:

```css
.container {
  width: min(72rem, calc(100% - 2rem));
  margin-inline: auto;
}
```

No hay que obsesionarse con el numero exacto. Lo importante es la estructura mental:

- en pequeno, el contenedor acompana;
- en grande, el contenedor se frena.

Eso protege a la vez la ergonomia en movil y la lectura en escritorio.

---

## 8. Tipografia responsive

La tipografia responsive no consiste en hacer que todo cambie de tamano constantemente. Consiste en que la jerarquia siga funcionando en distintos anchos.

### Titulares

Son los elementos que mas suelen necesitar ajuste fluido. Deben conservar presencia en grande y no romper el layout en pequeno. Suelen ser buenos candidatos para `clamp()`.

### Texto de parrafo

Normalmente necesita mucha menos variacion. Lo que mas importa es:

- un tamano comodo,
- un interlineado razonable,
- y un ancho de lectura sano.

### Botones y enlaces de navegacion

No suelen necesitar escalados bruscos. Lo importante es que sigan siendo legibles y faciles de pulsar.

### Idea clave

La tipografia responsive no es solo el valor de `font-size`. Tambien depende del ancho del bloque, del espacio que la rodea y del papel que cumple cada texto dentro de la jerarquia.

---

## 9. Layouts con Flexbox y Grid

Entender cuando usar Flexbox y cuando usar Grid evita muchos problemas.

### Flexbox

Es muy bueno para alinear elementos en una direccion principal. Funciona muy bien en:

- filas de botones,
- barras de navegacion,
- grupos pequenos de iconos,
- bloques lineales.

### Grid

Es mejor cuando el problema ya es una composicion de varias columnas o filas. Funciona muy bien en:

- tarjetas,
- galerias,
- secciones de varias columnas,
- composiciones con mas estructura.

### Regla rapida

- alineacion lineal: Flexbox;
- composicion bidimensional: Grid.

### Error frecuente

Intentar resolver una rejilla completa con Flexbox y acabar peleandose con anchos, wraps y excepciones. Cuando el problema es claramente una rejilla, Grid suele ser la solucion mas limpia.

---

## 10. Breakpoints bien elegidos

Un breakpoint es un cambio de reglas del layout. No es un numero magico ni una etiqueta de dispositivo.

La mejor manera de elegirlo es sencilla:

1. se construye una base flexible;
2. se observa donde el contenido deja de respirar;
3. se cambia la estructura en ese punto.

Los sintomas que suelen justificar un breakpoint son:

- el navbar ya no cabe,
- el hero pierde aire,
- dos tarjetas ya no tienen anchura suficiente,
- un formulario de dos columnas se vuelve incomodo,
- o una estructura de una sola columna ya tiene espacio para abrirse.

Lo que no es una buena razon es copiar numeros sin mirar la pagina.

Una web sana suele tener pocos breakpoints y todos responden a un cambio real del contenido.

---

## 11. Navbar responsive y menu hamburguesa

El navbar es uno de los primeros elementos que suele romper cuando el ancho disminuye. Tiene que convivir con logo, enlaces, CTA y, a veces, iconos o acciones extra. Por eso el patron mas habitual es:

- escritorio: menu horizontal visible;
- movil: menu oculto y boton hamburguesa.

### Reparto de responsabilidades

HTML define la estructura:

- logo,
- boton,
- menu,
- y atributos accesibles.

CSS decide:

- cuando aparece el boton,
- cuando desaparece,
- como se muestra el menu en movil,
- y como vuelve a ser horizontal en desktop.

JavaScript solo gestiona:

- abrir y cerrar,
- cambiar `aria-expanded`,
- resetear el estado al cruzar el breakpoint,
- y cerrar por determinadas acciones del usuario.

### Idea importante

La hamburguesa no existe para decorar. Existe porque el menu horizontal deja de ser comodo cuando falta espacio.

---

## 12. Imagenes, video y media embebida

Una imagen mal integrada puede romper una pagina entera. Lo mismo pasa con videos o iframes de mapas, formularios externos o contenido embebido.

Regla basica:

```css
img,
video,
iframe {
  max-width: 100%;
}
```

En imagenes y videos tambien suele ser correcto usar `height: auto`.

Esto asegura que el recurso visual se adapte al contenedor, no que el contenedor tenga que someterse al recurso visual.

Problemas tipicos:

- imagenes gigantes que fuerzan scroll horizontal,
- videos embebidos con ancho fijo,
- banners decorativos que pisan el contenido,
- bloques que dependen de una altura fija aunque el contenido cambie.

La regla util es clara: lo visual debe adaptarse al layout, no romperlo.

---

## 13. Formularios responsive

Los formularios suelen ser faciles de adaptar si se respeta una regla basica: en estrecho, una columna; en anchos mayores, dos columnas solo cuando ya existe espacio suficiente.

Esto suele funcionar especialmente bien en formularios simples:

- nombre,
- email,
- telefono,
- mensaje.

Lo importante en un formulario responsive es:

- que el campo tenga aire,
- que la etiqueta se lea bien,
- que el boton no quede estrecho,
- que la distribucion no obligue al usuario a pelearse con dos columnas demasiado pronto.

Un formulario puede ser visualmente sencillo y, aun asi, estar muy bien resuelto si respeta comodidad y orden.

---

## 14. Header sticky, anclas y scroll

Un header sticky mejora mucho la sensacion de navegacion, pero trae consigo un problema habitual: al navegar hacia una ancla, el header puede tapar el inicio real de la seccion.

La solucion limpia es `scroll-margin-top`. No es un truco raro. Es una forma correcta de decirle al navegador que deje un margen virtual cuando hace scroll hacia ese bloque.

Este detalle merece atencion porque mejora la UX de una manera muy visible y evita el tipico efecto de "el enlace funciona, pero el titulo queda escondido".

---

## 15. El papel real de JavaScript

Conviene separar muy bien dos cosas:

- el layout responsive,
- y la interaccion.

El layout responsive lo hace CSS.

JavaScript no deberia cargar con:

- decidir cuantas columnas caben,
- mover media pagina al redimensionar,
- recalcular tipografias para que no se rompan,
- o corregir anchos que ya deberian ser fluidos.

JavaScript si tiene sentido para:

- abrir y cerrar el menu,
- actualizar estados accesibles,
- cerrar el menu con `Escape`,
- marcar enlaces activos,
- y mejorar comportamientos pequenos.

Esta separacion hace la web mas simple, mas mantenible y menos fragil.

---

## 16. Errores tipicos que destrozan una web

### Error 1. Anchos fijos grandes

```css
.hero {
  width: 1100px;
}
```

Una regla asi ignora completamente el espacio real disponible.

### Error 2. Alturas fijas en bloques con texto

```css
.card {
  height: 300px;
}
```

Si cambia el texto, el idioma o la fuente, el bloque puede quedar corto, desbordarse o romper la composicion.

### Error 3. Intentar mantener siempre la misma fotografia

El responsive no debe proteger una foto fija. Debe proteger la jerarquia y la usabilidad.

### Error 4. Meter demasiados breakpoints

Si una pagina necesita un parche cada poco, probablemente el problema no es la falta de breakpoints. El problema es la falta de base flexible.

### Error 5. Abusar de `position: absolute`

Los elementos absolutos son utiles en detalles concretos. No son una buena base para sostener una composicion entera en anchos cambiantes.

### Error 6. No probar en anchos pequenos reales

No basta con ver la web a `768px`. Tambien hay que mirarla en `320px` y `375px`.

### Error 7. Esperar que JavaScript arregle el CSS

Eso suele producir mas complejidad y peor mantenimiento.

---

## 17. Proceso practico para convertir una web a responsive

Cuando llega una web que no responde bien, conviene seguir un orden.

### Fase 1. Diagnostico

Buscar:

- anchos fijos,
- alturas fijas,
- imagenes sin control,
- filas sin wrap,
- navbar que ya no cabe,
- grids rigidas,
- y origen del scroll horizontal.

### Fase 2. Base

Corregir:

- `viewport`,
- contenedor principal,
- media fluida,
- estructura de una columna.

### Fase 3. Jerarquia

Ajustar:

- titulares,
- espaciados,
- anchos de lectura,
- relacion entre bloques.

### Fase 4. Layout

Rehacer:

- tarjetas con Grid flexible,
- secciones estructurales con breakpoints claros,
- navbar movil.

### Fase 5. UX

Revisar:

- anclas,
- formularios,
- footer,
- cierre correcto del menu,
- botones,
- y pequeños detalles de navegacion.

### Fase 6. Prueba real

Comprobar al menos:

- `320px`
- `375px`
- `480px`
- `768px`
- `1024px`
- `1280px`

En cada ancho conviene revisar:

- si hay scroll horizontal,
- si el texto sigue respirando,
- si la composicion sigue teniendo sentido,
- si el menu sigue siendo usable,
- y si la pagina sigue resultando comoda.

---

## 18. Checklist final de revision

Antes de dar una web por buena conviene revisar esta lista:

- No hay scroll horizontal.
- El contenido no toca los bordes de forma agresiva.
- Los textos no se salen.
- El hero mantiene jerarquia.
- El navbar funciona bien en movil.
- El navbar vuelve a desktop sin quedarse roto.
- Las tarjetas pueden apilarse.
- Las imagenes no fuerzan ancho.
- Los formularios siguen siendo comodos.
- Las anclas no quedan tapadas por el header.
- La pagina no depende de JS para que el layout funcione.
- Los breakpoints tienen una razon real.

Si varios puntos fallan, la web no esta realmente resuelta.

---

## 19. Codigo extraido del navbar hamburguesa

Este bloque se deja como referencia practica porque es una de las partes que mas se repiten en una web simple responsive. El breakpoint usado es `48rem`, que normalmente equivale a `768px`.

### HTML

```html
<nav class="navbar" aria-label="Principal">
  <a class="brand" href="#top">Marca</a>

  <button
    class="nav-toggle"
    type="button"
    aria-expanded="false"
    aria-controls="primary-menu"
    aria-label="Abrir navegacion"
  >
    <span class="nav-toggle-line"></span>
    <span class="nav-toggle-line"></span>
    <span class="nav-toggle-line"></span>
  </button>

  <div class="nav-menu" id="primary-menu">
    <a href="#inicio">Inicio</a>
    <a href="#servicios">Servicios</a>
    <a href="#contacto">Contacto</a>
  </div>
</nav>
```

### CSS

```css
.nav-toggle {
  display: inline-grid;
  place-items: center;
  gap: 0.28rem;
  width: 3rem;
  height: 3rem;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.04);
  color: white;
  cursor: pointer;
}

.nav-toggle-line {
  width: 1.2rem;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.navbar.is-open .nav-toggle-line:nth-child(1) {
  transform: translateY(0.4rem) rotate(45deg);
}

.navbar.is-open .nav-toggle-line:nth-child(2) {
  opacity: 0;
}

.navbar.is-open .nav-toggle-line:nth-child(3) {
  transform: translateY(-0.4rem) rotate(-45deg);
}

.nav-menu {
  position: absolute;
  top: calc(100% + 0.75rem);
  left: 0;
  right: 0;
  display: grid;
  gap: 0.45rem;
  padding: 1rem;
  border-radius: 1.5rem;
  background: rgba(10, 20, 34, 0.94);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-0.65rem);
  pointer-events: none;
  transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s ease;
}

.navbar.is-open .nav-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  pointer-events: auto;
}

@media (min-width: 48rem) {
  .nav-toggle {
    display: none;
  }

  .nav-menu {
    position: static;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0;
    background: transparent;
    opacity: 1;
    visibility: visible;
    transform: none;
    pointer-events: auto;
  }
}
```

### JS

```js
const nav = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");
const desktopMenuQuery = window.matchMedia("(min-width: 48rem)");

function setMenuState(isOpen) {
  if (!nav || !navToggle) return;

  nav.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute(
    "aria-label",
    isOpen ? "Cerrar navegacion" : "Abrir navegacion"
  );
}

function closeMenu() {
  setMenuState(false);
}

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
});

desktopMenuQuery.addEventListener("change", () => {
  closeMenu();
});
```

### Comportamiento

- Menor de `48rem`: aparece la hamburguesa y el menu se oculta.
- Al abrirse, la clase `.is-open` controla el estado visual.
- Desde `48rem`: desaparece el boton y vuelve el menu horizontal.

---

## 20. Idea final

Una web responsive no necesita una coleccion infinita de trucos. Necesita una base flexible. Esa base suele incluir:

- contenedor fluido,
- tipografia con sentido,
- bloques capaces de apilarse,
- media controlada,
- pocos breakpoints claros,
- y JavaScript reducido a la interaccion.

La idea mas importante de todas es esta:

no se arregla una web rigida al final.

Se construye una web flexible desde el principio.
