# Guion de clase - Pasarela de pago con Stripe

## Objetivo de este documento

Este archivo no sustituye a `GUIA-STRIPE.md`.

Su funcion es distinta:

- `GUIA-STRIPE.md` explica la implementacion tecnica
- `GUION-CLASE.md` te da un texto orientativo para explicarlo en voz alta

La idea es que puedas abrir ambos a la vez:

- la guia tecnica para seguir el orden de construccion
- este guion para saber que contar en cada bloque

## Como usar este guion

Forma recomendada de trabajo:

1. Abres el bloque correspondiente en `GUIA-STRIPE.md`.
2. Implementas o enseñas el codigo.
3. Usas el texto de este documento como guion oral.
4. Haces una mini prueba antes de pasar al siguiente bloque.

No hace falta leerlo palabra por palabra. Esta escrito para que te sirva como base.

## Bloque 0 - Preparar dependencias y entorno

### Lo que digo en clase

En este primer bloque no estamos construyendo el pago todavia. Estamos preparando el terreno para que el proyecto pueda hablar con Stripe de forma segura.

Aqui aparecen dos ideas muy importantes. La primera es que necesitamos el SDK oficial de Stripe para Node, porque el navegador no debe crear pagos reales por su cuenta. La segunda es que la clave secreta no se pone en el codigo, sino en un archivo `.env`, porque esa clave pertenece al backend y no debe circular por el frontend ni por el repositorio.

Si un alumno entiende este bloque, ya entiende una regla central de cualquier pasarela: lo sensible vive en servidor.

### Mensaje clave

Sin configuracion no hay integracion. Antes de cobrar, hay que preparar el entorno.

### Pregunta para los alumnos

Por que no ponemos la `STRIPE_SECRET_KEY` dentro de `script.js`?

## Bloque 1 - Arranque del servidor y carga de configuracion

### Lo que digo en clase

Ahora levantamos un servidor minimo en Node. No usamos Express porque quiero que se vea la mecanica real sin capas extra. Este servidor va a tener tres trabajos: servir nuestros archivos, exponer una API muy pequena y hablar con Stripe.

Al arrancar, el servidor lee `.env`, fija el puerto, construye la URL base y prepara el cliente de Stripe. Esta parte es importante porque demuestra que Stripe no se integra solo desde el navegador. El navegador participa, pero la pieza que manda de verdad es el backend.

### Mensaje clave

El backend es el punto de control de la pasarela.

### Pregunta para los alumnos

Que dos datos del arranque necesita Stripe mas adelante para construir el flujo?

## Bloque 2 - Servir archivos estaticos

### Lo que digo en clase

Antes de hablar de cobros necesitamos poder abrir una pagina. Por eso este bloque se centra en servir HTML, CSS y JavaScript. No parece muy relacionado con Stripe, pero lo esta: sin una interfaz minima no tenemos desde donde iniciar el checkout ni a donde volver despues.

Fijaos en que el servidor mantiene un mapa muy simple entre rutas y archivos. Esto nos viene bien en clase porque se entiende rapido y deja claro que nuestro proyecto tiene dos caras: unas rutas sirven paginas y otras rutas sirven datos.

### Mensaje clave

Una pasarela web necesita interfaz y API. Las dos conviven en el mismo proyecto.

### Pregunta para los alumnos

Que diferencia hay entre pedir `/` y pedir `/api/course`?

## Bloque 3 - Definir el producto en el backend

### Lo que digo en clase

Aqui aparece una decision de arquitectura muy importante: el producto y el precio se definen en el servidor, no en el navegador. El navegador puede mostrar esa informacion, pero no debe decidirla.

Esto importa mucho en pagos porque cualquier valor que dependa del frontend puede ser manipulado. Por eso el backend lee nombre, descripcion, importe y moneda desde su propia configuracion y luego expone una version publica para la interfaz.

Si los alumnos se quedan solo con una idea de este bloque, que sea esta: en pagos, el frontend muestra y el backend decide.

### Mensaje clave

El importe nunca se debe fiar al navegador.

### Pregunta para los alumnos

Si alguien cambia el HTML desde el inspector y pone `1 euro`, que deberia seguir cobrando el servidor?

## Bloque 4 - Construir la landing y el formulario previo

### Lo que digo en clase

En este bloque construimos la cara visible de la aplicacion. La landing ensena el producto y el formulario recoge nombre y email del alumno antes de salir hacia Stripe.

Es importante explicar que esto todavia no es el pago. Esta pagina no procesa la tarjeta ni crea el cobro. Su funcion es simplemente capturar informacion previa para que el backend pueda construir la sesion de Checkout con contexto real.

### Mensaje clave

La landing prepara el pago, pero no lo ejecuta.

### Pregunta para los alumnos

Por que tiene sentido pedir nombre y email antes de abrir Stripe?

## Bloque 5 - Cargar el producto desde el frontend

### Lo que digo en clase

Ahora hacemos que la pagina no tenga el producto escrito a mano. En lugar de eso, la interfaz lo pide al backend mediante `/api/course`. Esto es una mejora tecnica y tambien una mejora docente, porque enseña una separacion correcta de responsabilidades.

La interfaz pregunta. El backend responde. La interfaz pinta. El backend conserva la autoridad. Ese patron se repetira en el resto del flujo.

### Mensaje clave

El frontend consume datos; el backend conserva la fuente de verdad.

### Pregunta para los alumnos

Que ventaja tiene cargar el precio por API en vez de escribirlo directamente en el HTML?

## Bloque 6 - Recoger el formulario y pedir la sesion de pago

### Lo que digo en clase

En este punto el usuario ya puede escribir su nombre y su email. Cuando pulsa el boton, el navegador no se va todavia a Stripe por arte de magia. Lo que hace primero es mandar esos datos a nuestro backend.

Eso es lo importante de este bloque: el frontend no crea el pago, solicita al backend que prepare el pago. Mientras tanto, desactivamos el boton y mostramos un mensaje para que la interfaz sea coherente y el usuario no pulse varias veces.

### Mensaje clave

El navegador no abre Stripe por su cuenta; se lo pide al servidor.

### Pregunta para los alumnos

Que datos estamos enviando al backend antes de crear la sesion?

## Bloque 7 - Crear la Checkout Session en el backend

### Lo que digo en clase

Este es el bloque nuclear del proyecto. Aqui es donde de verdad nace la integracion con Stripe. El backend recibe nombre y email, valida que existan, toma la configuracion del curso y construye una `Checkout Session`.

Quiero que aqui los alumnos lean con calma cada campo: `mode`, `success_url`, `cancel_url`, `customer_email`, `line_items`, `metadata`. Cada uno cuenta una parte de la historia del pago. Stripe no solo necesita saber cuanto cobrar, tambien necesita saber a donde devolver al usuario y que informacion asociar a la sesion.

La `metadata` es especialmente buena para explicar integraciones reales, porque permite guardar contexto propio, como el nombre del alumno o mas adelante un identificador de matricula.

### Mensaje clave

La sesion de Checkout se crea en servidor y resume todo el contexto del pago.

### Pregunta para los alumnos

Por que `success_url` incluye `session_id` y por que eso nos viene bien despues?

## Bloque 8 - Redirigir al usuario a Stripe Checkout

### Lo que digo en clase

Una vez que Stripe devuelve la URL de Checkout, nuestra app ya no necesita mostrar nada mas. Lo correcto es redirigir al navegador a esa URL. Eso significa que el usuario sale temporalmente de nuestra pagina y entra en la pagina segura de Stripe.

Aqui conviene recalcar que nosotros no estamos pintando inputs de tarjeta. Esa responsabilidad la tiene Stripe. Es una decision tecnica buena y, para un primer proyecto, simplifica mucho la integracion.

### Mensaje clave

Nosotros iniciamos el flujo; Stripe captura el pago.

### Pregunta para los alumnos

Quien construye la pantalla de tarjeta en este proyecto, nosotros o Stripe?

## Bloque 9 - Volver desde Stripe y consultar el estado de la sesion

### Lo que digo en clase

Cuando el usuario termina en Stripe, vuelve a nuestra aplicacion con un `session_id` en la URL. Ese dato es la llave que nos permite preguntar al backend por el estado real de la sesion.

La pantalla `success.html` no inventa nada. Lee el `session_id`, llama a `/api/session-status` y el backend consulta a Stripe. Esto es importante porque hace que la informacion que mostramos venga de una fuente real y no de suposiciones del navegador.

Tambien es un buen momento para explicar una advertencia pedagogica: esta pantalla vale para una primera practica, pero todavia no sustituye a un webhook ni a una persistencia real.

### Mensaje clave

La pantalla de exito debe apoyarse en datos reales de Stripe, no en intuiciones del frontend.

### Pregunta para los alumnos

Que diferencia hay entre volver a `success.html` y tener el pago confirmado de forma persistente?

## Bloque 10 - Gestionar la cancelacion

### Lo que digo en clase

Este bloque es pequeno, pero conceptualmente es muy importante. Queremos que el alumno vea que crear una sesion no significa haber cobrado. Puede existir la sesion y, aun asi, el usuario cancelar el proceso.

La pantalla de cancelacion sirve justo para eso: para mostrar que el flujo tuvo un intento, pero no un cierre exitoso. Esta diferencia entre intento y confirmacion es clave en cualquier sistema de pagos.

### Mensaje clave

Sesion creada no significa pago completado.

### Pregunta para los alumnos

Si un usuario llega a `cancel.html`, significa que Stripe fallo o que el usuario abandono?

## Bloque 11 - Prueba manual completa

### Lo que digo en clase

Ahora toca probar el flujo completo como si fueramos un alumno real. Entramos en la landing, escribimos nombre y email, pulsamos el boton, salimos a Stripe, usamos una tarjeta de prueba y comprobamos la vuelta.

En una clase esta parte no se deberia hacer deprisa. Conviene ir narrando lo que ocurre: primero nuestra app, luego el backend, luego Stripe, luego la vuelta a nuestra app. Si el alumno sigue esa pelicula mental, entiende la arquitectura completa.

### Mensaje clave

Probar el flujo completo sirve para unir todas las piezas del proyecto.

### Pregunta para los alumnos

En que momento exacto abandonamos nuestra web y entramos en Stripe?

## Bloque 12 - Donde verlo en el dashboard de Stripe

### Lo que digo en clase

No basta con mirar nuestra propia app. Un desarrollador de pagos tambien debe saber comprobar el resultado en el dashboard de Stripe. Por eso revisamos `Payments`, `Customers` y, si hace falta, los logs de API.

Este bloque ayuda a que el alumno entienda que Stripe no es una caja negra. Podemos contrastar lo que vemos en la interfaz con lo que Stripe ha registrado de verdad.

### Mensaje clave

Una integracion se verifica tanto en la app como en el dashboard de Stripe.

### Pregunta para los alumnos

Si acabas de pagar, donde buscarias primero ese movimiento en Stripe?

## Bloque 13 - Diagnostico si algo falla

### Lo que digo en clase

Cuando algo falla en una pasarela, no conviene improvisar. Lo correcto es revisar siempre en el mismo orden: configuracion, claves, arranque del servidor, respuesta de la API y solo despues el flujo visual.

Este bloque tambien sirve para enseñar disciplina tecnica. En vez de tocar veinte cosas a la vez, seguimos una secuencia de comprobacion. Eso reduce mucho el caos en clase y ayuda a que los alumnos aprendan a depurar con criterio.

### Mensaje clave

Los errores en pagos se diagnostican con orden, no a ciegas.

### Pregunta para los alumnos

Que revisarias antes: el CSS del boton o que exista `.env`?

## Bloque 14 - Lo que este proyecto todavia no hace

### Lo que digo en clase

En este punto conviene frenar una confusion habitual: que algo funcione no significa que ya este terminado para produccion. Nuestro proyecto sirve para aprender el flujo general, pero todavia no guarda pagos localmente ni usa webhooks ni confirma matriculas reales.

Esto no es un defecto del ejercicio. Al contrario: esta limitacion esta puesta a proposito para que los alumnos puedan asimilar primero la estructura del flujo antes de sumar mas piezas.

### Mensaje clave

Una demo funcional no equivale a una integracion lista para produccion.

### Pregunta para los alumnos

Que pieza faltaria para confiar menos en la vuelta del navegador y mas en el servidor?

## Bloque 15 - Siguientes pasos naturales

### Lo que digo en clase

Despues de este primer paso, el camino natural es guardar el intento de compra, registrar el `session.id` y despues incorporar el webhook `checkout.session.completed`. Ese webhook nos permitiria confirmar el pago desde el servidor, sin depender solo de que el navegador vuelva a nuestra app.

Es importante que los alumnos vean que el proyecto no termina aqui. Lo que hemos construido es la base correcta sobre la que se pueden sumar persistencia, reconciliacion y matriculas reales.

### Mensaje clave

Primero se entiende el flujo; despues se anade persistencia y confirmacion real.

### Pregunta para los alumnos

Que ganamos al introducir un webhook en el siguiente paso?

## Bloque 16 - Guion breve de cierre

### Lo que digo en clase

Si tuviera que resumir toda la practica en pocas frases, diria esto: nuestra landing recoge datos, el backend crea una sesion en Stripe, Stripe nos devuelve una URL segura, el usuario paga alli y luego vuelve a nuestra app, donde consultamos el estado real de la sesion.

Si los alumnos salen de clase entendiendo ese recorrido, la sesion ha cumplido su objetivo. Los detalles avanzados pueden venir despues, pero la arquitectura general ya habra quedado clara.

### Mensaje clave

La victoria de esta practica es entender el flujo completo, no memorizar llamadas.

### Pregunta final para los alumnos

Si tuvieras que explicar esta pasarela a otra persona en un minuto, como contarias el recorrido del pago?
