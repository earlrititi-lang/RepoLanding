/*
  Referencias a los elementos del DOM que vamos a manipular.
  Las guardamos una sola vez para no estar buscandolas repetidamente.
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
  "mode" indica en que estado esta la interfaz:
  - "register" para crear un usuario
  - "login" para iniciar sesion
*/
let mode = "register";

/*
  Esta funcion sincroniza la interfaz con el modo actual.
  Cada vez que cambia mode, llamamos a render() para actualizar:
  - titulo
  - texto del boton principal
  - texto del boton de cambio
  - visibilidad del campo nombre
  - validacion del campo nombre
*/
function render() {
  /*
    Convertimos la comparacion en una variable booleana para que el
    codigo sea mas facil de leer despues.
  */
  const register = mode === "register";

  /*
    Cambiamos los textos visibles de la interfaz.
  */
  title.textContent = register ? "Registro" : "Login";
  submit.textContent = register ? "Guardar usuario" : "Entrar";
  toggle.textContent = register ? "Ir a login" : "Ir a registro";

  /*
    El campo nombre solo tiene sentido durante el registro.
    En login se oculta y deja de ser obligatorio.
  */
  nameInput.style.display = register ? "block" : "none";
  nameInput.required = register;

  /*
    Limpiamos el mensaje anterior cada vez que cambiamos de modo
    para no mostrar errores o exitos desactualizados.
  */
  message.textContent = "";
}

/*
  Al pulsar el boton de cambio, alternamos entre registro y login
  y redibujamos la interfaz.
*/
toggle.addEventListener("click", () => {
  mode = mode === "register" ? "login" : "register";
  render();
});

/*
  Manejamos el envio del formulario de manera asincrona.
  async/await hace que el flujo se lea casi como si fuera sincrono.
*/
form.addEventListener("submit", async (event) => {
  /*
    Evitamos que el navegador recargue la pagina al enviar el formulario.
  */
  event.preventDefault();

  /*
    Construimos el cuerpo JSON que enviaremos al servidor.
    trim() elimina espacios sobrantes al principio y al final.
  */
  const body = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value
  };

  /*
    Llamamos a la API correspondiente segun el modo actual.
    Ejemplos:
    - /api/register
    - /api/login
  */
  const response = await fetch(`/api/${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  /*
    La respuesta del servidor se convierte a objeto JavaScript.
  */
  const data = await response.json();

  /*
    Mostramos el mensaje que envía el backend.
  */
  message.textContent = data.message;

  /*
    Si la respuesta no fue correcta, paramos aqui.
    De esta forma no seguimos ejecutando logica de exito.
  */
  if (!response.ok) {
    return;
  }

  /*
    En registro, si todo ha ido bien, limpiamos el formulario
    y nos quedamos en la misma vista.
  */
  if (mode === "register") {
    form.reset();
    return;
  }

  /*
    En login correcto ocultamos el formulario y mostramos la vista final.
  */
  formView.classList.add("hidden");
  successView.classList.remove("hidden");
});

/*
  Llamamos a render() una vez al cargar para que la interfaz inicial
  quede sincronizada con mode = "register".
*/
render();
