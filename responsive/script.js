const header = document.querySelector(".site-header");
const nav = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = Array.from(document.querySelectorAll(".nav-menu a[href^='#']"));
const pageSections = Array.from(document.querySelectorAll("main section[id]"));
const desktopMenuQuery = window.matchMedia("(min-width: 48rem)");
const currentYear = document.querySelector(".current-year");
const contactForm = document.querySelector(".contact-form");
const formNote = document.querySelector(".form-note");

function setMenuState(isOpen) {
  if (!nav || !navToggle) return;

  nav.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute(
    "aria-label",
    isOpen ? "Cerrar navegacion" : "Abrir navegacion"
  );
  document.body.classList.toggle("menu-open", isOpen && !desktopMenuQuery.matches);
}

function closeMenu() {
  setMenuState(false);
}

function updateHeaderState() {
  if (!header) return;

  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

function setActiveLink(sectionId) {
  navLinks.forEach((link) => {
    const isMatch = link.getAttribute("href") === `#${sectionId}`;

    link.classList.toggle("is-active", isMatch);

    if (isMatch) {
      link.setAttribute("aria-current", "location");
      return;
    }

    link.removeAttribute("aria-current");
  });
}

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

document.addEventListener("click", (event) => {
  if (!nav || desktopMenuQuery.matches) return;
  if (!nav.classList.contains("is-open")) return;
  if (nav.contains(event.target)) return;

  closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  closeMenu();
  navToggle?.focus();
});

desktopMenuQuery.addEventListener("change", () => {
  closeMenu();
});

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

if ("IntersectionObserver" in window && pageSections.length > 0) {
  setActiveLink("inicio");
  const visibleSections = new Map();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.set(entry.target.id, entry.intersectionRatio);
          return;
        }

        visibleSections.delete(entry.target.id);
      });

      const topMatch = [...visibleSections.entries()].sort(
        (left, right) => right[1] - left[1]
      )[0];

      if (topMatch) {
        setActiveLink(topMatch[0]);
      }
    },
    {
      threshold: [0.25, 0.5, 0.75],
      rootMargin: "-20% 0px -55% 0px",
    }
  );

  pageSections.forEach((section) => {
    observer.observe(section);
  });
} else if (navLinks[0]) {
  setActiveLink(navLinks[0].getAttribute("href")?.replace("#", "") || "inicio");
}

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!formNote) return;

  formNote.textContent =
    "Formulario de ejemplo: no envia datos. Conecta aqui tu backend o servicio.";
  contactForm.reset();
});
