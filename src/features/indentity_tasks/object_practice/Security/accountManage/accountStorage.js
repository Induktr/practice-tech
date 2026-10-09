import { SOLANA_RPC_ENDPOINT, TEST_PUBKEYS } from "./constants/rpc-endpoint.js";
import accountInfo from "./account.json" with { type: "json" };

export const accountStorage = Object.create(null);

export async function fetchAccounts(pubKeys = TEST_PUBKEYS, rpcUrl = SOLANA_RPC_ENDPOINT) {
  if (!Array.isArray(pubKeys) || pubKeys.length === 0) return null;

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getMultipleAccounts",
      params: [pubKeys, { encoding: "jsonParsed" }]
    })
  });

  if(!response.ok) return null

  const json = await response.json();
  const rawList = json?.result?.value;

  if (!Array.isArray(rawList)) return null;

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
    const registered = [];
    for (const item of account) {
      if (item?.pubKey) {
        if (item.executable === true) Object.freeze(item);
        storage[item.pubKey] = item;
        registered.push(structuredClone(item));
      }
    }
    return registered;
  }

  if (!account.pubKey) return null;
  if (account.executable === true) Object.freeze(account);

  storage[account.pubKey] = account;
  return structuredClone(account);
}

export function getAccountSnapshot(storage, pubKey) {
  if(!storage || typeof storage !== "object" || !pubKey) return null;

  const targetAccount = storage[pubKey];

  if(!targetAccount) return null;

  return structuredClone(targetAccount);
};

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

const targetProgram = accountsData[0]?.owner;

console.log(registerAccount(accountStorage, accountsData))

// const snapshot = getAccountSnapshot(accountStorage);
const tvlVolume = calcProgramTvl(accountStorage, targetProgram);

// TEST Base

Object.prototype.props = "HELLO!";

const isNullPrototype = accountStorage.props === undefined &&
accountStorage["toString"] === undefined &&
accountStorage["hasOwnProperty"] === undefined &&
accountStorage.constructor === undefined

accountsData[0].lamports - 30

// console.log("Снапшот аккаунта:", snapshot);
console.log("Общий обьём TVL:", tvlVolume);
console.log("Стерильный обьект:", isNullPrototype);
console.log("Отсутствие отрицательного баланса:", accountsData[0].lamports);

// 1. Проверить обьекты на наличие прототипов.
// 2. Проверить глубокую копию вложеных структур.
// 3. Проверить безопасность типов при не правльной передаче.
// 4. Проверить мутацию ключей в обьекте с нулевым прототипом.
// 5. Проверить наличие мутации при выходе данных для UI.
// 6. Проверить разные способы манипуляции обьектами в безопасном ключе.
// 7. Убедиться в том что все ключи при включении иетратора они не оставляют не следа прототипов от самого обьекта, чтобы при рантайме злоумышенник не смог проникнуть в этот цыкл и сделать изменения в нём.