const catalogo = {
    'prod-hamburguesa': { idDb: 1, nombre: 'Hamburguesa Clásica', precioBase: 15.00 },
    'prod-pizza': { idDb: 2, nombre: 'Pizza Personal', precioBase: 12.00 },
    'prod-cafe': { idDb: 3, nombre: 'Café Pasado', precioBase: 6.00 }
};

let productoActualSeleccionado = null;
let ticketPedido = [];
let totalPagar = 0;

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

        fetch(`http://127.0.0.1:8000/modificadores/${productoActualSeleccionado.idDb}`)
        .then(res => res.json())
        .then(data => {
            contenedorMods.innerHTML = ''; 
            
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
            console.error(error);
        });
    });
});

document.querySelector('.btn-agregar-ticket').addEventListener('click', () => {
    if (!productoActualSeleccionado) return;

    let subtotal = productoActualSeleccionado.precioBase;
    let cremasSeleccionadas = [];
    let extrasSeleccionados = [];

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

    document.getElementById('zona-personalizacion').classList.add('oculto');
    productoActualSeleccionado = null;
});

function actualizarTicketDOM() {
    const contenedorTicket = document.getElementById('lista-ticket');
    contenedorTicket.innerHTML = '';
    totalPagar = 0;

    ticketPedido.forEach((item) => {
        totalPagar += item.subtotal;
        
        let detallesText = [];
        if (item.cremas.length > 0) detallesText.push(`Cremas: ${item.cremas.join(', ')}`);
        if (item.extras.length > 0) detallesText.push(`Extras: ${item.extras.join(', ')}`);
        
        const div = document.createElement('div');
        div.className = 'item-ticket';
        div.innerHTML = `
            <p class="nombre-item">${item.nombre}</p>
            <p class="detalle-item">${detallesText.join(' | ')}</p>
            <p class="precio-item">S/ ${item.subtotal.toFixed(2)}</p>
        `;
        contenedorTicket.appendChild(div);
    });

    document.getElementById('monto-total').textContent = `S/ ${totalPagar.toFixed(2)}`;
}

document.getElementById('btn-generar-voucher').addEventListener('click', () => {
    if (ticketPedido.length === 0) {
        alert('Agrega al menos un producto al ticket.');
        return;
    }

    const metodoPago = document.querySelector('input[name="pago"]:checked');

    const payloadBackend = {
        metodo_pago: metodoPago ? metodoPago.value : 'efectivo',
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
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        return res.json();
    })
    .then(data => {
        alert(`${data.mensaje}\nNro. de Operación: ${data.id_venta}\nTotal: S/ ${data.total.toFixed(2)}`);
        
        ticketPedido = [];
        actualizarTicketDOM();
        
        if (document.querySelector('input[name="pago"][value="yape"]')) {
             document.querySelector('input[name="pago"][value="yape"]').checked = true;
        }
    })
    .catch(err => {
        console.error(err);
        alert('Hubo un problema al procesar el pago. Revisa la terminal de Python.');
    });
});