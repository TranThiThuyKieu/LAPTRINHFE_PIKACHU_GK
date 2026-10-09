document.addEventListener("DOMContentLoaded", function() {
    const btnBatDau = document.getElementById("btn-bat-dau");
    const manHinhBatDau = document.getElementById("man-hinh-bat-dau");
    const manHinhChonLevel = document.getElementById("man-hinh-chon-level");
    const manHinhGame = document.getElementById("man-hinh-game");
    const pikachuBoard = document.getElementById("pikachu-board");
    const lineCanvas = document.getElementById("line-canvas");
    const levelItems = document.querySelectorAll(".level-item");
    const btnChoiLai = Array.from(document.querySelectorAll('.cot-dieu-khien .nut-dieu-khien'))
        .find(btn => btn.textContent.trim() === 'Chơi Lại');
    const btnCheDo = Array.from(document.querySelectorAll('.cot-dieu-khien .nut-dieu-khien'))
        .find(btn => btn.textContent.includes('Chế độ:'));
    const btnTamDung = Array.from(document.querySelectorAll('.cot-dieu-khien .nut-dieu-khien'))
        .find(btn => btn.textContent.trim() === 'Tạm Dừng' || btn.textContent.trim() === 'Tiếp Tục');
    const hang = 9;
    const cot = 16;
    const full_hang = hang + 2;
    const full_cot = cot + 2;
    const card_width = 38;
    const card_height = 42;
    const max_pieces = 36;
    const game_time = 240;
    let board = [];
    let selectedCard = null;
    let timeInterval = null;
    let timeRemaining = game_time;
    let remainingPairs = (hang * cot) / 2;
    let isProcessing = false;
    let hintTimer = null;
    let isPaused = false;
    if (btnBatDau) {
        btnBatDau.addEventListener("click", function() {
            manHinhBatDau.style.display = "none";
            manHinhChonLevel.style.display = "flex";
        });
    }
    if (btnChoiLai) {
        btnChoiLai.addEventListener('click', function() {
            if (manHinhGame.style.display !== 'none') {
                if (timeInterval) clearInterval(timeInterval);
                clearCanvas();
                if (isPaused && btnTamDung) {
                    isPaused = false;
                    btnTamDung.textContent = 'Tạm Dừng';
                    pikachuBoard.style.pointerEvents = 'auto';
                    pikachuBoard.style.opacity = '1';
                }
                initLevel1();
            }});
    }
    if (btnCheDo) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            btnCheDo.textContent = 'Chế độ: Tối';
        } else {
            btnCheDo.textContent = 'Chế độ: Sáng';}
        btnCheDo.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            btnCheDo.textContent = isDark ? 'Chế độ: Tối' : 'Chế độ: Sáng';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
    if (btnTamDung) {
        btnTamDung.addEventListener('click', function() {
            if (manHinhGame.style.display === 'none') return;
            isPaused = !isPaused;
            if (isPaused) {
                if (timeInterval) clearInterval(timeInterval);
                clearTimeout(hintTimer);
                clearHintHighlight();
                btnTamDung.textContent = 'Tiếp Tục';
                pikachuBoard.style.pointerEvents = 'none';
                pikachuBoard.style.opacity = '0.4';
            } else {
                btnTamDung.textContent = 'Tạm Dừng';
                pikachuBoard.style.pointerEvents = 'auto';
                pikachuBoard.style.opacity = '1';
                resumeTimer();
                resetHintTimer();
            }
        });
    }
    levelItems.forEach(function(item) {
        item.addEventListener("click", function() {
            const levelTitle = this.querySelector(".level-title").innerText;
            levelItems.forEach(lvl => lvl.style.borderColor = "#eaebef");
            this.style.borderColor = "#3b82f6";
            if (levelTitle === "Level 1") {
                manHinhChonLevel.style.display = "none";
                manHinhGame.style.display = "flex";
                initLevel1();
            }
        });
    });
    function initLevel1() {
        pikachuBoard.innerHTML = '';
        selectedCard = null;
        isProcessing = false;
        isPaused = false;
        if (btnTamDung) btnTamDung.textContent = 'Tạm Dừng';
        pikachuBoard.style.pointerEvents = 'auto';
        pikachuBoard.style.opacity = '1';
        remainingPairs = (hang * cot) / 2;
        lineCanvas.width = full_cot * card_width;
        lineCanvas.height = full_hang * card_height;
        let cards = [];
        for (let i = 0; i < remainingPairs; i++) {
            const pieceId = Math.floor(Math.random() * max_pieces) + 1;
            cards.push(pieceId, pieceId);}
        cards.sort(() => Math.random() - 0.5);
        board = Array.from({ length: full_hang }, () => Array(full_cot).fill(0));
        let cardIdx = 0;
        for (let r = 1; r <= hang; r++) {
            for (let c = 1; c <= cot; c++) {
                board[r][c] = cards[cardIdx++];}}
        renderBoard();
        startTimer();
        checkAndShuffleIfNoMoves();
        resetHintTimer();}
    function renderBoard() {
        pikachuBoard.innerHTML = '';
        for (let r = 0; r < full_hang; r++) {
            for (let c = 0; c < full_cot; c++) {
                const card = document.createElement("div");
                card.dataset.row = r;
                card.dataset.col = c;
                if (board[r][c] === 0) {
                    card.className = "pokemon-card empty-cell";
                } else {
                    card.className = "pokemon-card";
                    card.style.backgroundImage = `url('resources/pieces${board[r][c]}.png')`;
                    card.addEventListener("click", () => handleCardClick(r, c, card));}
                pikachuBoard.appendChild(card);}}}
    function handleCardClick(r, c, element) {
        if (isProcessing || isPaused || board[r][c] === 0) return;
        if (!selectedCard) {
            selectedCard = { r, c, element };
            element.classList.add("active");
        } else if (selectedCard.r === r && selectedCard.c === c) {
            element.classList.remove("active");
            selectedCard = null;
        } else {
            const prevR = selectedCard.r;
            const prevC = selectedCard.c;
            if (board[prevR][prevC] === board[r][c]) {
                const path = canConnect(prevR, prevC, r, c);
                if (path) {
                    isProcessing = true;
                    element.classList.add("active");
                    drawLine(path);
                    setTimeout(() => {
                        clearCanvas();
                        board[prevR][prevC] = 0;
                        board[r][c] = 0;
                        selectedCard.element.className = "pokemon-card empty-cell";
                        selectedCard.element.style.backgroundImage = "";
                        element.className = "pokemon-card empty-cell";
                        element.style.backgroundImage = "";
                        selectedCard = null;
                        isProcessing = false;
                        remainingPairs--;
                        if (remainingPairs === 0) {
                            gameWin();
                        } else {
                            checkAndShuffleIfNoMoves();
                            resetHintTimer();}}, 300);
                    return;}
            }
            selectedCard.element.classList.remove("active");
            selectedCard = { r, c, element };
            element.classList.add("active");}}
    function canConnect(r1, c1, r2, c2) {
        const dirs = [
            { dr: -1, dc: 0 },
            { dr: 1, dc: 0 },
            { dr: 0, dc: -1 },
            { dr: 0, dc: 1 }];
        let queue = [{ r: r1, c: c1, dir: -1, turns: 0, path: [{ r: r1, c: c1 }] }];
        let visited = Array.from({ length: full_hang }, () =>
            Array.from({ length: full_cot }, () => Array(4).fill(Infinity)));
        while (queue.length > 0) {
            const { r, c, dir, turns, path } = queue.shift();
            if (r === r2 && c === c2) return path;
            for (let d = 0; d < 4; d++) {
                const nr = r + dirs[d].dr;
                const nc = c + dirs[d].dc;
                if (nr >= 0 && nr < full_hang && nc >= 0 && nc < full_cot) {
                    const newTurns = (dir === -1 || dir === d) ? turns : turns + 1;
                    if (newTurns <= 2) {
                        if (board[nr][nc] === 0 || (nr === r2 && nc === c2)) {
                            if (newTurns < visited[nr][nc][d]) {
                                visited[nr][nc][d] = newTurns;
                                queue.push({r: nr, c: nc, dir: d, turns: newTurns, path: [...path, { r: nr, c: nc }]});}}
                    }
                }}}
        return null;}
    function drawLine(path) {
        const ctx = lineCanvas.getContext("2d");
        ctx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#2563eb";
        ctx.shadowColor = "#60a5fa";
        ctx.shadowBlur = 8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        path.forEach((pt, index) => {
            const x = pt.c * card_width + card_width / 2;
            const y = pt.r * card_height + card_height / 2;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }});
        ctx.stroke();}
    function clearCanvas() {
        const ctx = lineCanvas.getContext("2d");
        ctx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);}
    function checkAndShuffleIfNoMoves() {
        if (!hasAvailableMoves()) {
            shuffleBoard();
        }}
    function hasAvailableMoves() {
        let activeCards = [];
        for (let r = 1; r <= hang; r++) {
            for (let c = 1; c <= cot; c++) {
                if (board[r][c] !== 0) {
                    activeCards.push({ r, c, val: board[r][c] });}}
        }
        for (let i = 0; i < activeCards.length; i++) {
            for (let j = i + 1; j < activeCards.length; j++) {
                if (activeCards[i].val === activeCards[j].val) {
                    if (canConnect(activeCards[i].r, activeCards[i].c, activeCards[j].r, activeCards[j].c)) {
                        return true;}}}
        }
        return false;}
    function shuffleBoard() {
        let currentValues = [];
        for (let r = 1; r <= hang; r++) {
            for (let c = 1; c <= cot; c++) {
                if (board[r][c] !== 0) {
                    currentValues.push(board[r][c]);}}
        }do {
            currentValues.sort(() => Math.random() - 0.5);
            let idx = 0;
            for (let r = 1; r <= hang; r++) {
                for (let c = 1; c <= cot; c++) {
                    if (board[r][c] !== 0) {
                        board[r][c] = currentValues[idx++];
                    }
                }}
        } while (!hasAvailableMoves() && currentValues.length > 0);
        renderBoard();
        resetHintTimer();}
    function startTimer() {
        if (timeInterval) clearInterval(timeInterval);
        timeRemaining = game_time;
        const timeBar = document.getElementById("time-bar");
        timeInterval = setInterval(() => {
            timeRemaining -= 0.1;
            let percentage = (timeRemaining / game_time) * 100;
            if (timeRemaining <= 0) {
                timeRemaining = 0;
                percentage = 0;
                clearInterval(timeInterval);
                gameOver();}
            timeBar.style.width = percentage + "%";
        }, 100);}
    function resumeTimer() {
        if (timeInterval) clearInterval(timeInterval);
        const timeBar = document.getElementById("time-bar");
        timeInterval = setInterval(() => {
            timeRemaining -= 0.1;
            let percentage = (timeRemaining / game_time) * 100;
            if (timeRemaining <= 0) {
                timeRemaining = 0;
                percentage = 0;
                clearInterval(timeInterval);
                gameOver();}
            timeBar.style.width = percentage + "%";
        }, 100);
    }
    function gameOver() {
        clearTimeout(hintTimer);
        clearHintHighlight();
        showModal("Thua cuộc!", "Đã hết thời gian. Bạn có muốn chơi lại?", "Chơi Lại", () => {
            closeModal();
            initLevel1();
        });}
    function gameWin() {
        clearInterval(timeInterval);
        clearTimeout(hintTimer);
        clearHintHighlight();
        showModal("Chiến Thắng!", "Chúc mừng bạn đã hoàn thành!", "Chơi Level tiếp", () => {
            closeModal();
            manHinhGame.style.display = "none";
            manHinhChonLevel.style.display = "flex";
        });
    }
    function showModal(title, msg, btnText, onAction) {
        closeModal();
        const modalHtml = `
            <div class="game-modal" id="game-modal">
                <div class="modal-content">
                    <h2>${title}</h2>
                    <p>${msg}</p>
                    <button class="btn-modal" id="btn-modal-action">${btnText}</button>
                </div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById("btn-modal-action").addEventListener("click", onAction);}
    function closeModal() {
        const modal = document.getElementById("game-modal");
        if (modal) modal.remove();}
    function resetHintTimer() {
        clearTimeout(hintTimer);
        clearHintHighlight();
        hintTimer = setTimeout(() => {showHint();}, 10000);
    }
    function findPair() {
        let activeCards = [];
        for (let r = 1; r <= hang; r++) {
            for (let c = 1; c <= cot; c++) {
                if (board[r][c] !== 0) {
                    activeCards.push({ r, c, val: board[r][c] });}}
        }
        for (let i = 0; i < activeCards.length; i++) {
            for (let j = i + 1; j < activeCards.length; j++) {
                if (activeCards[i].val === activeCards[j].val) {
                    if (canConnect(activeCards[i].r, activeCards[i].c, activeCards[j].r, activeCards[j].c)) {
                        return [activeCards[i], activeCards[j]];}}}
        }
        return null;}
    function showHint() {
        const pair = findPair();
        if (!pair) return;
        if (selectedCard) {
            selectedCard.element.classList.remove("active");
            selectedCard = null;
        }
        const [card1, card2] = pair;
        const el1 = document.querySelector(`.pokemon-card[data-row="${card1.r}"][data-col="${card1.c}"]`);
        const el2 = document.querySelector(`.pokemon-card[data-row="${card2.r}"][data-col="${card2.c}"]`);
        if (el1 && el2) {
            el1.classList.add("hint");
            el2.classList.add("hint");}}
    function clearHintHighlight() {
        const hintCards = document.querySelectorAll(".pokemon-card.hint");
        hintCards.forEach(card => card.classList.remove("hint"));
    }
});