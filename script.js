var row = 9;
var col = 16;
var fullRow = row + 2;
var fullCol = col + 2;
var cellWidth = 38;
var cellHeight = 42;
var maxPieces = 36;
var currentLevel = 1;
var game = document.getElementById("game");
var board = [];
var isPaused = false;
var isGameStarted = false;
var gameTime = 240;
var timeRemaining = gameTime;
var timeInterval = null;
var firstCell = null;
var levelDescriptions = {
    1: "Cơ bản: Các khối giữ nguyên vị trí khi bị xóa.",
    2: "..",
    3: "..",
    4: "..",
    5: "..",
    6: "..",
    7: "..",
    8: "..",
    9: ".."
};
var firstCell = null;
var lineCanvas, timeBar, btnPause, levelTitleSpan, levelDescP, levelSelect, gameContainer;
function buildUI() {
    let body = document.body;
    let header = document.createElement("div");
    header.style.marginBottom = "15px";
    header.innerHTML = `
        <h1 style="color:#2563eb; margin:0 0 5px 0;">GAME PIKACHU</h1>
        <h3 style="margin:0; color:#475569;">
            Màn chơi: <span id="level-title" style="color:#2563eb;">Level 1</span>
        </h3>
        <p id="level-desc" style="margin:5px 0 0 0; color:#64748b; font-size:14px; font-style:italic;">
            ${levelDescriptions[1]}
        </p>
    `;
    body.insertBefore(header, game);

    let controlPanel = document.createElement("div");
    controlPanel.style.marginBottom = "15px";

    let label = document.createElement("label");
    label.innerHTML = "<b>Level:</b> ";
    controlPanel.appendChild(label);
    levelSelect = document.createElement("select");
    styleBtn(levelSelect);
    for (let i = 1; i <= 9; i++) {
        let opt = document.createElement("option");
        opt.value = i;
        opt.innerText = "Level " + i;
        levelSelect.appendChild(opt);
    }
    controlPanel.appendChild(levelSelect);

    let btnRestart = document.createElement("button");
    btnRestart.innerText = "Chơi Lại";
    styleBtn(btnRestart);
    btnRestart.onclick = initBoard;
    controlPanel.appendChild(btnRestart);

    btnPause = document.createElement("button");
    btnPause.innerText = "Tạm Dừng";
    styleBtn(btnPause);
    btnPause.onclick = togglePause;
    controlPanel.appendChild(btnPause);

    let btnShuffle = document.createElement("button");
    btnShuffle.innerText = "Đổi Vị Trí";
    styleBtn(btnShuffle);
    controlPanel.appendChild(btnShuffle);

    let btnHint = document.createElement("button");
    btnHint.innerText = "Gợi Ý";
    styleBtn(btnHint);
    btnHint.onclick = function() {
        alert("Tính năng Gợi Ý đang được phát triển!");
    };
    controlPanel.appendChild(btnHint);

    body.insertBefore(controlPanel, game);
    gameContainer = document.createElement("div");
    gameContainer.style.position = "relative";
    gameContainer.style.display = "inline-block";

    let timeContainer = document.createElement("div");
    timeContainer.style.cssText = "width:100%; height:10px; background:#e2e8f0; border-radius:5px; overflow:hidden; margin-bottom:10px;";
    timeBar = document.createElement("div");
    timeBar.style.cssText = "height:100%; width:100%; background:#22c55e; transition:width 0.1s linear;";
    timeContainer.appendChild(timeBar);
    gameContainer.appendChild(timeContainer);

    lineCanvas = document.createElement("canvas");
    lineCanvas.style.cssText = "position:absolute; top:20px; left:0; pointer-events:none; z-index:10;";
    lineCanvas.width = fullCol * cellWidth;
    lineCanvas.height = fullRow * cellHeight;
    gameContainer.appendChild(lineCanvas);
    body.insertBefore(gameContainer, game);
    gameContainer.appendChild(game);
    levelTitleSpan = document.getElementById("level-title");
    levelDescP = document.getElementById("level-desc");
}

function styleBtn(elem) {
    elem.style.cssText = "padding:6px 14px; font-weight:bold; cursor:pointer; margin:0 4px; border-radius:6px; border:1px solid #cbd5e1; background:#fff;";
}

function initGame(col, row) {
    game.innerHTML = "";
    for (let i = 0; i < row; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < col; j++) {
            let td = document.createElement("td");
            td.id = "cell_" + i + "_" + j;
            td.classList.add("cell");
            td.onclick = () => onClickCell(i, j);
            tr.appendChild(td);
        }
        game.appendChild(tr);
    }
}
function initBoard() {
    let totalPairs = (row * col) / 2;
    let cards = [];
    for (let i = 0; i < totalPairs; i++) {
        let pieceId = Math.floor(Math.random() * maxPieces) + 1;
        cards.push(pieceId, pieceId);
    }
    cards.sort(() => Math.random() - 0.5);

    board = [];
    let idx = 0;
    for (let i = 0; i < fullRow; i++) {
        let rowData = [];
        for (let j = 0; j < fullCol; j++) {
            if (i === 0 || i === fullRow - 1 || j === 0 || j === fullCol - 1) {
                rowData.push(0);
            } else {
                rowData.push(cards[idx++]);
            }
        }
        board.push(rowData);
    }
    render();
    showStartOverlay();
}
function render() {
    for (let i = 0; i < fullRow; i++) {
        for (let j = 0; j < fullCol; j++) {
            let cell = document.getElementById("cell_" + i + "_" + j);
            let val = board[i][j];
            cell.className = "cell";
            cell.innerHTML = "";
            if (val === 0) {
                cell.classList.add("empty");
            } else {
                let img = document.createElement("div");
                img.className = "card-img";
                img.style.backgroundImage = "url('resources/pieces" + val + ".png')";
                cell.appendChild(img);
            }
        }
    }
}
function showStartOverlay() {
    removeStartOverlay();
    let overlay = document.createElement("div");
    overlay.id = "js-start-overlay";
    overlay.style.cssText = "position:absolute; top:20px; left:0; width:100%; height:calc(100% - 20px); background:rgba(255,255,255,0.92); border-radius:8px; z-index:20; display:flex; flex-direction:column; justify-content:center; align-items:center;";
    overlay.innerHTML = `
        <h2 style="color:#1e293b; margin-bottom:8px; font-size:24px;">SẴN SÀNG CHƠI!</h2>
        <p style="color:#64748b; margin-bottom:20px; font-size:15px;">Bấm nút bên dưới để bắt đầu chơi.</p>
        <button onclick="startGame()" style="padding:12px 30px; font-weight:bold; font-size:16px; background:#2563eb; color:white; border:none; border-radius:6px; cursor:pointer; box-shadow:0 4px 6px -1px rgba(37,99,235,0.3);">BẮT ĐẦU</button>
    `;
    gameContainer.appendChild(overlay);
    game.style.filter = "blur(2px)";
}
function removeStartOverlay() {
    let overlay = document.getElementById("js-start-overlay");
    if (overlay) overlay.remove();
}
function startGame() {
    isGameStarted = true;
    removeStartOverlay();
    game.style.filter = "none";
}
function showPauseOverlay() {
    if (document.getElementById("js-pause-overlay")) return;
    let overlay = document.createElement("div");
    overlay.id = "js-pause-overlay";
    overlay.style.cssText = "position:absolute; top:20px; left:0; width:100%; height:calc(100% - 20px); background:rgba(255,255,255,0.95); border-radius:8px; z-index:20; display:flex; flex-direction:column; justify-content:center; align-items:center;";
    overlay.innerHTML = `
        <h2 style="color:#1e293b; margin-bottom:10px;">ĐÃ TẠM DỪNG GAME</h2>
        <p style="color:#64748b; margin-bottom:15px;">Trò chơi đang dừng. Bấm nút bên dưới để chơi tiếp!</p>
        <button onclick="togglePause()" style="padding:10px 20px; font-weight:bold; background:#2563eb; color:white; border:none; border-radius:6px; cursor:pointer;">Tiếp Tục Chơi</button>
    `;
    gameContainer.appendChild(overlay);
}
function removePauseOverlay() {
    let overlay = document.getElementById("js-pause-overlay");
    if (overlay) overlay.remove();
}
function togglePause() {
    if (!isGameStarted) return;
    isPaused = !isPaused;
    if (isPaused) {
        btnPause.innerText = "Tiếp Tục";
        showPauseOverlay();
        game.style.filter = "blur(3px)";
    } else {
        btnPause.innerText = "Tạm Dừng";
        removePauseOverlay();
        game.style.filter = "none";
    }
}
buildUI();
initGame(fullCol, fullRow);
initBoard();
function drawLine(path) {
    let ctx = lineCanvas.getContext("2d");
    ctx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#2563eb";
    ctx.shadowColor = "#60a5fa";
    ctx.shadowBlur = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 0; i < path.length; i++) {
        let x = path[i].c * cellWidth + cellWidth / 2;
        let y = path[i].r * cellHeight + cellHeight / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();
}
function clearCanvas() {
    let ctx = lineCanvas.getContext("2d");
    ctx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);
}
function onClickCell(r, c) {
    if (!isGameStarted || isPaused || board[r][c] === 0) return;
    let currentCell = document.getElementById("cell_" + r + "_" + c);
    if (!firstCell) {
        firstCell = { r, c };
        currentCell.classList.add("selected");
    } else if (firstCell.r === r && firstCell.c === c) {
        firstCell = null;
        currentCell.classList.remove("selected");
    } else {
        let r1 = firstCell.r;
        let c1 = firstCell.c;
        if (board[r1][c1] === board[r][c]) {
            let path = canConnect(r1, c1, r, c);
            if (path) {
                currentCell.classList.add("selected");
                drawLine(path);
                setTimeout(() => {
                    clearCanvas();
                    board[r1][c1] = 0;
                    board[r][c] = 0;
                    firstCell = null;
                    render();
                }, 300);
                return;
            }
        }
        document.getElementById("cell_" + firstCell.r + "_" + firstCell.c).classList.remove("selected");
        firstCell = { r, c };
        currentCell.classList.add("selected");
    }
}
function canConnect(r1, c1, r2, c2) {
    let dirs = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 }
    ];
    let queue = [{ r: r1, c: c1, dir: -1, turns: 0, path: [{ r: r1, c: c1 }] }];
    let visited = Array.from({ length: fullRow }, () =>
        Array.from({ length: fullCol }, () => Array(4).fill(Infinity))
    );
    while (queue.length > 0) {
        let curr = queue.shift();
        if (curr.r === r2 && curr.c === c2) return curr.path;
        for (let d = 0; d < 4; d++) {
            let nr = curr.r + dirs[d].dr;
            let nc = curr.c + dirs[d].dc;
            if (nr >= 0 && nr < fullRow && nc >= 0 && nc < fullCol) {
                let newTurns = (curr.dir === -1 || curr.dir === d) ? curr.turns : curr.turns + 1;
                if (newTurns <= 2) {
                    if (board[nr][nc] === 0 || (nr === r2 && nc === c2)) {
                        if (newTurns < visited[nr][nc][d]) {
                            visited[nr][nc][d] = newTurns;
                            queue.push({
                                r: nr,
                                c: nc,
                                dir: d,
                                turns: newTurns,
                                path: [...curr.path, { r: nr, c: nc }]
                            });
                        }
                    }
                }
            }
        }
    }
    return null;
}