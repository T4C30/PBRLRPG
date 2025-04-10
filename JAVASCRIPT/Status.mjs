// Gestiona el estado global compartido de la aplicación

let personajeJugador = null;
let combateActual = null;
let pantallaActual = 'pantalla-inicio'; // ID de la pantalla visible
let elementosNavegables = []; // Para el gamepad
let indiceElementoSeleccionado = -1; // Para el gamepad
let mandoConectado = null; // Para el gamepad

// --- Getters ---
export function getPersonaje() {
    return personajeJugador;
}

export function getCombate() {
    return combateActual;
}

export function getPantallaActual() {
    return pantallaActual;
}

export function getElementosNavegables() {
    return elementosNavegables;
}

export function getIndiceElementoSeleccionado() {
    return indiceElementoSeleccionado;
}

export function getMandoConectado() {
    return mandoConectado;
}


// --- Setters ---
export function setPersonaje(nuevoPersonaje) {
    personajeJugador = nuevoPersonaje;
}

export function setCombate(nuevoCombate) {
    combateActual = nuevoCombate;
}

export function setPantallaActual(nuevaPantalla) {
    pantallaActual = nuevaPantalla;
}

export function setElementosNavegables(nuevosElementos) {
    elementosNavegables = nuevosElementos;
}

export function setIndiceElementoSeleccionado(nuevoIndice) {
    indiceElementoSeleccionado = nuevoIndice;
}

export function setMandoConectado(nuevoMando) {
    mandoConectado = nuevoMando;
}
