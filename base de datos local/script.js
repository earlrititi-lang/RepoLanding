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
