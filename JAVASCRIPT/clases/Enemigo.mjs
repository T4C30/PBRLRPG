import { Luchador } from './Luchador.mjs';

export class Enemigo extends Luchador {
    // Asegurarse de que avatarUrl se recibe y se guarda
    constructor(id, nombre, nivel, vidaMaxima, ataqueBase, defensaBase, velocidadBase, suerteBase, recompensaXP, recompensaDinero, patronIA = 'aleatorio', avatarUrl = 'images/enemigo_generico.png') { // Valor por defecto
        super(nombre, nivel, vidaMaxima, ataqueBase, defensaBase, velocidadBase, suerteBase);
        this.id = id;
        this.recompensaXP = recompensaXP;
        this.recompensaDinero = recompensaDinero;
        this.patronIA = patronIA;
        this.avatarUrl = avatarUrl; // Guardar URL
    }

    decidirAccion(objetivo) {
        this.setDefendiendo(false);
        switch (this.patronIA) {
            case 'agresivo': return 'atacar';
            case 'defensivo':
                if (this.vidaActual / this.vidaMaxima < 0.3) {
                    this.setDefendiendo(true);
                    return 'defender';
                } else { return 'atacar'; }
            case 'aleatorio': default:
                return Math.random() < 0.7 ? 'atacar' : 'defender';
        }
     }

    // fromData (si se usa) debería también pasar el avatarUrl
    static fromData(data) {
         return new Enemigo(
             data.id, data.nombre, data.nivel, data.vidaMaxima,
             data.ataqueBase, data.defensaBase, data.velocidadBase, data.suerteBase,
             data.recompensaXP, data.recompensaDinero, data.patronIA,
             data.avatarUrl || 'images/enemigo_generico.png' // Usar default si no viene
         );
     }
}
