require("dotenv").config()

const http = require("http")
const fs = require("fs")
const path = require("path")
const Stripe = require("stripe")

const PORT = Number(process.env.PORT || 4242)
const BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`
const STRIPE_API_VERSION = "2026-02-25.clover"
const PUBLIC_DIR = path.join(__dirname, "public")

const staticFiles = {
  "/": "index.html",
  "/index.html": "index.html",
  "/styles.css": "styles.css",
  "/script.js": "script.js",
  "/success.html": "success.html",
  "/success.js": "success.js",
  "/cancel.html": "cancel.html"
}

function getCourseConfig() {
  const amount = Number(process.env.COURSE_PRICE_CENTS || 4900)
  const currency = (process.env.COURSE_CURRENCY || "eur").toLowerCase()

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("COURSE_PRICE_CENTS debe ser un numero entero mayor que cero")
  }

  return {
    title: process.env.COURSE_NAME || "Curso Stripe desde cero",
    description: process.env.COURSE_DESCRIPTION || "Acceso al taller practico para alumnos",
    amount,
    currency
  }
}

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error("Falta STRIPE_SECRET_KEY. Crea el archivo .env antes de intentar cobrar.")
  }

  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION })
}

function formatPrice(amount, currency) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(amount / 100)
}

function getPublicCourse() {
  const course = getCourseConfig()

  return {
    ...course,
    displayAmount: formatPrice(course.amount, course.currency)
  }
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = ""

    request.on("data", (chunk) => {
      body += chunk
    })

    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"))
      } catch (error) {
        reject(new Error("El cuerpo de la peticion no es JSON valido"))
      }
    })

    request.on("error", () => {
      reject(new Error("No se pudo leer el cuerpo de la peticion"))
    })
  })
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  })

  response.end(JSON.stringify(data))
}

function sendFile(response, fileName) {
  const filePath = path.join(PUBLIC_DIR, fileName)

  if (!fs.existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
    response.end("Archivo no encontrado")
    return
  }

  const ext = path.extname(fileName)
  const contentTypeByExt = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8"
  }

  response.writeHead(200, {
    "Content-Type": contentTypeByExt[ext] || "application/octet-stream"
  })

  response.end(fs.readFileSync(filePath))
}

http
  .createServer(async (request, response) => {
    const requestUrl = new URL(request.url, BASE_URL)
    const { pathname, searchParams } = requestUrl

    if (request.method === "GET" && staticFiles[pathname]) {
      return sendFile(response, staticFiles[pathname])
    }

    if (request.method === "GET" && pathname === "/api/course") {
      try {
        return sendJson(response, 200, getPublicCourse())
      } catch (error) {
        return sendJson(response, 500, { message: error.message })
      }
    }

    if (request.method === "GET" && pathname === "/api/session-status") {
      const sessionId = searchParams.get("session_id")

      if (!sessionId) {
        return sendJson(response, 400, { message: "Falta el parametro session_id." })
      }

      try {
        const stripe = getStripeClient()
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        return sendJson(response, 200, {
          id: session.id,
          status: session.status,
          paymentStatus: session.payment_status,
          customerEmail: session.customer_details?.email || session.customer_email || "",
          studentName: session.metadata?.student_name || "",
          amountTotal: session.amount_total,
          currency: session.currency
        })
      } catch (error) {
        console.error("Error al recuperar la sesion de Stripe:", error)
        return sendJson(response, 500, {
          message: "No se pudo consultar el estado de la sesion de pago."
        })
      }
    }

    if (request.method === "POST" && pathname === "/api/create-checkout-session") {
      let body

      try {
        body = await readJsonBody(request)
      } catch (error) {
        return sendJson(response, 400, { message: error.message })
      }

      const studentName = String(body.studentName || "").trim()
      const studentEmail = String(body.studentEmail || "").trim()

      if (!studentName || !studentEmail) {
        return sendJson(response, 400, {
          message: "Nombre y email son obligatorios antes de iniciar el pago."
        })
      }

      try {
        const stripe = getStripeClient()
        const course = getCourseConfig()

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          success_url: `${BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${BASE_URL}/cancel.html`,
          customer_email: studentEmail,
          billing_address_collection: "auto",
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: course.currency,
                unit_amount: course.amount,
                product_data: {
                  name: course.title,
                  description: course.description
                }
              }
            }
          ],
          metadata: {
            student_name: studentName
          }
        })

        return sendJson(response, 200, { url: session.url })
      } catch (error) {
        console.error("Error al crear la sesion de Stripe:", error)
        return sendJson(response, 500, {
          message: "Stripe no pudo crear la sesion de pago. Revisa la clave secreta y la configuracion."
        })
      }
    }

    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
    response.end("Ruta no encontrada")
  })
  .listen(PORT, () => {
    console.log(`Servidor disponible en ${BASE_URL}`)
    console.log(`API de Stripe fijada en ${STRIPE_API_VERSION}`)
  })
