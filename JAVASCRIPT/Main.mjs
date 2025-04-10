import { mostrarPantalla, guardarProgreso, eliminarProgreso } from './UtilesExtras.mjs';
import { getCombate, getPantallaActual, setCombate } from './Status.mjs';
import { iniciarGamepad } from './Mando.mjs';
import { accionContinuarPartida, accionEliminarDatos } from './ui/Inicio.mjs';
import { accionCrearPersonaje } from './ui/Creador.mjs';
import { accionIniciarCombate, accionGuardarSalir } from './ui/Lobby.mjs';
import { registrarPrimeraInteraccion, cargarAudios } from './GestorAudio.mjs'; 

/**
 * Función principal de inicialización del juego.
 */
function inicializarJuego() {
    console.log("Inicializando el juego (Multimedia)...");

    cargarAudios();

    // --- Asignar Event Listeners Globales (igual que antes) ---
    document.getElementById('boton-continuar-partida').addEventListener('click', () => {
        registrarPrimeraInteraccion(); // Registrar interacción para audio
        if (accionContinuarPartida()) { mostrarPantalla('pantalla-lobby'); }
    });
    document.getElementById('boton-nueva-partida').addEventListener('click', () => {
        registrarPrimeraInteraccion(); // Registrar interacción para audio
        mostrarPantalla('pantalla-creador');
    });
    document.getElementById('boton-eliminar-datos').addEventListener('click', () => {
        registrarPrimeraInteraccion(); // Registrar interacción para audio
        if (confirm("¿Estás seguro de que quieres borrar todos los datos guardados? Esta acción no se puede deshacer.")) {
            eliminarProgreso();
            accionEliminarDatos();
        }
    });
    document.getElementById('formulario-creador').addEventListener('submit', (evento) => {
         evento.preventDefault();
         registrarPrimeraInteraccion(); // Registrar interacción para audio
         if (accionCrearPersonaje()) { mostrarPantalla('pantalla-lobby'); }
    });
    document.getElementById('boton-volver-inicio-desde-creador').addEventListener('click', () => mostrarPantalla('pantalla-inicio'));
    document.getElementById('boton-ir-tienda').addEventListener('click', () => mostrarPantalla('pantalla-tienda'));
    document.getElementById('boton-gestionar-inventario').addEventListener('click', () => mostrarPantalla('pantalla-inventario'));
    document.getElementById('boton-entrar-combate').addEventListener('click', () => {
         registrarPrimeraInteraccion(); // Registrar interacción para audio
         accionIniciarCombate();
     });
    document.getElementById('boton-guardar-salir').addEventListener('click', accionGuardarSalir);
    document.getElementById('boton-volver-lobby-desde-tienda').addEventListener('click', () => mostrarPantalla('pantalla-lobby'));
    document.getElementById('boton-volver-lobby-desde-inventario').addEventListener('click', () => mostrarPantalla('pantalla-lobby'));
    document.getElementById('boton-atacar').addEventListener('click', () => getCombate()?.ejecutarAccionJugador('atacar'));
    document.getElementById('boton-defender').addEventListener('click', () => getCombate()?.ejecutarAccionJugador('defender'));
    document.getElementById('boton-huir').addEventListener('click', () => getCombate()?.ejecutarAccionJugador('huir'));

    // --- Iniciar lógica ---
    iniciarGamepad();
    mostrarPantalla('pantalla-inicio'); // Mostrar pantalla inicial (esto llamará a reproducirMusica('menu'))

    console.log("Juego listo (Multimedia).");
}

// Ejecutar inicialización (igual que antes)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarJuego);
} else {
    inicializarJuego();
}
