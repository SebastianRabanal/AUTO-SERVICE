// 1. Catálogo con los IDs exactos de la Base de Datos
const catalogo = {
    'prod-hamburguesa': { idDb: 1, nombre: 'Hamburguesa Clásica', precioBase: 15.00 },
    'prod-pizza': { idDb: 2, nombre: 'Pizza Personal', precioBase: 12.00 },
    'prod-cafe': { idDb: 3, nombre: 'Café Pasado', precioBase: 6.00 }
};

let productoActualSeleccionado = null;
let ticketPedido = [];
let totalPagar = 0;

// 2. Seleccionar producto y cargar opciones dinámicas desde FastAPI
document.querySelectorAll('.btn-seleccionar').forEach(boton => {
    boton.addEventListener('click', (e) => {
        const tarjeta = e.target.closest('.tarjeta-producto');
        productoActualSeleccionado = catalogo[tarjeta.id];
        productoActualSeleccionado.idHtml = tarjeta.id;

        const zonaPersonalizacion = document.getElementById('zona-personalizacion');
        const contenedorMods = document.getElementById('contenedor-modificadores');
        
        zonaPersonalizacion.querySelector('h3').textContent = `Personaliza tu ${productoActualSeleccionado.nombre}`;
        contenedorMods.innerHTML = '<p>Cargando opciones...</p>';
        zonaPersonalizacion.classList.remove('oculto');

        // Petición GET al backend
        fetch(`http://127.0.0.1:8000/modificadores/${productoActualSeleccionado.idDb}`)
        .then(res => res.json())
        .then(data => {
            contenedorMods.innerHTML = ''; // Limpiar mensaje
            
            // Construir checkboxes según la respuesta de MySQL
            for (const [categoria, opciones] of Object.entries(data)) {
                let htmlCategoria = `<b>${categoria}</b><br>`;
                
                opciones.forEach(opc => {
                    const extraText = opc.precio > 0 ? `(+ S/ ${opc.precio.toFixed(2)})` : '(Gratis)';
                    htmlCategoria += `
                        <label style="display:block; margin-bottom:5px;">
                            <input type="checkbox" name="modificador" value="${opc.precio}" data-nombre="${opc.nombre}"> 
                            ${opc.nombre} ${extraText}
                        </label>`;
                });
                
                contenedorMods.innerHTML += `<div style="margin-bottom: 15px;">${htmlCategoria}</div>`;
            }
        })
        .catch(error => {
            contenedorMods.innerHTML = '<p>Error al cargar las opciones.</p>';
            console.error('Error fetching modificadores:', error);
        });
    });
});

// 3. Agregar el producto configurado al Ticket
document.querySelector('.btn-agregar-ticket').addEventListener('click', () => {
    if (!productoActualSeleccionado) return;

    let subtotal = productoActualSeleccionado.precioBase;
    let cremasSeleccionadas = [];
    let extrasSeleccionados = [];

    // Leer los inputs generados dinámicamente
    document.querySelectorAll('input[name="modificador"]:checked').forEach(cb => {
        const nombreMod = cb.getAttribute('data-nombre');
        const precioMod = parseFloat(cb.value);

        if (precioMod === 0) {
            cremasSeleccionadas.push(nombreMod);
        } else {
            extrasSeleccionados.push(nombreMod);
            subtotal += precioMod;
        }
    });

    const nuevoItem = {
        nombre: productoActualSeleccionado.nombre,
        cremas: cremasSeleccionadas,
        extras: extrasSeleccionados,
        subtotal: subtotal
    };

    ticketPedido.push(nuevoItem);
    actualizarTicketDOM();

    // Ocultar zona y resetear temporal
    document.getElementById('zona-personalizacion').classList.add('oculto');
    productoActualSeleccionado = null;
});

// 4. Actualizar la vista del Ticket en pantalla
function actualizarTicketDOM() {
    const contenedorTicket = document.getElementById('lista-ticket');
    contenedorTicket.innerHTML = '';
    totalPagar = 0;

    ticketPedido.forEach((item) => {
        totalPagar += item.subtotal;
        
        let detallesText = [];
        if (item.cremas.length > 0) detallesText.push(`Cremas: ${item.cremas.join(', ')}`);
        if (item.extras.length > 0) detallesText.push(`Extras: ${item.extras.join(', ')}`);
        
        const li = document.createElement('li');
        li.innerHTML = `
            <b>${item.nombre}</b> - S/ ${item.subtotal.toFixed(2)}<br>
            <small style="color:#555;">${detallesText.join(' | ')}</small>
        `;
        contenedorTicket.appendChild(li);
    });

    document.getElementById('total-pagar').textContent = `S/ ${totalPagar.toFixed(2)}`;
}

// 5. Procesar Pago y enviar POST a FastAPI
document.getElementById('btn-pagar').addEventListener('click', () => {
    if (ticketPedido.length === 0) {
        alert('Agrega al menos un producto al ticket.');
        return;
    }

    const metodoPago = document.getElementById('metodo-pago');

    // JSON alineado estrictamente con schemas/pydantic_models.py
    const payloadBackend = {
        metodo_pago: metodoPago.value,
        total: totalPagar,
        detalle_pedido: ticketPedido
    };

    fetch('http://127.0.0.1:8000/comprar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payloadBackend)
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        alert(`${data.mensaje}\nNro. de Operación: ${data.id_venta}\nTotal: S/ ${data.total.toFixed(2)}`);
        
        // Limpiar el ticket después de una compra exitosa
        ticketPedido = [];
        actualizarTicketDOM();
        document.getElementById('metodo-pago').value = 'yape'; // Resetear select
    })
    .catch(err => {
        console.error('Error en la transacción:', err);
        alert('Hubo un problema al procesar el pago. Revisa la consola.');
    });
});