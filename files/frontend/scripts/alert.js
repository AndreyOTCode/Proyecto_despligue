// frontend/scripts/alerts.js
(function () {
  // Creamos contenedor si no existe
  let contenedor = document.getElementById("alert-container");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "alert-container";
    contenedor.className = "position-fixed top-0 end-0 p-3";
    contenedor.style.zIndex = "20000";
    document.body.appendChild(contenedor);
  }

  /**
   * Mostrar alerta tipo toast de Bootstrap
   * @param {string} mensaje - Texto a mostrar
   * @param {"success"|"danger"|"warning"|"info"} tipo - Tipo de alerta
   * @param {number} duracion - Duración en ms
   */
  window.mostrarAlerta = function (mensaje, tipo = "success", duracion = 3000) {
    const toastEl = document.createElement("div");
    toastEl.className = `toast align-items-center text-bg-${tipo} border-0`;
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${mensaje}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    contenedor.appendChild(toastEl);

    const toast = new bootstrap.Toast(toastEl, { delay: duracion });
    toast.show();

    toastEl.addEventListener("hidden.bs.toast", () => {
      toastEl.remove();
    });
  };
})();
