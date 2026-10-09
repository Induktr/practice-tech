import {
  accountStorage,
  accountsData
} from "../accountStorage.js";
import { testManager } from "../utils/testManager.js";

const isUndefinedProto = Object.getPrototypeOf(accountStorage) === null &&
  accountStorage.toString === undefined &&
  accountStorage.valueOf === undefined &&
  accountStorage.hasOwnProperty === undefined;

testManager(!isUndefinedProto ? "ERROR" : "SUCCESS", "PROTOTYPE_OBJECT",
  console.log("1️⃣ ТЕСТ НА СТЕРИЛЬНОСТЬ РЕЕСТРА:"),
  Object.prototype.props = "HELLO!",
  console.log(`- Лишние данные не принимаються: ${accountStorage.props}`),
  console.log(`- Прототип равен undefined: ${isUndefinedProto}`),
  console.log(`- Прототип равен null: ${Object.getPrototypeOf(accountStorage) === null}`),
  console.log(`- Стандартные методы отсутствуют: ${accountStorage.toString === undefined}`),
);

const eqDegNum = accountsData[0].lamports - 30;
const eqNan = accountsData[0].lamports = "HACKED";

const isVerifyNan = eqDegNum < 0 && typeof eqNan !== "string";

testManager(!isVerifyNan ? "ERROR" : "SUCCESS", "NAN LAMPORTS",
  "1️⃣ ТЕСТ АКСУССОРА БАЛАНСА:",
  Object.prototype.props = "HELLO!",
  eqDegNum,
  `- Отсутствие отрицательного баланса:, ${accountsData[0].lamports}`,
  eqNan,
  `- Отсутствие NaN значений:, ${accountsData[0].lamports}`
);