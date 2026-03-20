/*
  Referencias basicas del DOM.

  - pinSection: la zona visible que se va a quedar fijada
  - videoBlock: el contenedor que se expandira
*/
const pinSection = document.querySelector(".escena__pin");
const videoBlock = document.querySelector(".bloque-video");

/*
  Comprobacion de seguridad.

  Si faltan elementos del HTML o si GSAP / ScrollTrigger no han cargado,
  detenemos la ejecucion para evitar errores en consola.
*/
if (!pinSection || !videoBlock || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
  console.warn("No se pudo iniciar la animacion del video.");
} else {
  /*
    ScrollTrigger debe registrarse antes de crear triggers.
    Es el paso obligatorio para que GSAP pueda usar este plugin.
  */
  gsap.registerPlugin(ScrollTrigger);

  /*
    Ajuste inicial del bloque de video.

    xPercent e yPercent con valor -50 equivalen al translate(-50%, -50%)
    de CSS, pero definidos desde GSAP. Esto hace mas consistente el punto
    de referencia del bloque cuando luego cambiemos su tamano.

    transformOrigin: "center center":
    indica que cualquier transformacion debe tomar como referencia
    el centro del propio elemento.
  */
  gsap.set(videoBlock, {
    xPercent: -50,
    yPercent: -50,
    transformOrigin: "center center"
  });

  /*
    Timeline principal.

    En lugar de lanzar la animacion por tiempo, la ligamos al scroll.
    Eso significa que el progreso depende del gesto del usuario:
    si hace poco scroll, el video crece poco;
    si avanza mas, el video sigue creciendo.
  */
  gsap.timeline({
    scrollTrigger: {
      /*
        trigger:
        la animacion comienza cuando la escena entra en el punto indicado.
      */
      trigger: ".escena",

      /*
        start: "top top"
        significa:
        - el top de ".escena"
        - coincide con el top de la ventana
      */
      start: "top top",

      /*
        end:
        repartimos la expansion a lo largo de un tramo largo de scroll.
        Asi el crecimiento se siente gradual y no brusco.
      */
      end: "+=130%",

      /*
        scrub: 1.2
        conecta el progreso de la animacion con el scroll
        y le anade un pequeno retraso para suavizar la sensacion.
      */
      scrub: 1.2,

      /*
        pin:
        fija visualmente la seccion durante el tramo del efecto.
        Gracias a esto, la pantalla no "avanza" mostrando otra cosa:
        solo vemos crecer el video sobre el mismo fondo.
      */
      pin: pinSection,

      /*
        anticipatePin reduce pequenos saltos justo al empezar el pin.
        invalidateOnRefresh obliga a recalcular medidas en cada refresh,
        util si cambia el tamano de la ventana.
      */
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  }).to(videoBlock, {
    /*
      Estado final del bloque:
      - todo el ancho de la ventana
      - todo el alto de la ventana
      - sin esquinas redondeadas
      - sin sombra, para que termine como un fondo limpio

      Usamos funciones para width y height porque asi el valor se calcula
      en el momento del refresh y se adapta al viewport real.
    */
    width: () => window.innerWidth,
    height: () => window.innerHeight,
    borderRadius: 0,
    boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
    ease: "none"
  });

  /*
    Si cambia el tamano de la ventana, refrescamos ScrollTrigger
    para recalcular el punto inicial, el final y las medidas del video.
  */
  window.addEventListener("resize", () => {
    ScrollTrigger.refresh();
  });

  /*
    Refresh inicial.
    Hace que ScrollTrigger mida todo correctamente justo al cargar la pagina.
  */
  ScrollTrigger.refresh();
}
