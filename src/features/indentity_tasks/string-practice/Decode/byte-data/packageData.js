function dataPackage(pData) {
    const buffer = new ArrayBuffer(8);
    const initArr = new DataView(buffer);
    const data = [...pData];
    const findStart = data.toSpliced(4);
    const press = findStart
    .reduce((
        p,
        currValue,
        currIndex
    ) => {
        if(currIndex > 0) return currValue + p;
    });
    const findEnd = Uint8Array.from(data.splice(4));
    const stat = new TextDecoder().decode(findEnd);
    
    initArr.setUint16(0, press, false);

    initArr.setUint16(0, findEnd, false);

    return { pressure: press, status: stat };
};

console.log(dataPackage([0x1, 0xF4, 0xF4, 0x01, 0x50, 0x41, 0x53, 0x53]));