/*
  Guardamos una referencia al contenedor que va a crecer.
  Sobre este elemento anadiremos la clase "expandido".
*/
const bloqueVideo = document.querySelector(".bloque-video");

/*
  Guardamos una referencia al propio elemento <video>.
  Lo usamos para escuchar eventos de reproduccion y progreso.
*/
const videoCentral = document.querySelector(".video-central");

/*
  Solo ejecutamos la logica si ambos elementos existen.
  Esta comprobacion evita errores si el HTML cambia o si el script
  se carga en una pagina donde no existe esta estructura.
*/
if (bloqueVideo && videoCentral) {
  /*
    Esta bandera evita repetir la expansion varias veces.
    Una vez el video crece, ya no hace falta volver a aplicar la clase.
  */
  let videoExpandido = false;

  /*
    Aqui guardamos el identificador del setTimeout.
    Lo usamos para saber si ya hay una cuenta atras en marcha.
  */
  let temporizadorExpansion = null;

  /*
    Esta funcion concentra la accion principal:
    anadir la clase CSS que convierte el bloque en pantalla completa visual.
  */
  const expandirVideo = () => {
    /*
      Si el video ya se expandio, salimos inmediatamente.
      Esto evita trabajo duplicado y estados innecesarios.
    */
    if (videoExpandido) {
      return;
    }

    /*
      La clase "expandido" activa las reglas CSS de tamano final.
    */
    bloqueVideo.classList.add("expandido");

    /*
      Marcamos el estado como completado para no repetir la animacion.
    */
    videoExpandido = true;
  };

  /*
    Esta funcion arranca una cuenta atras para expandir el video
    unos segundos despues de que empiece a reproducirse.
  */
  const iniciarTemporizador = () => {
    /*
      Si ya se expandio o ya existe un temporizador activo, no hacemos nada.
      Asi nos protegemos de varios eventos "playing".
    */
    if (videoExpandido || temporizadorExpansion !== null) {
      return;
    }

    /*
      Programamos la expansion automatica.
      El callback ejecutara expandirVideo tras el tiempo indicado.
    */
    temporizadorExpansion = window.setTimeout(expandirVideo, 3000);
  };

  /*
    Si el video ya estuviera reproduciendose cuando entra el script,
    arrancamos el temporizador en ese mismo momento.
  */
  if (!videoCentral.paused) {
    iniciarTemporizador();
  }

  /*
    "playing" se dispara cuando el video realmente empieza a reproducirse.
    Usamos { once: true } para escuchar este evento una sola vez.
  */
  videoCentral.addEventListener("playing", iniciarTemporizador, { once: true });

  /*
    Como refuerzo, escuchamos "timeupdate".
    Este evento llega cada cierto tiempo mientras el video avanza.

    Si el video alcanza 5 segundos de reproduccion real, forzamos la expansion.
    Esto sirve como respaldo si el temporizador no fuera suficiente.
  */
  videoCentral.addEventListener("timeupdate", () => {
    if (videoCentral.currentTime >= 5) {
      expandirVideo();
    }
  });
}
