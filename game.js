var row = 9;
var col = 16;
var fullRow = row + 2;
var fullCol = col + 2;
var cellWidth = 38;
var cellHeight = 42;
var maxPieces = 36;
var currentLevel = 1;
var board = [];
var isPaused = false;
var isGameStarted = false;
var gameTime = 240;
var timeRemaining = gameTime;
var timeInterval = null;
var firstCell = null;
var hintTimer = null;
var currentHintPair = null;
var iceCount = 23;
var slideMoves = [];
var levelDescriptions = {
    1: "Cơ bản: Các khối giữ nguyên vị trí khi bị xóa.",
    2: "Rơi xuống: Các khối phía trên rơi xuống lấp chỗ trống khi bị xóa.",
    3: "Ô băng: Khi một cặp bị xóa, ô băng kề sẽ trượt 1 ô vào chỗ trống.",
    4: "..",
    5: "..",
    6: "..",
    7: "..",
    8: "..",
    9: ".."
};
var game = document.getElementById("game");
var lineCanvas = document.getElementById("line-canvas");
var timeBar = document.getElementById("time-bar");
var btnPause = document.getElementById("btn-pause");
var levelTitleSpan = document.getElementById("level-title");
var levelDescP = document.getElementById("level-desc");
var levelSelect = document.getElementById("level-select");
var startOverlay = document.getElementById("start-overlay");
var pauseOverlay = document.getElementById("pause-overlay");
var tip = document.getElementById("tip");
function setupUI() {
    lineCanvas.width = fullCol * cellWidth;
    lineCanvas.height = fullRow * cellHeight;
    levelDescP.innerText = levelDescriptions[currentLevel];
    levelSelect.onchange = changeLevel;
    document.getElementById("btn-restart").onclick = initBoard;
    btnPause.onclick = togglePause;
    document.getElementById("btn-resume").onclick = togglePause;
    document.getElementById("btn-start").onclick = startGame;
    document.getElementById("btn-shuffle").onclick = function () {
        if (!isGameStarted || isPaused) return;
        shuffleBoard();
    };
    document.getElementById("btn-hint").onclick = function () {
        if (!isGameStarted || isPaused) return;
        showHint();
    };
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
    if (timeInterval) clearInterval(timeInterval);
    clearTimeout(hintTimer);
    isGameStarted = false;
    isPaused = false;
    firstCell = null;
    btnPause.innerText = "Tạm Dừng";
    pauseOverlay.classList.add("hidden");
    clearCanvas();
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
    iceBoard = createIceBoard();
    render();
    showStartOverlay();
}
function render() {
    for (let i = 0; i < fullRow; i++) {
        for (let j = 0; j < fullCol; j++) {
            let cell = document.getElementById("cell_" + i + "_" + j);
            let val = board[i][j];
            cell.className = "cell";
            if (currentHintPair &&
                ((i === currentHintPair.p1.r && j === currentHintPair.p1.c) ||
                    (i === currentHintPair.p2.r && j === currentHintPair.p2.c))) {
                cell.classList.add("hint");
            }
            cell.innerHTML = "";
            if (val === 0) {
                cell.classList.add("empty");
            } else {
                if (iceBoard[i][j]) cell.classList.add("ice");
                let img = document.createElement("div");
                img.className = "card-img";
                img.style.backgroundImage = "url('img/pieces" + val + ".png')";
                let mv = slideMoves.find(m => m.r === i && m.c === j);
                if (mv) {
                    img.style.setProperty("--dx", mv.dx + "px");
                    img.style.setProperty("--dy", mv.dy + "px");
                    img.classList.add("slide");
                }
                cell.appendChild(img);
            }
        }
    }slideMoves = [];
}
function showStartOverlay() {
    startOverlay.classList.remove("hidden");
    game.classList.remove("blur-heavy");
    game.classList.add("blur-light");}
function removeStartOverlay() {
    startOverlay.classList.add("hidden");
    game.classList.remove("blur-light");}
function startGame() {
    isGameStarted = true;
    removeStartOverlay();
    checkAndAutoShuffle();
    startTimer();
    startHintTimer();}
function showPauseOverlay() {
    pauseOverlay.classList.remove("hidden");}
function removePauseOverlay() {
    pauseOverlay.classList.add("hidden");}
function togglePause() {
    if (!isGameStarted) return;
    isPaused = !isPaused;
    if (isPaused) {
        btnPause.innerText = "Tiếp Tục";
        showPauseOverlay();
        game.classList.add("blur-heavy");
        clearTimeout(hintTimer);
    } else {
        btnPause.innerText = "Tạm Dừng";
        removePauseOverlay();
        game.classList.remove("blur-heavy");
        startHintTimer();
    }
}
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
function startHintTimer() {
    clearTimeout(hintTimer);
    if (!isGameStarted || isPaused) return;
    hintTimer = setTimeout(() => {
        showHint();
    }, 10000);
}
function clearHint() {
    if (currentHintPair) {
        let cell1 = document.getElementById("cell_" + currentHintPair.p1.r + "_" + currentHintPair.p1.c);
        let cell2 = document.getElementById("cell_" + currentHintPair.p2.r + "_" + currentHintPair.p2.c);
        if (cell1) cell1.classList.remove("hint");
        if (cell2) cell2.classList.remove("hint");
        currentHintPair = null;
    }
}
function findHintPair() {
    let activeCells = [];
    for (let i = 1; i <= row; i++) {
        for (let j = 1; j <= col; j++) {
            if (board[i][j] !== 0) {
                activeCells.push({ r: i, c: j, val: board[i][j] });
            }
        }
    }
    for (let i = 0; i < activeCells.length; i++) {
        for (let j = i + 1; j < activeCells.length; j++) {
            if (activeCells[i].val === activeCells[j].val) {
                if (canConnect(activeCells[i].r, activeCells[i].c, activeCells[j].r, activeCells[j].c)) {
                    return { p1: activeCells[i], p2: activeCells[j] };
                }
            }
        }
    }
    return null;
}
function showHint() {
    if (currentHintPair) return;
    let pair = findHintPair();
    if (pair) {
        currentHintPair = pair;
        let cell1 = document.getElementById("cell_" + pair.p1.r + "_" + pair.p1.c);
        let cell2 = document.getElementById("cell_" + pair.p2.r + "_" + pair.p2.c);
        if (cell1) cell1.classList.add("hint");
        if (cell2) cell2.classList.add("hint");
    }
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
                    clearHint();
                    if (currentLevel === 2) applyGravity();
                    if (currentLevel === 3) applyIceSlide([{ r: r1, c: c1 }, { r: r, c: c }]);
                    render();
                    checkAndAutoShuffle();
                    startHintTimer();
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
function checkHasPairs() {
    let activeCells = [];
    for (let i = 1; i <= row; i++) {
        for (let j = 1; j <= col; j++) {
            if (board[i][j] !== 0) {
                activeCells.push({ r: i, c: j, val: board[i][j] });
            }
        }
    }
    if (activeCells.length === 0) return true;
    for (let i = 0; i < activeCells.length; i++) {
        for (let j = i + 1; j < activeCells.length; j++) {
            if (activeCells[i].val === activeCells[j].val) {
                if (canConnect(activeCells[i].r, activeCells[i].c, activeCells[j].r, activeCells[j].c)) {
                    return true;
                }
            }
        }
    }
    return false;
}
function shuffleBoard() {
    clearHint();
    let positions = [];
    let values = [];
    for (let i = 1; i <= row; i++) {
        for (let j = 1; j <= col; j++) {
            if (board[i][j] !== 0) {
                positions.push({ r: i, c: j });
                values.push(board[i][j]);
            }
        }
    }
    if (values.length === 0) return;
    values.sort(() => Math.random() - 0.5);
    for (let i = 0; i < positions.length; i++) {
        let pos = positions[i];
        board[pos.r][pos.c] = values[i];
    }
    render();
}
function showTip() {
    tip.classList.add("show");
    setTimeout(() => tip.classList.remove("show"), 1200);
}
function checkAndAutoShuffle() {
    let shuffleCount = 0;
    while (!checkHasPairs()) {
        shuffleBoard();
        shuffleCount++;
        if (shuffleCount > 20) break;
    }
    if (shuffleCount > 0) showTip();
}
function startTimer() {
    if (timeInterval) clearInterval(timeInterval);
    timeRemaining = gameTime;
    timeBar.style.width = "100%";
    timeBar.style.backgroundColor = "#22c55e";
    timeInterval = setInterval(() => {
        if (isPaused || !isGameStarted) return;
        timeRemaining -= 0.1;
        let percentage = (timeRemaining / gameTime) * 100;
        if (percentage <= 0) {
            percentage = 0;
            clearInterval(timeInterval);
            alert("Hết giờ! Bạn đã thua cuộc.");
            isGameStarted = false;
        }
        if (percentage < 20) {
            timeBar.style.backgroundColor = "#ef4444";
        }
        timeBar.style.width = percentage + "%";
    }, 100);
}
function changeLevel() {
    let selectedLvl = parseInt(levelSelect.value);
    if (selectedLvl !== 1 && selectedLvl !== 2 && selectedLvl !== 3) {
        alert("Level " + selectedLvl + " chưa có");
        levelSelect.value = currentLevel;
        return;
    }
    currentLevel = selectedLvl;
    levelTitleSpan.innerText = "Level " + currentLevel;
    levelDescP.innerText = levelDescriptions[currentLevel];
    initBoard();
}
function applyGravity() {
    for (let j = 1; j <= col; j++) {
        let stack = [];
        for (let i = row; i >= 1; i--) {
            if (board[i][j] !== 0) stack.push(board[i][j]);
        }
        for (let i = row, k = 0; i >= 1; i--, k++) {
            board[i][j] = k < stack.length ? stack[k] : 0;
        }
    }
}
function createIceBoard() {
    let grid = Array.from({ length: fullRow }, () => Array(fullCol).fill(false));
    if (currentLevel !== 3) return grid;
    let n = 0;
    while (n < iceCount) {
        let r = 1 + Math.floor(Math.random() * row);
        let c = 1 + Math.floor(Math.random() * col);
        if (!grid[r][c]) {
            grid[r][c] = true;
            n++;
        }
    }
    return grid;
}
function applyIceSlide(removed) {
    let order = [
        { dr: -1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
        { dr: 1, dc: 0 }];
    let moved = new Set();
    slideMoves = [];
    for (const e of removed) {
        if (board[e.r][e.c] !== 0) continue;
        for (const d of order) {
            let nr = e.r + d.dr;
            let nc = e.c + d.dc;
            if (nr < 1 || nr > row || nc < 1 || nc > col) continue;
            if (board[nr][nc] === 0 || !iceBoard[nr][nc]) continue;
            if (moved.has(nr + "_" + nc)) continue;
            board[e.r][e.c] = board[nr][nc];
            iceBoard[e.r][e.c] = true;
            board[nr][nc] = 0;
            iceBoard[nr][nc] = false;
            moved.add(e.r + "_" + e.c);
            slideMoves.push({ r: e.r, c: e.c, dx: d.dc * cellWidth, dy: d.dr * cellHeight });
            break;
        }
    }
}
setupUI();
initGame(fullCol, fullRow);
initBoard();