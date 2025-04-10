import { getPersonaje } from '../Status.mjs';
import { guardarProgreso, mostrarMensaje } from '../UtilesExtras.mjs';
import { actualizarSeleccionMandoPantalla } from '../Mando.mjs';

let armaEquipadaElement;
let objetosInventarioElement;
let capacidadInventarioElement;
let listaArmasInventarioElement;

/**
 * Configura la pantalla del inventario.
 */
export function configurarPantallaInventario() {
    const personaje = getPersonaje();
    if (!personaje) return;

    // Cachear elementos
    if (!armaEquipadaElement) {
        armaEquipadaElement = document.getElementById('arma-equipada-inventario');
        objetosInventarioElement = document.getElementById('objetos-inventario');
        capacidadInventarioElement = document.getElementById('capacidad-inventario');
        listaArmasInventarioElement = document.getElementById('lista-armas-inventario');
    }

    const armaEquipada = personaje.obtenerArmaEquipadaInventario();
    armaEquipadaElement.textContent = armaEquipada ? `${armaEquipada.nombre} (Atk: ${armaEquipada.ataque})` : 'Ninguna';
    objetosInventarioElement.textContent = personaje.obtenerCantidadInventario();
    capacidadInventarioElement.textContent = personaje.obtenerCapacidadInventario();

    listaArmasInventarioElement.innerHTML = ''; // Limpiar lista

    personaje.obtenerInventario().forEach((arma, indice) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${arma.nombre} (Atk: ${arma.ataque})</span>
        `;

        if (personaje.inventario.armaEquipadaId !== arma.id) {
            const botonEquipar = document.createElement('button');
            botonEquipar.textContent = 'Equipar';
            botonEquipar.classList.add('ml-4', 'text-sm', 'py-1', 'px-2');
            botonEquipar.dataset.indiceMando = indice + 1; // +1 por el botón de volver
            botonEquipar.onclick = (e) => {
                 e.stopPropagation();
                 accionEquiparArma(arma.id);
            }
            li.appendChild(botonEquipar);
        } else {
            const textoEquipado = document.createElement('span');
            textoEquipado.textContent = '(Equipada)';
            textoEquipado.classList.add('ml-4', 'text-xs', 'text-green-400', 'font-semibold');
            li.appendChild(textoEquipado);
        }
        listaArmasInventarioElement.appendChild(li);
    });
}

/**
 * Lógica para equipar un arma.
 * @param {string} idArma
 */
export function accionEquiparArma(idArma) {
    const personaje = getPersonaje();
    if (!personaje) return;

    if (personaje.equiparArmaInventario(idArma)) {
        const armaEquipada = personaje.obtenerArmaEquipadaInventario(); // Obtener de nuevo para nombre
        mostrarMensaje(`Has equipado ${armaEquipada?.nombre || 'un arma'}.`, 'exito');
        guardarProgreso();
        configurarPantallaInventario(); // Re-renderizar inventario
        actualizarSeleccionMandoPantalla(); // Actualizar elementos navegables
    } else {
        mostrarMensaje('Error al equipar el arma.', 'error');
    }
}
