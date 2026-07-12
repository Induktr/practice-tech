// RESULT:
/*
    lengthInfo: { raw: 24, real: 22 },
    trimmed: "js 🚀 mastery ts 🚀",
    hasEmojis: true,
    indices: { first: 5, last: 20 }
*/

const metricsData = {
    lengthInfo: {},
    uniqueSymbols: [],
    trimmed: "",
    hasEmojis: false,
    indices: {}
};

function analyzeStringStructure(sourceStr, searchWord, forbiddenWord, replaceWord = "") {
    const entireLine = sourceStr.trim().toLowerCase();
    const wordForbidden = forbiddenWord.toLowerCase();
    const wordReplace = replaceWord.toLowerCase();
    const wordLowerCase = searchWord.toLowerCase();
    const lenStr = [...sourceStr];
    const lenPoint = sourceStr.length;
    const lenUnits = lenStr.length;

    const oneIndexSearch = entireLine.indexOf(wordLowerCase, wordLowerCase.length);
    const twoIndexSearch = entireLine.lastIndexOf(wordLowerCase);

    const formatWord = entireLine.replaceAll(wordForbidden, wordReplace);

    const unquieSet = new Set(lenStr);
    const unquieStr = [...unquieSet];

    if (entireLine.includes(wordLowerCase)) metricsData.indices = { first: oneIndexSearch, last: twoIndexSearch };

    lenStr.forEach((str) => {
        if(str.codePointAt() > 0xFFFF) metricsData.hasEmojis = true;
    });
    
    metricsData.trimmed = formatWord;
    
    metricsData.lengthInfo = { raw: lenUnits, real: lenPoint };

    for (const char of unquieStr) {
        metricsData.uniqueSymbols.push({
            symbol: char,
            point: char.codePointAt(),
            char: char.charCodeAt(),
            amountUnits: char.length
        });
    };

    return JSON.stringify(metricsData);
};

console.log(analyzeStringStructure(" JS 🚀 Mastery TS 🚀 ", "t", "Mastery", "Atomic"));