
// Gestiona la reproducción de música y efectos de sonido

// --- Configuración de Archivos ---
const RUTA_AUDIO = '../Audio/'; 
const PISTAS = {
    menu: `${RUTA_AUDIO}MenuPrincipal.mp3`,
    lobby: `${RUTA_AUDIO}Lobby.mp3`,
    tienda: `${RUTA_AUDIO}Tienda.mp3`,
    batalla1: `${RUTA_AUDIO}Batalla1.mp3`,
    batalla2: `${RUTA_AUDIO}Batalla2.mp3`,
};

// --- Estado del Audio ---
let musicaActual = null; // El objeto Audio que está sonando
let tipoMusicaActual = null; // 'menu', 'lobby', 'tienda', 'batalla1', 'batalla2'
let ultimaMusicaBatalla = 2; // Para alternar, empezamos asumiendo que la última fue la 2
let volumenMusica = 0.5; // Volumen por defecto (0 a 1)

// --- Funciones Públicas ---

/**
 * Intenta reproducir la música para un tipo de pantalla/escena específico.
 * Detiene la música anterior si la hay.
 * @param {'menu' | 'lobby' | 'tienda' | 'batalla'} tipo - El tipo de música a reproducir.
 */
export function reproducirMusica(tipo) {
    let pistaParaReproducir;
    let tipoPistaParaReproducir;

    if (tipo === 'batalla') {
        // Alternar música de batalla
        tipoPistaParaReproducir = (ultimaMusicaBatalla === 1) ? 'batalla2' : 'batalla1';
        ultimaMusicaBatalla = (ultimaMusicaBatalla === 1) ? 2 : 1;
        pistaParaReproducir = PISTAS[tipoPistaParaReproducir];
    } else if (PISTAS[tipo]) {
        tipoPistaParaReproducir = tipo;
        pistaParaReproducir = PISTAS[tipo];
    } else {
        console.warn(`Tipo de música no válido: ${tipo}`);
        detenerMusica(); // Detener música si el tipo no es válido
        return;
    }

    // Si ya está sonando la misma pista, no hacer nada
    if (musicaActual && tipoMusicaActual === tipoPistaParaReproducir) {
        // Asegurarse de que esté sonando si se pausó por alguna razón
        if (musicaActual.paused) {
            musicaActual.play().catch(e => console.error("Error al reanudar música:", e));
        }
        return;
    }

    // Detener música anterior
    detenerMusica();

    // Crear y reproducir nueva música
    console.log(`Reproduciendo música: ${tipoPistaParaReproducir} (${pistaParaReproducir})`);
    musicaActual = new Audio(pistaParaReproducir);
    musicaActual.loop = true; // Repetir música de fondo
    musicaActual.volume = volumenMusica;

    // Intentar reproducir (puede fallar si no hay interacción del usuario)
    musicaActual.play()
        .then(() => {
            tipoMusicaActual = tipoPistaParaReproducir; // Marcar como sonando solo si tiene éxito
        })
        .catch(error => {
            console.warn(`No se pudo reproducir la música automáticamente (${tipoPistaParaReproducir}):`, error.message);
            musicaActual = null; // Limpiar si falló
            tipoMusicaActual = null;
        });
}

/**
 * Detiene la música que esté sonando actualmente.
 */
export function detenerMusica() {
    if (musicaActual) {
        console.log(`Deteniendo música: ${tipoMusicaActual}`);
        musicaActual.pause();
        musicaActual.currentTime = 0; // Reiniciar al principio
        musicaActual = null;
        tipoMusicaActual = null;
    }
}

/**
 * Ajusta el volumen de la música actual y futura.
 * @param {number} nuevoVolumen - Valor entre 0 (silencio) y 1 (máximo).
 */
export function ajustarVolumen(nuevoVolumen) {
    volumenMusica = Math.max(0, Math.min(1, nuevoVolumen)); // Asegurar rango 0-1
    if (musicaActual) {
        musicaActual.volume = volumenMusica;
    }
    console.log(`Volumen ajustado a: ${volumenMusica}`);
    // Se podría guardar en localStorage si se quiere persistencia
}

/**
 * (Opcional) Precarga los archivos de audio para que estén listos.
 */
export function cargarAudios() {
    console.log("Precargando audios...");
    Object.values(PISTAS).forEach(ruta => {
        const audio = new Audio();
        audio.src = ruta;
        // No es necesario hacer play, solo crear el objeto puede iniciar la carga
    });
}

// --- Inicialización ---
let primeraInteraccionHecha = false;

export function registrarPrimeraInteraccion() {
    if (!primeraInteraccionHecha) {
        primeraInteraccionHecha = true;
        console.log("Primera interacción registrada. El audio debería funcionar.");
        // Intentar reproducir la música que debería estar sonando si falló antes
        if (!musicaActual && tipoMusicaActual) {
             reproducirMusica(tipoMusicaActual); // Intentar de nuevo
        }
    }
}


