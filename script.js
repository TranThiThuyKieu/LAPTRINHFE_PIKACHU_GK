document.addEventListener("DOMContentLoaded", function() {
    const btnBatDau = document.getElementById("btn-bat-dau");
    const manHinhBatDau = document.getElementById("man-hinh-bat-dau");
    const manHinhChonLevel = document.getElementById("man-hinh-chon-level");
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
            manHinhChonLevel.style.display = "none";
            document.getElementById("man-hinh-game").style.display = "flex";
            khoiTaoGame();
        });
    });

    function khoiTaoGame() {
        const bangGame = document.getElementById("bang-game");
        bangGame.innerHTML = ''; // Xóa bàn cũ nếu có

        // Tạo 36 ô với 36 hình khác nhau (từ pieces1.png đến pieces36.png)
        for(let i = 1; i <= 36; i++) {
            const oGame = document.createElement('div');
            oGame.className = 'o-game';

            const img = document.createElement('img');
            img.src = `Resources/pieces${i}.png`;

            oGame.appendChild(img);
            bangGame.appendChild(oGame);
        }
    }
});
