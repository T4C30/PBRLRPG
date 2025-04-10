import { CAPACIDAD_INVENTARIO } from '../Constant.mjs';
// No necesita importar Arma aquí, solo maneja IDs o instancias pasadas

/**
 * Representa el inventario del jugador.
 */
export class Inventario {
    constructor(capacidad = CAPACIDAD_INVENTARIO) {
        this.armas = []; // Array para guardar las instancias de Arma
        this.capacidad = capacidad; // Capacidad máxima
        this.armaEquipadaId = null; // ID del arma equipada
    }

    /**
     * Añade un arma al inventario si hay espacio.
     * @param {Arma} arma - La instancia del arma a añadir.
     * @returns {boolean} - True si se añadió, False si no.
     */
    agregarArma(arma) {
        if (this.armas.length < this.capacidad) {
            // Evitar duplicados por ID
            if (!this.armas.some(a => a.id === arma.id)) {
                 this.armas.push(arma);
                 return true;
            } else {
                console.warn(`El arma "${arma.nombre}" (ID: ${arma.id}) ya está en el inventario.`);
                return false;
            }
        }
        return false;
    }

    /**
     * Elimina un arma del inventario por su ID.
     * @param {string} idArma - El ID del arma a eliminar.
     */
    eliminarArma(idArma) {
        this.armas = this.armas.filter(arma => arma.id !== idArma);
        if (this.armaEquipadaId === idArma) {
            this.desequiparArma();
        }
    }

    /**
     * Equipa un arma del inventario.
     * @param {string} idArma - El ID del arma a equipar.
     * @returns {boolean} - True si se equipó, False si el arma no está en el inventario.
     */
    equiparArma(idArma) {
        const armaAEquipar = this.armas.find(arma => arma.id === idArma);
        if (armaAEquipar) {
            this.armaEquipadaId = idArma;
            return true;
        }
        return false;
    }

    /**
     * Desequipa el arma actual.
     */
    desequiparArma() {
        this.armaEquipadaId = null;
    }

    /**
     * Obtiene la instancia del arma equipada.
     * @returns {Arma | null} - La instancia del arma equipada o null si no hay ninguna.
     */
    obtenerArmaEquipada() {
        if (!this.armaEquipadaId) return null;
        return this.armas.find(arma => arma.id === this.armaEquipadaId) || null;
    }

    /**
     * Comprueba si el inventario contiene un arma específica por ID.
     * @param {string} idArma - El ID del arma a buscar.
     * @returns {boolean} - True si el arma está en el inventario, False si no.
     */
    contieneArma(idArma) {
        return this.armas.some(arma => arma.id === idArma);
    }

    /**
     * Obtiene el número actual de objetos en el inventario.
     * @returns {number}
     */
    obtenerCantidadActual() {
        return this.armas.length;
    }

    /**
     * Comprueba si el inventario está lleno.
     * @returns {boolean}
     */
    estaLleno() {
        return this.obtenerCantidadActual() >= this.capacidad;
    }

    /**
     * Obtiene un array con los IDs de las armas en el inventario.
     * @returns {string[]}
     */
    obtenerIdsArmas() {
        return this.armas.map(a => a.id);
    }
}
