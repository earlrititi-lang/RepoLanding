const studentName = document.getElementById("student-name")
const studentEmail = document.getElementById("student-email")
const sessionStatus = document.getElementById("session-status")
const paymentStatus = document.getElementById("payment-status")

async function loadSessionStatus() {
  const sessionId = new URLSearchParams(window.location.search).get("session_id")

  if (!sessionId) {
    throw new Error("La URL no incluye session_id.")
  }

  const response = await fetch(`/api/session-status?session_id=${encodeURIComponent(sessionId)}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "No se pudo recuperar la sesion")
  }

  studentName.textContent = data.studentName || "No informado"
  studentEmail.textContent = data.customerEmail || "No informado"
  sessionStatus.textContent = data.status || "No informado"
  paymentStatus.textContent = data.paymentStatus || "No informado"
}

loadSessionStatus().catch((error) => {
  studentName.textContent = "Error"
  studentEmail.textContent = error.message
  sessionStatus.textContent = "-"
  paymentStatus.textContent = "-"
})
