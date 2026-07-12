function calculateBilling(rawText = "", pricePerChar) {
    const str = rawText.normalize("NFC").trim();
    const chars = [...str];
    const byteSize = str.length * 2;
    const renderLines = "-".repeat(29);
    const lenGraph = chars.length;

    const rawCost = lenGraph * Number.parseFloat(pricePerChar);
    
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        currencyDisplay: "symbol"
    });

    const finalInvoice = formatter.format(Math.ceil(rawCost * 100) / 100);

    return `[REPORT]: MARS BILLING SYSTEM\n${renderLines}\nTEXT: ${str}\nLENGTH: ${chars.length} units\nRAW COST: ${rawCost} \nFINAL INVOICE: ${formatedInVoice}\n${renderLines}\nValidated by Induktr`;
};

console.log(calculateBilling("  🚀 Mission to Mars 🌀  ", "0.0075"));