/*
  ------------------------------------------------------------
  BLOQUE 1. REFERENCIAS A ELEMENTOS DEL DOM
  ------------------------------------------------------------

  Necesitamos once piezas para montar el efecto:

  1. pinSection
     Es la zona que ScrollTrigger dejara fija mientras el usuario
     sigue avanzando con el scroll.

  2. trackingStage
     Es la escena completa que contiene tele y video.
     Este es ahora el elemento que animaremos para simular
     un acercamiento de camara.

  3. sceneFrame
     Es el contenedor que escala el SVG de la tele con proporcion fija.
     Gracias a el podemos medir donde cae realmente la pantalla
     dentro de la composicion.

  4. videoBlock
     Es el marco del video que se coloca sobre el hueco exacto
     de la pantalla de la tele.

  5. blackBars
     Son las seis barras verticales que cierran la escena
     de izquierda a derecha cuando el zoom ya ha terminado.

  6. horizontalStage
     Es la capa negra que aparece despues del cierre completo.

  7. horizontalTrack
     Es la pista mas ancha que el viewport que moveremos en X
     para simular el scroll lateral.

  8. horizontalBarItem
     Es la primera pieza de la pista: scrollbarlateral.png.

  9. horizontalRingItem
     Es la segunda pieza: el ring que termina ocupando el viewport.

  10. ringLight1
      Es la primera capa luminosa superpuesta sobre el ring.

  11. ringLight2
      Es la segunda capa luminosa superpuesta sobre el ring.
*/
const pinSection = document.querySelector(".escena__pin");
const trackingStage = document.querySelector(".tracking-stage");
const sceneFrame = document.querySelector(".tracking-marco");
const videoBlock = document.querySelector(".bloque-video");
const blackBars = Array.from(document.querySelectorAll(".barra-negra"));
const horizontalStage = document.querySelector(".horizontal-stage");
const horizontalTrack = document.querySelector(".horizontal-track");
const horizontalBarItem = document.querySelector(".horizontal-item-bar");
const horizontalRingItem = document.querySelector(".horizontal-item-ring");
const ringLight1 = document.querySelector(".Luz1");
const ringLight2 = document.querySelector(".Luz2");

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
  !trackingStage ||
  !sceneFrame ||
  !videoBlock ||
  blackBars.length !== 6 ||
  !horizontalStage ||
  !horizontalTrack ||
  !horizontalBarItem ||
  !horizontalRingItem ||
  !ringLight1 ||
  !ringLight2 ||
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

    Este paso es obligatorio porque GSAP no activa automaticamente
    todos sus plugins. Al registrarlo aqui dejamos listo el motor
    para:
    - pinear la escena
    - vincular la timeline al scroll
    - recalcular medidas cuando cambie el viewport
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
    mas abajo, cuando ya conocemos el tamano real de la tele en pantalla.
  */

  /*
    ----------------------------------------------------------
    BLOQUE 5. CALCULO DE LA CAJA DEL VIDEO DENTRO DE LA ESCENA
    ----------------------------------------------------------

    El SVG se comporta como una imagen "cover":
    mantiene su proporcion pero puede sobresalir por los bordes.

    Por eso no basta con usar porcentajes directamente sobre el viewport.
    Primero medimos el marco visible de la tele y despues trasladamos
    el rectangulo verde al sistema de coordenadas de la escena escalable.
  */
  const getVideoRect = () => {
    const frameRect = sceneFrame.getBoundingClientRect();
    const stageRect = trackingStage.getBoundingClientRect();

    /*
      frameRect:
      describe el tamano y posicion reales del SVG ya escalado.

      stageRect:
      nos da el sistema de referencia local de la escena que despues
      vamos a ampliar con transform.

      Restar ambos top/left convierte coordenadas de viewport
      a coordenadas internas de la composicion.
    */
    return {
      top: frameRect.top - stageRect.top + frameRect.height * tvHole.top,
      left: frameRect.left - stageRect.left + frameRect.width * tvHole.left,
      width: frameRect.width * tvHole.width,
      height: frameRect.height * tvHole.height
    };
  };

  /*
    ----------------------------------------------------------
    BLOQUE 6. CALCULO DEL ZOOM OBJETIVO
    ----------------------------------------------------------

    Aqui convertimos el hueco del video en un destino de camara.

    La idea es sencilla:
    - medimos el tamano actual de la pantalla de la tele
    - calculamos cuanto hay que escalar la escena para que esa pantalla
      cubra todo el viewport
    - calculamos el desplazamiento necesario para llevar su centro
      al centro visible de la ventana

    Usamos Math.max para que el video termine llenando la pantalla
    aunque eso implique recortar un poco por uno de los ejes.
  */
  const getZoomTarget = (rect) => {
    const pinWidth = pinSection.clientWidth;
    const pinHeight = pinSection.clientHeight;
    const scale = Math.max(pinWidth / rect.width, pinHeight / rect.height);

    return {
      scale,
      x: (pinWidth - rect.width * scale) / 2 - rect.left * scale,
      y: (pinHeight - rect.height * scale) / 2 - rect.top * scale
    };
  };

  /*
    ----------------------------------------------------------
    BLOQUE 7. CALCULO DEL DESPLAZAMIENTO HORIZONTAL
    ----------------------------------------------------------

    La pista horizontal arranca fuera del viewport gracias al
    padding-left grande definido en CSS.

    Ese detalle es importante porque el usuario no ve "dos animaciones":
    ve un solo carril que cruza de derecha a izquierda.

    Aqui calculamos cuanto hay que mover esa pista para que el ring,
    que es la segunda pieza del carril, termine centrado en pantalla
    cuando el usuario complete esta fase.
  */
  const getHorizontalTarget = () => {
    const stageRect = horizontalStage.getBoundingClientRect();
    const itemRect = horizontalRingItem.getBoundingClientRect();

    return (stageRect.width - itemRect.width) / 2 - (itemRect.left - stageRect.left);
  };

  /*
    ----------------------------------------------------------
    BLOQUE 8. SINCRONIZACION DE LA ESCENA
    ----------------------------------------------------------

    Esta funcion deja la composicion en su estado base:
    - escena sin zoom
    - video colocado exactamente sobre la pantalla de la tele
    - objetivo de zoom recalculado para el viewport actual

    La llamamos:
    - al iniciar la pagina
    - cada vez que ScrollTrigger recalcula medidas

    visibility: visible hace que el video aparezca solo cuando
    ya tiene una posicion correcta y evita destellos desalineados.
  */
  let zoomTarget = { x: 0, y: 0, scale: 1 };
  let horizontalTargetX = 0;

  const syncTrackingScene = () => {
    /*
      Primero devolvemos la composicion a su estado neutro.

      Esto es importante porque las siguientes mediciones deben hacerse
      sin arrastrar transforms de un refresh anterior. Si midieramos
      la tele mientras ya esta ampliada, el calculo del hueco del video
      quedaria contaminado.
    */
    gsap.set(trackingStage, {
      x: 0,
      y: 0,
      scale: 1,
      transformOrigin: "top left"
    });

    /*
      La fase horizontal tambien vuelve a su punto de partida:
      - capa invisible
      - pista sin desplazamiento acumulado

      Asi cada refresh reconstruye la secuencia desde una base limpia.
    */
    gsap.set(horizontalStage, { opacity: 0 });
    gsap.set(horizontalTrack, { x: 0 });
    gsap.set([ringLight1, ringLight2], { autoAlpha: 1 });

    const rect = getVideoRect();
    zoomTarget = getZoomTarget(rect);
    horizontalTargetX = getHorizontalTarget();

    /*
      Solo cuando ya conocemos la caja exacta del hueco de la tele
      hacemos visible el bloque de video.

      Esto evita destellos mal colocados entre el primer render del DOM
      y la primera medicion real de la composicion.
    */
    gsap.set(videoBlock, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      visibility: "visible"
    });
  };

  /*
    ----------------------------------------------------------
    BLOQUE 9. ESTADO INICIAL DE LAS BARRAS
    ----------------------------------------------------------

    Cada barra arranca cerrada con scaleX(0) y crecera desde su
    borde izquierdo cuando llegue su turno en la timeline.
  */
  gsap.set(blackBars, {
    scaleX: 0,
    transformOrigin: "left center"
  });

  syncTrackingScene();

  /*
    ----------------------------------------------------------
    BLOQUE 10. TIMELINE PRINCIPAL VINCULADO AL SCROLL
    ----------------------------------------------------------

    FASE 1:
    en lugar de agrandar el video, hacemos zoom sobre toda la escena.
    El resultado percibido es el de una camara acercandose
    hasta que la pantalla de la tele termina ocupando el viewport.

    FASE 2:
    una vez completado ese acercamiento, entran las seis barras
    negras en escalera hasta cerrar todo el viewport.

    FASE 3:
    cuando la pantalla ya es completamente negra, aparece una pista
    horizontal. Primero entra scrollbarlateral.png y despues la
    composicion completa del ring.

    FASE 4:
    con el ring ya inmovil y encajado en el viewport,
    la primera capa de luz pierde opacidad hasta desaparecer.

    FASE 5:
    a continuacion ocurre lo mismo con la segunda capa de luz.

    Conceptualmente la parte final se divide en cuatro micro-momentos:
    - arranque del carril fuera de pantalla
    - cruce lateral de la panoramica
    - llegada final del ring al centro del viewport
    - apagado secuencial de las dos luces
  */
  const mainTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".escena",
      start: "top top",
      end: "+=620%",
      scrub: 1.2,
      pin: pinSection,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefreshInit: syncTrackingScene
    }
  });

  mainTimeline.to(trackingStage, {
    /*
      --------------------------------------------------------
      BLOQUE 11. FASE 1: ZOOM DE CAMARA
      --------------------------------------------------------

      El contenedor completo se escala y se desplaza.

      Importante:
      el video no cambia aqui su top, left, width ni height.
      Lo que cambia es la camara virtual desde la que observamos
      toda la composicion.
    */
    x: () => zoomTarget.x,
    y: () => zoomTarget.y,
    scale: () => zoomTarget.scale,
    ease: "none",
    duration: 1
  });

  mainTimeline.to(
    blackBars,
    {
      /*
        ------------------------------------------------------
        BLOQUE 12. FASE 2: CIERRE EN ESCALERA
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

  mainTimeline.set(
    horizontalStage,
    {
      /*
        ------------------------------------------------------
        BLOQUE 13. APERTURA DE LA CAPA HORIZONTAL
        ------------------------------------------------------

        En cuanto el negro ya cubre todo, activamos la nueva capa.
        Como su fondo tambien es negro, el cambio es visualmente
        continuo y solo se percibe la entrada del carril lateral.
      */
      opacity: 1
    },
    ">"
  );

  mainTimeline.to(horizontalTrack, {
    /*
      --------------------------------------------------------
      BLOQUE 14. FASE 3: ENTRADA HORIZONTAL
      --------------------------------------------------------

      La pista se desplaza hacia la izquierda.
      Primero entra scrollbarlateral.png y despues el conjunto del ring
      formado por su base y sus dos capas de luz.

      No centramos la pista completa, sino la segunda pieza.
      Por eso el target se calcula con getHorizontalTarget():
      el scroll lateral termina exactamente cuando el ring queda
      encajado en el viewport.
    */
    x: () => horizontalTargetX,
    ease: "none",
    duration: 1.6
  });

  /*
    ----------------------------------------------------------
    BLOQUE 15. FASE 4: APAGADO DE LA PRIMERA LUZ
    ----------------------------------------------------------

    En este punto la pista ya no se mueve: el ring se queda fijo
    y empezamos a actuar solo sobre su primera capa luminosa.

    Usamos autoAlpha para que la capa no solo se vuelva transparente,
    sino que tambien termine con visibility: hidden cuando alcance cero.
  */
  mainTimeline.to(ringLight1, {
    autoAlpha: 0,
    ease: "none",
    duration: 0.45
  });

  /*
    ----------------------------------------------------------
    BLOQUE 16. FASE 5: APAGADO DE LA SEGUNDA LUZ
    ----------------------------------------------------------

    Cuando la primera luz ya ha desaparecido, repetimos exactamente
    la misma idea con la segunda. Asi el ring pierde brillo
    en dos pasos diferenciados y legibles durante el scroll.
  */
  mainTimeline.to(ringLight2, {
    autoAlpha: 0,
    ease: "none",
    duration: 0.45
  });

  /*
    ----------------------------------------------------------
    BLOQUE 17. ADAPTACION A CAMBIOS DE TAMANO
    ----------------------------------------------------------

    Si el viewport cambia, el SVG se recoloca, el hueco de la tele
    cambia de posicion real en pantalla y tambien cambia el zoom
    necesario para que el video termine llenando el viewport.

    ScrollTrigger.refresh() obliga a recalcularlo todo.
  */
  window.addEventListener("resize", () => {
    ScrollTrigger.refresh();
  });

  /*
    ----------------------------------------------------------
    BLOQUE 18. REFRESH INICIAL
    ----------------------------------------------------------

    Ejecutamos un refresh inicial para que ScrollTrigger mida
    correctamente la escena antes de la primera interaccion.
  */
  ScrollTrigger.refresh();
}
