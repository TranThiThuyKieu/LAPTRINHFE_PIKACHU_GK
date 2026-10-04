document.addEventListener("DOMContentLoaded", function() {
    const btnBatDau = document.getElementById("btn-bat-dau");
    const manHinhBatDau = document.getElementById("man-hinh-bat-dau");
    const manHinhChonLevel = document.getElementById("man-hinh-chon-level");
    const manHinhGame = document.getElementById("man-hinh-game");
    const pikachuBoard = document.getElementById("pikachu-board");
    const levelItems = document.querySelectorAll(".level-item");
    if (btnBatDau) {
        btnBatDau.addEventListener("click", function() {
            manHinhBatDau.style.display = "none";
            manHinhChonLevel.style.display = "flex";
        });
    }
    levelItems.forEach(function(item) {
        item.addEventListener("click", function() {
            const levelTitle = this.querySelector(".level-title").innerText;
            levelItems.forEach(lvl => lvl.style.borderColor = "#eaebef");
            this.style.borderColor = "#3b82f6";
            console.log("Bắt đầu game với: " + levelTitle);
            if (levelTitle === "Level 1") {
                manHinhChonLevel.style.display = "none";
                manHinhGame.style.display = "flex";
                initBoard();
            }
        });
    });
    const maxPieces = 36;
    let timeInterval;
    function initBoard() {
        pikachuBoard.innerHTML = '';
        const rows = 9;
        const cols = 16;
        const totalCards = rows * cols;
        let cards = [];
        for (let i = 0; i < totalCards / 2; i++) {
            const pieceId = Math.floor(Math.random() * maxPieces) + 1;
            cards.push(pieceId);
            cards.push(pieceId);
        }
        cards.sort(() => Math.random() - 0.5);
        for (let i = 0; i < totalCards; i++) {
            const card = document.createElement("div");
            card.className = "pokemon-card";
            card.style.backgroundImage = `url('resources/pieces${cards[i]}.png')`;
            card.addEventListener("click", function() {
                if(this.classList.contains("hidden")) return;
                if (this.classList.contains("active")) {
                    this.classList.remove("active");
                } else {
                    this.classList.add("active");
                }
            });
            pikachuBoard.appendChild(card);
        }
        const timeBar = document.getElementById("time-bar");
        let percentage = 100;
        if (timeInterval) clearInterval(timeInterval);
        timeInterval = setInterval(() => {
            percentage -= 0.1;
            if (percentage <= 0) {
                percentage = 0;
                clearInterval(timeInterval);
                console.log("Hết giờ!");
            }
            timeBar.style.width = percentage + "%";
        }, 100);
    }
});
