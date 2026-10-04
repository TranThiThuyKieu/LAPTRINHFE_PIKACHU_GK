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
        });
    });
});
