/*
  Modulos nativos de Node.js usados en este servidor:

  - http:
    crea el servidor web sin depender de Express u otros frameworks.

  - fs:
    permite leer y escribir archivos en disco.

  - path:
    construye rutas correctas segun el sistema operativo.
*/
const http = require("http");
const fs = require("fs");
const path = require("path");

/*
  Puerto del servidor.

  Si existe process.env.PORT se respeta ese valor.
  Si no existe, usamos 3000 para poder arrancar facilmente en local.
*/
const PORT = process.env.PORT || 3000;

/*
  Ruta absoluta al archivo JSON que hara de base de datos local.

  __dirname siempre apunta a la carpeta donde esta este server.js.
  De ese modo, aunque ejecutes el comando desde otra ruta,
  el servidor seguira localizando bien db.json.
*/
const DB_PATH = path.join(__dirname, "db.json");

/*
  Mapa de archivos estaticos permitidos.

  Es una solucion minima: si la URL coincide con una de estas claves,
  devolvemos el archivo correspondiente.

  Esto evita tener que montar un sistema mas complejo de rutas estaticas.
*/
const files = {
  "/": "index.html",
  "/styles.css": "styles.css",
  "/script.js": "script.js"
};

/*
  Inicializacion de la "base de datos".

  Si db.json no existe, lo creamos con una estructura inicial:
  {
    "users": []
  }

  Asi nos aseguramos de que las funciones de lectura y escritura
  siempre tengan un archivo valido sobre el que trabajar.
*/
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
}

/*
  Lee db.json y devuelve su contenido como objeto JavaScript.

  Flujo:
  1. leer archivo como texto UTF-8
  2. convertir ese texto JSON a objeto real con JSON.parse
*/
function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

/*
  Guarda un objeto JavaScript dentro de db.json.

  JSON.stringify(data, null, 2):
  - convierte el objeto en JSON
  - con indentacion de 2 espacios para que siga siendo legible a mano
*/
function saveDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

/*
  Lee el cuerpo de una peticion POST.

  En Node.js los datos no llegan de golpe, sino por fragmentos.
  Por eso:
  - acumulamos cada fragmento en la variable "body"
  - cuando termina la llegada ("end"), parseamos el JSON

  Si no llega nada, devolvemos un objeto vacio para evitar fallos
  al hacer JSON.parse de una cadena vacia.
*/
function readBody(request) {
  return new Promise((resolve) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      resolve(JSON.parse(body || "{}"));
    });
  });
}

/*
  Helper para respuestas JSON.

  Lo usamos para no repetir siempre las mismas dos operaciones:
  - writeHead con el Content-Type correcto
  - response.end con JSON.stringify
*/
function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

/*
  Helper para servir un archivo estatico.

  Este proyecto solo necesita HTML, CSS y JS, asi que detectamos
  el tipo MIME de forma muy simple segun la extension del archivo.
*/
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

/*
  Servidor principal.

  Cada vez que llega una peticion, esta funcion decide que hacer segun:
  - metodo HTTP
  - URL solicitada
*/
http.createServer(async (request, response) => {
  /*
    CASO 1: archivos estaticos

    Si la peticion es GET y la URL esta permitida en el mapa "files",
    devolvemos el archivo correspondiente.
  */
  if (request.method === "GET" && files[request.url]) {
    return sendFile(response, files[request.url]);
  }

  /*
    CASO 2: registro de usuario

    El frontend envia nombre, email y password al endpoint /api/register.
  */
  if (request.method === "POST" && request.url === "/api/register") {
    /*
      Leemos el body de la peticion y el estado actual de la base de datos.
    */
    const { name, email, password } = await readBody(request);
    const db = readDb();

    /*
      Validacion minima:
      si falta cualquier dato obligatorio, devolvemos 400.

      400 = bad request
      significa que el cliente ha enviado datos invalidos o incompletos.
    */
    if (!name || !email || !password) {
      return sendJson(response, 400, { message: "Completa todos los campos." });
    }

    /*
      Evitamos duplicados por email.

      .find devuelve el primer usuario que cumpla la condicion.
      Si existe alguno con el mismo email, cancelamos el alta.
    */
    if (db.users.find((user) => user.email === email)) {
      return sendJson(response, 400, { message: "Ese usuario ya esta registrado." });
    }

    /*
      Si todo es correcto, anadimos el usuario al array
      y guardamos la nueva version del archivo.
    */
    db.users.push({ name, email, password });
    saveDb(db);

    /*
      Respondemos con 201.
      201 = recurso creado correctamente.
    */
    return sendJson(response, 201, { message: "Usuario registrado correctamente." });
  }

  /*
    CASO 3: login

    El frontend envia email y password al endpoint /api/login.
  */
  if (request.method === "POST" && request.url === "/api/login") {
    /*
      Leemos credenciales y base de datos actual.
    */
    const { email, password } = await readBody(request);
    const db = readDb();

    /*
      Buscamos un usuario cuyo email y password coincidan.
      Si no encontramos ninguno, el login debe fallar.
    */
    const user = db.users.find((item) => item.email === email && item.password === password);

    /*
      Si no existe coincidencia, devolvemos 401.

      401 = unauthorized
      indica que la autenticacion no es valida.
    */
    if (!user) {
      return sendJson(response, 401, { message: "Usuario no registrado." });
    }

    /*
      Si existe coincidencia, respondemos con exito.
      En un proyecto real aqui podriamos generar una sesion o un token,
      pero en este ejemplo didactico solo devolvemos un mensaje.
    */
    return sendJson(response, 200, { message: "Inicio de sesion correcto." });
  }

  /*
    CASO 4: cualquier otra ruta

    Si no ha coincidido ningun caso anterior, devolvemos 404.
    404 = recurso no encontrado.
  */
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("No encontrado");
}).listen(PORT, () => {
  /*
    Mensaje de confirmacion al arrancar.
    Es util para saber rapidamente en que URL esta escuchando el servidor.
  */
  console.log(`Servidor en http://localhost:${PORT}`);
});
