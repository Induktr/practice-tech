// function analyzeData() {
//     const inputData = document.getElementById("field-data");

//     let value = "";
    
//     inputData.addEventListener("input", (e) => value = e.target.value);

//     return value.normalize("NFC");
// };

function parserString(len, hex, slug ) {
    const data = hex;

    const codePints = [];

    for(const char of data) {
        const codePointDecimal = char.codePointAt(0); 

        let hex = codePointDecimal.toString(16).toUpperCase();

        if (hex.length < 4) {
            hex = hex.padStart(4, '0');
        };

        codePints.push(`U+${hex}`);
    };

    return console.log(codePints.join(""));
};

parserString(222, "2. Interactive Input: Поле ввода, куда можно вставлять любые сложные строки (смесь кириллицы, латыни, спецсимволов и комплексных эмодзи типа семейств 👨‍👩‍👧‍👦 или флагов).")

// function renderingUi() {
//     const inputData = document.getElementById("field-data");
//     const hLen = document.querySelector(".cards__card-len");
//     const hHex = document.querySelector(".cards__card-hex");
//     const hSlug = document.querySelector(".cards__card-slug");

//     inputData.addEventListener("input", (e) => {
//         e.preventDefault();

//         parserString(hLen.textContent, hHex.textContent, hSlug.textContent);
//     });
    
// };