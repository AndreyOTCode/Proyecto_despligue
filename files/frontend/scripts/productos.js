fetch('https://proyecto-despligue.onrender.com/api/productos', {
  credentials: 'include'
})
  .then(res => res.json())
  .then(productos => {
    const contenedor = document.getElementById('productos-container');
    contenedor.innerHTML = '';

    productos.forEach(producto => {
      const card = document.createElement('div');
      card.className = 'col-md-4 mb-4';

      // Crea la estructura HTML
      card.innerHTML =  `
    <div class="card h-100 shadow" data-id="${producto.id}" data-categoria="${producto.categoria}">
      <img src="${producto.imagen_url}" class="card-img-top img-fluid" alt="${producto.nombre}">
      <div class="card-body">
        <h5 class="card-title">${producto.nombre}</h5>
        <p class="card-text">${producto.descripcion}</p>
        <p class="card-text">$${producto.precio.toLocaleString()}</p>
        <p class="card-text stock-text" data-stock="${producto.stock}">
          Stock disponible: ${producto.stock}
        </p>
        <button class="btn btn-dark w-100" ${producto.stock <= 0 ? 'disabled' : ''}>
          ${producto.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
        </button>
      </div>
    </div>
  `;

      // Asocia evento al botón
      const boton = card.querySelector('button');
      boton.addEventListener('click', () => {
        addToCart({
          id: producto.id,
          name: producto.nombre,
          price: Number(producto.precio),
          image: producto.imagen_url,
          stock: producto.stock
        });
      });

      contenedor.appendChild(card);
    });
  })
  .catch(error => console.error('Error al cargar productos:', error));
