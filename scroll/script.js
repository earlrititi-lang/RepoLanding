/*
  ------------------------------------------------------------
  BLOQUE 1. REFERENCIAS A ELEMENTOS DEL DOM
  ------------------------------------------------------------

  Necesitamos dos elementos principales para construir el efecto:

  1. pinSection:
     es la parte de la escena que ScrollTrigger dejara fijada.
     Mientras esta zona este "pineada", el usuario sigue haciendo scroll
     pero la imagen visible no cambia de seccion.

  2. videoBlock:
     es el contenedor del video que ira creciendo progresivamente.

  Guardamos ambas referencias al principio para que el resto del script
  sea mas claro y no tengamos que repetir querySelector varias veces.
*/
const pinSection = document.querySelector(".escena__pin");
const videoBlock = document.querySelector(".bloque-video");

/*
  ------------------------------------------------------------
  BLOQUE 2. COMPROBACION DE SEGURIDAD
  ------------------------------------------------------------

  Antes de animar nada comprobamos que:
  - el HTML contiene los elementos necesarios
  - GSAP esta cargado
  - ScrollTrigger esta cargado

  Si alguna de esas piezas falta, el efecto no puede construirse bien.
  En ese caso:
  - mostramos un aviso por consola
  - evitamos que el script siga y provoque errores

  Este patron es util para hacer el codigo mas robusto,
  especialmente cuando se depende de librerias externas.
*/
if (!pinSection || !videoBlock || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
  console.warn("No se pudo iniciar la animacion del video.");
} else {
  /*
    ----------------------------------------------------------
    BLOQUE 3. REGISTRO DEL PLUGIN
    ----------------------------------------------------------

    ScrollTrigger no funciona automaticamente por el mero hecho
    de cargar su script. Primero hay que registrarlo dentro de GSAP.

    Este paso le dice a GSAP:
    "a partir de ahora puedes usar este plugin en mis animaciones".
  */
  gsap.registerPlugin(ScrollTrigger);

  /*
    ----------------------------------------------------------
    BLOQUE 4. AJUSTE INICIAL DEL BLOQUE DE VIDEO
    ----------------------------------------------------------

    Aunque el centrado visual ya esta preparado en CSS,
    aqui reforzamos desde GSAP la forma en la que el bloque
    debe interpretar sus transformaciones.

    xPercent: -50 y yPercent: -50:
    equivalen al translate(-50%, -50%) clasico de CSS.

    ¿Por que repetirlo aqui desde GSAP?
    Porque asi la animacion trabaja siempre con el mismo sistema
    de transformaciones y el punto de referencia queda mejor definido.

    transformOrigin: "center center":
    indica que cualquier escalado o transformacion debe entenderse
    tomando el centro del elemento como origen.
  */
  gsap.set(videoBlock, {
    xPercent: -50,
    yPercent: -50,
    transformOrigin: "center center"
  });

  /*
    ----------------------------------------------------------
    BLOQUE 5. TIMELINE PRINCIPAL
    ----------------------------------------------------------

    Creamos un timeline de GSAP con un scrollTrigger asociado.

    La idea clave de este proyecto es esta:
    ya no lanzamos la expansion del video con un temporizador fijo,
    sino que la conectamos directamente con el scroll del usuario.

    Por tanto:
    - si el usuario hace un poco de scroll, el video crece un poco
    - si hace mucho scroll, el video sigue creciendo
    - si vuelve hacia arriba, el video puede retroceder en su expansion

    Esto produce una sensacion mucho mas interactiva que una animacion
    por tiempo.
  */
  gsap.timeline({
    scrollTrigger: {
      /*
        trigger:
        define que elemento dispara el comienzo del calculo.

        En este caso usamos ".escena", es decir, el contenedor general
        del efecto.
      */
      trigger: ".escena",

      /*
        start: "top top"

        Significa:
        - cuando la parte superior del trigger
        - coincide con la parte superior del viewport

        En ese instante la animacion empieza a estar activa.
      */
      start: "top top",

      /*
        end: "+=130%"

        Indica que la animacion no termina enseguida, sino despues
        de un tramo adicional de scroll relativamente largo.

        Ese tramo extra es lo que permite que la expansion se sienta
        progresiva y no brusca.
      */
      end: "+=130%",

      /*
        scrub: 1.2

        "scrub" vincula el progreso del timeline al progreso del scroll.

        Cuando scrub es numerico, anade una pequena inercia o retraso
        entre el gesto del usuario y la respuesta de la animacion.

        En la practica:
        no responde de forma seca, sino algo mas amortiguada,
        que es precisamente la sensacion que estabas buscando.
      */
      scrub: 1.2,

      /*
        pin: pinSection

        Este es el corazon del efecto visual.

        Mientras dura el tramo de animacion, ScrollTrigger fija visualmente
        la seccion que hemos indicado. Eso provoca que la pantalla parezca
        quieta aunque el usuario siga desplazando la rueda del raton
        o arrastrando la pagina.

        Resultado:
        no vemos "bajar" la pagina, sino crecer el video dentro del mismo encuadre.
      */
      pin: pinSection,

      /*
        anticipatePin:
        ayuda a que el comienzo del pin sea mas suave, reduciendo saltos.

        invalidateOnRefresh:
        obliga a recalcular valores en cada refresh, algo util si cambia
        el tamano de ventana o si el layout se altera.
      */
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  }).to(videoBlock, {
    /*
      --------------------------------------------------------
      BLOQUE 6. PROPIEDADES ANIMADAS
      --------------------------------------------------------

      Aqui definimos el estado final del bloque de video.

      width y height:
      terminan ocupando exactamente el ancho y alto del viewport.

      Usamos funciones en lugar de numeros fijos para que el valor final
      se calcule en tiempo real en cada refresh.
      Asi, si cambia el tamano de la ventana, la animacion se adapta.

      borderRadius: 0
      elimina las esquinas redondeadas al final del proceso.
      La pieza pequena deja de parecer una tarjeta flotante y pasa
      a comportarse como un fondo completo.

      boxShadow: "0 0 0 rgba(0, 0, 0, 0)"
      elimina la sombra al final para que el video se integre totalmente
      en la pantalla y ya no parezca un objeto separado.

      ease: "none"
      es importante aqui porque no queremos una aceleracion artificial
      independiente del scroll.

      Como el ritmo lo marca el usuario al desplazarse, la animacion
      debe seguir ese ritmo de la forma mas directa posible.
    */
    width: () => window.innerWidth,
    height: () => window.innerHeight,
    borderRadius: 0,
    boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
    ease: "none"
  });

  /*
    ----------------------------------------------------------
    BLOQUE 7. RESPUESTA A CAMBIOS DE TAMANO
    ----------------------------------------------------------

    Si el usuario redimensiona la ventana, las medidas del viewport cambian.

    Como nuestro estado final depende de:
    - window.innerWidth
    - window.innerHeight

    necesitamos pedir a ScrollTrigger que recalcule su informacion.

    refresh() vuelve a medir:
    - puntos de inicio y fin
    - posiciones
    - valores dependientes del viewport
  */
  window.addEventListener("resize", () => {
    ScrollTrigger.refresh();
  });

  /*
    ----------------------------------------------------------
    BLOQUE 8. REFRESH INICIAL
    ----------------------------------------------------------

    Ejecutamos un refresh al cargar para asegurarnos de que ScrollTrigger
    mida bien todos los elementos desde el principio.

    Es un buen cierre del proceso de inicializacion porque deja preparada
    la escena antes de que el usuario interactue con ella.
  */
  ScrollTrigger.refresh();
}
