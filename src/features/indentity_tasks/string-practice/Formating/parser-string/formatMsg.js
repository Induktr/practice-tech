export function processMessage(rawInput, time ) {
    let cleanLine = rawInput.trimStart();

    let res;

    if(cleanLine.startsWith("/send")) {
        let msgIndex = cleanLine.indexOf("[");
        let msg = cleanLine.slice(msgIndex);
        let secMsg = msg.replaceAll("Fuck", "****");
        let extraTime = time.replace(":", "0").padStart(time.length + 1, "0");
        let indexHour = extraTime.slice(0, -2);
        let indexMin = extraTime.slice(-2);
        let timeFormat = `[${indexHour}:${indexMin}]`;
        let indexSlash = cleanLine.at(0);

        res = `${timeFormat} ${secMsg}${indexSlash}`;
    } else {
        res = "Error: Invalid Command";
    };

    return res;
};

console.log(processMessage(" /send [Admin]: Hello world! Fuck this bug ", "9:5"));