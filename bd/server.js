/*
  Modulos nativos de Node.js que necesitamos:

  - http: para crear el servidor web
  - fs: para leer y escribir archivos
  - path: para construir rutas de forma segura
*/
const http = require("http");
const fs = require("fs");
const path = require("path");

/*
  Puerto del servidor.
  Si existe una variable de entorno PORT la usamos;
  si no, caemos en 3000 como valor por defecto.
*/
const PORT = process.env.PORT || 3000;

/*
  Ruta absoluta al archivo que actuara como base de datos local.
*/
const DB_PATH = path.join(__dirname, "db.json");

/*
  Mapa muy simple de archivos estaticos.
  La clave es la URL solicitada y el valor es el archivo a devolver.
*/
const files = {
  "/": "index.html",
  "/styles.css": "styles.css",
  "/script.js": "script.js"
};

/*
  Si db.json no existe todavia, lo creamos con una estructura minima.
  Esto evita errores en la primera ejecucion.
*/
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
}

/*
  Lee el archivo db.json y lo convierte desde JSON a objeto JavaScript.
*/
function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

/*
  Guarda un objeto JavaScript en db.json con formato legible.
  El "null, 2" sirve para indentar el JSON con 2 espacios.
*/
function saveDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

/*
  Lee el cuerpo de una peticion POST.
  Los datos llegan por fragmentos, asi que los concatenamos hasta el final.
  Despues convertimos la cadena JSON en objeto.
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
  Helper para responder con JSON.
  Recibe:
  - el objeto response
  - el codigo HTTP
  - el objeto de datos a enviar
*/
function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

/*
  Helper para servir un archivo estatico.
  Detecta un tipo MIME basico segun la extension.
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
  Creamos el servidor HTTP.
  La funcion recibe cada peticion entrante y decide como responder.
*/
http.createServer(async (request, response) => {
  /*
    1. Archivos estaticos
    Si la peticion es GET y la URL esta en el mapa "files",
    devolvemos el archivo correspondiente.
  */
  if (request.method === "GET" && files[request.url]) {
    return sendFile(response, files[request.url]);
  }

  /*
    2. Registro de usuario
  */
  if (request.method === "POST" && request.url === "/api/register") {
    /*
      Extraemos los datos enviados por el cliente
      y cargamos la base de datos actual.
    */
    const { name, email, password } = await readBody(request);
    const db = readDb();

    /*
      Validacion minima: todos los campos deben existir.
    */
    if (!name || !email || !password) {
      return sendJson(response, 400, { message: "Completa todos los campos." });
    }

    /*
      Evitamos registrar dos usuarios con el mismo email.
    */
    if (db.users.find((user) => user.email === email)) {
      return sendJson(response, 400, { message: "Ese usuario ya esta registrado." });
    }

    /*
      Si todo es correcto, guardamos el nuevo usuario y respondemos con 201.
      201 significa "recurso creado".
    */
    db.users.push({ name, email, password });
    saveDb(db);
    return sendJson(response, 201, { message: "Usuario registrado correctamente." });
  }

  /*
    3. Login
  */
  if (request.method === "POST" && request.url === "/api/login") {
    /*
      Leemos email y contrasena enviados desde el formulario.
    */
    const { email, password } = await readBody(request);
    const db = readDb();

    /*
      Buscamos un usuario cuyo email y password coincidan.
    */
    const user = db.users.find((item) => item.email === email && item.password === password);

    /*
      Si no existe coincidencia, devolvemos 401.
      401 significa que la autenticacion no ha sido valida.
    */
    if (!user) {
      return sendJson(response, 401, { message: "Usuario no registrado." });
    }

    /*
      Si existe, devolvemos mensaje de login correcto.
    */
    return sendJson(response, 200, { message: "Inicio de sesion correcto." });
  }

  /*
    4. Si ninguna ruta coincide, respondemos con 404.
  */
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("No encontrado");
}).listen(PORT, () => {
  /*
    Mensaje util para saber en que URL se ha levantado el servidor.
  */
  console.log(`Servidor en http://localhost:${PORT}`);
});
