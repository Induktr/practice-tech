function generateSeal(name = "", level = 0) {
    let nameFormat;

    const indexOneSym = name.at(0);
    const upperName = name.toUpperCase();
    const calcLenHash = name.length + (level * 2);
    const charSym = `[0x${indexOneSym.codePointAt(0).toString(16)}]`;
    const addHash = `${charSym}${"#".repeat(calcLenHash)}${charSym}`;
    const nameArrows = `${"".padStart(level, "<")} ${upperName} ${"".padEnd(level, ">")}`;
    const isComplex = /[\p{Extended_Pictographic}\u200D]/u.test(indexOneSym);

    if (isComplex) {
        nameFormat = `* ${nameArrows} *`;
    } else nameFormat = `# ${nameArrows} #`;

    return `${addHash}\n${nameFormat}\n${addHash}`;
};

console.log(generateSeal("Induktr", 5));