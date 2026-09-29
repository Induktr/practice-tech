export function bitChange(b64) {
    let res;
    if(!Number.isNaN(b64)) res = Number.parseInt(b64);
    return Math.fround(res) || "Error";
};