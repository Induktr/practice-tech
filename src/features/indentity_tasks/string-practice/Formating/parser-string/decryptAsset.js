export function decryptAsset(rawLine = "") {
    const cleanLine = rawLine.trim();

    let res;

    if(cleanLine.startsWith("!!!MATRIX_OS!!!")) {
        let indexData = cleanLine.indexOf("#");
        let extraData = cleanLine.slice(indexData);
        let dataFlag = extraData.replaceAll(/[#\]\[]/gu, "");
        let indexId = extraData.search(/[^ID\0-9]/);
        let id = dataFlag.slice(-extraData.length, ++indexId);
        let indexNum = id.slice(-1, indexId);
        let num = indexNum.padStart(indexNum.length + 4, "0");
        let indexName = dataFlag.indexOf("NAME:");
        let name = dataFlag.slice(indexName, indexData - extraData.length + 2);
        let valueName = dataFlag.slice(indexName + indexId + 1, indexData + indexName - 2);
        let indexPower = dataFlag.indexOf("P");
        let power = dataFlag.slice(indexPower, -indexName - 5);
        let numPower = dataFlag.slice(indexPower + indexName + 1, -indexNum);
        let indexSig = dataFlag.indexOf("SIG");
        let sig = dataFlag.slice(indexSig, indexSig + 4);
        let emoji = dataFlag.slice(indexSig + 4);
        let symPrimary = cleanLine.at(0);
        
        res = `${id.slice(-id.length, 3)} ${num} | ${name} ${valueName}...... | ${power} ${numPower} | ${sig} ${emoji} | Verified: ${symPrimary}`;
    } else res = "Access Denied";

    return res;
};

console.log(decryptAsset(" !!!MATRIX_OS!!! #ID:7# #NAME:Scout_Bot# #POWER:95%# [SIG:🚀] "));