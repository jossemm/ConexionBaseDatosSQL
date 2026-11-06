// js/landing.js - Navegación suave y filtros de productos
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (pageYOffset >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });
});

function filtrarCatalogo(tipo) {
  const buttons = document.querySelectorAll(".pill-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");

  const cards = document.querySelectorAll(".item-card");
  const services = document.querySelectorAll(".service-box");

  if (tipo === "todos") {
    cards.forEach(c => c.style.display = "flex");
    services.forEach(s => s.style.display = "block");
  } else if (tipo === "huevo") {
    cards.forEach(c => c.style.display = "flex");
    services.forEach(s => s.style.display = "none");
  } else if (tipo === "servicio") {
    cards.forEach(c => c.style.display = "none");
    services.forEach(s => s.style.display = "block");
  }
}

function enviarMensaje(e) {
  e.preventDefault();
  const nombre = document.getElementById("contacto_nombre").value;
  const feedback = document.getElementById("form-feedback");
  feedback.textContent = `¡Gracias ${nombre}! Tu consulta ha sido enviada al área comercial de Granja El Pollón.`;
  document.getElementById("contactForm").reset();
}