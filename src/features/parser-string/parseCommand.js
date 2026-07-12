// 1 Example
function parseCommand(rawInput) {
    let str = rawInput.trim().normalize("NFKC");

    if(str.startsWith("!!")) {
        const startIndex = str.search(/[^!]/);
        const indexCommand = str.indexOf(":");

        const commaChar = str.split(",");
        const command = commaChar[0].slice(-str.length + startIndex, indexCommand).replaceAll("!", "").toUpperCase().trim();
        const indexLabel = commaChar[1].indexOf("\"");
        const indexFlag = commaChar[1].indexOf("--");
        const emoji = commaChar[0].replaceAll(/[0-\x-FFFF\!\)\(]/g, "").trim();
        const smileCodePint = emoji.codePointAt();

        const label = commaChar[1].slice(indexLabel, indexFlag).replaceAll(/["\)\(]/g, "").trim();

        const indexEquel = commaChar[1].lastIndexOf("=");
        const key = commaChar[1].slice(indexFlag, indexEquel).replaceAll("--", "").trim();
        const value = commaChar[1].slice(indexEquel).replaceAll("=", "").trim();
        const valCodePoint = String(value.codePointAt() - 3);
        
        return `[COMMAND]: ${command.padEnd(20, '.')}\n[TARGET]: ${emoji} (Code: ${smileCodePint || 0})\n[LABEL]: ${label} \n[FLAG]: ${key.padEnd(key.length + 3, " ->")} ${value} \n[SESSION]: ${valCodePoint.repeat(3)} `;
    } else return str = "INVALID_PROTOCOL";
    
    return str;
};

console.log(parseCommand("!!Build:Node(🌀, \"Neural Core\") --priority=high"));

// 2 Exmaple
function parseCommand(rawInput) {
    const str = rawInput.normalize("NFKC");
    const charsMatch = str.matchAll(/!!(\w+):(?:(\w+)\()?([^,\)]+)(?:,\s*"([^"]+)")?\)?\s*--(\w+)=(\w+)/gu);
    for (const [full, cmd, type, target, label, key, value] of charsMatch) return `[COMMAND]: ${cmd.toUpperCase().padEnd(20, '.')}\n[TARGET]: ${target} (Code: ${target.codePointAt()})\n[LABEL]: ${label} \n[FLAG]: ${key.padEnd(key.length + 3, " ->")} ${value} \n[SESSION]: ${String(value.codePointAt() - 3).repeat(3)}`;
};

console.log(parseCommand("!!Build:Node(🌀, \"Neural Core\") --priority=high"));