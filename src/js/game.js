document.getElementById('regenerateMaze').addEventListener('click', () => {
    localStorage.getItem('lifetimeScore') ? localStorage.setItem('lifetimeScore', parseInt(localStorage.getItem('lifetimeScore')) - 1) : localStorage.setItem('lifetimeScore', 0);
    window.location.reload();
});

document.getElementById('lifetimeScore').innerText = localStorage.getItem('lifetimeScore') ? `Lifetime Score: ${localStorage.getItem('lifetimeScore')}` : 'Lifetime Score: 0';

const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const rows = 15;
const cols = 20;
const cellSize = canvas.width / cols;
const maze = [];

for (let y = 0; y < rows; y++) {
    maze[y] = [];
    for (let x = 0; x < cols; x++) {
        maze[y][x] = 1;
    }
}

const player = {
    x: 0,
    y: 0,
    size: cellSize / 2,
    color: 'red'
};

let exit = {
    x: cols - 1,
    y: rows - 1,
    size: cellSize,
    color: 'green'
};

const monster = {
    x: cols - 1,
    y: 0,
    size: cellSize / 2,
    color: 'purple'
};

function carvePassagesFrom(x, y) {
    const directions = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
    ];

    directions.sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
        const nx = x + dx * 2;
        const ny = y + dy * 2;

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 1) {
            maze[y + dy][x + dx] = 0;
            maze[ny][nx] = 0;
            carvePassagesFrom(nx, ny);
        }
    }
}

maze[0][0] = 0;
carvePassagesFrom(0, 0);
maze[rows - 1][cols - 1] = 0;

for (let i = 0; i < 30; i++) { // kamu bisa ubah 30 jadi lebih besar/lebih kecil sesuai keinginan
    const x = Math.floor(Math.random() * (cols - 2)) + 1;
    const y = Math.floor(Math.random() * (rows - 2)) + 1;

    if (maze[y][x] === 1 && (
        maze[y-1][x] === 0 || maze[y+1][x] === 0 ||
        maze[y][x-1] === 0 || maze[y][x+1] === 0
    )) {
        maze[y][x] = 0;
    }
}

function drawMaze() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            ctx.fillStyle = maze[y][x] === 1 ? 'black' : 'white';
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x * cellSize + (cellSize - player.size) / 2, player.y * cellSize + (cellSize - player.size) / 2, player.size, player.size);
}

function drawMonster() {
    ctx.font = `${cellSize}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("👾", monster.x * cellSize + cellSize / 2, monster.y * cellSize + cellSize / 2);
}

function drawExit() {
    ctx.fillStyle = exit.color;
    ctx.fillRect(exit.x * cellSize, exit.y * cellSize, exit.size, exit.size);
}

function checkCollision(x, y) {
    return maze[y][x] === 1;
}

// Deklarasi audio
const langkahSound = new Audio('sounds/footsteps.mp3');    // Suara langkah
const gameOverSound = new Audio('sounds/gameover.wav');     // Suara game over
const victorySound = new Audio('sounds/victory.mp3');       // Suara menang
const monsterGrowl = new Audio('sounds/growl.mp3');         // Suara monster (opsional)

function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (newX >= 0 && newX < cols && newY >= 0 && newY < rows && !checkCollision(newX, newY)) {
    player.x = newX;
    player.y = newY;
    langkahSound.play();  // Mainkan suara langkah
    }
}

function checkWin() {
    if (player.x === exit.x && player.y === exit.y) {
        localStorage.getItem('lifetimeScore') ? localStorage.setItem('lifetimeScore', parseInt(localStorage.getItem('lifetimeScore')) + 1) : localStorage.setItem('lifetimeScore', 1);
        alert("Congratulations, you've escaped the maze! Now we dare you to do it again! FYI, your lifetime score is currently: " + localStorage.getItem('lifetimeScore'));
        window.location.reload();
    }
}

function bfs(start, end) {
    const queue = [[start]];
    const visited = Array(rows).fill().map(() => Array(cols).fill(false));
    visited[start.y][start.x] = true;

    while (queue.length > 0) {
        const path = queue.shift();
        const { x, y } = path[path.length - 1];

        if (x === end.x && y === end.y) return path;

        const directions = [[0,1],[1,0],[0,-1],[-1,0]];
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 0 && !visited[ny][nx]) {
                visited[ny][nx] = true;
                queue.push([...path, {x: nx, y: ny}]);
            }
        }
    }

    return [start]; // fallback
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    drawPlayer();
    drawMonster();
    drawExit();
    requestAnimationFrame(draw);
}

draw();

window.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            e.preventDefault();
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            e.preventDefault();
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            e.preventDefault();
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            e.preventDefault();
            break;
    }
    checkWin();
});

document.getElementById('moveUp').addEventListener('click', () => movePlayer(0, -1));
document.getElementById('moveDown').addEventListener('click', () => movePlayer(0, 1));
document.getElementById('moveLeft').addEventListener('click', () => movePlayer(-1, 0));
document.getElementById('moveRight').addEventListener('click', () => movePlayer(1, 0));

setInterval(() => {
    const path = bfs(monster, player);
    if (path.length > 1) {
        monster.x = path[1].x;
        monster.y = path[1].y;
        monsterGrowl.play();
    }

    if (monster.x === player.x && monster.y === player.y) {
        alert("Game Over! Kamu tertangkap monster!");
        window.location.reload();
    }
}, 500);

