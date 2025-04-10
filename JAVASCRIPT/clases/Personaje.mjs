import { Luchador } from './Luchador.mjs';
import { Inventario } from './Inventario.mjs';
import { XP_POR_NIVEL_BASE, FACTOR_XP_NIVEL, PENALIZACION_HUIDA_XP, PENALIZACION_HUIDA_DINERO, CAPACIDAD_INVENTARIO } from '../Constant.mjs';

export class Personaje extends Luchador {
    constructor(nombre, nivel, vidaMaxima, ataqueBase, defensaBase, velocidadBase, suerteBase, dinero = 0, experiencia = 0, avatarUrl = 'Imagenes/Heroe.png') { // Valor por defecto
        super(nombre, nivel, vidaMaxima, ataqueBase, defensaBase, velocidadBase, suerteBase);

        this.dinero = dinero;
        this.experiencia = experiencia;
        this.experienciaNecesaria = this.calcularExperienciaNecesaria();
        this.inventario = new Inventario();
        this.avatarUrl = avatarUrl; 
        this.logCallback = (mensaje) => console.log("Log Personaje:", mensaje);
    }

    setLogCallback(callback) { this.logCallback = callback; }
    calcularAtaque() { 
        let ataqueCalculado = super.calcularAtaque();
        const armaEquipada = this.inventario.obtenerArmaEquipada();
        if (armaEquipada) {
            ataqueCalculado += armaEquipada.ataque;
        }
        return ataqueCalculado;
     }
    calcularExperienciaNecesaria() { 
        return Math.floor(XP_POR_NIVEL_BASE * Math.pow(FACTOR_XP_NIVEL, this.nivel - 1));
    }
    ganarExperiencia(cantidadExperiencia) { 
        if (cantidadExperiencia <= 0) return;
        this.experiencia += cantidadExperiencia;
        this.logCallback(`¡${this.nombre} ha ganado ${cantidadExperiencia} puntos de experiencia!`);
        while (this.experiencia >= this.experienciaNecesaria) {
            this.subirNivel();
        }
     }
    subirNivel() { 
        this.experiencia -= this.experienciaNecesaria;
        this.nivel++;
        this.experienciaNecesaria = this.calcularExperienciaNecesaria();
        const mejoraVida = Math.floor(Math.random() * 5) + 5;
        const mejoraAtaque = Math.floor(Math.random() * 2) + 1;
        const mejoraDefensa = Math.floor(Math.random() * 2) + 1;
        const mejoraVelocidad = Math.floor(Math.random() * 2);
        const mejoraSuerte = Math.floor(Math.random() * 2);
        this.vidaMaxima += mejoraVida;
        this.vidaActual = this.vidaMaxima;
        this.ataqueBase += mejoraAtaque;
        this.defensaBase += mejoraDefensa;
        this.velocidadBase += mejoraVelocidad;
        this.suerteBase = Math.min(100, this.suerteBase + mejoraSuerte);
        this.logCallback(`¡${this.nombre} ha subido al nivel ${this.nivel}!`);
        this.logCallback(` Vida: +${mejoraVida}, Atk: +${mejoraAtaque}, Def: +${mejoraDefensa}, Vel: +${mejoraVelocidad}, Sue: +${mejoraSuerte}`);
     }
    ganarDinero(cantidadDinero) { 
         if (cantidadDinero <= 0) return;
        this.dinero += cantidadDinero;
        this.logCallback(`¡${this.nombre} ha encontrado ${cantidadDinero} monedas!`);
     }
    gastarDinero(cantidadDinero) { 
        if (this.dinero >= cantidadDinero) {
            this.dinero -= cantidadDinero;
            return true;
        }
        return false;
     }
    aplicarPenalizacionHuida() { 
        const xpPerdida = Math.floor(this.experiencia * PENALIZACION_HUIDA_XP);
        const dineroPerdido = PENALIZACION_HUIDA_DINERO;
        this.experiencia = Math.max(0, this.experiencia - xpPerdida);
        this.dinero = Math.max(0, this.dinero - dineroPerdido);
        this.logCallback(`¡${this.nombre} ha huido! Pierde ${xpPerdida} XP y ${dineroPerdido} monedas.`);
     }
    aplicarPenalizacionDerrota() { 
         const dineroPerdido = Math.floor(this.dinero / 2);
         this.dinero = Math.max(0, this.dinero - dineroPerdido);
         this.logCallback(`¡${this.nombre} ha sido derrotado! Pierde ${dineroPerdido} monedas.`);
     }

    // Métodos delegados al Inventario (sin cambios)
    agregarArmaInventario(arma) { return this.inventario.agregarArma(arma); }
    eliminarArmaInventario(idArma) { this.inventario.eliminarArma(idArma); }
    equiparArmaInventario(idArma) { return this.inventario.equiparArma(idArma); }
    obtenerArmaEquipadaInventario() { return this.inventario.obtenerArmaEquipada(); }
    obtenerInventario() { return this.inventario.armas; }
    obtenerCapacidadInventario() { return this.inventario.capacidad; }
    obtenerCantidadInventario() { return this.inventario.obtenerCantidadActual(); }
    inventarioLleno() { return this.inventario.estaLleno(); }
    contieneArmaEnInventario(idArma) { return this.inventario.contieneArma(idArma); }

    // --- Serialización  ---
    toJSON() {
        return {
            
            nombre: this.nombre,
            nivel: this.nivel,
            vidaMaxima: this.vidaMaxima,
            ataqueBase: this.ataqueBase,
            defensaBase: this.defensaBase,
            velocidadBase: this.velocidadBase,
            suerteBase: this.suerteBase,
            dinero: this.dinero,
            experiencia: this.experiencia,
            avatarUrl: this.avatarUrl, // Guardar avatar
            inventario: {
                armasIds: this.inventario.obtenerIdsArmas(),
                armaEquipadaId: this.inventario.armaEquipadaId,
                capacidad: this.inventario.capacidad
            }
        };
    }

    // --- Deserialización ---
    static fromJSON(jsonData, listaGlobalArmas) {
        if (!jsonData) return null;

        const personaje = new Personaje(
            jsonData.nombre, jsonData.nivel, jsonData.vidaMaxima,
            jsonData.ataqueBase, jsonData.defensaBase, jsonData.velocidadBase, jsonData.suerteBase,
            jsonData.dinero, jsonData.experiencia,
            jsonData.avatarUrl || 'images/heroe_batalla.png' // Cargar avatar o usar default
        );

        // Reconstruir inventario 
        if (jsonData.inventario && jsonData.inventario.armasIds) {
            personaje.inventario = new Inventario(jsonData.inventario.capacidad || CAPACIDAD_INVENTARIO);
            jsonData.inventario.armasIds.forEach(idArma => {
                const armaEncontrada = listaGlobalArmas.find(a => a.id === idArma);
                if (armaEncontrada) {
                    personaje.inventario.agregarArma(armaEncontrada);
                } else {
                    console.warn(`No se encontró el arma con ID ${idArma} en la lista global al cargar.`);
                }
            });
            if (jsonData.inventario.armaEquipadaId) {
                personaje.inventario.equiparArma(jsonData.inventario.armaEquipadaId);
            }
        }
        personaje.reiniciarEstado();
        personaje.experienciaNecesaria = personaje.calcularExperienciaNecesaria();

        return personaje;
    }
}
