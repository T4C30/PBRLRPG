import { detenerMusica } from '../GestorAudio.mjs';

export class Combate {
    constructor(personaje, enemigo, UIElements, onCombateTerminado) {
        this.personaje = personaje;
        this.enemigo = enemigo;
        this.UI = UIElements; // Debe incluir ahora imgAvatarJugador, imgAvatarEnemigo
        this.onCombateTerminado = onCombateTerminado;

        this.turno = null;
        this.combateTerminado = false;

        // Limpiar UI y reiniciar luchadores (igual que antes)
        this.UI.logElement.innerHTML = '<p>Comienza la batalla...</p>';
        this.UI.resultadoElement.style.display = 'none';
        this.UI.opcionesBatallaElement.style.display = 'block';
        this.personaje.reiniciarEstado();
        this.enemigo.reiniciarEstado();
        this.personaje.setLogCallback((msg) => this.log(msg));

        // Listener botón continuar (igual que antes)
        this.UI.botonContinuar.onclick = () => this.finalizarCombateAccion();
    }

    iniciar() { 
        this.log(`¡Un ${this.enemigo.nombre} salvaje apareció!`);
        this.determinarPrimerTurno();
        this.actualizarUIBatalla(); // <-- Esto ahora actualizará las imágenes
        if (this.turno === 'enemigo') {
            this.log("El enemigo es más rápido y ataca primero.");
            setTimeout(() => this.ejecutarTurnoEnemigo(), 1000);
        } else {
            this.log("¡Tu turno!");
            this.habilitarAccionesJugador(true);
        }
     }
    determinarPrimerTurno() { 
        this.turno = (this.enemigo.calcularVelocidad() > this.personaje.calcularVelocidad()) ? 'enemigo' : 'personaje';
     }
    ejecutarAccionJugador(accion) { 
         if (this.combateTerminado || this.turno !== 'personaje') return;
         this.habilitarAccionesJugador(false);
         this.personaje.setDefendiendo(false);
         switch (accion) {
             case 'atacar': this.realizarAtaque(this.personaje, this.enemigo); break;
             case 'defender':
                 this.personaje.setDefendiendo(true);
                 this.log(`${this.personaje.nombre} se prepara para defender.`);
                 break;
             case 'huir':
                 if (this.intentarHuir()) return;
                 this.log(`${this.personaje.nombre} intentó huir, ¡pero falló!`);
                 break;
         }
         this.actualizarUIBatalla();
         if (!this.enemigo.estaVivo()) { this.terminarCombate(true); return; }
         this.turno = 'enemigo';
         this.log("Turno del enemigo...");
         setTimeout(() => this.ejecutarTurnoEnemigo(), 1500);
     }
    ejecutarTurnoEnemigo() { 
         if (this.combateTerminado || this.turno !== 'enemigo') return;
         const accionEnemigo = this.enemigo.decidirAccion(this.personaje);
         this.log(`El ${this.enemigo.nombre}...`);
         setTimeout(() => {
             switch (accionEnemigo) {
                 case 'atacar': this.realizarAtaque(this.enemigo, this.personaje); break;
                 case 'defender': this.log(`¡${this.enemigo.nombre} se defiende!`); break;
             }
             this.actualizarUIBatalla();
             if (!this.personaje.estaVivo()) { this.terminarCombate(false); return; }
             this.turno = 'personaje';
             this.log("¡Tu turno!");
             this.habilitarAccionesJugador(true);
         }, 1000);
     }
    realizarAtaque(atacante, defensor) { 
         const ataque = atacante.calcularAtaque();
         const defensa = defensor.calcularDefensa();
         let danioBase = Math.max(1, ataque - defensa);
         const factorAleatorio = 1 + (Math.random() * 0.2 - 0.1);
         let danioFinal = Math.round(danioBase * factorAleatorio);
         const probabilidadCritico = atacante.calcularSuerte() / 10;
         const esCritico = Math.random() * 100 < probabilidadCritico;
         if (esCritico) {
             danioFinal = Math.round(danioFinal * 1.5);
             this.log(`¡Golpe Crítico!`);
         }
         danioFinal = Math.max(0, danioFinal);
         defensor.recibirDanio(danioFinal);
         this.log(`${atacante.nombre} ataca a ${defensor.nombre} y causa ${danioFinal} puntos de daño.`);
         if (defensor.estaDefendiendo) { defensor.setDefendiendo(false); }
     }
    intentarHuir() { 
         const velocidadRatio = this.personaje.calcularVelocidad() / this.enemigo.calcularVelocidad();
         const suerteFactor = this.personaje.calcularSuerte() / 100;
         let probabilidadHuida = Math.max(0.1, Math.min(0.9, 0.5 + (velocidadRatio - 1) * 0.2 + suerteFactor * 0.1));
         if (Math.random() < probabilidadHuida) {
             this.personaje.aplicarPenalizacionHuida();
             this.terminarCombate(false, true);
             return true;
         }
         return false;
     }
    terminarCombate(jugadorGano, huyo = false) {
        this.combateTerminado = true;
        this.habilitarAccionesJugador(false);
        this.UI.opcionesBatallaElement.style.display = 'none';
        this.UI.resultadoElement.style.display = 'block';

        detenerMusica(); // Detener la música de batalla

        if (huyo) { 
            this.UI.mensajeResultadoElement.textContent = "¡Has huido!";
            this.UI.recompensasElement.textContent = `Perdiste algo de XP y dinero.`;
        } else if (jugadorGano) { 
             this.UI.mensajeResultadoElement.textContent = `¡Victoria! Has derrotado a ${this.enemigo.nombre}.`;
             this.personaje.ganarExperiencia(this.enemigo.recompensaXP);
             this.personaje.ganarDinero(this.enemigo.recompensaDinero);
             this.UI.recompensasElement.textContent = `Ganaste ${this.enemigo.recompensaXP} XP y ${this.enemigo.recompensaDinero} monedas.`;
        } else { 
            this.UI.mensajeResultadoElement.textContent = `¡Has sido derrotado!`;
            this.personaje.aplicarPenalizacionDerrota();
             this.UI.recompensasElement.textContent = `Pierdes la mitad de tu dinero.`;
        }

        this.UI.botonContinuar.focus();
        this.UI.botonContinuar.classList.add('seleccionado-mando');
    }

    finalizarCombateAccion() { 
        if (this.onCombateTerminado) {
            this.onCombateTerminado();
        }
     }

    // --- ACTUALIZAR UI  ---
    actualizarUIBatalla() {
        // Nombres y Barras de vida 
        this.UI.nombreJugadorBatalla.textContent = `${this.personaje.nombre} (Nvl ${this.personaje.nivel})`;
        this.UI.nombreEnemigoBatalla.textContent = `${this.enemigo.nombre} (Nvl ${this.enemigo.nivel})`;
        const vidaJugadorPorcentaje = (this.personaje.vidaActual / this.personaje.vidaMaxima) * 100;
        this.UI.barraVidaJugador.style.width = `${vidaJugadorPorcentaje}%`;
        this.UI.barraVidaJugador.style.backgroundColor = vidaJugadorPorcentaje > 50 ? '#48bb78' : vidaJugadorPorcentaje > 20 ? '#ecc94b' : '#f56565';
        this.UI.textoVidaJugador.textContent = `${this.personaje.vidaActual}/${this.personaje.vidaMaxima}`;
        const vidaEnemigoPorcentaje = (this.enemigo.vidaActual / this.enemigo.vidaMaxima) * 100;
        this.UI.barraVidaEnemigo.style.width = `${vidaEnemigoPorcentaje}%`;
        this.UI.barraVidaEnemigo.style.backgroundColor = vidaEnemigoPorcentaje > 50 ? '#48bb78' : vidaEnemigoPorcentaje > 20 ? '#ecc94b' : '#f56565';
        this.UI.textoVidaEnemigo.textContent = `${this.enemigo.vidaActual}/${this.enemigo.vidaMaxima}`;

        // Actualizar imágenes de avatares
        const placeholderHeroe = 'https://placehold.co/96x96/718096/e2e8f0?text=H%C3%A9roe';
        const placeholderEnemigo = 'https://placehold.co/96x96/a0aec0/1a202c?text=Enemigo';

        if (this.UI.imgAvatarJugador) {
            this.UI.imgAvatarJugador.src = this.personaje.avatarUrl || placeholderHeroe;
            this.UI.imgAvatarJugador.onerror = () => { this.UI.imgAvatarJugador.src = placeholderHeroe; }; // Fallback si falla la carga
        }
        if (this.UI.imgAvatarEnemigo) {
            this.UI.imgAvatarEnemigo.src = this.enemigo.avatarUrl || placeholderEnemigo;
             this.UI.imgAvatarEnemigo.onerror = () => { this.UI.imgAvatarEnemigo.src = placeholderEnemigo; }; // Fallback
        }
    }

    habilitarAccionesJugador(habilitar) { 
        const botones = this.UI.opcionesBatallaElement.querySelectorAll('button');
        botones.forEach(boton => boton.disabled = !habilitar);
     }
    log(mensaje) { 
        const p = document.createElement('p');
        p.textContent = mensaje;
        this.UI.logElement.appendChild(p);
        this.UI.logElement.scrollTop = this.UI.logElement.scrollHeight;
     }
}
