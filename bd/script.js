/*
  Referencias a nodos del DOM.

  Guardamos estas referencias una sola vez al cargar el script.
  Asi evitamos repetir busquedas en el documento y dejamos claro
  que elementos forman parte del flujo principal de la interfaz.
*/
const form = document.getElementById("form");
const title = document.getElementById("title");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submit = document.getElementById("submit");
const toggle = document.getElementById("toggle");
const message = document.getElementById("message");
const formView = document.getElementById("form-view");
const successView = document.getElementById("success-view");

/*
  "mode" representa el estado actual de la interfaz.

  Valores posibles:
  - "register": el formulario crea un nuevo usuario
  - "login": el formulario intenta autenticar un usuario existente

  Este enfoque es muy importante para entender el archivo:
  no tenemos dos pantallas separadas, sino una sola interfaz cuyo
  comportamiento depende del valor de "mode".
*/
let mode = "register";

/*
  render() es la funcion que "pinta" la interfaz segun el estado actual.

  Su trabajo es sincronizar lo que el usuario ve con lo que la variable
  "mode" indica internamente.

  En una aplicacion mayor, esta idea se pareceria a un render de framework,
  pero aqui la hacemos manualmente con JavaScript puro.
*/
function render() {
  /*
    Convertimos la condicion principal en un booleano intermedio.
    Esto mejora la legibilidad del resto del codigo porque luego podemos
    preguntar "si estamos en registro" sin repetir la comparacion completa.
  */
  const register = mode === "register";

  /*
    Actualizamos los textos visibles.

    Fijate en que no hay dos titulos ni dos botones distintos:
    simplemente cambiamos su contenido segun el modo.
  */
  title.textContent = register ? "Registro" : "Login";
  submit.textContent = register ? "Guardar usuario" : "Entrar";
  toggle.textContent = register ? "Ir a login" : "Ir a registro";

  /*
    El campo nombre solo es necesario en registro.

    - En registro se muestra y se vuelve obligatorio
    - En login se oculta y deja de ser required

    Esto evita pedir datos innecesarios al usuario.
  */
  nameInput.style.display = register ? "block" : "none";
  nameInput.required = register;

  /*
    Cada vez que cambiamos de modo, limpiamos cualquier mensaje anterior.
    Asi evitamos que un error de login, por ejemplo, siga visible cuando
    ya hemos vuelto al modo registro.
  */
  message.textContent = "";
}

/*
  Cambio manual entre modos.

  Cuando el usuario pulsa el boton secundario, invertimos el valor de "mode"
  y volvemos a llamar a render() para actualizar la interfaz.
*/
toggle.addEventListener("click", () => {
  mode = mode === "register" ? "login" : "register";
  render();
});

/*
  Gestion del envio del formulario.

  El evento submit sirve tanto para registro como para login.
  Lo que cambia es la URL de la API, que depende del valor de "mode".
*/
form.addEventListener("submit", async (event) => {
  /*
    Evitamos el comportamiento por defecto del navegador, que seria
    recargar la pagina y enviar el formulario de forma clasica.
  */
  event.preventDefault();

  /*
    Construimos el cuerpo de la peticion.

    trim() limpia espacios sobrantes al principio y al final en nombre y email.
    La password no se recorta para no modificar lo que el usuario haya escrito.
  */
  const body = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value
  };

  /*
    Enviamos la peticion al backend.

    /api/register si mode === "register"
    /api/login si mode === "login"

    Content-Type avisa al servidor de que estamos mandando JSON.
    JSON.stringify convierte el objeto body en una cadena JSON real.
  */
  const response = await fetch(`/api/${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  /*
    El backend responde en formato JSON.
    Aqui lo convertimos a objeto JavaScript para poder leer "data.message".
  */
  const data = await response.json();

  /*
    Mostramos siempre el mensaje del servidor, sea exito o error.
    Esto hace que la interfaz sea mas explicita para el usuario.
  */
  message.textContent = data.message;

  /*
    Si la respuesta HTTP no fue correcta, detenemos la ejecucion aqui.

    Ejemplos:
    - 400: datos invalidos o usuario duplicado
    - 401: credenciales incorrectas

    No seguimos con la logica de exito porque el backend ya ha indicado
    que la operacion ha fallado.
  */
  if (!response.ok) {
    return;
  }

  /*
    Caso 1: registro correcto.

    Limpiamos el formulario para dejarlo listo para otro posible alta,
    pero seguimos dentro de la misma vista.
  */
  if (mode === "register") {
    form.reset();
    return;
  }

  /*
    Caso 2: login correcto.

    Ocultamos la vista del formulario y mostramos la vista final.
    Este pequeno cambio de clases es suficiente para cambiar
    por completo lo que el usuario ve en pantalla.
  */
  formView.classList.add("hidden");
  successView.classList.remove("hidden");
});

/*
  Primera sincronizacion de la interfaz.

  Sin esta llamada inicial, el HTML mostraria textos por defecto,
  pero la interfaz no estaria garantizada como reflejo exacto del estado.
*/
render();
