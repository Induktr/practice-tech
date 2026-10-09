import {
  describe,
  test,
  expect,
  runTests,
  generateNotionReport
} from "../utils/testManager.js";

import {
  accountStorage,
  accountsData,
  registerAccount,
  getAccountSnapshot,
  calcProgramTvl
} from "../accountStorage.js";

const accSecure = registerAccount(accountStorage, accountsData);

describe("1️⃣ СТЕРИЛЬНОСТЬ РЕЕСТРА (Anti-Prototype Pollution)", () => {
  test("Хранилище создано с нулевым прототипом [[Prototype]] = null", () => {
    expect(accountStorage).toBeSterile();
  });

  test("Глобальное заражение Object.prototype не проникает в реестр", () => {
    Object.prototype.props = "HELLO_INJECTION!";
    Object.prototype.isHacked = true;
    
    expect(accountStorage.props).toBe(undefined);
    expect(accountStorage.isHacked).toBe(undefined);
  });

  test("Стандартные методы Object отсутствуют у экземпляра", () => {
    expect(accountStorage.toString).toBe(undefined);
    expect(accountStorage.valueOf).toBe(undefined);
    expect(accountStorage.hasOwnProperty).toBe(undefined);
    expect(accountStorage.constructor).toBe(undefined);
  });
});

describe("2️⃣ РЕАКТИВНЫЙ АКСЕССОР БАЛАНСА (Lamports Closure)", () => {
  test("Исходный баланс инициализирован корректным целым числом", () => {
    expect(Number.isSafeInteger(accountsData[0].lamports)).toBe(true);
    expect(accountsData[0].lamports).toBe(1);
  });

  test("Сеттер отклоняет невалидные типы (строки, NaN)", () => {
    accountsData[0].lamports = "HACKED_STRING";
    expect(accountsData[0].lamports).toBe(1);
  });

  test("Сеттер отклоняет отрицательные балансы", () => {
    accountsData[0].lamports = -50;
    expect(accountsData[0].lamports).toBe(1);
  });
});

describe("3️⃣ НЕОБРАТИМАЯ ЗАМОРОЗКА КОНТРАКТА (Object.freeze)", () => {
  test("Исполняемый аккаунт (executable: true) заморожен на уровне движка V8", () => {
    expect(accSecure[0]).toBeFrozen();
    expect(accountStorage[accountsData[0].pubKey]).toBeFrozen();
  });

  test("Мутация существующих свойств контракта выбрасывает исключение", () => {
    expect(() => {
      accSecure[0].executable = false;
    }).toThrow();
  });

  test("Инъекция новых свойств в контракт запрещена", () => {
    expect(() => {
      accSecure[0].hackedField = "MALICIOUS_PAYLOAD";
    }).toThrow();
  });
});

describe("4️⃣ ССЫЛОЧНАЯ ИЗОЛЯЦИЯ СНАПШОТА (Zero-Leak Snapshot)", () => {
  const userPubKey = accountsData[2]?.pubKey ?? "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

  test("Безопасный fallback: несуществующий ключ возвращает null", () => {
    const unknownSnapshot = getAccountSnapshot(accountStorage, "NON_EXISTING_PUBKEY");
    expect(unknownSnapshot).toBe(null);
  });

  test("Снимок обычного аккаунта (executable: false) не заморожен", () => {
    const snapshot = getAccountSnapshot(accountStorage, userPubKey);
    expect(snapshot).not.toBeNull();
    expect(snapshot.executable).toBe(false);
    expect(snapshot).not.toBeFrozen();
  });

  test("Мутация снимка клиентом НЕ изменяет подлинник в реестре accountStorage", () => {
    const snapshot = getAccountSnapshot(accountStorage, userPubKey);
    const originalBalanceInStorage = accountStorage[userPubKey].lamports;

    snapshot.lamports = 50;
    expect(snapshot.lamports).toBe(50);

    expect(accountStorage[userPubKey].lamports).toBe(originalBalanceInStorage);
    expect(accountStorage[userPubKey].lamports).toBe(279860871237);
  });
});

describe("5️⃣ УСТОЙЧИВОСТЬ TVL-АГРЕГАЦИИ К PROTOTYPE POLLUTION", () => {
  test("Заражение Object.prototype.lamports = 999_999_999 игнорируется агрегатором", () => {
    Object.prototype.lamports = 999_999_999;

    const targetProgram = "NativeLoader1111111111111111111111111111111";
    const tvl = calcProgramTvl(accountStorage, targetProgram);

    expect(tvl).toBe(2);
  });
});

await runTests();
console.log(generateNotionReport());
