# Documentacion Didactica: Login, Registro y Base de Datos Local con JSON

## 1. Introduccion

Este proyecto es una version intencionadamente simple de un sistema de registro y login.

La idea no es construir una aplicacion profesional ni segura para produccion. La idea es que un alumno pueda entender:

- que papel tiene el HTML
- que papel tiene el CSS
- que papel tiene JavaScript en el navegador
- por que hace falta un backend
- como se guardan datos en un archivo JSON
- por que usamos `npm start`
- como se conectan todas las piezas

En otras palabras: aqui no buscamos "la mejor arquitectura", sino una arquitectura muy facil de explicar.

## 2. Que hace exactamente la aplicacion

La aplicacion permite dos acciones:

1. Registrar un usuario con nombre, email y contrasena.
2. Iniciar sesion con email y contrasena.

Ademas, muestra mensajes distintos segun el caso:

- Si el registro sale bien: `Usuario registrado correctamente.`
- Si el login falla: `Usuario no registrado.`
- Si el login sale bien: se oculta el formulario y aparece un mensaje final en la misma pagina:
  `Inicio de sesion correcto`
  `Datos guardados en db.json.`

## 3. Esquema general del proyecto

La estructura del proyecto es esta:

```text
Landing-Contenidos/
|-- index.html
|-- styles.css
|-- script.js
|-- server.js
|-- db.json
|-- package.json
```

Cada archivo tiene una responsabilidad muy concreta:

- `index.html`: la pagina y sus elementos.
- `styles.css`: el aspecto visual.
- `script.js`: la logica del navegador.
- `server.js`: el servidor backend.
- `db.json`: la "base de datos" local.
- `package.json`: la forma comoda de arrancar el proyecto con `npm`.

## 4. Por que necesitamos un backend

Esta es una de las ideas mas importantes para explicar a los alumnos.

Muchos principiantes piensan algo parecido a esto:

> "Si tengo un formulario en HTML y JavaScript, por que no guardo los datos directamente en un archivo JSON?"

La respuesta corta es:

**Porque el navegador no puede escribir libremente en los archivos del proyecto.**

El navegador puede:

- mostrar una pagina
- recoger lo que el usuario escribe
- enviar datos por red
- cambiar el contenido visible de la pagina

Pero el navegador no debe poder hacer esto sin control:

- abrir cualquier archivo del ordenador
- modificar `db.json`
- escribir dentro de la carpeta del proyecto

Eso seria un problema enorme de seguridad.

### 4.1 Entonces, quien guarda los datos

Los datos los guarda el **backend**.

En este proyecto, el backend es `server.js`, un servidor hecho con Node.js.

Su trabajo es:

1. Escuchar peticiones del navegador.
2. Recibir los datos del formulario.
3. Leer el archivo `db.json`.
4. Cambiar el contenido si hace falta.
5. Volver a guardar el archivo.
6. Responder al navegador con un mensaje.

### 4.2 Idea clave para clase

Puedes explicarlo asi:

```text
Frontend = la cara visible
Backend  = el que trabaja por detras
JSON     = donde se guardan los datos
```

O asi:

```text
Alumno ve el formulario
        |
        v
El navegador recoge los datos
        |
        v
Los envia al servidor
        |
        v
El servidor decide que hacer
        |
        v
Lee y guarda en db.json
        |
        v
Responde al navegador
        |
        v
El navegador muestra el mensaje final
```

## 5. Por que usamos npm para iniciar la web

Otra pregunta frecuente es:

> "Si esto es una web, por que no hago doble clic en `index.html` y ya esta?"

La respuesta es:

**Porque aqui no solo hay una pagina web. Tambien hay un servidor.**

Si abres `index.html` sin servidor:

- el HTML se veria
- el CSS seguramente tambien
- el formulario apareceria
- pero `fetch("/api/register")` y `fetch("/api/login")` no funcionarian como toca

Eso pasa porque esas rutas pertenecen al backend.

### 5.1 Por que esas rutas no existen por si solas

Aqui hay una idea fundamental:

`/api/register` y `/api/login` **no son archivos**.

No son esto:

- `/pagina.html`
- `/foto.png`
- `/styles.css`

Tampoco son funciones internas del navegador.

Son **rutas HTTP** que el navegador intenta llamar por red, esperando que algun servidor las reciba.

Es decir, cuando en `script.js` hacemos esto:

```js
fetch("/api/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});
```

el navegador esta diciendo algo parecido a:

> "Quiero enviar una peticion POST a la direccion `/api/register`.  
> Quien este escuchando esa direccion, que reciba estos datos y me conteste."

Pero esa direccion no se atiende sola.

Tiene que existir un programa ejecutandose que diga:

- "si me llega una peticion a `/api/register`, hago el registro"
- "si me llega una peticion a `/api/login`, compruebo el login"

Ese programa es `server.js`.

### 5.2 Que pasa si abro `index.html` con doble clic

Si haces doble clic en `index.html`, normalmente el navegador lo abre asi:

```text
file:///C:/Users/...
```

Eso significa:

- estas viendo un archivo local
- pero no hay servidor HTTP arrancado
- por tanto, no hay backend funcionando

Entonces el navegador puede mostrarte la interfaz, porque HTML y CSS si se pueden abrir como archivo local.

Pero cuando el usuario pulsa el boton y `script.js` intenta hacer:

```js
fetch("/api/register")
```

aparece el problema:

- el navegador intenta llamar a una ruta
- pero no hay ningun servidor escuchando
- nadie recibe esa peticion
- nadie puede leer `db.json`
- nadie puede guardar el usuario
- nadie puede responder con un mensaje

Dicho de forma muy simple:

```text
Sin servidor hay formulario
Pero no hay "oficina" que procese el formulario
```

### 5.3 Que pasa cuando si arrancamos el servidor

Cuando ejecutamos:

```bash
npm start
```

ocurre esto:

```text
npm start
-> ejecuta node server.js
-> server.js arranca un servidor en localhost:3000
-> el servidor queda escuchando peticiones
```

La palabra importante aqui es **escuchando**.

Escuchar significa:

> "El servidor se queda esperando a que lleguen peticiones del navegador para responderlas."

En ese momento ya existe alguien que puede atender estas direcciones:

- `GET /`
- `GET /styles.css`
- `GET /script.js`
- `POST /api/register`
- `POST /api/login`

Ahora si el navegador manda una peticion a `/api/register`, `server.js` la recibe.

### 5.4 Flujo real completo con servidor arrancado

El flujo correcto es este:

```text
1. El usuario abre http://localhost:3000
2. El servidor envia index.html
3. El navegador carga styles.css y script.js
4. El usuario rellena el formulario
5. script.js hace fetch("/api/register") o fetch("/api/login")
6. server.js recibe la peticion
7. server.js lee db.json
8. server.js guarda o comprueba los datos
9. server.js responde con un JSON
10. script.js muestra el mensaje en pantalla
```

### 5.5 La diferencia entre servir archivos y atender API

Otra idea importante para clase es que el mismo servidor hace dos trabajos distintos.

#### Trabajo 1: servir archivos

Cuando el navegador pide:

- `/`
- `/styles.css`
- `/script.js`

el servidor simplemente devuelve archivos.

#### Trabajo 2: atender la API

Cuando el navegador pide:

- `/api/register`
- `/api/login`

el servidor no devuelve archivos.

Lo que hace es ejecutar logica:

- leer datos enviados
- validar
- consultar `db.json`
- guardar o comprobar informacion
- devolver una respuesta JSON

O sea:

```text
Rutas normales -> devuelven archivos
Rutas /api     -> ejecutan logica
```

### 5.6 Por que el navegador no puede hacerlo todo solo

El navegador puede:

- leer lo que escribe el usuario
- cambiar textos en pantalla
- enviar peticiones

Pero el navegador no debe poder:

- modificar libremente archivos del proyecto
- escribir en `db.json` directamente
- actuar como servidor backend

Por eso hace falta un programa aparte, que es Node ejecutando `server.js`.

### 5.7 Explicacion para alumnos muy principiantes

Una forma muy simple de explicarlo es esta:

```text
HTML muestra el formulario
JavaScript recoge los datos
El servidor recibe esos datos
El servidor guarda en db.json
El servidor responde
JavaScript muestra el resultado
```

Y otra explicacion aun mas visual:

```text
Frontend = mostrador
Backend  = oficina de tramites
db.json  = archivador
```

Si el mostrador existe pero la oficina esta cerrada:

- el cliente puede rellenar el papel
- pero nadie lo tramita

Eso es exactamente lo que pasa si abres solo `index.html` sin arrancar `server.js`.

### 5.8 Que hace `npm start`

En `package.json` tenemos esto:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

Eso significa:

- cuando escribimos `npm start`
- Node ejecuta `server.js`
- y `server.js` levanta el servidor web

Ese servidor hace dos cosas a la vez:

1. Sirve los archivos del frontend (`index.html`, `styles.css`, `script.js`).
2. Atiende las rutas del backend (`/api/register` y `/api/login`).

### 5.9 Explicacion muy simple

`npm` no "pinta" la web.

`npm` simplemente es una forma comoda de lanzar comandos definidos en `package.json`.

En este caso:

```text
npm start
   ->
node server.js
   ->
se inicia el servidor
   ->
la web funciona completa
```

## 6. Funcion de cada archivo

## 6.1 index.html

Es el esqueleto de la pagina.

Contiene:

- un formulario
- un boton para cambiar entre registro y login
- una zona para mensajes
- una zona oculta para mostrar el exito del login

### Codigo de `index.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login y registro</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="card">
    <div id="form-view">
      <h1 id="title">Registro</h1>

      <form id="form">
        <input id="name" type="text" placeholder="Nombre">
        <input id="email" type="email" placeholder="Email" required>
        <input id="password" type="password" placeholder="Contrasena" required minlength="6">
        <button id="submit" type="submit">Guardar usuario</button>
      </form>

      <p id="message"></p>
      <button id="toggle" type="button">Ir a login</button>
    </div>

    <div id="success-view" class="hidden">
      <h1>Inicio de sesion correcto</h1>
      <p>Datos guardados en <code>db.json</code>.</p>
    </div>
  </main>

  <script src="script.js"></script>
</body>
</html>
```

### Explicacion por bloques

#### `<!DOCTYPE html>`

Le dice al navegador que el documento es HTML5.

#### `<meta charset="UTF-8">`

Indica la codificacion del texto.

#### `<link rel="stylesheet" href="styles.css">`

Conecta el HTML con el CSS.

#### `<main class="card">`

Es el contenedor principal de la pagina.

#### `<div id="form-view">`

Es la parte que se ve al principio: formulario, titulo, mensaje y boton para cambiar de modo.

#### `<form id="form">`

Es el formulario que envia datos al backend.

#### `<input id="name">`

Solo se usa en el registro.

#### `<input id="email">`

Se usa tanto para registro como para login.

#### `<input id="password">`

Se usa tanto para registro como para login.

#### `<p id="message"></p>`

Aqui aparecen mensajes como:

- `Usuario registrado correctamente.`
- `Usuario no registrado.`

#### `<button id="toggle">`

Sirve para cambiar entre modo registro y modo login.

#### `<div id="success-view" class="hidden">`

Esta parte empieza oculta.

Solo se muestra cuando el login sale bien.

## 6.2 styles.css

Este archivo solo controla el aspecto visual.

No guarda datos.
No valida usuarios.
No toma decisiones de login.

### Codigo de `styles.css`

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: Arial, sans-serif;
  background: #f4f4f4;
}

.card {
  width: min(90%, 360px);
  padding: 24px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  text-align: center;
}

form {
  display: grid;
  gap: 12px;
}

input,
button {
  padding: 12px;
  font: inherit;
}

button {
  cursor: pointer;
}

#message {
  min-height: 24px;
  color: #444;
}

.hidden {
  display: none;
}
```

### Lo importante para entender

- `body` centra la tarjeta en pantalla.
- `.card` crea la caja blanca.
- `form` coloca los inputs en columna.
- `.hidden` oculta elementos.

La clase `.hidden` es especialmente importante porque permite hacer esto:

- al principio se oculta la vista de exito
- despues del login correcto, JavaScript quita esa clase

## 6.3 script.js

Este archivo contiene la logica del frontend.

Es decir:

- controla el formulario
- cambia entre registro y login
- envia datos al backend
- muestra mensajes
- cambia la vista si el login es correcto

### Codigo de `script.js`

```js
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

let mode = "register";

function render() {
  const register = mode === "register";
  title.textContent = register ? "Registro" : "Login";
  submit.textContent = register ? "Guardar usuario" : "Entrar";
  toggle.textContent = register ? "Ir a login" : "Ir a registro";
  nameInput.style.display = register ? "block" : "none";
  nameInput.required = register;
  message.textContent = "";
}

toggle.addEventListener("click", () => {
  mode = mode === "register" ? "login" : "register";
  render();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const body = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value
  };

  const response = await fetch(`/api/${mode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  message.textContent = data.message;

  if (!response.ok) {
    return;
  }

  if (mode === "register") {
    form.reset();
    return;
  }

  formView.classList.add("hidden");
  successView.classList.remove("hidden");
});

render();
```

### Explicacion linea por linea por bloques

#### 1. Captura de elementos del DOM

```js
const form = document.getElementById("form");
const title = document.getElementById("title");
...
```

Aqui JavaScript busca elementos del HTML para poder trabajar con ellos.

Es como decir:

"Guardame una referencia al formulario, al titulo, al input del email, al boton, etc."

Sin esto, JavaScript no podria cambiar textos, leer valores o mostrar mensajes.

#### 2. Variable de estado

```js
let mode = "register";
```

Esta variable dice en que modo estamos:

- `register`
- `login`

Es una idea muy importante: la interfaz cambia segun el valor de una variable.

#### 3. Funcion `render()`

```js
function render() {
  const register = mode === "register";
  title.textContent = register ? "Registro" : "Login";
  submit.textContent = register ? "Guardar usuario" : "Entrar";
  toggle.textContent = register ? "Ir a login" : "Ir a registro";
  nameInput.style.display = register ? "block" : "none";
  nameInput.required = register;
  message.textContent = "";
}
```

Esta funcion "pinta" el estado correcto en pantalla.

Si estamos en registro:

- el titulo pone `Registro`
- el boton principal pone `Guardar usuario`
- el boton secundario pone `Ir a login`
- el campo nombre se ve

Si estamos en login:

- el titulo pone `Login`
- el boton principal pone `Entrar`
- el boton secundario pone `Ir a registro`
- el campo nombre se oculta

Es decir:

**La funcion `render()` no guarda datos. Solo actualiza la interfaz.**

#### 4. Cambio entre registro y login

```js
toggle.addEventListener("click", () => {
  mode = mode === "register" ? "login" : "register";
  render();
});
```

Cuando se pulsa el boton de cambiar modo:

1. se cambia el valor de `mode`
2. se vuelve a llamar a `render()`

Esto hace que la pagina se adapte al nuevo modo.

#### 5. Envio del formulario

```js
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  ...
});
```

Cuando el usuario envia el formulario:

- se activa el evento `submit`
- `event.preventDefault()` evita que la pagina se recargue

Eso es importante porque queremos controlar nosotros el envio con JavaScript.

#### 6. Construccion del objeto `body`

```js
const body = {
  name: nameInput.value.trim(),
  email: emailInput.value.trim(),
  password: passwordInput.value
};
```

Aqui reunimos los datos escritos por el usuario.

Despues esos datos se enviaran al backend.

#### 7. Llamada al backend con `fetch`

```js
const response = await fetch(`/api/${mode}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});
```

Esta es una de las lineas mas importantes del proyecto.

Si `mode` vale `"register"`, la ruta sera:

```text
/api/register
```

Si `mode` vale `"login"`, la ruta sera:

```text
/api/login
```

`fetch` envia los datos al servidor.

#### 8. Lectura de la respuesta

```js
const data = await response.json();
message.textContent = data.message;
```

El servidor responde con JSON. Por ejemplo:

```json
{ "message": "Usuario registrado correctamente." }
```

Despues, el frontend coge ese mensaje y lo escribe en pantalla.

#### 9. Si hubo error

```js
if (!response.ok) {
  return;
}
```

Si el servidor responde con error, paramos aqui.

Por ejemplo:

- usuario ya registrado
- usuario no registrado

En ese caso, el mensaje ya se ha mostrado y no hace falta seguir.

#### 10. Si el registro fue bien

```js
if (mode === "register") {
  form.reset();
  return;
}
```

Si estamos registrando y todo va bien:

- limpiamos el formulario
- salimos

#### 11. Si el login fue bien

```js
formView.classList.add("hidden");
successView.classList.remove("hidden");
```

Esto cambia la pantalla:

- oculta el formulario
- muestra el bloque de exito

No hay cambio de pagina. Todo sucede dentro del mismo `index.html`.

#### 12. `render();`

```js
render();
```

Se llama al final para dibujar el estado inicial.

Sin esta linea, la interfaz podria no arrancar en el modo correcto.

## 6.4 server.js

Este archivo es el corazon del backend.

### Que hace

- crea un servidor
- sirve archivos del frontend
- recibe datos del formulario
- lee y guarda `db.json`
- responde al navegador

### Codigo de `server.js`

```js
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "db.json");
const files = {
  "/": "index.html",
  "/styles.css": "styles.css",
  "/script.js": "script.js"
};

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
}

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function readBody(request) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => body += chunk);
    request.on("end", () => resolve(JSON.parse(body || "{}")));
  });
}

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

function sendFile(response, fileName) {
  const filePath = path.join(__dirname, fileName);
  const content = fs.readFileSync(filePath);
  const type = fileName.endsWith(".css")
    ? "text/css; charset=utf-8"
    : fileName.endsWith(".js")
      ? "application/javascript; charset=utf-8"
      : "text/html; charset=utf-8";

  response.writeHead(200, { "Content-Type": type });
  response.end(content);
}

http.createServer(async (request, response) => {
  if (request.method === "GET" && files[request.url]) {
    return sendFile(response, files[request.url]);
  }

  if (request.method === "POST" && request.url === "/api/register") {
    const { name, email, password } = await readBody(request);
    const db = readDb();

    if (!name || !email || !password) {
      return sendJson(response, 400, { message: "Completa todos los campos." });
    }

    if (db.users.find((user) => user.email === email)) {
      return sendJson(response, 400, { message: "Ese usuario ya esta registrado." });
    }

    db.users.push({ name, email, password });
    saveDb(db);
    return sendJson(response, 201, { message: "Usuario registrado correctamente." });
  }

  if (request.method === "POST" && request.url === "/api/login") {
    const { email, password } = await readBody(request);
    const db = readDb();
    const user = db.users.find((item) => item.email === email && item.password === password);

    if (!user) {
      return sendJson(response, 401, { message: "Usuario no registrado." });
    }

    return sendJson(response, 200, { message: "Inicio de sesion correcto." });
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("No encontrado");
}).listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
```

### Explicacion por bloques

#### 1. Modulos usados

```js
const http = require("http");
const fs = require("fs");
const path = require("path");
```

- `http`: crea el servidor.
- `fs`: lee y escribe archivos.
- `path`: construye rutas de archivo de forma segura.

#### 2. Constantes principales

```js
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, "db.json");
```

- `PORT`: el puerto donde escucha el servidor.
- `DB_PATH`: la ruta al archivo `db.json`.

#### 3. Mapa de archivos

```js
const files = {
  "/": "index.html",
  "/styles.css": "styles.css",
  "/script.js": "script.js"
};
```

Este objeto sirve para decir:

- si piden `/`, envio `index.html`
- si piden `/styles.css`, envio `styles.css`
- si piden `/script.js`, envio `script.js`

#### 4. Crear `db.json` si no existe

```js
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
}
```

Esto evita errores la primera vez.

Si el archivo no existe, lo crea con esta estructura:

```json
{
  "users": []
}
```

#### 5. Leer la base de datos

```js
function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}
```

Pasos:

1. lee el archivo como texto
2. convierte el texto JSON en objeto JavaScript
3. devuelve ese objeto

#### 6. Guardar la base de datos

```js
function saveDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}
```

Pasos:

1. recibe un objeto JavaScript
2. lo convierte en JSON
3. lo escribe dentro de `db.json`

Esta funcion es la clave de la persistencia.

#### 7. Leer el cuerpo de la peticion

```js
function readBody(request) {
  return new Promise((resolve) => {
    let body = "";
    request.on("data", (chunk) => body += chunk);
    request.on("end", () => resolve(JSON.parse(body || "{}")));
  });
}
```

Cuando el navegador envia datos al backend, esos datos llegan en trozos.

Esta funcion:

- va acumulando esos trozos
- cuando termina, convierte el texto en JSON
- devuelve el resultado

#### 8. Enviar JSON al frontend

```js
function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}
```

Sirve para responder cosas como:

```json
{ "message": "Usuario registrado correctamente." }
```

#### 9. Enviar archivos del frontend

```js
function sendFile(response, fileName) {
  ...
}
```

Esta funcion se encarga de devolver al navegador:

- HTML
- CSS
- JavaScript

Sin esta funcion, el navegador no recibiria la pagina ni sus archivos asociados.

#### 10. Ruta GET

```js
if (request.method === "GET" && files[request.url]) {
  return sendFile(response, files[request.url]);
}
```

Esto significa:

si el navegador pide un archivo del frontend, se lo enviamos.

#### 11. Ruta POST `/api/register`

```js
if (request.method === "POST" && request.url === "/api/register") {
  ...
}
```

Aqui se procesa el registro.

Pasos:

1. leer datos enviados
2. leer `db.json`
3. comprobar si faltan campos
4. comprobar si el email ya existe
5. guardar el nuevo usuario
6. responder con mensaje de exito

La linea clave es esta:

```js
db.users.push({ name, email, password });
```

Aqui el nuevo usuario se mete dentro del array `users`.

Despues:

```js
saveDb(db);
```

Eso escribe el nuevo contenido en el archivo.

#### 12. Ruta POST `/api/login`

```js
if (request.method === "POST" && request.url === "/api/login") {
  ...
}
```

Aqui se valida el login.

Pasos:

1. leer email y password enviados
2. leer `db.json`
3. buscar un usuario con ese email y esa password
4. si no existe, devolver error
5. si existe, devolver exito

La busqueda se hace aqui:

```js
const user = db.users.find((item) => item.email === email && item.password === password);
```

Es una busqueda muy simple:

- mismo email
- misma contrasena

#### 13. Respuesta 404

```js
response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
response.end("No encontrado");
```

Si llega una ruta que no existe, el servidor responde con error 404.

#### 14. Arranque del servidor

```js
}).listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
```

Esto pone el servidor a escuchar en el puerto indicado.

## 6.5 db.json

Este archivo actua como una base de datos local muy basica.

### Contenido

```json
{
  "users": []
}
```

Cuando se registra un usuario, pasa a algo parecido a esto:

```json
{
  "users": [
    {
      "name": "Ana",
      "email": "ana@test.com",
      "password": "123456"
    }
  ]
}
```

### Importante para clase

Esto no es una base de datos real como MySQL, PostgreSQL o MongoDB.

Pero para enseñar la idea de persistencia es perfecto, porque:

- se ve el archivo
- se entiende el contenido
- se puede abrir con cualquier editor
- el alumno ve que los datos "quedan guardados"

## 6.6 package.json

Este archivo define informacion del proyecto y comandos utiles.

### Contenido

```json
{
  "name": "landing-contenidos-auth-local",
  "version": "1.0.0",
  "private": true,
  "description": "Login y registro con persistencia en JSON local",
  "scripts": {
    "start": "node server.js"
  }
}
```

### Lo importante

Lo mas importante aqui es:

```json
"start": "node server.js"
```

Gracias a eso podemos arrancar todo con:

```bash
npm start
```

## 7. Como ocurre la persistencia

Persistencia significa:

**que los datos no desaparecen cuando termina la ejecucion.**

Por ejemplo:

- si un alumno se registra
- y luego cierra la web
- y mas tarde vuelve a abrirla
- el usuario sigue estando en `db.json`

Eso pasa porque no estamos guardando los datos en una variable temporal, sino en un archivo real.

### Esquema de persistencia

```text
Usuario rellena formulario
        |
        v
script.js envia datos con fetch
        |
        v
server.js recibe los datos
        |
        v
readDb() lee db.json
        |
        v
se modifica el array users
        |
        v
saveDb() vuelve a escribir db.json
        |
        v
el archivo queda guardado en disco
```

### Diferencia entre memoria y persistencia

#### En memoria

```js
let users = [];
```

Si el servidor se apaga, se pierde.

#### Persistente

```js
saveDb(db);
```

Si el servidor se apaga, el archivo queda guardado.

## 8. Flujo completo del registro

### Paso a paso

1. El usuario escribe nombre, email y contrasena.
2. Pulsa `Guardar usuario`.
3. `script.js` detecta el `submit`.
4. `script.js` envia los datos a `/api/register`.
5. `server.js` recibe los datos.
6. `server.js` lee `db.json`.
7. Comprueba si faltan campos.
8. Comprueba si el email ya existe.
9. Si todo esta bien, mete el usuario en `users`.
10. Guarda `db.json`.
11. Devuelve `Usuario registrado correctamente.`
12. El frontend muestra ese mensaje.

### Esquema visual

```text
Formulario
   |
   v
POST /api/register
   |
   v
Servidor
   |
   +--> valida datos
   |
   +--> lee db.json
   |
   +--> agrega usuario
   |
   +--> guarda db.json
   |
   v
Respuesta JSON
   |
   v
Mensaje en pantalla
```

## 9. Flujo completo del login

### Paso a paso

1. El usuario cambia a modo login.
2. Escribe email y contrasena.
3. Pulsa `Entrar`.
4. `script.js` envia los datos a `/api/login`.
5. `server.js` lee `db.json`.
6. Busca si hay un usuario con ese email y esa contrasena.
7. Si no lo encuentra, responde `Usuario no registrado.`
8. Si lo encuentra, responde `Inicio de sesion correcto.`
9. El frontend recibe la respuesta.
10. Si hubo exito, oculta el formulario.
11. Muestra el bloque final con `Datos guardados en db.json.`

### Esquema visual

```text
Formulario login
   |
   v
POST /api/login
   |
   v
Servidor busca usuario en db.json
   |
   +--> no existe -> "Usuario no registrado."
   |
   +--> existe -> "Inicio de sesion correcto."
                    |
                    v
          script.js cambia la vista
                    |
                    v
      aparece el mensaje final en index.html
```

## 10. Que es frontend y que es backend en este proyecto

### Frontend

Es lo que se ejecuta en el navegador:

- `index.html`
- `styles.css`
- `script.js`

Responsabilidades del frontend:

- mostrar la interfaz
- leer lo que escribe el usuario
- enviar peticiones
- mostrar mensajes
- cambiar entre vistas

### Backend

Es lo que se ejecuta en Node.js:

- `server.js`

Responsabilidades del backend:

- servir archivos
- recibir datos
- validar informacion
- leer `db.json`
- guardar `db.json`
- responder al navegador

## 11. Por que esta version es buena para enseñar

Porque reduce la cantidad de conceptos a lo esencial:

- no hay frameworks
- no hay librerias externas
- no hay base de datos compleja
- no hay sesiones
- no hay tokens
- no hay hashes
- no hay componentes
- no hay build

Solo hay:

- HTML
- CSS
- JavaScript
- Node.js
- JSON

Eso permite enseñar la idea principal sin distraer al alumno.

## 12. Limites de esta version

Tambien es importante explicarle esto a los alumnos:

Esta version es didactica, no profesional.

### Limitaciones

- la contrasena se guarda en texto plano
- no hay cifrado
- no hay sesiones
- no hay cookies
- no hay control real de seguridad
- no hay validaciones avanzadas
- si dos peticiones escribieran a la vez podria haber problemas

Esto no invalida la practica. Solo significa que esta pensada para aprender conceptos.

## 13. Resumen final para explicar en clase

Si quieres dar una explicacion muy simple, puedes usar esta:

> Tenemos una pagina con un formulario.  
> El formulario puede funcionar en modo registro o en modo login.  
> Cuando el usuario envia el formulario, el navegador manda los datos al servidor usando `fetch`.  
> El servidor recibe esos datos, abre `db.json`, comprueba la informacion y responde con un mensaje.  
> Si es registro, guarda el nuevo usuario en el archivo.  
> Si es login, comprueba si ese usuario existe.  
> Si el login es correcto, la propia pagina oculta el formulario y muestra un mensaje final.  
> Usamos `npm start` porque necesitamos arrancar el backend, no solo abrir el HTML.

## 14. Resumen ultra simple para alumnos muy principiantes

```text
HTML  = crea la pagina
CSS   = la pone bonita
JS    = le da comportamiento
Node  = hace de servidor
JSON  = guarda los datos
npm   = arranca el servidor
```

## 15. Preguntas tipicas que pueden hacer los alumnos

### "Por que no guardamos en una variable normal?"

Porque una variable se pierde cuando el programa termina. Un archivo no.

### "Por que usamos fetch?"

Porque `fetch` sirve para enviar peticiones HTTP desde el navegador al servidor.

### "Por que el login no busca en HTML?"

Porque HTML solo muestra la interfaz. Los datos guardados estan en `db.json`, y quien puede leer ese archivo es el backend.

### "Por que npm start en vez de abrir index.html?"

Porque hace falta arrancar el servidor para que funcionen las rutas `/api/register` y `/api/login`.

### "Que es db.json?"

Un archivo JSON que usamos como base de datos local muy simple.

## 16. Conclusiones

Este proyecto ensena una idea fundamental del desarrollo web:

**una aplicacion web suele dividirse en frontend y backend.**

El frontend recoge lo que hace el usuario.
El backend decide que hacer con esa informacion.
La persistencia ocurre cuando el backend guarda datos en un medio estable, en este caso un archivo JSON.

Aunque la aplicacion es pequena, aqui ya estan presentes muchos conceptos clave:

- formularios
- eventos
- peticiones HTTP
- rutas
- lectura de archivos
- escritura de archivos
- persistencia
- separacion entre cliente y servidor

Por eso esta version es una muy buena base para ensenar.
