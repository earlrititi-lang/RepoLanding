/*
  ------------------------------------------------------------
  BLOQUE 1. REFERENCIAS A ELEMENTOS DEL DOM
  ------------------------------------------------------------

  Necesitamos tres elementos para construir el efecto completo:

  1. pinSection
     Es la zona de la escena que ScrollTrigger dejara visualmente fija.
     Mientras esta zona este pineada, el usuario podra seguir haciendo scroll
     pero la pantalla no avanzara a otro contenido.

  2. videoBlock
     Es el contenedor del video. Lo animamos a el, y no al <video> directamente,
     porque asi controlamos mejor su recorte, su borde redondeado y su sombra.

  3. blackFill
     Es la capa negra que aparecera despues de que el video llegue
     a pantalla completa. Su animacion ira de izquierda a derecha.
*/
const pinSection = document.querySelector(".escena__pin");
const videoBlock = document.querySelector(".bloque-video");
const blackFill = document.querySelector(".relleno-negro");

/*
  ------------------------------------------------------------
  BLOQUE 2. COMPROBACION DE SEGURIDAD
  ------------------------------------------------------------

  Antes de inicializar el efecto comprobamos que:
  - existen los nodos del HTML que necesitamos
  - GSAP esta cargado
  - ScrollTrigger esta cargado

  Si falta alguna pieza, detenemos la ejecucion para evitar errores.
*/
if (
  !pinSection ||
  !videoBlock ||
  !blackFill ||
  typeof gsap === "undefined" ||
  typeof ScrollTrigger === "undefined"
) {
  console.warn("No se pudo iniciar la animacion del video.");
} else {
  /*
    ----------------------------------------------------------
    BLOQUE 3. REGISTRO DEL PLUGIN
    ----------------------------------------------------------

    ScrollTrigger debe registrarse dentro de GSAP antes de usarse.
    Si no se hace este paso, GSAP no sabra interpretar la propiedad
    "scrollTrigger" dentro de los timelines o tweens.
  */
  gsap.registerPlugin(ScrollTrigger);

  /*
    ----------------------------------------------------------
    BLOQUE 4. ESTADO INICIAL DE LOS ELEMENTOS ANIMADOS
    ----------------------------------------------------------

    Reforzamos desde GSAP dos cosas importantes:

    1. El bloque de video debe quedar centrado tomando como referencia
       su propio centro, no su esquina superior izquierda.

    2. La capa negra debe arrancar visualmente cerrada.
       Para eso usamos scaleX(0), que equivale a "ancho aparente cero".
       El origen de esa escala se coloca en la izquierda para que,
       al crecer, el relleno negro avance hacia la derecha.
  */
  gsap.set(videoBlock, {
    xPercent: -50,
    yPercent: -50,
    transformOrigin: "center center"
  });

  gsap.set(blackFill, {
    scaleX: 0,
    transformOrigin: "left center"
  });

  /*
    ----------------------------------------------------------
    BLOQUE 5. TIMELINE PRINCIPAL VINCULADO AL SCROLL
    ----------------------------------------------------------

    Este timeline contiene DOS fases consecutivas:

    FASE 1:
    el video se expande desde su tamano pequeno inicial
    hasta ocupar toda la pantalla.

    FASE 2:
    una capa negra cubre el viewport de izquierda a derecha.

    Ambas fases se gobiernan con el mismo scroll del usuario.
    Eso se consigue porque:
    - las dos animaciones estan dentro del mismo timeline
    - ese timeline tiene un ScrollTrigger con scrub

    Asi, el usuario "empuja" ambas transiciones con el scroll.
  */
  gsap.timeline({
    scrollTrigger: {
      /*
        trigger:
        usamos la escena completa como referencia del comienzo del efecto.
      */
      trigger: ".escena",

      /*
        start: "top top"
        significa:
        el efecto arranca cuando el borde superior de la escena
        coincide con el borde superior del viewport.
      */
      start: "top top",

      /*
        end: "+=220%"
        reservamos un recorrido largo de scroll para repartir bien
        las dos fases del timeline:
        - expansion del video
        - barrido negro

        Al aumentar este valor, la transicion se siente mas progresiva.
      */
      end: "+=220%",

      /*
        scrub: 1.2
        vincula el progreso del timeline al progreso del scroll
        y anade una ligera amortiguacion.

        Eso hace que el movimiento no responda de forma seca o brusca.
      */
      scrub: 1.2,

      /*
        pin: pinSection
        fija visualmente la zona de la escena donde ocurre el efecto.

        Gracias a esto:
        - la pantalla no baja mostrando otra seccion
        - el usuario siente que permanece dentro del mismo encuadre
        - solo cambia el estado del video y, despues, el de la cortina negra
      */
      pin: pinSection,

      /*
        anticipatePin reduce pequenos tirones al inicio del pin.
        invalidateOnRefresh obliga a recalcular medidas al refrescar.
      */
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  })
    .to(videoBlock, {
      /*
        --------------------------------------------------------
        BLOQUE 6. FASE 1: EXPANSION DEL VIDEO
        --------------------------------------------------------

        En esta primera mitad del timeline, el bloque de video:
        - gana ancho hasta cubrir el viewport
        - gana alto hasta cubrir el viewport
        - pierde esquinas redondeadas
        - pierde la sombra

        El resultado es que deja de parecer una pieza flotante
        y pasa a comportarse como un fondo completo.

        duration: 1
        no significa "1 segundo real". Dentro de un timeline con scrub,
        duration funciona como proporcion interna del recorrido.
      */
      width: () => window.innerWidth,
      height: () => window.innerHeight,
      borderRadius: 0,
      boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
      ease: "none",
      duration: 1
    })
    .to(blackFill, {
      /*
        --------------------------------------------------------
        BLOQUE 7. FASE 2: RELLENO NEGRO DE IZQUIERDA A DERECHA
        --------------------------------------------------------

        Esta segunda animacion empieza solo cuando la expansion del video
        ya ha terminado dentro del timeline.

        scaleX: 1
        hace que la capa negra pase de ancho visual cero
        a ancho completo.

        Como su transformOrigin esta fijado en la izquierda,
        el barrido nace en ese borde y avanza hacia la derecha.

        Lo mas importante:
        esta fase sigue vinculada al scroll.
        No es una animacion autonoma por tiempo, sino la segunda parte
        del mismo timeline gobernado por ScrollTrigger.
      */
      scaleX: 1,
      ease: "none",
      duration: 1
    });

  /*
    ----------------------------------------------------------
    BLOQUE 8. ADAPTACION A CAMBIOS DE TAMANO
    ----------------------------------------------------------

    Como la fase de expansion usa window.innerWidth y window.innerHeight,
    necesitamos refrescar ScrollTrigger si cambia el tamano de la ventana.

    Eso obliga a recalcular:
    - medidas
    - puntos de inicio y fin
    - valores dependientes del viewport
  */
  window.addEventListener("resize", () => {
    ScrollTrigger.refresh();
  });

  /*
    ----------------------------------------------------------
    BLOQUE 9. REFRESH INICIAL
    ----------------------------------------------------------

    Ejecutamos un refresh inicial para que ScrollTrigger mida todo
    correctamente antes de la primera interaccion del usuario.
  */
  ScrollTrigger.refresh();
}
