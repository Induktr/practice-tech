const user = { email: "", phone: "", tags: [], icon: "" };

export function anonymize(txtData) {
    try {
        const listData = txtData.match(/[^A-Z:;\s]+/g);

        for (let txt of listData) {
            let indexDomain = txt.search(/[^A-z]/);
            let domain = txt.slice(indexDomain);
            let indexPhone = txt.search(/[^A-z\@\s+]/);
            let phone = txt.slice(-indexPhone * 4);
            let masking = '***';
            let indexEmoji = txt.search(/[^\0-\xFFFF]/u);
            
            if(txt.includes("@")) {
                user.email = `${masking}${domain}`;
            } else if(txt.includes("+")) {
                user.phone = `${masking}${phone}`;
            } else if(txt.codePointAt(indexEmoji) > 0xFFFF) {
                user.icon = txt.trim();
            } else {   
                user.tags.push(txt);
            };
        };
    } catch(e) {
        if(e instanceof Error) return new Error(`TypeError: ${e.message}`);
    };

    return user || {};
};

console.log(anonymize("USER: nikita@gmail.com TEL:+380689621643 ;key1; key2 🛡️"));