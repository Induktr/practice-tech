export function blueprintScanner(input = "") {
    const matches = input.matchAll(/\[MOD-([A-Z0-9]+):(.+?)\]/gu);

    const res = [];

    function formattedTable(id, status, len) {
        return `ID: ${id.padEnd(5)} | Status: ${status.padEnd(5)} | Len: ${len}`;
    };

    for (let match of matches) {
        const id = match[1];
        const status = match[2];
        const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
        const segments = segmenter.segment(status);
        const segmentsArray = [...segments];
        const len = segmentsArray.length;
        const fixedStatus = segmentsArray[0].segment;

        res.push(formattedTable(id, fixedStatus, len));
    };

    return res.toString().replace(/[,]/g, "\n");
};

console.log(blueprintScanner("[MOD-A1:🔋][noise_392][MOD-B2:⚙️][MOD-C3:👨‍🔧]"));