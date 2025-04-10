/**
 * Clase base para representar a un luchador en el combate (Jugador o Enemigo).
 */
export class Luchador {
    constructor(nombre, nivel, vidaMaxima, ataqueBase, defensaBase, velocidadBase, suerteBase) {
        this.nombre = nombre;
        this.nivel = nivel;
        this.vidaMaxima = vidaMaxima;
        this.vidaActual = vidaMaxima;
        this.ataqueBase = ataqueBase;
        this.defensaBase = defensaBase;
        this.velocidadBase = velocidadBase;
        this.suerteBase = suerteBase; // 1 a 100 (probabilidad de golpe crítico/esquivar?)
        this.estaDefendiendo = false; // Estado de defensa
        this.efectosEstado = []; // Para futuras ampliaciones (quemadura, veneno, etc.)
    }

    /**
     * Calcula el ataque total (base + bonificaciones).
     * Este método será sobrescrito en clases hijas si es necesario (ej: Personaje con arma).
     * @returns {number}
     */
    calcularAtaque() {
        // Aquí se podrían añadir cálculos de efectos de estado que modifiquen el ataque
        return this.ataqueBase;
    }

    /**
     * Calcula la defensa total (base + bonificaciones).
     * Si está defendiendo, la duplica (ejemplo simple).
     * @returns {number}
     */
    calcularDefensa() {
        let defensaCalculada = this.defensaBase;
         // Aquí se podrían añadir cálculos de efectos de estado que modifiquen la defensa
        if (this.estaDefendiendo) {
            defensaCalculada *= 2; // Ejemplo: Defender duplica la defensa
        }
        return defensaCalculada;
    }

    /**
     * Calcula la velocidad total.
     * @returns {number}
     */
    calcularVelocidad() {
         // Aquí se podrían añadir cálculos de efectos de estado que modifiquen la velocidad
        return this.velocidadBase;
    }

    /**
     * Calcula la suerte total.
     * @returns {number}
     */
    calcularSuerte() {
         // Aquí se podrían añadir cálculos de efectos de estado que modifiquen la suerte
        return this.suerteBase;
    }

    /**
     * Aplica daño al luchador, reduciendo su vida actual.
     * @param {number} cantidadDanio - La cantidad de daño a recibir.
     */
    recibirDanio(cantidadDanio) {
        this.vidaActual -= cantidadDanio;
        if (this.vidaActual < 0) {
            this.vidaActual = 0;
        }
        this.estaDefendiendo = false; // Se quita la defensa al recibir daño (puede variar según reglas)
    }

    /**
     * Cura al luchador, aumentando su vida actual.
     * @param {number} cantidadCuracion - La cantidad de vida a recuperar.
     */
    curar(cantidadCuracion) {
        this.vidaActual += cantidadCuracion;
        if (this.vidaActual > this.vidaMaxima) {
            this.vidaActual = this.vidaMaxima;
        }
    }

    /**
     * Comprueba si el luchador está vivo.
     * @returns {boolean}
     */
    estaVivo() {
        return this.vidaActual > 0;
    }

    /**
     * Establece el estado de defensa.
     * @param {boolean} defendiendo - True si está defendiendo, False si no.
     */
    setDefendiendo(defendiendo) {
        this.estaDefendiendo = defendiendo;
    }

    /**
     * Reinicia el estado del luchador (vida al máximo, quitar defensa).
     * Útil al inicio o fin de un combate.
     */
    reiniciarEstado() {
        this.vidaActual = this.vidaMaxima;
        this.estaDefendiendo = false;
        this.efectosEstado = []; // Limpiar efectos
    }
}
