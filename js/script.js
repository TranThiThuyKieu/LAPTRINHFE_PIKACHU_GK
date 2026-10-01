document.addEventListener('DOMContentLoaded', () => {
    const nutHuongDan = document.getElementById('nutHuongDan');
    const nutDongHuongDan = document.getElementById('nutDongHuongDan');
    const hopThoaiHuongDan = document.getElementById('hopThoaiHuongDan');
    const nutBatDau = document.getElementById('nutBatDau');
    const chonLevel = document.getElementById('chonLevel');
    if (nutHuongDan && hopThoaiHuongDan) {
        nutHuongDan.addEventListener('click', () => {
            hopThoaiHuongDan.classList.remove('an-di');
        });
    }
    if (nutDongHuongDan && hopThoaiHuongDan) {
        nutDongHuongDan.addEventListener('click', () => {
            hopThoaiHuongDan.classList.add('an-di');
        });
    }
    if (hopThoaiHuongDan) {
        hopThoaiHuongDan.addEventListener('click', (event) => {
            if (event.target === hopThoaiHuongDan) {
                hopThoaiHuongDan.classList.add('an-di');
            }
        });
    }
});