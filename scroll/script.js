/*
  ------------------------------------------------------------
  BLOQUE 1. REFERENCIAS A ELEMENTOS DEL DOM
  ------------------------------------------------------------

  Necesitamos cuatro piezas para montar el efecto:

  1. pinSection
     Es la zona que ScrollTrigger dejara fija mientras el usuario
     sigue avanzando con el scroll.

  2. sceneFrame
     Es el contenedor que escala el SVG de la tele con proporcion fija.
     Gracias a el podemos medir donde cae realmente la pantalla
     dentro del viewport.

  3. videoBlock
     Es el marco del video que arranca dentro del hueco de la tele
     y luego se expande a fullscreen.

  4. blackBars
     Son las seis barras verticales que cierran la escena
     de izquierda a derecha cuando el video ya ha llenado la pantalla.
*/
const pinSection = document.querySelector(".escena__pin");
const sceneFrame = document.querySelector(".tracking-marco");
const videoBlock = document.querySelector(".bloque-video");
const blackBars = Array.from(document.querySelectorAll(".barra-negra"));

/*
  ------------------------------------------------------------
  BLOQUE 2. COMPROBACION DE SEGURIDAD
  ------------------------------------------------------------

  Antes de animar nada, comprobamos que:
  - el HTML contiene todas las piezas necesarias
  - GSAP esta cargado
  - ScrollTrigger esta disponible

  Si falta algo, mostramos un aviso y evitamos errores en consola.
*/
if (
  !pinSection ||
  !sceneFrame ||
  !videoBlock ||
  blackBars.length !== 6 ||
  typeof gsap === "undefined" ||
  typeof ScrollTrigger === "undefined"
) {
  console.warn("No se pudo iniciar la animacion principal.");
} else {
  /*
    ----------------------------------------------------------
    BLOQUE 3. REGISTRO DEL PLUGIN
    ----------------------------------------------------------

    ScrollTrigger debe registrarse dentro de GSAP antes de usarlo.
  */
  gsap.registerPlugin(ScrollTrigger);

  /*
    ----------------------------------------------------------
    BLOQUE 4. LECTURA DE LAS MEDIDAS DEL HUECO DE LA TELE
    ----------------------------------------------------------

    Los porcentajes del hueco verde viven en CSS como variables.
    Asi mantenemos la medicion centralizada en un solo sitio.

    parseFloat convierte cada valor textual en numero y al dividir
    entre 100 lo dejamos listo para usar como proporcion.
  */
  const rootStyles = getComputedStyle(document.documentElement);
  const tvHole = {
    left: parseFloat(rootStyles.getPropertyValue("--tv-hole-left")) / 100,
    top: parseFloat(rootStyles.getPropertyValue("--tv-hole-top")) / 100,
    width: parseFloat(rootStyles.getPropertyValue("--tv-hole-width")) / 100,
    height: parseFloat(rootStyles.getPropertyValue("--tv-hole-height")) / 100
  };

  /*
    En este punto, por ejemplo, tvHole.left no significa "43% del viewport",
    sino "43% del ancho interno del SVG". La conversion al viewport ocurre
    un bloque mas abajo, cuando ya sabemos cuanto ocupa realmente la tele.
  */

  /*
    ----------------------------------------------------------
    BLOQUE 5. CALCULO DE LA CAJA INICIAL DEL VIDEO
    ----------------------------------------------------------

    El SVG se comporta como una imagen "cover":
    mantiene su proporcion pero puede sobresalir por los bordes.

    Por eso no basta con usar porcentajes directamente sobre el viewport.
    Primero medimos el marco visible de la tele y despues trasladamos
    el rectangulo verde al sistema de coordenadas del contenedor pineado.
  */
  const getVideoRect = () => {
    const frameRect = sceneFrame.getBoundingClientRect();
    const pinRect = pinSection.getBoundingClientRect();

    /*
      frameRect:
      describe el tamano y posicion reales del SVG ya escalado.

      pinRect:
      nos da el sistema de referencia en el que vive el video.

      Restar ambos top/left convierte coordenadas de viewport
      a coordenadas locales del contenedor pineado.
    */
    return {
      top: frameRect.top - pinRect.top + frameRect.height * tvHole.top,
      left: frameRect.left - pinRect.left + frameRect.width * tvHole.left,
      width: frameRect.width * tvHole.width,
      height: frameRect.height * tvHole.height
    };
  };

  /*
    ----------------------------------------------------------
    BLOQUE 6. SINCRONIZACION VISUAL DEL VIDEO
    ----------------------------------------------------------

    Esta funcion coloca el bloque justo encima del hueco de la tele.

    La llamamos:
    - al iniciar la pagina
    - cada vez que ScrollTrigger recalcula medidas

    visibility: visible hace que el video aparezca solo cuando
    ya tiene una posicion correcta y evita destellos desalineados.

    Tambien reiniciamos aqui el aspecto visual de arranque.
    Eso garantiza que, si el usuario redimensiona la ventana
    o cambia la orientacion del dispositivo, el video vuelva
    exactamente a su pantalla de la tele antes de seguir animando.
  */
  const setVideoToHole = () => {
    const rect = getVideoRect();

    gsap.set(videoBlock, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      borderRadius: 0,
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
      visibility: "visible"
    });
  };

  /*
    ----------------------------------------------------------
    BLOQUE 7. ESTADO INICIAL DE LAS BARRAS
    ----------------------------------------------------------

    Cada barra arranca cerrada con scaleX(0) y crecera desde su
    borde izquierdo cuando llegue su turno en la timeline.
  */
  gsap.set(blackBars, {
    scaleX: 0,
    transformOrigin: "left center"
  });

  setVideoToHole();

  /*
    ----------------------------------------------------------
    BLOQUE 8. TIMELINE PRINCIPAL VINCULADO AL SCROLL
    ----------------------------------------------------------

    FASE 1:
    el video pasa de la pantalla de la tele a fullscreen.

    FASE 2:
    una vez completado ese fullscreen, entran las seis barras
    negras en escalera hasta cerrar todo el viewport.
  */
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".escena",
        start: "top top",
        end: "+=220%",
        scrub: 1.2,
        pin: pinSection,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: setVideoToHole
      }
    })
    .to(videoBlock, {
      /*
        --------------------------------------------------------
        BLOQUE 9. FASE 1: FULLSCREEN DEL VIDEO
        --------------------------------------------------------

        El bloque deja atras la pantalla de la tele y pasa a ocupar
        toda la superficie visible del contenedor pineado.
      */
      top: 0,
      left: 0,
      width: () => pinSection.clientWidth,
      height: () => pinSection.clientHeight,
      borderRadius: 0,
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
      ease: "none",
      duration: 1
    })
    .to(
      blackBars,
      {
        /*
          ------------------------------------------------------
          BLOQUE 10. FASE 2: CIERRE EN ESCALERA
          ------------------------------------------------------

          Cada barra cubre su sexta parte del viewport y entra con un
          pequeno retraso respecto a la anterior para producir el cierre
          de izquierda a derecha que querias conservar.
        */
        scaleX: 1,
        ease: "none",
        duration: 0.9,
        stagger: 0.08
      },
      "+=0.14"
    );

  /*
    ----------------------------------------------------------
    BLOQUE 11. ADAPTACION A CAMBIOS DE TAMANO
    ----------------------------------------------------------

    Si el viewport cambia, el SVG se recoloca y el hueco de la tele
    cambia de posicion real en pantalla. ScrollTrigger.refresh()
    obliga a recalcularlo todo.
  */
  window.addEventListener("resize", () => {
    ScrollTrigger.refresh();
  });

  /*
    ----------------------------------------------------------
    BLOQUE 12. REFRESH INICIAL
    ----------------------------------------------------------

    Ejecutamos un refresh inicial para que ScrollTrigger mida
    correctamente la escena antes de la primera interaccion.
  */
  ScrollTrigger.refresh();
}
