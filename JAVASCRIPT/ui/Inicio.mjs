import { cargarProgreso, mostrarMensaje } from '../UtilesExtras.mjs';
import { getPersonaje } from '../Status.mjs';

/**
 * Configura la pantalla de inicio, habilitando/deshabilitando botones.
 */
export function configurarPantallaInicio() {
    const datosExistentes = getPersonaje() !== null || localStorage.getItem('aventuraEpicaDatosGuardados_Modular') !== null; // Comprobar estado y localStorage
    const botonContinuar = document.getElementById('boton-continuar-partida');
    const mensajeInicio = document.getElementById('mensaje-inicio'); // Asegúrate que el ID es correcto

    if (datosExistentes) {
        botonContinuar.disabled = false;
        if (mensajeInicio) mensajeInicio.style.display = 'none'; // Ocultar mensaje si hay datos
    } else {
        botonContinuar.disabled = true;
        if (mensajeInicio) {
             mensajeInicio.textContent = "No hay datos guardados. Empieza una Nueva Partida.";
             mensajeInicio.className = 'mensaje info mt-4'; // Resetear clases
             mensajeInicio.style.display = 'block';
        }
    }
}

/**
 * Lógica para el botón Continuar Partida.
 * @returns {boolean} True si la carga fue exitosa, False si no.
 */
export function accionContinuarPartida() {
    if (cargarProgreso()) {
        return true; // Éxito al cargar
    } else {
        mostrarMensaje('No se pudieron cargar los datos. Empieza una nueva partida.', 'error');
        configurarPantallaInicio(); // Reconfigurar por si la carga falló y borró datos
        return false; // Fallo al cargar
    }
}

/**
 * Lógica para el botón Eliminar Datos.
 */
export function accionEliminarDatos() {
    // La confirmación y eliminación se manejan en el event listener de main.mjs
    // Pero mostramos el mensaje desde aquí después de la acción.
     mostrarMensaje('Datos de la partida anterior eliminados.', 'exito');
     configurarPantallaInicio(); // Reconfigurar botones
}
