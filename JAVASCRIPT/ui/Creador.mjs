import { MAX_PUNTOS_ESTADISTICAS } from '../Constant.mjs';
import { listaGlobalArmas } from '../DatoBasico.mjs';
import { Personaje } from '../clases/Personaje.mjs';
import { setPersonaje } from '../Status.mjs';
import { guardarProgreso, mostrarMensaje } from '../UtilesExtras.mjs';

let puntosRestantesElement;
let errorStatsElement;
let botonCrearElement;
let nombrePersonajeElement;
let inputsStatsElements;
let armaInicialElement;
let formCreadorElement;

/**
 * Configura la pantalla del creador de personajes.
 */
export function configurarPantallaCreador() {
    // Cachear elementos DOM si no están cacheados
    if (!formCreadorElement) {
        formCreadorElement = document.getElementById('formulario-creador');
        puntosRestantesElement = document.getElementById('puntos-estadisticas-restantes');
        errorStatsElement = document.getElementById('error-estadisticas');
        botonCrearElement = document.getElementById('boton-crear-personaje');
        nombrePersonajeElement = document.getElementById('nombre-personaje');
        inputsStatsElements = document.querySelectorAll('#pantalla-creador input[type="number"]');
        armaInicialElement = document.getElementById('arma-inicial');

        // Añadir listeners una sola vez
        inputsStatsElements.forEach(input => {
            input.addEventListener('input', validarPuntosEstadisticas);
        });
         nombrePersonajeElement.addEventListener('input', validarPuntosEstadisticas); // Validar también al cambiar nombre
    }


    // Resetear formulario
    formCreadorElement.reset();
    puntosRestantesElement.textContent = MAX_PUNTOS_ESTADISTICAS;
    errorStatsElement.style.display = 'none';
    botonCrearElement.disabled = true; // Deshabilitado al inicio

    // Cargar armas iniciales en el select
    armaInicialElement.innerHTML = ''; // Limpiar opciones
    listaGlobalArmas.slice(0, 2).forEach(arma => { // Ofrecer solo las 2 primeras como iniciales
        const opcion = document.createElement('option');
        opcion.value = arma.id;
        opcion.textContent = `${arma.nombre} (Ataque: ${arma.ataque})`;
        armaInicialElement.appendChild(opcion);
    });

    validarPuntosEstadisticas(); // Validar estado inicial
}

/**
 * Valida que la suma de estadísticas no supere el máximo y que haya nombre.
 */
export function validarPuntosEstadisticas() {
     if (!puntosRestantesElement || !inputsStatsElements || !errorStatsElement || !botonCrearElement || !nombrePersonajeElement) {
         console.error("Error: Elementos del creador no encontrados al validar.");
         return; // Salir si los elementos no están listos
     }

    let totalPuntosAsignados = 0;
    inputsStatsElements.forEach(input => {
        totalPuntosAsignados += (parseInt(input.value) || 0) - 1; // Restar el punto base (1)
    });
     totalPuntosAsignados = Math.max(0, totalPuntosAsignados); // No puede ser negativo

    const puntosRestantes = MAX_PUNTOS_ESTADISTICAS - totalPuntosAsignados;
    puntosRestantesElement.textContent = puntosRestantes;

    const nombre = nombrePersonajeElement.value.trim();
    let esValido = true;

    if (puntosRestantes < 0) {
        errorStatsElement.textContent = `Has asignado ${totalPuntosAsignados} puntos. El máximo es ${MAX_PUNTOS_ESTADISTICAS}.`;
        errorStatsElement.style.display = 'block';
        esValido = false;
    } else {
        errorStatsElement.style.display = 'none';
    }

    if (nombre === '') {
        esValido = false; // Nombre es obligatorio
    }

    botonCrearElement.disabled = !esValido;
}

/**
 * Crea un nuevo personaje basado en el formulario.
 * @returns {Personaje | null} La instancia del personaje creado o null si hay error.
 */
export function accionCrearPersonaje() {
    const nombre = nombrePersonajeElement.value.trim();
    const fuerza = parseInt(document.getElementById('stat-fuerza').value) || 1;
    const defensa = parseInt(document.getElementById('stat-defensa').value) || 1;
    const velocidad = parseInt(document.getElementById('stat-velocidad').value) || 1;
    const suerte = parseInt(document.getElementById('stat-suerte').value) || 1;
    const idArmaInicial = armaInicialElement.value;

    // Validar de nuevo por si acaso
    if (!nombre || (fuerza + defensa + velocidad + suerte - 4) > MAX_PUNTOS_ESTADISTICAS) {
        mostrarMensaje('Datos inválidos. Revisa el nombre y los puntos de estadísticas.', 'error');
        return null;
    }

    const vidaMaximaInicial = defensa * 10 + 50;
    const nuevoPersonaje = new Personaje(nombre, 1, vidaMaximaInicial, fuerza, defensa, velocidad, suerte, 20, 0);

    const armaInicial = listaGlobalArmas.find(a => a.id === idArmaInicial);
    if (armaInicial) {
        nuevoPersonaje.agregarArmaInventario(armaInicial);
        nuevoPersonaje.equiparArmaInventario(armaInicial.id);
    } else {
        console.warn("No se encontró el arma inicial seleccionada.");
    }

    setPersonaje(nuevoPersonaje); // Guardar en el estado global
    guardarProgreso(); // Guardar inmediatamente
    console.log("Personaje creado:", nuevoPersonaje);
    return nuevoPersonaje;
}
