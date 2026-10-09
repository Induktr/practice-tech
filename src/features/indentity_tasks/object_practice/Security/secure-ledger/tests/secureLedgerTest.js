import { regTransaction, calcVolumeCurrency } from "../secureLedger.js";
import { ledger } from "../constants/secrets.js";
import payload from "../../trans.json" with { type: "json" };

console.log("==================================================");
console.log("🚀 ЗАПУСК ВЕРИФИКАЦИИ ПО 5 КРИТЕРИЯМ ПРИЁМКИ");
console.log("==================================================\n");

// --------------------------------------------------
// 1. ТЕСТ НА СТЕРИЛЬНОСТЬ
// --------------------------------------------------
console.log("1️⃣ ТЕСТ НА СТЕРИЛЬНОСТЬ РЕЕСТРА:");
const isSterile = 
  Object.getPrototypeOf(ledger) === null &&
  ledger.toString === undefined &&
  ledger.valueOf === undefined &&
  ledger.hasOwnProperty === undefined;

console.log(`- Прототип равен null: ${Object.getPrototypeOf(ledger) === null}`);
console.log(`- Стандартные методы отсутствуют: ${ledger.toString === undefined}`);
console.log(`=> Результат: ${isSterile ? "✅ PASS" : "❌ FAIL"}\n`);

// --------------------------------------------------
// 2. ТЕСТ НА НЕИЗМЕНЯЕМОСТЬ ПОЛЕЙ
// --------------------------------------------------
console.log("2️⃣ ТЕСТ НА НЕИЗМЕНЯЕМОСТЬ ПОЛЕЙ В РЕЕСТРЕ:");
regTransaction(ledger, payload);
const targetId = payload[0].id;
const initialCurrency = ledger[targetId].currency;

// Попытка прямой мутации валюты в реестре:
try {
  ledger[targetId].currency = "MUTATED_EUR";
} catch (e) {
  // В строгом режиме выбросит TypeError (writable: false)
}

// Попытка удаления поля валюты в реестре:
try {
  delete ledger[targetId].currency;
} catch (e) {
  // В строгом режиме выбросит TypeError (configurable: false)
}

const isFieldImmutable = ledger[targetId].currency === initialCurrency;
console.log(`- Валюта до попытки изменения/удаления: "${initialCurrency}"`);
console.log(`- Валюта после попытки изменения/удаления: "${ledger[targetId].currency}"`);
console.log(`=> Результат: ${isFieldImmutable ? "✅ PASS" : "❌ FAIL"}\n`);

// --------------------------------------------------
// 3. ТЕСТ НА ССЫЛОЧНУЮ НЕЗАВИСИМОСТЬ
// --------------------------------------------------
console.log("3️⃣ ТЕСТ НА ССЫЛОЧНУЮ НЕЗАВИСИМОСТЬ (КЛИЕНТ vs РЕЕСТР):");
const clientTxList = regTransaction(ledger, payload);
const clientTx = clientTxList[0];

// Клиент мутирует свою копию:
clientTx.currency = "HACKED_BTC";
clientTx.amount = 999999999;

const isReferenceIndependent = 
  ledger[targetId].currency === "SOL" && 
  ledger[targetId].amount === 0.5 &&
  clientTx.currency === "HACKED_BTC";

console.log(`- Данные у клиента (мутированы): ${clientTx.currency} ${clientTx.amount}`);
console.log(`- Данные в реестре (исходные): ${ledger[targetId].currency} ${ledger[targetId].amount}`);
console.log(`=> Результат: ${isReferenceIndependent ? "✅ PASS" : "❌ FAIL"}\n`);

// --------------------------------------------------
// 4. ТЕСТ НА УСТОЙЧИВОСТЬ К ИНЪЕКЦИИ (PROTOTYPE POLLUTION)
// --------------------------------------------------
console.log("4️⃣ ТЕСТ НА УСТОЙЧИВОСТЬ К ИНЪЕКЦИИ:");
Object.prototype.isCompromised = true;
Object.prototype.fakeAmount = 100_000_000;

const isPollutionProof = 
  ({}).isCompromised === true &&
  ledger.isCompromised === undefined &&
  ledger[targetId].isCompromised === undefined &&
  ledger[targetId].fakeAmount === undefined;

console.log(`- Обычный объект заражен: ${({}).isCompromised}`);
console.log(`- Реестр заражен: ${ledger.isCompromised}`);
console.log(`- Транзакция заражена: ${ledger[targetId].fakeAmount}`);
console.log(`=> Результат: ${isPollutionProof ? "✅ PASS" : "❌ FAIL"}\n`);

// --------------------------------------------------
// 5. ТЕСТ НА УСТОЙЧИВОСТЬ К СБОЯМ ТИПОВ
// --------------------------------------------------
console.log("5️⃣ ТЕСТ НА УСТОЙЧИВОСТЬ К СБОЯМ ТИПОВ:");
let hasCrash = false;
let volumeNull = null;
let volumeUndefined = null;
let volumePrimitives = null;

try {
  volumeNull = calcVolumeCurrency(null, "SOL");
  volumeUndefined = calcVolumeCurrency(undefined, null);
  volumePrimitives = calcVolumeCurrency("bad_ledger", 12345);
} catch (e) {
  hasCrash = true;
}

const isTypeResilient = 
  !hasCrash && 
  volumeNull === 0 && 
  volumeUndefined === 0 && 
  volumePrimitives === 0;

console.log(`- Результат для calcVolumeCurrency(null, "SOL"): ${volumeNull}`);
console.log(`- Результат для calcVolumeCurrency(undefined, null): ${volumeUndefined}`);
console.log(`- Результат для некорректных примитивов: ${volumePrimitives}`);
console.log(`=> Результат: ${isTypeResilient ? "✅ PASS" : "❌ FAIL"}\n`);

// --------------------------------------------------
// ИТОГОВАЯ АГРЕГАЦИЯ
// --------------------------------------------------
console.log("📊 ИТОГОВАЯ ФИНАНСОВАЯ АГРЕГАЦИЯ:");
console.log(`- Объём SOL (ожидаем 2.0): ${calcVolumeCurrency(ledger, "SOL")}`);
console.log(`- Объём USDT (ожидаем 250): ${calcVolumeCurrency(ledger, "USDT")}`);