const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timeTravelButton = document.getElementById('timeTravelButton');
const eraMeter = document.getElementById('eraMeter');

let currentEra = 0;
const eras = [
    "Ancient Steppe (3000 BCE)",
    "Bronze Age (2000 BCE)",
    "Iron Age (1000 BCE)",
    "Achaemenid Empire (500 BCE)",
    "Parthian Empire (200 BCE)",
    "Sasanian Empire (200 CE)",
    "Early Islamic Period (700 CE)",
    "Seljuk Empire (1000 CE)",
    "Mongol Invasion (1200 CE)",
    "Timurid Empire (1400 CE)",
    "Khivan Khanate (1700 CE)",
    "Russian Empire (1800 CE)",
    "Soviet Era (1900 CE)",
    "Modern Turkmenistan (2000 CE)"
];

function updateEraMeter() {
    eraMeter.innerText = `Current Era: ${eras[currentEra]}`;
}

const gridSize = 20; // Size of each grid cell
const mapWidth = 30; // Number of cells wide
const mapHeight = 20; // Number of cells high

canvas.width = mapWidth * gridSize;
canvas.height = mapHeight * gridSize;

let player = { x: Math.floor(mapWidth / 2), y: Math.floor(mapHeight / 2) };
let map = [];

function generateMap() {
    map = [];
    for (let y = 0; y < mapHeight; y++) {
        let row = [];
        for (let x = 0; x < mapWidth; x++) {
            row.push({ grazed: false, color: '#4CAF50' }); // Green for fresh grass
        }
        map.push(row);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            ctx.fillStyle = map[y][x].color;
            ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
        }
    }

    // Draw player
    ctx.fillStyle = '#FFC107'; // Yellow for player (Shah/herd)
    ctx.fillRect(player.x * gridSize, player.y * gridSize, gridSize, gridSize);
}

function graze() {
    if (!map[player.y][player.x].grazed) {
        map[player.y][player.x].grazed = true;
        map[player.y][player.x].color = '#8BC34A'; // Lighter green for grazed
    }
}

function handleKeyDown(event) {
    let newX = player.x;
    let newY = player.y;

    switch (event.key) {
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
    }

    if (newX >= 0 && newX < mapWidth && newY >= 0 && newY < mapHeight) {
        player.x = newX;
        player.y = newY;
        graze();
        draw();
    }
}

timeTravelButton.addEventListener('click', () => {
    currentEra = (currentEra + 1) % eras.length;
    generateMap();
    player = { x: Math.floor(mapWidth / 2), y: Math.floor(mapHeight / 2) }; // Reset player position
    updateEraMeter();
    draw();
});

window.addEventListener('keydown', handleKeyDown);

generateMap();
updateEraMeter();
draw();