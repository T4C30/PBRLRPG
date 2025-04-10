import { getPersonaje, setCombate } from '../Status.mjs';
import { listaGlobalEnemigos } from '../DatoBasico.mjs';
import { Combate } from '../clases/Combate.mjs';
import { Enemigo } from '../clases/Enemigo.mjs';
import { mostrarPantalla, guardarProgreso, mostrarMensaje } from '../UtilesExtras.mjs';
import { reproducirMusica, detenerMusica } from '../GestorAudio.mjs';

let lobbyNombre, lobbyNivel, lobbyXp, lobbyXpNecesaria, lobbyDinero, lobbyArma;
let lobbyFuerza, lobbyDefensa, lobbyVelocidad, lobbySuerte;
function cachearElementosLobby() { 
    if (!lobbyNombre) {
        lobbyNombre = document.getElementById('lobby-nombre'); lobbyNivel = document.getElementById('lobby-nivel'); lobbyXp = document.getElementById('lobby-xp'); lobbyXpNecesaria = document.getElementById('lobby-xp-necesaria'); lobbyDinero = document.getElementById('lobby-dinero'); lobbyArma = document.getElementById('lobby-arma'); lobbyFuerza = document.getElementById('lobby-fuerza'); lobbyDefensa = document.getElementById('lobby-defensa'); lobbyVelocidad = document.getElementById('lobby-velocidad'); lobbySuerte = document.getElementById('lobby-suerte');
    }
 }
export function configurarPantallaLobby() { cachearElementosLobby(); const personaje = getPersonaje(); if (!personaje || !lobbyNombre) { console.error("Error: No hay personaje o elementos del lobby no encontrados."); mostrarPantalla('pantalla-inicio'); return; } actualizarEstadoPersonajeLobby(); }
export function actualizarEstadoPersonajeLobby() { const personaje = getPersonaje(); if (!personaje || !lobbyNombre) return; lobbyNombre.textContent = personaje.nombre; lobbyNivel.textContent = personaje.nivel; lobbyXp.textContent = personaje.experiencia; lobbyXpNecesaria.textContent = personaje.experienciaNecesaria; lobbyDinero.textContent = personaje.dinero; const armaEq = personaje.obtenerArmaEquipadaInventario(); lobbyArma.textContent = armaEq ? `${armaEq.nombre} (+${armaEq.ataque} Atk)` : 'Desarmado'; lobbyFuerza.textContent = personaje.ataqueBase; lobbyDefensa.textContent = personaje.defensaBase; lobbyVelocidad.textContent = personaje.velocidadBase; lobbySuerte.textContent = personaje.suerteBase; }


/**
 * Inicia un combate contra un enemigo aleatorio adecuado al nivel.
 * 
 */
export function accionIniciarCombate() {
    const personaje = getPersonaje();
    if (!personaje) return;

    // Selección de enemigo 
    const nivelMin = Math.max(1, personaje.nivel - 1);
    const nivelMax = personaje.nivel + 1;
    let enemigosPosibles = listaGlobalEnemigos.filter(e => e.nivel >= nivelMin && e.nivel <= nivelMax);
    if (enemigosPosibles.length === 0) {
        enemigosPosibles = listaGlobalEnemigos;
        if (enemigosPosibles.length === 0) { mostrarMensaje('No hay enemigos definidos.', 'error'); return; }
    }
    const enemigoSeleccionadoData = enemigosPosibles[Math.floor(Math.random() * enemigosPosibles.length)];
    const enemigoEnCombate = new Enemigo(
         enemigoSeleccionadoData.id, enemigoSeleccionadoData.nombre, enemigoSeleccionadoData.nivel,
         enemigoSeleccionadoData.vidaMaxima, enemigoSeleccionadoData.ataqueBase, enemigoSeleccionadoData.defensaBase,
         enemigoSeleccionadoData.velocidadBase, enemigoSeleccionadoData.suerteBase, enemigoSeleccionadoData.recompensaXP,
         enemigoSeleccionadoData.recompensaDinero, enemigoSeleccionadoData.patronIA,
         enemigoSeleccionadoData.avatarUrl // Pasar avatarUrl
    );

    // Referencias UI 
    const UIElementsBatalla = {
        logElement: document.getElementById('log-batalla'),
        resultadoElement: document.getElementById('resultado-batalla'),
        mensajeResultadoElement: document.getElementById('mensaje-resultado'),
        recompensasElement: document.getElementById('recompensas-batalla'),
        opcionesBatallaElement: document.getElementById('opciones-batalla'),
        botonContinuar: document.getElementById('boton-continuar-despues-batalla'),
        nombreJugadorBatalla: document.getElementById('nombre-jugador-batalla'),
        nombreEnemigoBatalla: document.getElementById('nombre-enemigo-batalla'),
        barraVidaJugador: document.getElementById('barra-vida-jugador'),
        textoVidaJugador: document.getElementById('texto-vida-jugador'),
        barraVidaEnemigo: document.getElementById('barra-vida-enemigo'),
        textoVidaEnemigo: document.getElementById('texto-vida-enemigo'),
        imgAvatarJugador: document.getElementById('img-avatar-jugador'), // Añadido
        imgAvatarEnemigo: document.getElementById('img-avatar-enemigo'), // Añadido
    };

    // Callback fin de combate 
    const callbackFinCombate = () => {
        setCombate(null);
        guardarProgreso();
        mostrarPantalla('pantalla-lobby'); // Esto reproducirá la música del lobby
    };

    // --- Inicio de Música de Batalla ---
    detenerMusica(); // Asegurarse de detener la música anterior (lobby)
    reproducirMusica('batalla'); // Iniciar música de batalla (alternará)

    // Crear e iniciar combate 
    const nuevoCombate = new Combate(personaje, enemigoEnCombate, UIElementsBatalla, callbackFinCombate);
    setCombate(nuevoCombate);
    mostrarPantalla('pantalla-batalla'); // Mostrar la pantalla (sin cambiar música aquí)
    nuevoCombate.iniciar();
}

export function accionGuardarSalir() { guardarProgreso(); mostrarMensaje('Progreso guardado. Puedes cerrar la ventana.', 'info', 0); document.querySelectorAll('#opciones-lobby button').forEach(b => b.disabled = true); }

