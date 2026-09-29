const newMessage = {
    sender: "",
    receiver: "",
    message: "",
    icon: ""
};

export function parserMsg(txtData, msgData) {
    try {
        const msgLogs = txtData.split(/[@#$!%*\]\[]+/u);

        for (let log of msgLogs) {
            let index = log.indexOf(":");
            let msg = log.slice(index + 1);

            if (log.includes("S")) msgData.sender = msg;
            
            if(log.includes("R")) msgData.receiver = msg;
            
            if(log.includes("M")) msgData.message = msg.replaceAll(/[_]/g, " ");

            if(log.includes("E")) msgData.icon = msg;
        };
    } catch(e) {
        if(e instanceof Error) return new Error(`TypeError: ${e.message}`);
    };

    return msgData || {};
};

console.log(parserMsg("$#%[S:Architect][R:DigitalTwin][M:Code_is_Gold][E:💎]!*@", newMessage));
