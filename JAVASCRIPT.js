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
        this.money = 100; // Comenzar con algo de dinero
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
            return true;
        }
        return false;
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
        const damage = Math.max(1, this.strength - (target.defense / 2));
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
        const index = this.weapons.findIndex(w => 
            w.name === weapon.name && 
            w.attackValue === weapon.attackValue && 
            w.price === weapon.price
        );
        
        if (index > -1) {
            this.weapons.splice(index, 1);
            return true;
        }
        return false;
    }
}

class Shop {
    constructor() {
        this.weapons = [
            new Weapon("Espada básica", 10, 50),
            new Weapon("Hacha de guerra", 15, 100),
            new Weapon("Lanza afilada", 12, 75),
            new Weapon("Espada legendaria", 25, 250)
        ];
    }

    buyWeapon(player, weapon) {
        if (player.money >= weapon.price) {
            player.money -= weapon.price;
            if (player.inventory.addWeapon(weapon)) {
                return true;
            } else {
                // Devolver el dinero si el inventario está lleno
                player.money += weapon.price;
                return false;
            }
        }
        return false;
    }
}

class Battle {
    constructor(player, enemy) {
        this.player = player;
        this.enemy = enemy;
        this.turn = 'player';
        this.isDefending = false;
    }

    playerAttack() {
        if (!this.player.equippedWeapon) return 0;
        
        const weaponAttack = this.player.equippedWeapon.attackValue;
        const damage = Math.max(1, (this.player.strength + weaponAttack) - (this.enemy.defense / 2));
        this.enemy.takeDamage(damage);
        this.turn = 'enemy';
        this.isDefending = false;
        return damage;
    }

    playerDefend() {
        this.isDefending = true;
        this.turn = 'enemy';
        return true;
    }

    enemyAttack() {
        let damage = this.enemy.attack(this.player);
        
        // Si el jugador está defendiéndose, reduce el daño a la mitad
        if (this.isDefending) {
            damage = Math.floor(damage / 2);
            this.isDefending = false;
        }
        
        this.player.takeDamage(damage);
        this.turn = 'player';
        return damage;
    }

    isOver() {
        return this.player.currentHP <= 0 || this.enemy.currentHP <= 0;
    }

    getResult() {
        if (this.player.currentHP <= 0) {
            return 'defeat';
        } else if (this.enemy.currentHP <= 0) {
            return 'victory';
        }
        return null;
    }
}

// Gestión de pantallas
class GameManager {
    constructor() {
        this.currentScreen = 'start-screen';
        this.player = null;
        this.shop = new Shop();
        this.currentBattle = null;
        this.initializeEventListeners();
        this.loadGame();
    }

    initializeEventListeners() {
        // Inicio
        document.getElementById('continue-game').addEventListener('click', () => this.continueGame());
        document.getElementById('new-game').addEventListener('click', () => this.showCharacterCreator());
        document.getElementById('delete-data').addEventListener('click', () => this.deleteGameData());
        
        // Creador de personaje
        document.getElementById('character-form').addEventListener('submit', (e) => this.createCharacter(e));
        
        // Lobby
        document.getElementById('go-to-shop').addEventListener('click', () => this.showShop());
        document.getElementById('manage-inventory').addEventListener('click', () => this.showInventory());
        document.getElementById('start-battle').addEventListener('click', () => this.startBattle());
        
        // Tienda
        document.getElementById('return-to-lobby').addEventListener('click', () => this.returnToLobby());
        
        // Inventario
        document.getElementById('return-from-inventory').addEventListener('click', () => this.returnToLobby());
        
        // Batalla
        document.getElementById('attack-btn').addEventListener('click', () => this.battleAction('attack'));
        document.getElementById('defend-btn').addEventListener('click', () => this.battleAction('defend'));
        document.getElementById('flee-btn').addEventListener('click', () => this.battleAction('flee'));
    }

    // Métodos para gestionar las pantallas
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;

        // Actualizar interface según la pantalla
        if (screenId === 'lobby') {
            this.updateLobbyDisplay();
        } else if (screenId === 'shop') {
            this.renderShop();
        } else if (screenId === 'inventory') {
            this.renderInventory();
        }
    }

    // Métodos para cada pantalla
    continueGame() {
        if (this.player) {
            this.showScreen('lobby');
        } else {
            alert('No hay partida guardada.');
        }
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

        // Validar puntos de estadísticas
        const totalPoints = strength + defense + speed;
        if (totalPoints > 25) {
            alert('¡Has asignado demasiados puntos! El total debe ser menor o igual a 25.');
            return;
        }

        this.player = new Character(name, strength, defense, speed);
        
        // Dar arma inicial
        const initialWeapon = new Weapon("Daga básica", 5, 0);
        this.player.inventory.addWeapon(initialWeapon);
        this.player.equipWeapon(initialWeapon);
        
        this.showScreen('lobby');
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
    }

    renderShop() {
        const shopContainer = document.getElementById('weapon-list');
        shopContainer.innerHTML = '';

        this.shop.weapons.forEach(weapon => {
            const weaponElement = document.createElement('div');
            weaponElement.classList.add('weapon-item');
            
            weaponElement.innerHTML = `
                <span>${weapon.name} - Ataque: ${weapon.attackValue} - Precio: ${weapon.price}</span>
                <button class="buy-btn">Comprar</button>
            `;
            
            weaponElement.querySelector('.buy-btn').addEventListener('click', () => {
                if (this.shop.buyWeapon(this.player, weapon)) {
                    alert(`¡Has comprado ${weapon.name}!`);
                    this.saveGame();
                } else {
                    alert('No tienes suficiente dinero o tu inventario está lleno.');
                }
            });
            
            shopContainer.appendChild(weaponElement);
        });
    }

    showInventory() {
        this.showScreen('inventory');
    }

    renderInventory() {
        const inventoryContainer = document.getElementById('weapon-inventory');
        inventoryContainer.innerHTML = '';

        // Mostrar arma equipada
        if (this.player.equippedWeapon) {
            const equippedElement = document.createElement('div');
            equippedElement.classList.add('equipped-weapon');
            equippedElement.innerHTML = `
                <h3>Arma Equipada</h3>
                <p>${this.player.equippedWeapon.name} - Ataque: ${this.player.equippedWeapon.attackValue}</p>
            `;
            inventoryContainer.appendChild(equippedElement);
        }

        // Mostrar armas en inventario
        const inventoryTitle = document.createElement('h3');
        inventoryTitle.textContent = `Inventario (${this.player.inventory.weapons.length}/${this.player.inventory.maxCapacity})`;
        inventoryContainer.appendChild(inventoryTitle);

        this.player.inventory.weapons.forEach(weapon => {
            const weaponElement = document.createElement('div');
            weaponElement.classList.add('inventory-item');
            
            weaponElement.innerHTML = `
                <span>${weapon.name} - Ataque: ${weapon.attackValue}</span>
                <button class="equip-btn">Equipar</button>
            `;
            
            weaponElement.querySelector('.equip-btn').addEventListener('click', () => {
                if (this.player.equipWeapon(weapon)) {
                    alert(`¡Has equipado ${weapon.name}!`);
                    this.renderInventory(); // Actualizar lista
                    this.saveGame();
                }
            });
            
            inventoryContainer.appendChild(weaponElement);
        });
    }

    returnToLobby() {
        this.showScreen('lobby');
    }

    startBattle() {
        // Crear enemigo basado en el nivel del jugador
        const enemies = [
            { name: 'Goblin', basePower: 1 },
            { name: 'Orco', basePower: 1.5 },
            { name: 'Troll', basePower: 2 },
            { name: 'Dragón', basePower: 3 }
        ];
        
        const randomIndex = Math.floor(Math.random() * enemies.length);
        const enemyTemplate = enemies[randomIndex];
        const enemy = new Enemy(enemyTemplate.name, Math.max(1, Math.floor(this.player.level * enemyTemplate.basePower)));
        
        this.currentBattle = new Battle(this.player, enemy);
        this.showScreen('battle-screen');
        this.updateBattleUI();
    }

    updateBattleUI() {
        if (!this.currentBattle) return;
        
        // Nombres
        document.getElementById('player-battle-name').textContent = 
            `${this.player.name} (Nivel ${this.player.level})`;
        document.getElementById('enemy-name').textContent = 
            `${this.currentBattle.enemy.name} (Nivel ${this.currentBattle.enemy.level})`;
        
        // Barras de vida
        const playerHpPercent = (this.player.currentHP / this.player.maxHP) * 100;
        const enemyHpPercent = (this.currentBattle.enemy.currentHP / this.currentBattle.enemy.maxHP) * 100;
        
        document.getElementById('player-hp-current').style.width = `${playerHpPercent}%`;
        document.getElementById('enemy-hp-current').style.width = `${enemyHpPercent}%`;
        
        // Actualizar texto de HP
        document.getElementById('player-hp-current').textContent = 
            `${this.player.currentHP}/${this.player.maxHP}`;
        document.getElementById('enemy-hp-current').textContent = 
            `${this.currentBattle.enemy.currentHP}/${this.currentBattle.enemy.maxHP}`;
        
        // Cambiar color de barras según el porcentaje de vida
        if (playerHpPercent < 25) {
            document.getElementById('player-hp-current').style.backgroundColor = 'red';
        } else if (playerHpPercent < 50) {
            document.getElementById('player-hp-current').style.backgroundColor = 'orange';
        } else {
            document.getElementById('player-hp-current').style.backgroundColor = 'green';
        }
        
        if (enemyHpPercent < 25) {
            document.getElementById('enemy-hp-current').style.backgroundColor = 'red';
        } else if (enemyHpPercent < 50) {
            document.getElementById('enemy-hp-current').style.backgroundColor = 'orange';
        } else {
            document.getElementById('enemy-hp-current').style.backgroundColor = 'green';
        }
        
        // Habilitar/deshabilitar botones según el turno
        const isPlayerTurn = this.currentBattle.turn === 'player';
        document.getElementById('attack-btn').disabled = !isPlayerTurn;
        document.getElementById('defend-btn').disabled = !isPlayerTurn;
        document.getElementById('flee-btn').disabled = !isPlayerTurn;
    }

    battleAction(action) {
        if (!this.currentBattle) return;
        const battleLog = document.getElementById('battle-log');
        
        if (action === 'attack') {
            const damage = this.currentBattle.playerAttack();
            battleLog.innerHTML += `<p>Has infligido ${damage} puntos de daño a ${this.currentBattle.enemy.name}.</p>`;
            
            if (this.currentBattle.isOver()) {
                this.endBattle();
                return;
            }
            
            // Turno del enemigo
            setTimeout(() => {
                const enemyDamage = this.currentBattle.enemyAttack();
                battleLog.innerHTML += `<p>${this.currentBattle.enemy.name} te ha infligido ${enemyDamage} puntos de daño.</p>`;
                battleLog.scrollTop = battleLog.scrollHeight;
                this.updateBattleUI();
                
                if (this.currentBattle.isOver()) {
                    this.endBattle();
                }
            }, 1000);
            
        } else if (action === 'defend') {
            this.currentBattle.playerDefend();
            battleLog.innerHTML += `<p>Te has puesto en posición defensiva. Recibirás menos daño este turno.</p>`;
            
            // Turno del enemigo
            setTimeout(() => {
                const enemyDamage = this.currentBattle.enemyAttack();
                battleLog.innerHTML += `<p>${this.currentBattle.enemy.name} te ha infligido ${enemyDamage} puntos de daño (reducido por tu defensa).</p>`;
                battleLog.scrollTop = battleLog.scrollHeight;
                this.updateBattleUI();
                
                if (this.currentBattle.isOver()) {
                    this.endBattle();
                }
            }, 1000);
            
        } else if (action === 'flee') {
            const fleeChance = Math.random();
            if (fleeChance > 0.5) {
                battleLog.innerHTML += `<p>Has escapado del combate.</p>`;
                // Penalización por huir
                this.player.money = Math.floor(this.player.money * 0.9);
                setTimeout(() => this.returnToLobby(), 1500);
            } else {
                battleLog.innerHTML += `<p>¡No has podido escapar!</p>`;
                
                // Turno del enemigo con bonificación por intento de huida
                setTimeout(() => {
                    const enemyDamage = Math.floor(this.currentBattle.enemyAttack() * 1.5);
                    battleLog.innerHTML += `<p>${this.currentBattle.enemy.name} aprovecha tu intento de huida y te inflige ${enemyDamage} puntos de daño.</p>`;
                    battleLog.scrollTop = battleLog.scrollHeight;
                    this.updateBattleUI();
                    
                    if (this.currentBattle.isOver()) {
                        this.endBattle();
                    }
                }, 1000);
            }
        }
        
        this.updateBattleUI();
        battleLog.scrollTop = battleLog.scrollHeight;
    }

    endBattle() {
        const result = this.currentBattle.getResult();
        const battleLog = document.getElementById('battle-log');
        
        if (result === 'victory') {
            // Calcular recompensas
            const expGained = this.currentBattle.enemy.level * 10;
            const moneyGained = this.currentBattle.enemy.level * 15;
            
            this.player.experience += expGained;
            this.player.money += moneyGained;
            
            battleLog.innerHTML += `
                <p>¡Victoria! Has derrotado a ${this.currentBattle.enemy.name}.</p>
                <p>Has ganado ${expGained} puntos de experiencia y ${moneyGained} monedas.</p>
            `;
            
            // Subir de nivel si corresponde
            if (this.player.experience >= this.player.level * 100) {
                this.player.levelUp();
                battleLog.innerHTML += `<p>¡Has subido al nivel ${this.player.level}!</p>`;
            }
            
            battleLog.innerHTML += `<p>Regresando al lobby en 3 segundos...</p>`;
            setTimeout(() => {
                this.saveGame();
                this.returnToLobby();
            }, 3000);
            
        } else if (result === 'defeat') {
            battleLog.innerHTML += `<p>Has sido derrotado por ${this.currentBattle.enemy.name}.</p>`;
            
            // Penalización por derrota
            this.player.money = Math.floor(this.player.money * 0.75);
            this.player.currentHP = Math.floor(this.player.maxHP * 0.3);
            
            battleLog.innerHTML += `
                <p>Has perdido algo de dinero.</p>
                <p>Has quedado gravemente herido.</p>
                <p>Regresando al lobby en 3 segundos...</p>
            `;
            
            setTimeout(() => {
                this.saveGame();
                this.returnToLobby();
            }, 3000);
        }
    }

    // Métodos de persistencia
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
            experience: this.player.experience,
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
            this.player.experience = data.experience || 0;

            // Restaurar inventario
            this.player.inventory = new Inventory();
            if (data.inventory && Array.isArray(data.inventory)) {
                data.inventory.forEach(weaponData => {
                    const weapon = new Weapon(weaponData.name, weaponData.attackValue, weaponData.price);
                    this.player.inventory.addWeapon(weapon);
                });
            }

            // Restaurar arma equipada
            if (data.equippedWeapon) {
                this.player.equippedWeapon = new Weapon(
                    data.equippedWeapon.name, 
                    data.equippedWeapon.attackValue, 
                    data.equippedWeapon.price
                );
            }
        }
    }

    deleteGameData() {
        if (confirm('¿Estás seguro de que deseas eliminar todos los datos guardados? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('gameData');
            this.player = null;
            alert('Datos eliminados correctamente.');
        }
    }
}

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    new GameManager();
});