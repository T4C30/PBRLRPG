// utils.mjs
import { DATOS_GUARDADOS_KEY } from './Constant.mjs';
import { Personaje } from './clases/Personaje.mjs';
import { listaGlobalArmas } from './DatoBasico.mjs';
import { getPersonaje, setPersonaje, setPantallaActual, getPantallaActual } from './Status.mjs';
import { actualizarSeleccionMandoPantalla } from './Mando.mjs';
import { reproducirMusica, detenerMusica } from './GestorAudio.mjs'; // Importar audioManager

// Importar funciones de configuración de UI 
import { configurarPantallaInicio } from './ui/Inicio.mjs';
import { configurarPantallaCreador } from './ui/Creador.mjs';
import { configurarPantallaLobby } from './ui/Lobby.mjs';
import { configurarPantallaTienda } from './ui/Tienda.mjs';
import { configurarPantallaInventario } from './ui/Inventario.mjs';

/**
 * Muestra una pantalla específica, oculta las demás y gestiona la música de fondo.
 * @param {string} idPantalla - El ID de la sección a mostrar.
 */
export function mostrarPantalla(idPantalla) {
    const pantallas = document.querySelectorAll('.pantalla');
    pantallas.forEach(pantalla => {
        pantalla.classList.remove('activa');
    });

    const pantallaAMostrar = document.getElementById(idPantalla);
    if (pantallaAMostrar) {
        pantallaAMostrar.classList.add('activa');
        const pantallaAnterior = getPantallaActual(); // Guardar pantalla anterior antes de actualizar
        setPantallaActual(idPantalla);
        console.log(`Mostrando pantalla: ${idPantalla} (desde ${pantallaAnterior})`);

        document.querySelectorAll('.mensaje').forEach(msg => msg.style.display = 'none');

        // --- Gestión de Música ---
        // Detener música solo si no vamos a la misma pantalla o a batalla (batalla tiene su propia lógica)
        // O si nos venimos de batallar
         if (idPantalla !== pantallaAnterior && idPantalla !== 'pantalla-batalla') {
            //detenerMusica(); 
            // Detener la música anterior explícitamente pero causa estragos en la ejecucion por ahora dejo comentado
         }


        // Reproducir música según la nueva pantalla
        let tipoMusica = null;
        switch (idPantalla) {
            case 'pantalla-inicio': tipoMusica = 'menu'; break;
            case 'pantalla-lobby': tipoMusica = 'lobby'; break;
            case 'pantalla-tienda': tipoMusica = 'tienda'; break;
            case 'pantalla-inventario': tipoMusica = 'lobby'; break; // Usar música del lobby para el inventario? O ninguna?
            case 'pantalla-creador': tipoMusica = 'menu'; break; // Usar música del menú? O ninguna?
            case 'pantalla-batalla':
                // La música de batalla se inicia desde accionIniciarCombate
                //detenerMusica(); pero causa estragos en la ejecucion por ahora dejo comentado
                // Asegurarse de que no haya otra sonando
                break;
        }

        if (tipoMusica) {
            reproducirMusica(tipoMusica);
        }


        // Ejecutar lógica de configuración específica para la pantalla
        switch (idPantalla) {
            case 'pantalla-inicio': configurarPantallaInicio(); break;
            case 'pantalla-creador': configurarPantallaCreador(); break;
            case 'pantalla-lobby':
                 if (!getPersonaje()) { console.error("Intento de ir al lobby sin personaje."); mostrarPantalla('pantalla-inicio'); return; }
                configurarPantallaLobby(); break;
            case 'pantalla-tienda':
                 if (!getPersonaje()) { mostrarPantalla('pantalla-inicio'); return; }
                configurarPantallaTienda(); break;
            case 'pantalla-inventario':
                 if (!getPersonaje()) { mostrarPantalla('pantalla-inicio'); return; }
                configurarPantallaInventario(); break;
            case 'pantalla-batalla': break; // Configuración en Combate
            default: console.warn(`Configuración de UI no definida para: ${idPantalla}`);
        }
        actualizarSeleccionMandoPantalla();
    } else {
        console.error(`No se encontró la pantalla con ID: ${idPantalla}`);
        mostrarPantalla('pantalla-inicio');
    }
}

// mostrarMensaje, guardarProgreso, cargarProgreso, eliminarProgreso (sin cambios)
export function mostrarMensaje(texto, tipo, duracion = 3000) { 
    const idPantalla = getPantallaActual();
    const idElementoMensaje = `mensaje-${idPantalla.replace('pantalla-', '')}`;
    const elementoMensaje = document.getElementById(idElementoMensaje);
    if (elementoMensaje) {
        elementoMensaje.textContent = texto;
        elementoMensaje.className = `mensaje ${tipo} mt-4`;
        elementoMensaje.style.display = 'block';
        if (elementoMensaje.timeoutId) { clearTimeout(elementoMensaje.timeoutId); }
        if (duracion > 0) {
            elementoMensaje.timeoutId = setTimeout(() => { elementoMensaje.style.display = 'none'; elementoMensaje.timeoutId = null; }, duracion);
        } else { elementoMensaje.timeoutId = null; }
    } else { console.warn(`Elemento de mensaje no encontrado para ${idPantalla}: ${idElementoMensaje}. Mensaje: ${texto}`); }
 }
export function guardarProgreso() { 
    const personaje = getPersonaje();
    if (!personaje) return;
    try {
        const datosParaGuardar = { personaje: personaje.toJSON() };
        localStorage.setItem(DATOS_GUARDADOS_KEY, JSON.stringify(datosParaGuardar));
        console.log("Progreso guardado.");
        if (document.getElementById(`mensaje-${getPantallaActual().replace('pantalla-', '')}`)) {
             mostrarMensaje('Progreso guardado con éxito.', 'exito');
        }
    } catch (error) { console.error("Error al guardar el progreso:", error); mostrarMensaje('Error al guardar el progreso.', 'error'); }
 }
export function cargarProgreso() { 
    try {
        const datosGuardados = localStorage.getItem(DATOS_GUARDADOS_KEY);
        if (!datosGuardados) { console.log("No hay datos guardados."); return false; }
        const datosParseados = JSON.parse(datosGuardados);
        const personajeCargado = Personaje.fromJSON(datosParseados.personaje, listaGlobalArmas);
        if (personajeCargado) {
            setPersonaje(personajeCargado);
            console.log("Progreso cargado:", getPersonaje());
            return true;
        } else { console.warn("Datos guardados corruptos o incompletos al reconstruir Personaje."); eliminarProgreso(); return false; }
    } catch (error) { console.error("Error al cargar el progreso:", error); if (error instanceof SyntaxError) { console.warn("Limpiando datos guardados posiblemente corruptos."); eliminarProgreso(); } return false; }
 }
export function eliminarProgreso() { 
    localStorage.removeItem(DATOS_GUARDADOS_KEY);
    setPersonaje(null);
    console.log("Datos eliminados.");
 }

