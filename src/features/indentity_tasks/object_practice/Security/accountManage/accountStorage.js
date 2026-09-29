export const SOLANA_RPC_ENDPOINT = "https://api.devnet.solana.com";
export const PUBLIC_KEY = "11111111111111111111111111111111";

export async function fetchAccount(pubKey = PUBLIC_KEY, rpcUrl = SOLANA_RPC_ENDPOINT) {
  if (!pubKey || typeof pubKey !== "string") return null;

  const response = await Promise.try(async () => fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getAccountInfo",
      params: [pubKey, { encoding: "jsonParsed" }]
    })
  }));

  if(!response.ok) return null;

  const json = await response.json();
  const accountInfo = json?.result?.value;

  if(!accountInfo) return null;

  return {
    pubKey,
    lamports: accountInfo.lamports,
    owner: accountInfo.owner,
    executable: accountInfo.executable,
    data: accountInfo.data
  };
};

export async function accountStorage() {
  const data = await fetchAccount();

  let _lamports = Number.isSafeInteger(data.lamports) && data.lamports >= 0 ? data.lamports : 0;

  const account = Object.create(null, {
    pubKey: { value: data.pubKey, writable: false, configurable: false },
    lamports: {
      get() { return _lamports; },
      set(val) {
        _lamports = val || 0;
      }
    },
    owner: { value: data.owner, writable: false, configurable: false  },
    executable: { value: data.executable },
    data: { value: data.data }
  });

  if(account.executable === true) Object.freeze(account);

  const storage = Object.create(null);

  const accountStore = storage[account.pubKey] = account;

  return structuredClone(accountStore);
};

export async function getAccountSnapshot(storage, pubkey= PUBLIC_KEY) {
  
};
