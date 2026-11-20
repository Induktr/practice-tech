import { SOLANA_RPC_ENDPOINT, TEST_PUBKEYS } from "./constants/rpc-endpoint.js";

export const accountStorage = Object.create(null);

export async function fetchAccounts(pubKeys = TEST_PUBKEYS, rpcUrl = SOLANA_RPC_ENDPOINT) {
  if (!Array.isArray(pubKeys) || pubKeys.length === 0) return null;

  const controller = new AbortController();

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getMultipleAccounts",
      params: [pubKeys, { encoding: "jsonParsed" }]
    })
  }, { signal: controller.signal });

  if(!response.ok) {
    controller.abort()
    return null
  }

  const json = await response.json();
  const rawList = json?.result?.value;

  if (!Array.isArray(rawList)) { 
    controller.abort()
    return null
  };

  return rawList.map((info, index) => ({
    pubKey: pubKeys[index],
    lamports: info?.lamports ?? 0,
    owner: info?.owner ?? "",
    executable: info?.executable ?? false,
    data: info?.data ?? null
  }));
};

export function createAccountObject(data) {
  let _lamports = Number.isSafeInteger(data.lamports) && data.lamports >= 0 ? data.lamports : 0;
  return Object.create(null, {
    pubKey: { 
      value: data.pubKey, 
      writable: false, 
      configurable: false, 
      enumerable: true 
    },
    lamports: {
      get() { return _lamports; },
      set(val) {
        if (Number.isSafeInteger(val) && val >= 0) {
          _lamports = val;
        }
      },
      enumerable: true
    },
    owner: { 
      value: data.owner, 
      writable: false, 
      configurable: false, 
      enumerable: true 
    },
    executable: { 
      value: data.executable, 
      enumerable: true 
    },
    data: { 
      value: data.data, 
      enumerable: true 
    }
  });
}

export const getAccounts = async (pubKeys = TEST_PUBKEYS) => {
  const rawDataArray = await fetchAccounts(pubKeys);
  if (!Array.isArray(rawDataArray)) return [];

  return rawDataArray.map(item => createAccountObject(item));
};

export const accountsData = await getAccounts();

export function registerAccount(storage, account) {
  if (!storage || !account) return null;

  if (Array.isArray(account)) {
    return account.map(item => registerAccount(storage, item)).filter(Boolean);
  }

  if (!account.pubKey) return null;

  if (account.executable === true) {
    Object.freeze(account);
  }

  storage[account.pubKey] = account;

  const snapshot = structuredClone(account);

  if (account.executable === true) {
    Object.freeze(snapshot);
  }

  return snapshot;
}

export function getAccountSnapshot(storage, pubKey) {
  if (!storage || typeof storage !== "object" || typeof pubKey !== "string") {
    return null;
  }

  const targetAccount = storage[pubKey];
  if (!targetAccount) return null;

  const snapshot = structuredClone(targetAccount);

  if (targetAccount.executable === true) {
    Object.freeze(snapshot);
  }

  return snapshot;
}

export function calcProgramTvl(storage, ownerProgram) {
  if (!storage || typeof storage !== "object" || !ownerProgram || typeof ownerProgram !== "string") return null;

  let totalTvl = 0;
  const keys = Reflect.ownKeys(storage);

  for (let i = 0; i < keys.length; i++) {
    const acc = storage[keys[i]];
    if (acc && acc.owner === ownerProgram) {
      const lamports = Number.parseFloat(acc.lamports);
      if (Number.isFinite(lamports)) {
        totalTvl += lamports;
      }
    }
  }

  return totalTvl;
}
