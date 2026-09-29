const ICON_SUFFIX = "[ICON]";

const VERIFY_FORMAT = "Validated by Induktr";

// Example 1
function sanitize(input = "", maxLength) {
    const str = input
    .trim()
    .normalize("NFKC")
    .toUpperCase();

    const chars = [...str];

    try {
        if (str.codePointAt(0) > 0xFFFF) {
            if (chars.length > maxLength) {
                const emoji = str.search(/[0-\x-FFFF]/g);
                const smileCalc = Math.floor(emoji / 2);
                const endChar = chars.slice(-maxLength + smileCalc, -2).join("");
                const startChar = chars.slice(-chars.length + smileCalc, --maxLength).join("");

                return `${ICON_SUFFIX}${startChar}${endChar}... ${" ".repeat(maxLength)} | ${VERIFY_FORMAT}`;
            };
        };
    } catch(e) {
        if(e instanceof Error) throw new Error(`Error exchange string: ${e.message}`);
    };

    return str;
};

console.log(sanitize(" 👨‍🚀 mars mission ", 10));

// Example 2
function sanitize(input = "", maxLength) {
    const str = input
    .trim()
    .normalize("NFKC")
    .toUpperCase();

    const chars = [...str];

    try {
        const matchStr = str.match(/[A-Z]+/g);

        return `${ICON_SUFFIX} ${matchStr[0]} ${matchStr[1].slice(-maxLength, -2)}... ${" ".repeat(maxLength)} | ${VERIFY_FORMAT}`;
    } catch(e) {
        if(e instanceof Error) throw new Error(`Error exchange string: ${e.message}`);
    };

    return str;
};

console.log(sanitize(" 👨‍🚀 mars mission ", 10));