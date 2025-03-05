// Clases del juego
class Character {
    constructor(name, strength, defense, speed) {
        this.name = name;
        this.level = 1;
        this.strength = strength;
        this.defense = defense;
        this.speed = speed;
        this.maxHP = 100 + (strength * 10);
        this.currentHP = this.maxHP;
        this.money = 0;
        this.experience = 0;
        this.equippedWeapon = null;
        this.inventory = new Inventory();
    }

    // Métodos para equipar arma, recibir daño, etc.
    equipWeapon(weapon) {
        if (this.inventory.weapons.includes(weapon)) {
            if (this.equippedWeapon) {
                this.inventory.addWeapon(this.equippedWeapon);
            }
            this.equippedWeapon = weapon;
            this.inventory.removeWeapon(weapon);
        }
    }

    takeDamage(damage) {
        this.currentHP = Math.max(0, this.currentHP - damage);
    }

    heal(amount) {
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    }

    levelUp() {
        this.level++;
        this.strength += 2;
        this.defense += 2;
        this.maxHP += 20;
        this.currentHP = this.maxHP;
    }
}

class Weapon {
    constructor(name, attackValue, price) {
        this.name = name;
        this.attackValue = attackValue;
        this.price = price;
    }
}

class Enemy {
    constructor(name, level) {
        this.name = name;
        this.level = level;
        this.strength = level * 3;
        this.defense = level * 2;
        this.maxHP = 50 + (level * 10);
        this.currentHP = this.maxHP;
    }

    attack(target) {
        const damage = Math.max(0, this.strength - target.defense);
        target.takeDamage(damage);
        return damage;
    }
}

class Inventory {
    constructor() {
        this.weapons = [];
        this.maxCapacity = 10;
    }

    addWeapon(weapon) {
        if (this.weapons.length < this.maxCapacity) {
            this.weapons.push(weapon);
            return true;
        }
        return false;
    }

    removeWeapon(weapon) {
        const index = this.weapons.indexOf(weapon);
        if (index > -1) {
            this.weapons.splice(index, 1);
        }
    }
}

class Shop {
    constructor() {
        this.weapons = [
            new Weapon("Espada básica", 10, 50),
            new Weapon("Hacha de guerra", 15, 100),
            new Weapon("Espada legendaria", 25, 250)
        ];
    }

    buyWeapon(player, weapon) {
        if (player.money >= weapon.price) {
            player.money -= weapon.price;
            player.inventory.addWeapon(weapon);
            return true;
        }
        return false;
    }
}

class Battle {
    constructor(player, enemy) {
        this.player = player;
        this.enemy = enemy;
        this.turn = 'player';
    }

    playerAttack() {
        if (!this.player.equippedWeapon) return 0;
        const damage = Math.max(0, this.player.strength + this.player.equippedWeapon.attackValue - this.enemy.defense);
        this.enemy.takeDamage(damage);
        return damage;
    }

    enemyAttack() {
        const damage = this.enemy.attack(this.player);
        return damage;
    }

    isOver() {
        return this.player.currentHP <= 0 || this.enemy.currentHP <= 0;
    }
}

// Gestión de pantallas
class GameManager {
    constructor() {
        this.currentScreen = 'start-screen';
        this.player = null;
        this.shop = new Shop();
        this.initializeEventListeners();
        this.loadGame();
    }

    initializeEventListeners() {
        // Implementar eventos para botones y pantallas
        document.getElementById('new-game').addEventListener('click', () => this.showCharacterCreator());
        document.getElementById('character-form').addEventListener('submit', (e) => this.createCharacter(e));
        document.getElementById('go-to-shop').addEventListener('click', () => this.showShop());
        document.getElementById('start-battle').addEventListener('click', () => this.startBattle());
        // Añadir más listeners para otras funcionalidades
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    showCharacterCreator() {
        this.showScreen('character-creator');
    }

    createCharacter(event) {
        event.preventDefault();
        const name = document.getElementById('character-name').value;
        const strength = parseInt(document.getElementById('strength').value);
        const defense = parseInt(document.getElementById('defense').value);
        const speed = parseInt(document.getElementById('speed').value);

        this.player = new Character(name, strength, defense, speed);
        this.showScreen('lobby');
        this.updateLobbyDisplay();
        this.saveGame();
    }

    updateLobbyDisplay() {
        if (!this.player) return;
        document.getElementById('player-name').textContent = this.player.name;
        document.getElementById('player-level').textContent = this.player.level;
        document.getElementById('player-money').textContent = this.player.money;
    }

    showShop() {
        this.showScreen('shop');
        // Lógica para mostrar armas en la tienda
    }

    startBattle() {
        const enemy = new Enemy('Goblin', this.player.level);
        const battle = new Battle(this.player, enemy);
        this.showScreen('battle-screen');
        // Actualizar pantalla de batalla
    }

    saveGame() {
        if (!this.player) return;
        
        const gameData = {
            playerName: this.player.name,
            level: this.player.level,
            strength: this.player.strength,
            defense: this.player.defense,
            speed: this.player.speed,
            money: this.player.money,
            currentHP: this.player.currentHP,
            maxHP: this.player.maxHP,
            inventory: this.player.inventory.weapons.map(w => ({
                name: w.name,
                attackValue: w.attackValue,
                price: w.price
            })),
            equippedWeapon: this.player.equippedWeapon ? {
                name: this.player.equippedWeapon.name,
                attackValue: this.player.equippedWeapon.attackValue,
                price: this.player.equippedWeapon.price
            } : null
        };

        localStorage.setItem('gameData', JSON.stringify(gameData));
    }

    loadGame() {
        const savedData = localStorage.getItem('gameData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.player = new Character(data.playerName, data.strength, data.defense, data.speed);
            this.player.level = data.level;
            this.player.money = data.money;
            this.player.currentHP = data.currentHP;
            this.player.maxHP = data.maxHP;

            // Restaurar inventario
            data.inventory.forEach(weaponData => {
                const weapon = new Weapon(weaponData.name, weaponData.attackValue, weaponData.price);
                this.player.inventory.addWeapon(weapon);
            });

            // Restaurar arma equipada
            if (data.equippedWeapon) {
                const equippedWeapon = new Weapon(
                    data.equippedWeapon.name, 
                    data.equippedWeapon.attackValue, 
                    data.equippedWeapon.price
                );
                this.player.equipWeapon(equippedWeapon);
            }

            this.showScreen('lobby');
            this.updateLobbyDisplay();
        }
    }
}

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    new GameManager();
});