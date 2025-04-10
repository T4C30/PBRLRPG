import {
    setMandoConectado, getMandoConectado,
    setElementosNavegables, getElementosNavegables,
    setIndiceElementoSeleccionado, getIndiceElementoSeleccionado,
    getPantallaActual
} from './Status.mjs';

let intervaloPollingMando = null;
let botonesAnteriores = [];
let ejeYAnterior = 0;
const UMBRAL_EJE = 0.5;
const RETRASO_ENTRE_MOVIMIENTOS = 150; // ms
let tiempoUltimoMovimientoEje = 0;

/**
 * Inicia la detección y el polling del mando.
 */
export function iniciarGamepad() {
    window.addEventListener("gamepadconnected", handleGamepadConnect);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnect);

    // Comprobar mandos ya conectados
    const mandos = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const mando of mandos) {
        if (mando) {
            handleGamepadConnect({ gamepad: mando });
            break; // Conectar solo el primero
        }
    }
     actualizarEstadoMandoVisual(); // Actualizar texto inicial
}

function handleGamepadConnect(evento) {
    console.log("Mando conectado:", evento.gamepad);
    setMandoConectado(evento.gamepad);
    actualizarEstadoMandoVisual();

    if (!intervaloPollingMando) {
        intervaloPollingMando = requestAnimationFrame(pollGamepad);
    }
    actualizarSeleccionMandoPantalla(); // Actualizar selección al conectar
}

function handleGamepadDisconnect(evento) {
    console.log("Mando desconectado:", evento.gamepad);
    const mandoActual = getMandoConectado();
    if (mandoActual && mandoActual.index === evento.gamepad.index) {
        setMandoConectado(null);
        actualizarEstadoMandoVisual();
        quitarSeleccionMando();
    }
}

/**
 * Actualiza el texto que indica el estado del mando.
 */
function actualizarEstadoMandoVisual() {
     const elementoEstado = document.getElementById('estado-mando');
     if (!elementoEstado) return;
     const mando = getMandoConectado();
     elementoEstado.textContent = mando ? `Mando conectado: ${mando.id}` : 'Esperando conexión de mando...';
}


/**
 * Bucle principal para leer el estado del mando.
 */
function pollGamepad() {
    const mando = getMandoConectado();
    if (!mando) {
        intervaloPollingMando = requestAnimationFrame(pollGamepad); // Seguir buscando
        return;
    }

    const mandos = navigator.getGamepads();
    const estadoMandoActual = mandos[mando.index];

    if (!estadoMandoActual) {
        intervaloPollingMando = requestAnimationFrame(pollGamepad);
        return;
    }

    const ahora = performance.now();

    // --- Navegación (Eje Y o D-pad) ---
    const ejeY = estadoMandoActual.axes[1] ?? 0; // Usar ?? 0 por si no existe
    const dpadArriba = estadoMandoActual.buttons[12]?.pressed;
    const dpadAbajo = estadoMandoActual.buttons[13]?.pressed;

    if (ahora > tiempoUltimoMovimientoEje + RETRASO_ENTRE_MOVIMIENTOS) {
        if (ejeY < -UMBRAL_EJE || dpadArriba) {
            navegarMando(-1);
            tiempoUltimoMovimientoEje = ahora;
        } else if (ejeY > UMBRAL_EJE || dpadAbajo) {
            navegarMando(1);
            tiempoUltimoMovimientoEje = ahora;
        }
    }

    // --- Acciones (Botones) ---
    estadoMandoActual.buttons.forEach((boton, indice) => {
        const presionadoAhora = boton.pressed;
        const presionadoAntes = botonesAnteriores[indice];

        if (presionadoAhora && !presionadoAntes) {
            manejarPulsacionBotonMando(indice);
        }
    });

    botonesAnteriores = estadoMandoActual.buttons.map(b => b.pressed);
    ejeYAnterior = ejeY;

    intervaloPollingMando = requestAnimationFrame(pollGamepad);
}

/**
 * Actualiza la lista de elementos navegables para la pantalla actual y selecciona el primero.
 */
export function actualizarSeleccionMandoPantalla() {
    quitarSeleccionMando();
    const pantallaActiva = document.querySelector('.pantalla.activa');
    if (!pantallaActiva) {
         setElementosNavegables([]);
         setIndiceElementoSeleccionado(-1);
        return;
    }

    const nuevosElementosNavegables = Array.from(
        pantallaActiva.querySelectorAll('button:not([disabled]), input, select, a.boton')
    ).filter(el => el.offsetParent !== null) // Visibles
     .sort((a, b) => {
         const indiceA = parseInt(a.dataset.indiceMando) ?? Infinity;
         const indiceB = parseInt(b.dataset.indiceMando) ?? Infinity;
         if (indiceA !== Infinity && indiceB !== Infinity) {
             return indiceA - indiceB;
         }
         // Fallback (no muy fiable entre contenedores diferentes)
         return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
     });

     setElementosNavegables(nuevosElementosNavegables);

    if (nuevosElementosNavegables.length > 0) {
        setIndiceElementoSeleccionado(0);
        seleccionarElementoMando(nuevosElementosNavegables[0]);
    } else {
        setIndiceElementoSeleccionado(-1);
    }
}

/**
 * Mueve la selección del mando al siguiente o anterior elemento navegable.
 * @param {number} direccion - 1 para siguiente, -1 para anterior.
 */
function navegarMando(direccion) {
    const elementos = getElementosNavegables();
    let indiceActual = getIndiceElementoSeleccionado();

    if (elementos.length === 0 || indiceActual === -1) return;

    quitarSeleccionMando();

    indiceActual += direccion;

    if (indiceActual < 0) {
        indiceActual = elementos.length - 1;
    } else if (indiceActual >= elementos.length) {
        indiceActual = 0;
    }

    setIndiceElementoSeleccionado(indiceActual);
    seleccionarElementoMando(elementos[indiceActual]);
}

/**
 * Aplica el estilo de selección a un elemento y le da foco.
 * @param {HTMLElement} elemento
 */
function seleccionarElementoMando(elemento) {
    if (!elemento) return;
    quitarSeleccionMando(); // Asegurar que solo uno esté seleccionado
    elemento.classList.add('seleccionado-mando');
    elemento.focus();
}

/**
 * Quita el estilo de selección del elemento actualmente seleccionado.
 */
function quitarSeleccionMando() {
    const seleccionado = document.querySelector('.seleccionado-mando');
    if (seleccionado) {
        seleccionado.classList.remove('seleccionado-mando');
    }
}

/**
 * Maneja la pulsación de un botón del mando.
 * @param {number} indiceBoton - El índice del botón presionado.
 */
function manejarPulsacionBotonMando(indiceBoton) {
    const elementos = getElementosNavegables();
    const indiceActual = getIndiceElementoSeleccionado();
    const elementoActivo = (indiceActual !== -1 && elementos[indiceActual]) ? elementos[indiceActual] : null;

     // Botón A/X (Confirmar/Activar)
    if (indiceBoton === 0 && elementoActivo) {
        console.log(`Mando: Activando ${elementoActivo.id || elementoActivo.tagName}`);
        elementoActivo.click();

    }
    // Botón B/O (Cancelar/Volver)
    else if (indiceBoton === 1) {
        const pantallaActiva = document.querySelector('.pantalla.activa');
        if (pantallaActiva) {
             // Buscar botón específico de volver en la pantalla actual
            const botonVolver = pantallaActiva.querySelector(
                '#boton-volver-lobby-desde-tienda, #boton-volver-lobby-desde-inventario, #boton-volver-inicio-desde-creador'
                );
            if (botonVolver) {
                 console.log(`Mando: Activando Volver (${botonVolver.id})`);
                botonVolver.click();
            } else if (getPantallaActual() === 'pantalla-batalla' && !getCombate()?.combateTerminado) {
                 console.log("Mando: Botón Volver presionado en batalla (acción no definida).");
            } else {
                 console.log("Mando: Botón Volver presionado, sin acción definida para esta pantalla.");
            }
        }
    }
}

