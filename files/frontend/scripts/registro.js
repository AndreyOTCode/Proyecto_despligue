// frontend/scripts/registro.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm");
  const inputFecha = document.getElementById("fecha_nacimiento");
  const errorEdad = document.getElementById("errorEdad"); // recuerda tener este <small> en tu HTML

  // ✅ Limitar fecha máxima en el input (hoy - 18 años)
  const hoy = new Date();
  const anio = hoy.getFullYear() - 18;
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  inputFecha.max = `${anio}-${mes}-${dia}`;

  // ✅ Enviar formulario con validación
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validar edad antes de mandar al backend
    const fecha = new Date(inputFecha.value);
    if (isNaN(fecha)) return; // si no hay fecha, HTML5 se encarga de required

    let edad = hoy.getFullYear() - fecha.getFullYear();
    const diferenciaMes = hoy.getMonth() - fecha.getMonth();
    const diferenciaDia = hoy.getDate() - fecha.getDate();

    if (diferenciaMes < 0 || (diferenciaMes === 0 && diferenciaDia < 0)) {
      edad--;
    }

    if (edad < 18) {
      errorEdad.textContent = "Debes ser mayor de 18 años para registrarte.";
      return; // 🚫 no hace fetch si no cumple
    } else {
      errorEdad.textContent = "";
    }

    // ✅ Recoger valores del formulario
    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const email = document.getElementById("email").value;
    const fecha_nacimiento = document.getElementById("fecha_nacimiento").value;
    const contrasena = document.getElementById("contrasena").value;

    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, email, fecha_nacimiento, contrasena })
      });

      const data = await res.json();

      // Mostrar mensaje en toast
      const toastMessage = document.getElementById("toastMessage");
      toastMessage.textContent = data.message;

      const toastEl = document.getElementById("registroToast");
      toastEl.classList.remove("text-bg-success", "text-bg-danger");
      toastEl.classList.add(res.ok ? "text-bg-success" : "text-bg-danger");

      const toast = new bootstrap.Toast(toastEl);
      toast.show();

      if (res.ok) {
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      }
    } catch (err) {
      console.error(err);

      const toastMessage = document.getElementById("toastMessage");
      toastMessage.textContent = "Error al conectar con el servidor";

      const toastEl = document.getElementById("registroToast");
      toastEl.classList.remove("text-bg-success");
      toastEl.classList.add("text-bg-danger");

      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  });
});
