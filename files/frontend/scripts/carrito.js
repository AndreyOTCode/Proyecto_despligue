let cart = [];
let finalizarBtn = null;

// Agrega producto al carrito
function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    if (existing.quantity < product.stock) {
      existing.quantity += 1;
      ocultarErrorStock();
    } else {
      mostrarErrorStock();
    }
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartUI();
}

// Actualiza la interfaz del carrito
function updateCartUI() {
  const cartCount = document.getElementById('cart-count');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
    cartTotal.textContent = '0';
    return;
  }

  let itemsHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    itemsHTML += `
      <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
        <div class="d-flex align-items-center gap-2">
          <img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
          <div>
            <strong>${item.name}</strong><br>
            <small>
              Precio unitario: $${item.price.toLocaleString()} <br>
              Total: $${(item.price * item.quantity).toLocaleString()}
            </small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary" onclick="adjustQuantity(${index}, -1)">−</button>
          <span>${item.quantity}</span>
          <button class="btn btn-sm btn-outline-secondary" onclick="adjustQuantity(${index}, 1)">+</button>
          <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">&times;</button>
        </div>
      </div>
    `;
  });

  cartItemsContainer.innerHTML = itemsHTML;
  cartTotal.textContent = total.toLocaleString();
}

// Ajustar cantidad desde el carrito
function adjustQuantity(index, delta) {
  const item = cart[index];
  if (!item) return;

  if (delta === -1 && item.quantity > 1) {
    item.quantity -= 1;
    ocultarErrorStock();
  } else if (delta === 1) {
    if (item.quantity < item.stock) {
      item.quantity += 1;
      ocultarErrorStock();
    } else {
      mostrarErrorStock();
      return;
    }
  }

  updateCartUI();
}

// Quita producto del carrito
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

// Verifica si el usuario está logueado antes de finalizar compra
function verificarSesionAntesDeComprar() {
  fetch('http://localhost:3000/api/usuario-sesion', {
    credentials: 'include'
  })
    .then(res => {
      if (!res.ok) throw new Error('No autenticado');
      return res.json();
    })
    .then(data => {
      mostrarMensajeCompraExitosa();
    })
    .catch(() => {
      mostrarErrorNoAutenticado();
    });
}

// Finaliza la compra y descuenta stock
function mostrarMensajeCompraExitosa() {
  const errorDiv = document.getElementById('compra-error');
  errorDiv.style.display = 'none';

  const productosAEnviar = cart.map(item => ({
    id: item.id,
    cantidad: item.quantity,
    precio_unitario: item.price
  }));

  fetch('http://localhost:3000/api/descontar-stock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ productos: productosAEnviar })
  })
    .then(res => res.json())
    .then(data => {
      if (data.fallos && data.fallos.length > 0) {
        alert('Algunos productos no tienen stock suficiente.');
      } else {
        // Obtener usuario_id para registrar venta
        fetch('http://localhost:3000/api/usuario-sesion', {
          credentials: 'include'
        })
          .then(res => res.json())
          .then(userData => {
            return fetch('http://localhost:3000/api/registrar-venta', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                usuario_id: userData.usuario.id,
                productos: productosAEnviar
              })
            });
          })
          .then(res => res.json())
          .then(ventaData => {
            const exitoDiv = document.getElementById('compra-exito');
            if (exitoDiv) {
              exitoDiv.style.display = 'block';
              exitoDiv.textContent = '✅ Compra exitosa y registrada.';
            }

            mostrarReciboCompra(); // Mostrar modal
            actualizarStockVisual(productosAEnviar);
            cart = [];
            updateCartUI();
          })
          .catch(err => {
            console.error('Error al registrar venta:', err);
          });
      }
    })
    .catch(err => {
      console.error(err);
      alert('Error al actualizar stock');
    });
}

function actualizarStockVisual(productosVendidos) {
  productosVendidos.forEach(vendido => {
    const productoCard = document.querySelector(`[data-id="${vendido.id}"]`);
    if (productoCard) {
      const stockText = productoCard.querySelector('.stock-text');
      let nuevoStock = parseInt(stockText.dataset.stock, 10) - vendido.cantidad;

      stockText.textContent = `Stock disponible: ${nuevoStock}`;
      stockText.dataset.stock = nuevoStock;

      // Desactivar botón si ya no hay stock
      const btn = productoCard.querySelector('button');
      if (nuevoStock <= 0) {
        btn.disabled = true;
        btn.textContent = 'Agotado';
      }
    }
  });
}


function mostrarReciboCompra() {
  const detalleDiv = document.getElementById('detalle-recibo');
  detalleDiv.innerHTML = '';

  let total = 0;
  let html = `
    <table class="table table-sm table-striped">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cant.</th>
          <th>Precio</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
  `;

  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    html += `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toLocaleString()}</td>
        <td>$${subtotal.toLocaleString()}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    <div class="text-end fw-bold mt-2">Total pagado: $${total.toLocaleString()}</div>
  `;

  detalleDiv.innerHTML = html;

  // Muestra el modal (requiere Bootstrap 5)
  const modal = new bootstrap.Modal(document.getElementById('modalResumenCompra'));
  modal.show();
}


function mostrarErrorNoAutenticado() {
  const errorDiv = document.getElementById('compra-error');
  errorDiv.style.display = 'block';
  errorDiv.innerHTML = `
    ⚠️ Debes iniciar sesión o registrarte para finalizar la compra.
    <div class="mt-2 d-flex justify-content-center gap-2">
      <a href="login.html" class="btn btn-outline-light btn-sm">Iniciar sesión</a>
      <a href="registro.html" class="btn btn-outline-light btn-sm">Registrarse</a>
    </div>
  `;
}

function mostrarErrorStock() {
  const errorDiv = document.getElementById('stock-error');
  if (errorDiv) {
    errorDiv.style.display = 'block';
    errorDiv.textContent = '⚠️ No hay más stock disponible.';
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 3000);
  }
}

function ocultarErrorStock() {
  const errorDiv = document.getElementById('stock-error');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  finalizarBtn = document.querySelector('.btn-success');
  if (finalizarBtn) {
    finalizarBtn.addEventListener('click', e => {
      e.preventDefault();
      verificarSesionAntesDeComprar();
    });
  }

  updateCartUI();
});
