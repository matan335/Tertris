const canvas = document.querySelector('.tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);


var colors = [null, '#f8b28e', '#f1737f', '#c06c86', '#6c5b7f', '#2a3e4e', '#e20921', '#e209b7'];

function createPiece(type) {
    switch (type) {
        case 'T':
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];

        case 'O':
            return [
                [2, 2],
                [2, 2]
            ];

        case 'L':
            return [
                [0, 3, 0],
                [0, 3, 0],
                [0, 3, 3]
            ];

        case 'J':
            return [
                [0, 4, 0],
                [0, 4, 0],
                [4, 4, 0]
            ];

        case 'S':
            return [
                [0, 5, 5],
                [5, 5, 0],
                [0, 0, 0]
            ];

        case 'Z':
            return [
                [6, 6, 0],
                [0, 6, 6],
                [0, 0, 0]
            ];

        case 'I':
            return [
                [0, 7, 0, 0],
                [0, 7, 0, 0],
                [0, 7, 0, 0],
                [0, 7, 0, 0],
            ];
    }
}
function arenaSweep() {
    var rowCount = 1
    outer: for (let y = arena.length - 1; y > 0; y--) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0)
        arena.unshift(row)
        ++y
        console.log(rowCount, 'rows')
        player.score += rowCount * 10
        rowCount *= 2

    }
}

function collide(arena, player) {
    const [mat, pos] = [player.matrix, player.pos]
    for (let y = 0; y < mat.length; ++y) {
        for (let x = 0; x < mat[y].length; ++x) {
            if (mat[y][x] !== 0 &&
                (arena[y + pos.y] && arena[y + pos.y][x + pos.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(width, height) {
    const matrix = [];
    while (height--) {
        matrix.push(new Array(width).fill(0));
    }

    return matrix;
}

function draw() {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);

}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val !== 0) {
                //draw border
                context.fillStyle = 'white';
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                //draw color
                context.fillStyle = colors[val];
                context.fillRect(x + 0.125 + offset.x, y + 0.125 + offset.y, 0.75, 0.75);
            }

        })
    })
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = val
            }
        })
    })
}

function playerDrop() {
    player.pos.y++;
    dropCounter = 0;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerResets();
        arenaSweep();
        updateScore();
        player.pos.y = 0;
    }
}

function playerResets() {
    const types = 'ITJLOSZ'
    let type = types[parseInt(Math.random() * types.length)]
    player.matrix = createPiece(type);
    player.pos.y = 0;
    player.pos.x = (parseInt(arena[0].length / 2) - parseInt(player.matrix[0].length / 2))

    if (collide(arena, player)) {
        console.log('restart')
        arena.forEach(row => row.fill(0))
        player.score = 0;
        updateScore();
    }
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate(dir) {
    const posX = player.pos.x
    let offset = 1
    rotate(player.matrix, dir)
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = posX
            return;
        }
    }
}
function updateScore() {
    document.querySelector('.score').innerText = player.score
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                [matrix[x][y]], [matrix[y][x]]
            ] = [
                    [matrix[y][x]], [matrix[x][y]]
                ]
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse())
    } else {
        matrix.reverse()
    }
}

let arena = createMatrix(12, 20)
const player = {
    matrix: null,
    pos: { x: 0, y: 0 },
    score: 0
};

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    var deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);

}

document.addEventListener('click', event => {
    var className = event.target.className
    className = className.split(" ")
    console.log(className)
    switch (className[0]) {
        case 'right':
            playerMove(1)
            break;
        case 'left':
            playerMove(-1)
            break;
        case 'down':
            playerDrop();
            break;
        case 'R-right':
            playerRotate(-1)
            break;
        case 'R-left':
            playerRotate(1)
            break;
    }
})

document.addEventListener('keydown', event => {
    switch (event.keyCode) {
        case 37:
            playerMove(-1)
            break;
        case 39:
            playerMove(1)
            break;
        case 40:
            playerDrop();
            break;
        case 81:
            playerRotate(-1);
            break;
        case 87:
            playerRotate(1);
            break;

    }
})
playerResets();
updateScore();
update();