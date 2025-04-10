import { getPersonaje } from '../Status.mjs';
import { listaGlobalArmas } from '../DatoBasico.mjs';
import { guardarProgreso, mostrarMensaje } from '../UtilesExtras.mjs';
import { actualizarSeleccionMandoPantalla } from '../Mando.mjs'; // Para actualizar selección tras compra

let dineroTiendaElement;
let listaArmasTiendaElement;

/**
 * Configura la pantalla de la tienda.
 */
export function configurarPantallaTienda() {
    const personaje = getPersonaje();
    if (!personaje) return; // Seguridad

    // Cachear elementos si es necesario
    if (!dineroTiendaElement) {
        dineroTiendaElement = document.getElementById('dinero-tienda');
        listaArmasTiendaElement = document.getElementById('lista-armas-tienda');
    }

    dineroTiendaElement.textContent = personaje.dinero;
    listaArmasTiendaElement.innerHTML = ''; // Limpiar lista

    listaGlobalArmas.forEach((arma, indice) => {
        const li = document.createElement('li');
        const tieneArma = personaje.contieneArmaEnInventario(arma.id);
        const puedeComprar = personaje.dinero >= arma.precio && !personaje.inventarioLleno();

        li.innerHTML = `
            <span class="${tieneArma ? 'text-gray-500' : ''}">${arma.nombre} (Atk: ${arma.ataque}) - ${arma.descripcion || ''}</span>
            <span class="precio-objeto ${tieneArma ? 'text-gray-600' : 'text-yellow-400'}">${arma.precio} monedas</span>
        `;

        if (tieneArma) {
            const textoYaComprado = document.createElement('span');
            textoYaComprado.textContent = '(En inventario)';
            textoYaComprado.classList.add('ml-4', 'text-xs', 'text-gray-400');
            li.appendChild(textoYaComprado);
        } else {
            const botonComprar = document.createElement('button');
            botonComprar.textContent = 'Comprar';
            botonComprar.classList.add('ml-4', 'text-sm', 'py-1', 'px-2');
            botonComprar.dataset.indiceMando = indice + 1; // +1 por el botón de volver
            botonComprar.disabled = !puedeComprar;
            botonComprar.title = personaje.inventarioLleno() ? "Inventario lleno" : (personaje.dinero < arma.precio ? "Dinero insuficiente" : "");
            botonComprar.onclick = (e) => {
                 e.stopPropagation(); // Evitar que el click se propague si está dentro de otro elemento clickeable
                 accionComprarArma(arma.id);
            }
            li.appendChild(botonComprar);
        }
        listaArmasTiendaElement.appendChild(li);
    });
}

/**
 * Lógica para comprar un arma.
 * @param {string} idArma
 */
export function accionComprarArma(idArma) {
    const personaje = getPersonaje();
    if (!personaje) return;

    const armaAComprar = listaGlobalArmas.find(a => a.id === idArma);
    if (!armaAComprar) {
        mostrarMensaje('Error: Arma no encontrada.', 'error');
        return;
    }

    if (personaje.inventarioLleno()) {
        mostrarMensaje('Tu inventario está lleno.', 'error');
        return;
    }
    if (personaje.contieneArmaEnInventario(idArma)){
         mostrarMensaje('Ya tienes esta arma.', 'info');
         return;
    }


    if (personaje.gastarDinero(armaAComprar.precio)) {
        if (personaje.agregarArmaInventario(armaAComprar)) {
            mostrarMensaje(`¡Has comprado ${armaAComprar.nombre}!`, 'exito');
            guardarProgreso();
            configurarPantallaTienda(); // Re-renderizar tienda
            actualizarSeleccionMandoPantalla(); // Actualizar elementos navegables
        } else {
            // Si falla agregar (raro si ya comprobamos), devolver dinero
            personaje.ganarDinero(armaAComprar.precio);
            mostrarMensaje('Error al añadir el arma al inventario.', 'error');
        }
    } else {
        mostrarMensaje('No tienes suficiente dinero.', 'error');
    }
}
