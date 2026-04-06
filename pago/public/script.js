const courseTitle = document.getElementById("course-title")
const courseDescription = document.getElementById("course-description")
const coursePrice = document.getElementById("course-price")
const form = document.getElementById("checkout-form")
const studentNameInput = document.getElementById("student-name")
const studentEmailInput = document.getElementById("student-email")
const submitButton = document.getElementById("submit-button")
const message = document.getElementById("message")

async function loadCourse() {
  const response = await fetch("/api/course")
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "No se pudo cargar el producto")
  }

  courseTitle.textContent = data.title
  courseDescription.textContent = data.description
  coursePrice.textContent = data.displayAmount
}

form.addEventListener("submit", async (event) => {
  event.preventDefault()

  submitButton.disabled = true
  submitButton.textContent = "Preparando checkout..."
  message.textContent = ""

  try {
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

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "No se pudo iniciar el pago")
    }

    window.location.href = data.url
  } catch (error) {
    message.textContent = error.message
    submitButton.disabled = false
    submitButton.textContent = "Ir a pagar con Stripe"
  }
})

loadCourse().catch((error) => {
  message.textContent = error.message
})
