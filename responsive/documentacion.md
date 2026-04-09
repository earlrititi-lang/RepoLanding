# Demo completa de web simple responsive

Esta carpeta ya no contiene solo un navbar de prueba. Ahora es una plantilla pequena pero util para explicar una web responsive de principio a fin.

## Indice

- [Archivos](#archivos)
- [Que incluye la demo](#que-incluye-la-demo)
- [Breakpoints](#breakpoints)
- [Reglas responsive que usa](#reglas-responsive-que-usa)
- [Como esta montado el navbar](#como-esta-montado-el-navbar)
- [Codigo extraido del navbar hamburguesa](#codigo-extraido-del-navbar-hamburguesa)
- [Estructura HTML](#estructura-html)
- [Que partes puedes reutilizar rapido](#que-partes-puedes-reutilizar-rapido)
- [Que cambiar primero si quieres adaptarla](#que-cambiar-primero-si-quieres-adaptarla)
- [Idea principal](#idea-principal)

## Archivos

- `index.html`: estructura semantica completa.
- `styles.css`: sistema visual, layout y media queries.
- `script.js`: mejoras de interaccion.
- `documentacion.md`: resumen de decisiones y puntos de cambio.

## Que incluye la demo

- Header sticky.
- Navbar con menu hamburguesa en movil.
- Hero con CTA y metricas.
- Grid de tarjetas reusable.
- Seccion de proceso en dos columnas.
- Casos o proyectos en cards.
- FAQ con `details`.
- Formulario de contacto.
- Footer con ano automatico.

## Breakpoints

- `36rem` (`576px`): mejora botones del hero, metricas y mini grid.
- `48rem` (`768px`): el navbar deja de ser hamburguesa y pasa a menu horizontal.
- `62rem` (`992px`): hero, FAQ, contacto y otras secciones pasan a varias columnas.
- `80rem` (`1280px`): pequenos ajustes de lectura para pantallas grandes.

## Reglas responsive que usa

1. El contenedor principal usa `min(72rem, calc(100% - 1.25rem))`.
2. La tipografia principal usa `clamp()` para crecer sin saltos bruscos.
3. Las tarjetas usan `repeat(auto-fit, minmax(...))` cuando encaja.
4. Las secciones complejas cambian de una columna a dos o tres solo en breakpoints claros.
5. El header sticky no tapa las anclas porque las secciones usan `scroll-margin-top`.
6. El JS no intenta "hacer responsive"; solo mejora menu, estado activo y pequenas ayudas.

## Como esta montado el navbar

HTML:

- Un `button.nav-toggle` con `aria-expanded` y `aria-controls`.
- Un bloque `.nav-menu` con los enlaces.

CSS:

- En movil el boton se ve y `.nav-menu` se oculta visualmente.
- Cuando `.navbar` tiene `.is-open`, el menu aparece debajo.
- Desde `48rem`, el boton se oculta y el menu vuelve a ser horizontal.

JS:

- Abre y cierra el menu.
- Cierra con `Escape`.
- Cierra al pulsar un enlace.
- Cierra al hacer clic fuera.
- Resetea el estado al volver a desktop.

## Codigo extraido del navbar hamburguesa

Este es el bloque minimo para reutilizar la transformacion del navbar a menu hamburguesa segun el ancho de pantalla. El breakpoint usado es `48rem`, que normalmente equivale a `768px`.

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

### Resumen del comportamiento

- Menor de `48rem`: se ve el boton hamburguesa y el menu queda oculto.
- Al pulsar el boton: `.navbar` recibe la clase `.is-open`.
- Con `.is-open`: las tres lineas se transforman en una `X` y el menu se despliega.
- Desde `48rem` en adelante: el boton desaparece y el menu vuelve a horizontal.

## Estructura HTML

- `header.site-header`
- `nav.navbar`
- `section#inicio`
- `section#servicios`
- `section#proceso`
- `section#casos`
- `section#faq`
- `section#contacto`
- `footer.site-footer`

## Que partes puedes reutilizar rapido

- Solo navbar: copia `header`, reglas `.navbar`, `.nav-toggle`, `.nav-menu` y el bloque principal de `script.js`.
- Landing completa: copia los cuatro archivos tal cual y cambia textos, colores y secciones.
- Portfolio o pagina de negocio: manten hero, cards, FAQ y contacto; elimina lo que sobre.

## Que cambiar primero si quieres adaptarla

- Marca y enlaces en `index.html`.
- Paleta y radios en `:root` dentro de `styles.css`.
- Breakpoint del navbar: cambia `48rem` en `styles.css` y en `script.js`.
- Numero de cards: puedes duplicar o borrar `article.info-card` sin tocar CSS.
- Mensaje del formulario demo en `script.js`.

## Idea principal

Una web simple responsive no necesita docenas de media queries. Necesita:

- una base fluida,
- pocos breakpoints bien elegidos,
- componentes que acepten crecer o apilarse,
- y un JS pequeno que no pelee con CSS.
