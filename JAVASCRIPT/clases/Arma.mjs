/**
 * Representa un arma en el juego.
 */
export class Arma {
    constructor(id, nombre, ataque, precio, descripcion = '') {
        this.id = id; // Identificador único del arma
        this.nombre = nombre; // Nombre del arma
        this.ataque = ataque; // Puntos de ataque que otorga
        this.precio = precio; // Costo en la tienda
        this.descripcion = descripcion; // Descripción opcional
    }
}
