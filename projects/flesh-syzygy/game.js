const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
let tileSize;
const mapWidth = 40;
const mapHeight = 30;



// Player
const player = {
    x: Math.floor(mapWidth / 2),
    y: Math.floor(mapHeight / 2),
    health: 100,
    maxHealth: 100,
    attack: 10,
    weapon: null,
    biocurrency: 0,
    level: 1,
    char: '@',
    color: '#00ff00'
};

const enemies = [];

const bosses = [
    {
        name: "The Glitch-Lord",
        char: 'G',
        color: '#00ffff',
        baseHealth: 100,
        baseAttack: 15,
        ability: "Corrupts reality, causing random screen distortions and temporary stat drains."
    },
    {
        name: "The Bio-Mass Accumulator",
        char: 'B',
        color: '#ff00ff',
        baseHealth: 120,
        baseAttack: 10,
        ability: "Spawns smaller meat-tech constructs and regenerates health."
    },
    {
        name: "The Pheromone Overlord",
        char: 'P',
        color: '#ffff00',
        baseHealth: 90,
        baseAttack: 20,
        ability: "Charms nearby enemies, making them stronger, and can briefly stun the player."
    }
];
const items = [];
const corpses = [];
const messageLog = [];

// Game Map
let map = [];

function generateMap() {
    // Clear previous level entities
    enemies.length = 0;
    items.length = 0;
    corpses.length = 0;
    messageLog.length = 0;

    // Fill map with walls
    for (let x = 0; x < mapWidth; x++) {
        map[x] = [];
        for (let y = 0; y < mapHeight; y++) {
            map[x][y] = { char: '#', color: '#888', walkable: false };
        }
    }

    // Check for boss level
    if (player.level % 5 === 0) {
        messageLog.push(`Level ${player.level}: A powerful entity emerges!`);
    if (messageLog.length > 5) messageLog.shift();
        const randomBoss = bosses[Math.floor(Math.random() * bosses.length)];
        const bossHealth = randomBoss.baseHealth + (player.level / 5 - 1) * 50;
        const bossAttack = randomBoss.baseAttack + (player.level / 5 - 1) * 5;

        // Create a large open room for the boss
        const roomX = 5;
        const roomY = 5;
        const roomW = mapWidth - 10;
        const roomH = mapHeight - 10;
        for (let x = roomX; x < roomX + roomW; x++) {
            for (let y = roomY; y < roomY + roomH; y++) {
                map[x][y] = { char: '.', color: '#444', walkable: true };
            }
        }

        enemies.push({
            x: Math.floor(mapWidth / 2),
            y: Math.floor(mapHeight / 2),
            health: bossHealth,
            char: randomBoss.char,
            color: randomBoss.color,
            type: 'boss',
            name: randomBoss.name,
            attack: bossAttack,
            ability: randomBoss.ability
        });
        player.x = Math.floor(mapWidth / 2) - 2;
        player.y = Math.floor(mapHeight / 2);

    } else {
        // Room generation parameters
        const maxRooms = 10;
        const minRoomSize = 4;
        const maxRoomSize = 8;
        const rooms = [];

        for (let i = 0; i < maxRooms; i++) {
            let w = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
            let h = Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
            let x = Math.floor(Math.random() * (mapWidth - w - 2)) + 1;
            let y = Math.floor(Math.random() * (mapHeight - h - 2)) + 1;

            const newRoom = { x, y, w, h };

            // Check for intersections with other rooms
            let failed = false;
            for (const otherRoom of rooms) {
                if (
                    newRoom.x < otherRoom.x + otherRoom.w &&
                    newRoom.x + newRoom.w > otherRoom.x &&
                    newRoom.y < otherRoom.y + otherRoom.h &&
                    newRoom.h + newRoom.y > otherRoom.y
                ) {
                    failed = true;
                    break;
                }
            }

            if (!failed) {
                createRoom(newRoom);
                const { x: centerX, y: centerY } = getRoomCenter(newRoom);

                if (rooms.length !== 0) {
                    const { x: prevX, y: prevY } = getRoomCenter(rooms[rooms.length - 1]);
                    createHTunnel(prevX, centerX, prevY);
                    createVTunnel(prevY, centerY, centerX);
                }
                rooms.push(newRoom);
            }
        }

        // Place enemies in rooms
        const baseEnemyHealth = 20 + (player.level - 1) * 5;
        const baseEnemyAttack = 5 + (player.level - 1) * 2;
        const shamanChance = 0.5 + (player.level - 1) * 0.1; // Increase shaman chance by 10% per level
        const enemiesPerRoom = 1 + Math.floor((player.level - 1) / 2); // Increase enemy count every 2 levels

        for (const room of rooms) {
            for (let i = 0; i < enemiesPerRoom; i++) {
                if (Math.random() < 0.5) {
                    const x = Math.floor(Math.random() * room.w) + room.x;
                    const y = Math.floor(Math.random() * room.h) + room.y;
                    const type = Math.random() < shamanChance ? 'shaman' : 'meat';
                    if (type === 'meat') {
                        enemies.push({ x, y, health: baseEnemyHealth, char: 'f', color: '#aa4444', type: 'Flesh-Crawler', attack: baseEnemyAttack });
                    } else {
                        enemies.push({ x, y, health: baseEnemyHealth * 0.75, char: 'z', color: '#660099', type: 'Brand-Zealot', attack: baseEnemyAttack * 1.2 });
                    }
                }
            }
        }

        // Place items in rooms
        for (const room of rooms) {
            if (Math.random() < 0.3) { // 30% chance to spawn an item
                const x = Math.floor(Math.random() * room.w) + room.x;
                const y = Math.floor(Math.random() * room.h) + room.y;
                const type = Math.random() < 0.7 ? 'health' : 'damage'; // 70% chance for health
                if (type === 'health') {
                    items.push({ x, y, char: '+', color: '#ff0000', type });
                } else {
                    items.push({ x, y, char: '*', color: '#ffff00', type });
                }
            }
        }

        // Place player in the center of the first room
        if (rooms.length > 0) {
            const { x: startX, y: startY } = getRoomCenter(rooms[0]);
            player.x = startX;
            player.y = startY;

            // Place exit in the last room
            const lastRoom = rooms[rooms.length - 1];
            const exitX = Math.floor(Math.random() * lastRoom.w) + lastRoom.x;
            const exitY = Math.floor(Math.random() * lastRoom.h) + lastRoom.y;
            map[exitX][exitY] = { char: '>', color: '#00ffff', walkable: true, type: 'exit' };
        }
    }
}

function createRoom(room) {
    for (let x = room.x; x < room.x + room.w; x++) {
        for (let y = room.y; y < room.y + room.h; y++) {
            map[x][y] = { char: '.', color: '#444', walkable: true };
        }
    }
}

function getRoomCenter(room) {
    return {
        x: Math.floor(room.x + room.w / 2),
        y: Math.floor(room.y + room.h / 2),
    };
}

function createHTunnel(x1, x2, y) {
    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        map[x][y] = { char: '.', color: '#444', walkable: true };
    }
}

function createVTunnel(y1, y2, x) {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        map[x][y] = { char: '.', color: '#444', walkable: true };
    }
}

generateMap();

const jitterAmount = 0.5;
let shakeAmount = 0;
let shakeDuration = 0;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.fillStyle = '#880000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '40px monospace';
        ctx.fillText("SYSTEM FAILURE", canvas.width / 2 - 150, canvas.height / 2 - 80);
        ctx.font = '20px monospace';
        ctx.fillText(`Your flesh has failed you.`, canvas.width / 2 - 150, canvas.height / 2 - 30);
        ctx.fillText(`You became one with the decay on Level: ${player.level}`, canvas.width / 2 - 150, canvas.height / 2);
        ctx.fillText("Press R to Re-Incarnate", canvas.width / 2 - 150, canvas.height / 2 + 50);
        return;
    }

    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    if (shakeDuration > 0) {
        shakeOffsetX = (Math.random() - 0.5) * shakeAmount;
        shakeOffsetY = (Math.random() - 0.5) * shakeAmount;
        shakeDuration--;
    }

    // Draw map
    for (let x = 0; x < mapWidth; x++) {
        for (let y = 0; y < mapHeight; y++) {
            ctx.fillStyle = map[x][y].color;
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }

    // Draw enemies
    for (const enemy of enemies) {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x * tileSize, enemy.y * tileSize, tileSize, tileSize);
    }

    // Draw items
    for (const item of items) {
        ctx.fillStyle = item.color;
        ctx.fillRect(item.x * tileSize, item.y * tileSize, tileSize, tileSize);
    }

    // Draw corpses
    for (const corpse of corpses) {
        ctx.fillStyle = corpse.color;
        ctx.fillRect(corpse.x * tileSize, corpse.y * tileSize, tileSize, tileSize);
    }

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x * tileSize, player.y * tileSize, tileSize, tileSize);

    // Draw health and attack
    ctx.fillStyle = '#fff';
    ctx.fillText(`Health: ${player.health}/${player.maxHealth}`, tileSize * 0.5, tileSize * 1);
    ctx.fillText(`Attack: ${player.attack}`, tileSize * 0.5, tileSize * 2);
    ctx.fillText(`Biocurrency: ${player.biocurrency}`, tileSize * 0.5, tileSize * 3);
    ctx.fillText(`Level: ${player.level}`, tileSize * 0.5, tileSize * 4);
    if (player.weapon) {
        ctx.fillText(`Weapon: ${player.weapon.name} (${player.weapon.durability})`, tileSize * 0.5, tileSize * 5);
    }

    // Draw message log
    for (let i = 0; i < messageLog.length; i++) {
        ctx.fillText(messageLog[i], tileSize * 0.5, canvas.height - (messageLog.length - i) * tileSize * 1.2 - tileSize * 0.5);
    }
}

function triggerShake(amount, duration) {
    shakeAmount = amount;
    shakeDuration = duration;
}

function moveEnemies() {
    for (const enemy of enemies) {
        let newX = enemy.x;
        let newY = enemy.y;

        if (enemy.type === 'shaman') {
            // Shaman moves towards the player
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            if (Math.abs(dx) > Math.abs(dy)) {
                newX += Math.sign(dx);
            } else {
                newY += Math.sign(dy);
            }
        } else {
            // Meat moves randomly
            const moveX = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            const moveY = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            newX += moveX;
            newY += moveY;
        }

        if (
            newX >= 0 &&
            newX < mapWidth &&
            newY >= 0 &&
            newY < mapHeight &&
            map[newX][newY].walkable &&
            (newX !== player.x || newY !== player.y) // Don't move into player
        ) {
            enemy.x = newX;
            enemy.y = newY;
        }
    }
}

function handleKeyDown(event) {
    const { key } = event;
    let newX = player.x;
    let newY = player.y;

    switch (key) {
        case 'ArrowUp':
            newY--;
            break;
        case 'ArrowDown':
            newY++;
            break;
        case 'ArrowLeft':
            newX--;
            break;
        case 'ArrowRight':
            newX++;
            break;
        case 'd': // Devour ability
            const corpseIndex = corpses.findIndex(c => c.x === player.x && c.y === player.y);
            if (corpseIndex !== -1) {
                player.health = Math.min(player.maxHealth, player.health + 10); // Restore 10 health
                player.biocurrency += 10; // Corpses yield 10 biocurrency
                corpses.splice(corpseIndex, 1);
                messageLog.push("You devour the corpse, regaining some health and biocurrency.");
                if (messageLog.length > 5) messageLog.shift();
            } else {
                messageLog.push("There's no corpse here to devour.");
                if (messageLog.length > 5) messageLog.shift();
            }
            draw();
            moveEnemies();
            return;
    }

    // Check for enemy at new position
    const enemyIndex = enemies.findIndex(e => e.x === newX && e.y === newY);
    if (enemyIndex !== -1) {
        const enemy = enemies[enemyIndex];
        let playerAttack = player.attack;
        if (player.weapon) {
            playerAttack += player.weapon.damage;
            player.weapon.durability--;
            if (player.weapon.durability <= 0) {
                player.weapon = null;
                messageLog.push("Your Meat-Whip disintegrated!");
                if (messageLog.length > 5) messageLog.shift();
            }
        }
        enemy.health -= playerAttack;

        if (enemy.health <= 0) {
            corpses.push({ x: enemy.x, y: enemy.y, char: '%', color: '#663300' });
            player.biocurrency += 5; // Enemies drop 5 biocurrency
            if (enemy.type === 'boss') {
                messageLog.push(`You defeated ${enemy.name}! You gained 50 biocurrency.`);
                if (messageLog.length > 5) messageLog.shift();
                player.biocurrency += 50;
            } else {
                messageLog.push(`You defeated the ${enemy.type}! You gained 5 biocurrency.`);
                if (messageLog.length > 5) messageLog.shift();
            }
            if (Math.random() < 0.3) { // 30% chance to drop a whip
                items.push({ x: enemy.x, y: enemy.y, char: '~', color: '#ff00ff', type: 'weapon', name: 'Meat-Whip', damage: 15, durability: 10 });
            }
            enemies.splice(enemyIndex, 1);

            if (enemy.type === 'boss') {
                map[enemy.x][enemy.y] = { char: '>', color: '#00ffff', walkable: true, type: 'exit' };
                messageLog.push("An exit appears!");
                if (messageLog.length > 5) messageLog.shift();
            }
        }
        player.health -= enemy.attack; // Enemy deals damage
        triggerShake(5, 10); // Shake screen when player takes damage
        if (player.health <= 0) {
            gameOver = true;
            messageLog.push("GAME OVER! Press R to Restart.");
            if (messageLog.length > 5) messageLog.shift();
        }
        moveEnemies();
        draw();
        return; // Don't move into enemy space
    }

    // Check for item at new position
    const itemIndex = items.findIndex(i => i.x === newX && i.y === newY);
    if (itemIndex !== -1) {
        const item = items[itemIndex];
        if (item.type === 'health') {
            player.maxHealth += 10;
            player.health = Math.min(player.maxHealth, player.health + 10); // Also heal for the new max health
            messageLog.push("You augmented your health! Max Health +10.");
            if (messageLog.length > 5) messageLog.shift();
            items.splice(itemIndex, 1);
        } else if (item.type === 'damage') {
            player.attack += 5;
            messageLog.push("You augmented your attack! Attack +5.");
            if (messageLog.length > 5) messageLog.shift();
            items.splice(itemIndex, 1);
        } else if (item.type === 'weapon') {
            player.weapon = item;
            messageLog.push(`You picked up a ${item.name}!`);
            if (messageLog.length > 5) messageLog.shift();
            items.splice(itemIndex, 1);
        }
    }

    // Check boundaries and walkability
    if (
        newX >= 0 &&
        newX < mapWidth &&
        newY >= 0 &&
        newY < mapHeight &&
        map[newX][newY].walkable
    ) {
        player.x = newX;
        player.y = newY;

        const currentTile = map[player.x][player.y];
        if (currentTile.type === 'exit') {
            enterShop();
            return;
        }

        moveEnemies();
        draw();
    }
}

let shopActive = false;
let gameOver = false;

function restartGame() {
    player.x = Math.floor(mapWidth / 2);
    player.y = Math.floor(mapHeight / 2);
    player.health = 100;
    player.maxHealth = 100;
    player.attack = 10;
    player.weapon = null;
    player.biocurrency = 0;
    player.level = 1;

    enemies.length = 0;
    items.length = 0;
    corpses.length = 0;
    messageLog.length = 0;

    gameOver = false;
    shopActive = false;
    generateMap();
    draw();
}

function enterShop() {
    shopActive = true;
    messageLog.push("Welcome to the Organ Market! Your flesh is our fortune.");
    if (messageLog.length > 5) messageLog.shift();
    messageLog.push("1. Grafted Viscera (20 Biocurrency): +10 Max Health");
    if (messageLog.length > 5) messageLog.shift();
    messageLog.push("2. Synaptic Overcharge (30 Biocurrency): +5 Attack");
    if (messageLog.length > 5) messageLog.shift();
    messageLog.push("3. Proceed to the next Consumption Cycle");
    if (messageLog.length > 5) messageLog.shift();
    draw();
}

function handleShopInput(key) {
    switch (key) {
        case '1':
            if (player.biocurrency >= 20) {
                player.biocurrency -= 20;
                player.maxHealth += 10;
                player.health = Math.min(player.maxHealth, player.health + 10); // Also heal for the new max health
                messageLog.push("You augmented your health! Max Health +10.");
                if (messageLog.length > 5) messageLog.shift();
            } else {
                messageLog.push("Not enough biocurrency for Health Augmentation.");
                if (messageLog.length > 5) messageLog.shift();
            }
            break;
        case '2':
            if (player.biocurrency >= 30) {
                player.biocurrency -= 30;
                player.attack += 5;
                messageLog.push("You augmented your attack! Attack +5.");
                if (messageLog.length > 5) messageLog.shift();
            } else {
                messageLog.push("Not enough biocurrency for Attack Augmentation.");
                if (messageLog.length > 5) messageLog.shift();
            }
            break;
        case '3':
            messageLog.push("Proceeding to the next level...");
            if (messageLog.length > 5) messageLog.shift();
            shopActive = false;
            player.level++;
            generateMap(); // Regenerate map for next level
            break;
        default:
            messageLog.push("Invalid choice. Press 1, 2, or 3.");
            if (messageLog.length > 5) messageLog.shift();
            break;
    }
    draw();
}

window.addEventListener('keydown', (event) => {
    if (gameOver) {
        if (event.key === 'r') {
            restartGame();
        }
        return;
    }

    if (shopActive) {
        handleShopInput(event.key);
    } else {
        handleKeyDown(event);
    }
});

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    console.log(`Canvas dimensions: ${canvas.width}x${canvas.height}`);
    tileSize = Math.max(10, Math.min(canvas.width / mapWidth, canvas.height / mapHeight));
    console.log(`Calculated tileSize: ${tileSize}`);
    ctx.font = `${tileSize * 0.9}px monospace`; // Re-set font after resize
    ctx.textBaseline = 'top';
    draw();
}

window.addEventListener('resize', resizeCanvas);


generateMap(); // Call generateMap initially
resizeCanvas(); // Call resizeCanvas initially to set correct dimensions


