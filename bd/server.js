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
