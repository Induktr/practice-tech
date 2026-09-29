const txt = "Привет! меня зовут Никита, Я наилучший мастер эксперт Middle Fullstack Разработчик на React, и больше технологического стека на данный момент.";

function collInfo(txtData = "") {
    return txtData
    .split("")
    .map((coll, index) => `${index + 1}. ${coll}`)
    .toLocaleString()
    .replace(/[,]/g, "\n");
};

console.log(collInfo(txt));
