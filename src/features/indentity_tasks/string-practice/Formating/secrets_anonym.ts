type HashDataMsg = { hashOp?: string, hashPass?: string, isVerify?: boolean }

type ErrorMsgRes = {
  count: number;
  isError: boolean;
  currTypeData: "undefined" | "string" | "object";
};

type SubmitData = {
  operation: string,
  password: string,
  verefication: string
}

const message = 'OPERATION: [DETECTED] PASSWORD: qwerty123 VEREFYCATION: ENABELD';

function anonymizeFormattingData(msg: string): HashDataMsg[] | string | ErrorMsgRes {
  if(!msg) return "";

  const packagesHashing: HashDataMsg[] = [];

  const spliting= msg.split(",");

  for(let i = 0; i < spliting.length; i++) {
    const str = spliting[i];

    if(str.includes("OPERATION")) {
      const hashingOp = str.codePointAt(i);
      packagesHashing.push({ hashOp: `0x${hashingOp}` });
    };
    if(str.includes("PASSWORD")) {
      const hashingPass = crypto.randomUUID().slice(0, 8);
      packagesHashing.push({ hashPass: hashingPass });
    };
    if(str.includes("VEREFYCATION")) {
      for(let k = 0; k < str.length - 1; k++) {
        packagesHashing.push();
      };
    };
  };

  return typeof msg === "string" ? packagesHashing : packagesHashing.toString();
};

console.log(anonymizeFormattingData(message));