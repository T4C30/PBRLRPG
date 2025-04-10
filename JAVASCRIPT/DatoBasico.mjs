import { Arma } from './clases/Arma.mjs';
import { Enemigo } from './clases/Enemigo.mjs'; // Importar Enemigo para usar fromData si se define ahí

// Definir datos en bruto
const datosArmas = [
    { id: 'espada_madera', nombre: 'Espada de Madera', ataque: 5, precio: 10, descripcion: 'Una espada básica para empezar.' },
    { id: 'daga_oxidada', nombre: 'Daga Oxidada', ataque: 7, precio: 15, descripcion: 'Ligera pero poco fiable.' },
    { id: 'hacha_mano', nombre: 'Hacha de Mano', ataque: 10, precio: 50, descripcion: 'Un hacha robusta.' },
    { id: 'espada_hierro', nombre: 'Espada de Hierro', ataque: 15, precio: 100, descripcion: 'Un arma estándar de guerrero.' },
    { id: 'arco_corto', nombre: 'Arco Corto', ataque: 12, precio: 80, descripcion: 'Requiere destreza para usar.' },
    { id: 'mandoble_acero', nombre: 'Mandoble de Acero', ataque: 25, precio: 250, descripcion: 'Pesada pero poderosa.' },
    { id: 'baculo_aprendiz', nombre: 'Báculo de Aprendiz', ataque: 8, precio: 60, descripcion: 'Canaliza un poco de magia.' },
];

const datosEnemigos = [
    { id: 'rata_gigante', nombre: 'Rata Gigante', nivel: 1, vidaMaxima: 30, ataqueBase: 5, defensaBase: 3, velocidadBase: 10, suerteBase: 10, recompensaXP: 10, recompensaDinero: 5, patronIA: 'agresivo', avatarUrl: 'https://placehold.co/96x96/a0aec0/1a202c?text=Rata' },
    { id: 'goblin_debil', nombre: 'Goblin Débil', nivel: 2, vidaMaxima: 50, ataqueBase: 8, defensaBase: 5, velocidadBase: 15, suerteBase: 20, recompensaXP: 15, recompensaDinero: 10, patronIA: 'aleatorio', avatarUrl: 'https://placehold.co/96x96/48bb78/1a202c?text=Goblin' },
    { id: 'esqueleto', nombre: 'Esqueleto', nivel: 3, vidaMaxima: 70, ataqueBase: 12, defensaBase: 8, velocidadBase: 12, suerteBase: 30, recompensaXP: 25, recompensaDinero: 15, patronIA: 'aleatorio', avatarUrl: 'https://placehold.co/96x96/e2e8f0/1a202c?text=Huesos' },
    { id: 'lobo_feroz', nombre: 'Lobo Feroz', nivel: 4, vidaMaxima: 60, ataqueBase: 15, defensaBase: 6, velocidadBase: 25, suerteBase: 40, recompensaXP: 30, recompensaDinero: 20, patronIA: 'agresivo', avatarUrl: 'https://placehold.co/96x96/718096/1a202c?text=Lobo' },
    { id: 'orco_bruto', nombre: 'Orco Bruto', nivel: 5, vidaMaxima: 120, ataqueBase: 20, defensaBase: 15, velocidadBase: 8, suerteBase: 50, recompensaXP: 50, recompensaDinero: 30, patronIA: 'agresivo', avatarUrl: 'https://placehold.co/96x96/9f7aea/1a202c?text=Orco' },
    { id: 'mago_oscuro', nombre: 'Mago Oscuro', nivel: 6, vidaMaxima: 80, ataqueBase: 25, defensaBase: 10, velocidadBase: 20, suerteBase: 60, recompensaXP: 60, recompensaDinero: 40, patronIA: 'defensivo', avatarUrl: 'https://placehold.co/96x96/ed64a6/1a202c?text=Mago' },
];

// Crear instancias y exportar
export const listaGlobalArmas = datosArmas.map(data => new Arma(data.id, data.nombre, data.ataque, data.precio, data.descripcion));

// Usar el método estático fromData si se definió en Enemigo.mjs
// export const listaGlobalEnemigos = datosEnemigos.map(data => Enemigo.fromData(data));
// O crear instancias directamente si no se usó fromData
export const listaGlobalEnemigos = datosEnemigos.map(data => new Enemigo(
     data.id, data.nombre, data.nivel, data.vidaMaxima,
     data.ataqueBase, data.defensaBase, data.velocidadBase, data.suerteBase,
     data.recompensaXP, data.recompensaDinero, data.patronIA, data.avatarUrl
));

