# Guia didactica - Pasarela de pago con Stripe

## Objetivo de esta guia

Esta guia esta pensada para explicar el proyecto en clase de forma secuencial.

No esta escrita como un resumen rapido, sino como un recorrido docente por bloques funcionales. La idea es que puedas hacer dos cosas con el mismo documento:

- replicar la implementacion paso a paso
- explicarla a los alumnos siguiendo un orden claro

El proyecto actual implementa un flujo basico de pago puntual con Stripe Checkout.

## Regla del taller

A partir de este punto, cada avance tecnico debe quedar reflejado aqui.

Eso significa:

- si cambiamos codigo, actualizamos la guia
- si cambiamos flujo, actualizamos la guia
- si comprobamos algo importante, lo anotamos en la bitacora

Esta guia es a la vez:

- material didactico
- bitacora de implementacion real

## Como usar esta guia en clase

La secuencia recomendada es esta:

1. Preparacion del entorno.
2. Explicacion de la arquitectura general.
3. Construccion por bloques funcionales.
4. Pruebas parciales despues de cada bloque.
5. Prueba completa final.
6. Revision de lo que aun no existe y de los siguientes pasos.

No conviene empezar por Stripe directamente. Primero hay que dejar claro que el proyecto tiene dos partes:

- frontend: recoge datos y redirige
- backend: configura el producto, habla con Stripe y valida lo importante

Documento complementario para la explicacion oral:

- `GUION-CLASE.md`: texto orientativo para explicar cada bloque en voz alta

## Arquitectura general del proyecto

Estructura actual:

```text
pago/
  .env
  .env.example
  .gitignore
  GUIA-STRIPE.md
  package.json
  package-lock.json
  server.js
  public/
    cancel.html
    index.html
    script.js
    styles.css
    success.html
    success.js
```

Responsabilidad de cada parte:

- `server.js`: servidor HTTP, configuracion del producto, conexion con Stripe y endpoints API
- `public/index.html`: landing con formulario previo al pago
- `public/script.js`: carga datos del curso y solicita la sesion de Checkout
- `public/success.html`: pantalla de vuelta cuando el usuario completa el pago
- `public/success.js`: consulta el estado de la sesion a Stripe a traves del backend
- `public/cancel.html`: pantalla de vuelta cuando el usuario cancela el flujo
- `.env`: configuracion privada local
- `.env.example`: plantilla de variables de entorno

## Por que se ha elegido Stripe Checkout

Para un primer ejercicio docente, Stripe Checkout es la opcion mas solida.

Motivos:

- Stripe aloja el formulario de pago
- no manejamos datos de tarjeta en nuestro servidor
- el flujo se entiende de extremo a extremo con pocos archivos
- es mas facil explicar la arquitectura antes de entrar en webhooks o persistencia real

En terminos de integracion, este proyecto usa:

- pago puntual
- Checkout Sessions
- backend Node.js minimo
- frontend HTML, CSS y JavaScript sin framework

## Cuentas de Stripe y modo de trabajo

Esta parte hay que explicarla muy pronto para evitar confusion.

Hay dos papeles distintos:

- desarrollador de la integracion
- comprador final

Regla clave:

- el desarrollador si necesita cuenta de Stripe
- el comprador no necesita cuenta de Stripe

Para que un alumno construya y pruebe esta pasarela por su cuenta necesita:

- una cuenta gratuita de Stripe
- acceso al modo test
- una `STRIPE_SECRET_KEY` de pruebas

Para hacer un pago de prueba en Checkout no hace falta cuenta de Stripe. Solo hace falta abrir la pagina y usar una tarjeta de prueba.

## Preparacion del aula

Antes de empezar a picar codigo, cada alumno deberia tener resuelto esto:

- cuenta de Stripe creada
- modo test activo en el dashboard
- clave secreta localizada
- proyecto abierto en local
- Node instalado
- terminal funcionando

Checklist rapido para el profesor:

- comprobar que Stripe se abre en la red del aula
- comprobar que `npm install` funciona
- comprobar que el puerto `4242` esta libre
- recordar que no se comparte la `STRIPE_SECRET_KEY`
- recordar la diferencia entre clave publica y clave secreta

## Comandos base del proyecto

Secuencia minima en PowerShell:

```powershell
cd c:\Users\lorit\OneDrive\Escritorio\Landing-Contenidos\pago
npm install
Copy-Item .env.example .env
notepad .env
npm start
```

Comprobacion rapida de la API:

```powershell
Invoke-WebRequest http://localhost:4242/api/course | Select-Object -ExpandProperty Content
```

Abrir la app en navegador:

```powershell
start http://localhost:4242
```

Detener el servidor:

```powershell
Ctrl + C
```

## Bloque 0 - Preparar dependencias y entorno

### Objetivo

Dejar el proyecto arrancable y con acceso a Stripe en modo test.

### Archivos implicados

- `package.json`
- `.env.example`
- `.env`

### Que se construye en este bloque

1. Dependencias de Node.
2. Variables de entorno.
3. Clave secreta de Stripe en local.

### Que hay que explicar a los alumnos

`stripe` es el SDK oficial para hablar con la API de Stripe desde Node.

`dotenv` sirve para cargar variables desde `.env` en `process.env`.

No ponemos la clave dentro del codigo porque:

- seria inseguro
- dificultaria cambiar entre test y live
- obligaria a tocar codigo para cambiar configuracion

### Contenido actual de ejemplo de `.env`

```env
STRIPE_SECRET_KEY=sk_test_...
PUBLIC_BASE_URL=http://localhost:4242
COURSE_NAME=Curso Stripe desde cero
COURSE_DESCRIPTION=Acceso al taller practico para alumnos
COURSE_PRICE_CENTS=4900
COURSE_CURRENCY=eur
```

### Prueba de este bloque

El bloque se considera correcto cuando:

- `npm install` termina sin errores
- `.env` existe
- `STRIPE_SECRET_KEY` esta definida

### Idea docente importante

El alumno debe entender que en una pasarela de pago la configuracion critica vive en el backend y fuera del repositorio publico.

## Bloque 1 - Arranque del servidor y carga de configuracion

### Objetivo

Levantar un servidor minimo en Node y cargar la configuracion al arrancar.

### Archivo principal

- `server.js`

### Codigo que abre este bloque

```js
require("dotenv").config()

const http = require("http")
const fs = require("fs")
const path = require("path")
const Stripe = require("stripe")

const PORT = Number(process.env.PORT || 4242)
const BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`
const STRIPE_API_VERSION = "2026-02-25.clover"
const PUBLIC_DIR = path.join(__dirname, "public")
```

### Explicacion paso a paso

`require("dotenv").config()`:

- lee el archivo `.env`
- mete sus valores dentro de `process.env`
- permite que el resto del servidor use esas variables

`http`:

- crea el servidor web sin Express

`fs`:

- permite leer archivos del disco

`path`:

- construye rutas seguras en Windows y otros sistemas

`Stripe`:

- crea el cliente del SDK oficial

`PORT`:

- define el puerto del servidor
- por defecto usamos `4242`

`BASE_URL`:

- es la URL base publica de la aplicacion
- Stripe la necesita para construir `success_url` y `cancel_url`

`STRIPE_API_VERSION`:

- fija la version de API que usa el cliente de Stripe

`PUBLIC_DIR`:

- apunta a la carpeta donde estan HTML, CSS y JS del frontend

### Que hay que remarcar en clase

No estamos usando Express a proposito.

Motivo docente:

- reduce el ruido
- deja mas clara la relacion entre ruta, peticion y respuesta
- permite centrarse en Stripe y en la arquitectura del flujo

### Prueba de este bloque

Arrancar el servidor:

```powershell
npm start
```

Resultado esperado en consola:

- el servidor anuncia `http://localhost:4242`
- no hay errores de arranque

## Bloque 2 - Servir archivos estaticos

### Objetivo

Permitir que el backend entregue las paginas HTML, el CSS y el JavaScript del frontend.

### Parte del codigo implicada

```js
const staticFiles = {
  "/": "index.html",
  "/index.html": "index.html",
  "/styles.css": "styles.css",
  "/script.js": "script.js",
  "/success.html": "success.html",
  "/success.js": "success.js",
  "/cancel.html": "cancel.html"
}
```

y la funcion:

```js
function sendFile(response, fileName) {
  const filePath = path.join(PUBLIC_DIR, fileName)
  ...
}
```

### Explicacion paso a paso

El servidor mantiene un mapa simple entre URL y archivo.

Ejemplos:

- `/` devuelve `index.html`
- `/styles.css` devuelve la hoja de estilos
- `/success.html` devuelve la pantalla final

La funcion `sendFile`:

- construye la ruta real del archivo
- comprueba que exista
- detecta el tipo de contenido por extension
- devuelve el contenido al navegador

### Que hay que remarcar en clase

Este servidor no es un framework completo.

Es un servidor didactico con una responsabilidad muy concreta:

- servir una interfaz minima
- ofrecer una API minima
- conectar con Stripe

### Prueba de este bloque

Con el servidor arrancado:

```powershell
Invoke-WebRequest http://localhost:4242/ | Select-Object -ExpandProperty StatusCode
```

Resultado esperado:

```text
200
```

## Bloque 3 - Definir el producto en el backend

### Objetivo

Centralizar en el servidor la informacion del producto y del precio.

### Funciones implicadas

```js
function getCourseConfig() {
  ...
}

function formatPrice(amount, currency) {
  ...
}

function getPublicCourse() {
  ...
}
```

### Que hace cada funcion

`getCourseConfig()`:

- lee el nombre del curso
- lee la descripcion
- lee el precio en centimos
- lee la moneda
- valida que el precio sea un entero positivo

`formatPrice()`:

- transforma `4900` y `eur` en un precio legible como `49,00 EUR`

`getPublicCourse()`:

- toma la configuracion interna
- genera una version apta para mostrar en el frontend

### Por que este bloque es importante

El precio no debe confiarse al navegador.

Si el alumno entiende esta idea, entiende una de las reglas mas importantes de un sistema de pagos:

- el frontend puede mostrar
- el backend decide

### Endpoint asociado

```js
if (request.method === "GET" && pathname === "/api/course") {
  return sendJson(response, 200, getPublicCourse())
}
```

### Que devuelve

Devuelve algo asi:

```json
{
  "title": "Curso Stripe desde cero",
  "description": "Acceso al taller practico para alumnos",
  "amount": 4900,
  "currency": "eur",
  "displayAmount": "49,00 EUR"
}
```

### Prueba de este bloque

```powershell
Invoke-WebRequest http://localhost:4242/api/course | Select-Object -ExpandProperty Content
```

### Resultado esperado

El navegador o la terminal reciben los datos del curso correctamente.

## Bloque 4 - Construir la landing y el formulario previo

### Objetivo

Mostrar al usuario el producto y recoger los datos minimos antes de saltar a Stripe.

### Archivos implicados

- `public/index.html`
- `public/styles.css`

### Que hace la pagina principal

La landing contiene dos partes:

- una tarjeta visual con el curso y el precio
- un formulario con nombre y email del alumno

Campos usados:

- `student-name`
- `student-email`

Boton principal:

- `submit-button`

Zona de mensajes:

- `message`

### Por que se pide nombre y email antes de Stripe

Porque queremos:

- identificar al alumno
- asociar el pago a una persona
- mandar esos datos al backend antes de crear la sesion

### Que hay que remarcar en clase

El formulario previo no cobra nada.

Su unica responsabilidad es recoger informacion y pedir al backend una sesion de Checkout.

### Prueba de este bloque

Abrir:

```powershell
start http://localhost:4242
```

Resultado esperado:

- se ve la landing
- se ve el precio
- se puede escribir en los inputs

## Bloque 5 - Cargar el producto desde el frontend

### Objetivo

Hacer que el frontend pida el producto al backend en lugar de tenerlo quemado en el HTML.

### Archivo implicado

- `public/script.js`

### Funcion principal de este bloque

```js
async function loadCourse() {
  const response = await fetch("/api/course")
  const data = await response.json()
  ...
}
```

### Explicacion paso a paso

Cuando se carga la pagina:

1. `fetch("/api/course")` llama al backend.
2. El backend responde con JSON.
3. El frontend lee ese JSON.
4. El frontend rellena:
   - `course-title`
   - `course-description`
   - `course-price`

### Por que esta decision es buena didacticamente

Permite explicar muy pronto una idea arquitectonica correcta:

- el backend es la fuente de verdad del producto
- el frontend solo lo presenta

### Prueba de este bloque

Recargar la pagina y comprobar:

- el titulo deja de decir `Cargando curso...`
- aparece el nombre del curso
- aparece el precio real

## Bloque 6 - Recoger el formulario y pedir la sesion de pago

### Objetivo

Capturar nombre y email en el navegador y enviarlos al backend para iniciar el checkout.

### Archivo implicado

- `public/script.js`

### Parte del codigo implicada

```js
form.addEventListener("submit", async (event) => {
  event.preventDefault()
  ...
  const response = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      studentName: studentNameInput.value.trim(),
      studentEmail: studentEmailInput.value.trim()
    })
  })
  ...
})
```

### Explicacion paso a paso

`event.preventDefault()`:

- evita el envio clasico del formulario
- nos deja controlar el flujo con JavaScript

Se recogen los valores:

- `studentName`
- `studentEmail`

Luego se hace un `POST` con JSON a:

- `/api/create-checkout-session`

Mientras se procesa:

- el boton se desactiva
- el texto cambia a `Preparando checkout...`

Si algo falla:

- se muestra un mensaje en pantalla
- el boton vuelve a activarse

### Que hay que remarcar en clase

El frontend no crea directamente el checkout en Stripe.

Siempre habla primero con el backend.

## Bloque 7 - Crear la Checkout Session en el backend

### Objetivo

Construir en el servidor la sesion real de Stripe Checkout.

### Ruta implicada

- `POST /api/create-checkout-session`

### Flujo interno del endpoint

1. Leer el cuerpo JSON.
2. Validar nombre y email.
3. Crear cliente Stripe.
4. Leer la configuracion del curso.
5. Crear la sesion con `stripe.checkout.sessions.create(...)`.
6. Devolver al frontend la URL de Checkout.

### Parte central del codigo

```js
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
```

### Explicacion detallada de cada campo

`mode: "payment"`:

- indica que estamos ante un pago puntual

`success_url`:

- URL a la que Stripe redirige si el pago termina
- incluye `session_id` para poder consultar despues la sesion

`cancel_url`:

- URL a la que Stripe redirige si el usuario abandona el flujo

`customer_email`:

- manda a Stripe el email que recogimos antes

`billing_address_collection: "auto"`:

- deja que Stripe pida direccion si la necesita

`line_items`:

- define que producto se esta cobrando
- incluye cantidad, moneda, importe y datos visibles del producto

`metadata.student_name`:

- guarda el nombre del alumno dentro de la sesion
- luego puede recuperarse para mostrarlo o enlazarlo con una matricula

### Idea docente importante

Este es el bloque mas importante de toda la practica.

Aqui los alumnos deben entender tres reglas:

1. la sesion se crea en el backend
2. el precio se define en el backend
3. Stripe devuelve una URL, no un formulario que nosotros hayamos construido

### Prueba de este bloque

Si el servidor esta arrancado:

```powershell
Invoke-WebRequest http://localhost:4242/api/create-checkout-session `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"studentName":"Ada Lovelace","studentEmail":"ada@example.com"}' `
  | Select-Object -ExpandProperty Content
```

Resultado esperado:

- un JSON con una propiedad `url`
- esa URL apunta a `checkout.stripe.com`

## Bloque 8 - Redirigir al usuario a Stripe Checkout

### Objetivo

Hacer que el navegador abandone nuestra pagina y vaya a la pagina segura de Stripe.

### Archivo implicado

- `public/script.js`

### Linea clave

```js
window.location.href = data.url
```

### Explicacion

El backend responde con una URL de Stripe.

El frontend no procesa el pago. Solo redirige al usuario a esa URL.

Esto permite:

- delegar la captura de tarjeta en Stripe
- reducir complejidad
- evitar que nuestro servidor toque datos de tarjeta

### Prueba de este bloque

Rellenar el formulario y pulsar el boton.

Resultado esperado:

- el navegador sale de nuestra app
- se abre Stripe Checkout

## Bloque 9 - Volver desde Stripe y consultar el estado de la sesion

### Objetivo

Recibir al usuario de vuelta y mostrarle informacion real de la sesion creada.

### Archivos implicados

- `public/success.html`
- `public/success.js`
- `server.js`

### Flujo completo

1. Stripe redirige a `success.html?session_id=...`
2. `success.js` lee `session_id` desde la URL
3. `success.js` llama a `/api/session-status`
4. El backend consulta a Stripe
5. El frontend pinta los datos en pantalla

### Funcion principal del frontend

```js
async function loadSessionStatus() {
  const sessionId = new URLSearchParams(window.location.search).get("session_id")
  ...
  const response = await fetch(`/api/session-status?session_id=${encodeURIComponent(sessionId)}`)
  ...
}
```

### Endpoint del backend

El backend hace esto:

```js
const session = await stripe.checkout.sessions.retrieve(sessionId)
```

y devuelve:

- `id`
- `status`
- `paymentStatus`
- `customerEmail`
- `studentName`
- `amountTotal`
- `currency`

### Que se muestra en la pantalla de exito

- alumno
- email
- estado de la sesion
- estado del pago

### Que hay que remarcar en clase

Volver a `success.html` no es lo mismo que tener persistencia real.

Esta pantalla sirve para una primera practica, pero en un sistema serio aun faltaria:

- webhook
- base de datos
- confirmacion persistente

### Prueba de este bloque

Despues de crear una sesion pero antes de pagar, si se consulta el endpoint:

- `status` suele aparecer como `open`
- `paymentStatus` suele aparecer como `unpaid`

Despues de completar el pago, esos valores deberian cambiar.

## Bloque 10 - Gestionar la cancelacion

### Objetivo

Explicar que crear una sesion no equivale a completar un cobro.

### Archivo implicado

- `public/cancel.html`

### Idea docente

Este bloque es pequeno, pero conceptualmente importante.

Si el usuario cancela:

- la sesion existio
- Stripe pudo redirigir
- el pago no se completo

Eso ayuda a explicar la diferencia entre:

- intento de pago
- pago completado

## Bloque 11 - Prueba manual completa

### Objetivo

Comprobar el flujo de extremo a extremo como lo haria un alumno.

### Secuencia

1. Arrancar el servidor con `npm start`.
2. Abrir `http://localhost:4242`.
3. Comprobar que se ve el curso y el precio.
4. Escribir nombre y email.
5. Pulsar `Ir a pagar con Stripe`.
6. Verificar que abre Stripe Checkout.
7. Pagar con tarjeta de prueba.
8. Verificar la vuelta a `success.html`.
9. Repetir la prueba cancelando para comprobar `cancel.html`.

### Tarjeta de prueba

```text
4242 4242 4242 4242
```

Usar tambien:

- cualquier fecha futura
- cualquier CVC de tres cifras
- cualquier codigo postal valido

### Resultado esperado

Al final de la prueba, el alumno debe poder afirmar:

- mi app arranca
- mi backend crea una sesion real de Stripe
- Stripe me redirige a su Checkout
- vuelvo a mi app al completar o cancelar

## Bloque 12 - Donde verlo en el dashboard de Stripe

### Objetivo

Aprender a verificar el resultado tambien fuera de la aplicacion.

### Donde mirar

Siempre en modo `test`.

Zonas utiles del dashboard:

- `Payments`
- `Customers`
- logs o eventos API del area de desarrolladores

Tambien puedes buscar:

- el email del alumno
- el identificador `cs_test_...`

### Que deberias ver

- el importe del cobro
- el email asociado
- el estado del pago
- la sesion de Checkout asociada

### Idea docente

Es importante que el alumno aprenda a comprobar el flujo en dos sitios:

- en su propia app
- en el dashboard de Stripe

## Bloque 13 - Diagnostico si algo falla

### Fallos mas comunes

- `.env` no existe
- `STRIPE_SECRET_KEY` esta mal copiada
- se ha usado una clave publica en lugar de la secreta
- el servidor no se ha reiniciado tras cambiar `.env`
- el puerto `4242` esta ocupado
- se ha abierto el HTML directamente sin arrancar el servidor

### Orden correcto de revision

1. Comprobar que `.env` existe.
2. Comprobar que la clave empieza por `sk_test_`.
3. Comprobar que `npm install` se ejecuto.
4. Comprobar que `npm start` esta activo.
5. Comprobar que `http://localhost:4242/api/course` responde.
6. Comprobar que el formulario redirige a Stripe.

## Bloque 14 - Lo que este proyecto todavia no hace

Este paso 1 es intencionadamente basico.

Todavia no incluye:

- webhooks
- persistencia local de pagos
- base de datos
- matricula real asociada al cobro
- panel de administracion
- reconciliacion automatica del pago

### Por que esto esta bien para clase

Porque no conviene mezclar demasiados conceptos a la vez.

El orden correcto es:

1. entender el flujo general
2. crear la sesion
3. redirigir
4. volver y consultar
5. despues introducir persistencia y webhooks

## Bloque 15 - Siguientes pasos naturales

### Paso 2 sugerido

Guardar el intento de compra en un JSON o en una base de datos local.

Objetivo:

- registrar el alumno
- registrar el `session.id`
- dejar trazabilidad local

### Paso 3 sugerido

Implementar el webhook `checkout.session.completed`.

Objetivo:

- confirmar el pago desde un evento del servidor
- dejar de depender solo de la vuelta del navegador

### Paso 4 sugerido

Asociar el pago confirmado a una matricula real.

## Bloque 16 - Guion breve para explicar el proyecto en clase

Si quieres hacer una explicacion oral rapida, este orden suele funcionar bien:

1. Tenemos una landing propia.
2. La landing no cobra, solo recoge datos.
3. El frontend pide al backend una sesion de Checkout.
4. El backend crea esa sesion en Stripe.
5. Stripe devuelve una URL segura.
6. El navegador redirige a Stripe.
7. Stripe devuelve al usuario a nuestra app.
8. Nuestra app consulta el estado real de la sesion.

Ese guion suele bastar para que los alumnos entiendan el flujo completo antes de entrar en el codigo.

## Referencias oficiales utiles

- API keys: `https://docs.stripe.com/keys`
- activacion de cuenta: `https://docs.stripe.com/get-started/account/activate`
- Checkout Sessions frente a otros enfoques: `https://docs.stripe.com/payments/checkout-sessions-and-payment-intents-comparison`
- Checkout Sessions API: `https://docs.stripe.com/api/checkout/sessions/create`

## Bitacora de avances del taller

### Estado actual del proyecto

Hasta este momento se ha hecho esto:

1. Se creo la carpeta `pago`.
2. Se creo un servidor minimo en `server.js`.
3. Se creo el frontend base en `public/`.
4. Se configuro Stripe Checkout como flujo inicial.
5. Se anadio `.env.example`.
6. Se creo `.env` local.
7. Se configuro una `STRIPE_SECRET_KEY` de test real.
8. Se verifico `GET /api/course`.
9. Se verifico `POST /api/create-checkout-session`.
10. Se verifico `GET /api/session-status`.
11. Se dejo la landing funcionando en local.
12. Se reescribio esta guia por bloques funcionales para poder replicar la practica paso a paso en clase.
13. Se creo `GUION-CLASE.md` como documento separado para la explicacion oral bloque a bloque.

### Regla para seguir avanzando

Cada nuevo paso tecnico debe dejar dos rastros:

- el cambio en codigo
- el cambio en esta guia
