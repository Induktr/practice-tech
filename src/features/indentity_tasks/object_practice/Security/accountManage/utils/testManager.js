const ANSI_REGEX = /\x1b\[[0-9;]*m/g;
const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

export function safeSplitGraphemes(str) {
  if (typeof str !== "string") str = String(str);
  return Array.from(segmenter.segment(str), s => s.segment);
}

export function visibleLength(str) {
  if (typeof str !== "string") str = String(str);
  const clean = str.replace(ANSI_REGEX, "");
  return safeSplitGraphemes(clean).length;
}

export function safePadEnd(str, targetWidth, padChar = " ") {
  const currentLen = visibleLength(str);
  if (currentLen >= targetWidth) return str;
  return str + padChar.repeat(targetWidth - currentLen);
}

const isColorSupported = Boolean(process.stdout?.isTTY || process.env.TERM);
const c = {
  reset: (s) => isColorSupported ? `\x1b[0m${s}\x1b[0m` : s,
  bold: (s) => isColorSupported ? `\x1b[1m${s}\x1b[0m` : s,
  dim: (s) => isColorSupported ? `\x1b[2m${s}\x1b[0m` : s,
  green: (s) => isColorSupported ? `\x1b[32m${s}\x1b[0m` : s,
  red: (s) => isColorSupported ? `\x1b[31m${s}\x1b[0m` : s,
  yellow: (s) => isColorSupported ? `\x1b[33m${s}\x1b[0m` : s,
  cyan: (s) => isColorSupported ? `\x1b[36m${s}\x1b[0m` : s,
  bgGreen: (s) => isColorSupported ? `\x1b[42m\x1b[30m${s}\x1b[0m` : s,
  bgRed: (s) => isColorSupported ? `\x1b[41m\x1b[37m${s}\x1b[0m` : s,
};

export function deepEqual(a, b, seen = new WeakMap()) {
  if (Object.is(a, b)) return true;

  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }

  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
    return false;
  }

  if (seen.has(a)) return seen.get(a) === b;
  seen.set(a, b);

  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp && b instanceof RegExp) return a.toString() === b.toString();

  const keysA = Reflect.ownKeys(a);
  const keysB = Reflect.ownKeys(b);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!Reflect.has(b, key)) return false;
    if (!deepEqual(a[key], b[key], seen)) return false;
  }

  return true;
}

class AssertionError extends Error {
  constructor(message, { expected, actual } = {}) {
    super(message);
    this.name = "AssertionError";
    this.expected = expected;
    this.actual = actual;
  }
}

class Expectation {
  constructor(actual, isNegated = false) {
    this.actual = actual;
    this.isNegated = isNegated;
  }

  get not() {
    return new Expectation(this.actual, !this.isNegated);
  }

  toBe(expected) {
    const pass = Object.is(this.actual, expected);
    if (this.isNegated ? pass : !pass) {
      throw new AssertionError(
        `Ожидалось ${this.isNegated ? "НЕ " : ""}${String(expected)}, но получено ${String(this.actual)}`,
        { expected, actual: this.actual }
      );
    }
  }

  toEqual(expected) {
    const pass = deepEqual(this.actual, expected);
    if (this.isNegated ? pass : !pass) {
      throw new AssertionError(
        `Объекты ${this.isNegated ? "НЕ должны быть равны" : "должны быть эквивалентны"} по значению`,
        { expected, actual: this.actual }
      );
    }
  }

  toBeNull() {
    const pass = this.actual === null;
    if (this.isNegated ? pass : !pass) {
      throw new AssertionError(
        `Ожидалось ${this.isNegated ? "НЕ null" : "null"}, но получено ${String(this.actual)}`,
        { expected: null, actual: this.actual }
      );
    }
  }

  toBeUndefined() {
    const pass = this.actual === undefined;
    if (this.isNegated ? pass : !pass) {
      throw new AssertionError(
        `Ожидалось ${this.isNegated ? "НЕ undefined" : "undefined"}, но получено ${String(this.actual)}`,
        { expected: undefined, actual: this.actual }
      );
    }
  }

  toBeDefined() {
    const pass = this.actual !== undefined;
    if (this.isNegated ? pass : !pass) {
      throw new AssertionError(
        `Ожидалось значение отличное от undefined, но получено undefined`,
        { expected: "defined", actual: this.actual }
      );
    }
  }

  toBeTruthy() {
    const pass = Boolean(this.actual);
    if (this.isNegated ? pass : !pass) {
      throw new AssertionError(
        `Ожидалось ${this.isNegated ? "falsy" : "truthy"} значение, но получено ${String(this.actual)}`,
        { expected: "truthy", actual: this.actual }
      );
    }
  }

  toBeFalsy() {
    const pass = !this.actual;
    if (this.isNegated ? pass : !pass) {
      throw new AssertionError(
        `Ожидалось ${this.isNegated ? "truthy" : "falsy"} значение, но получено ${String(this.actual)}`,
        { expected: "falsy", actual: this.actual }
      );
    }
  }

  toBeSterile() {
    const hasNullProto = Object.getPrototypeOf(this.actual) === null;
    const hasNoObjectMethods = 
      this.actual?.toString === undefined &&
      this.actual?.valueOf === undefined &&
      this.actual?.hasOwnProperty === undefined;
    const pass = hasNullProto && hasNoObjectMethods;

    if (this.isNegated ? pass : !pass) {
      throw new AssertionError(
        `Объект ${this.isNegated ? "НЕ должен быть" : "должен быть"} стерильным (Object.create(null))`,
        { expected: "Sterile Object", actual: this.actual }
      );
    }
  }

  toBeFrozen() {
    const pass = Object.isFrozen(this.actual);
    if (this.isNegated ? pass : !pass) {
      throw new AssertionError(
        `Объект ${this.isNegated ? "НЕ должен быть" : "должен быть"} заморожен через Object.freeze`,
        { expected: "Frozen Object", actual: this.actual }
      );
    }
  }

  toThrow(expectedErrorPattern) {
    let threw = false;
    let caughtError = null;

    if (typeof this.actual !== "function") {
      throw new AssertionError("expect(fn).toThrow(...) требует функцию в качестве аргумента");
    }

    try {
      this.actual();
    } catch (e) {
      threw = true;
      caughtError = e;
    }

    if (this.isNegated) {
      if (threw) {
        throw new AssertionError(`Функция не должна была выбросить ошибку, но упала с: ${caughtError?.message}`);
      }
      return;
    }

    if (!threw) {
      throw new AssertionError("Ожидалось появление ошибки, но функция завершилась успешно");
    }

    if (expectedErrorPattern) {
      const msg = caughtError?.message || String(caughtError);
      const matches = expectedErrorPattern instanceof RegExp
        ? expectedErrorPattern.test(msg)
        : msg.includes(String(expectedErrorPattern));

      if (!matches) {
        throw new AssertionError(
          `Ошибка выброшена, но её текст "${msg}" не совпадает с шаблоном "${expectedErrorPattern}"`
        );
      }
    }
  }
}

export function expect(actual) {
  return new Expectation(actual);
}

class TestContext {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
  }

  describe(suiteName, suiteFn) {
    const suite = {
      name: suiteName,
      tests: [],
      startTime: 0,
      endTime: 0
    };

    const prev = this.currentSuite;
    this.currentSuite = suite;
    this.suites.push(suite);

    try {
      suiteFn();
    } finally {
      this.currentSuite = prev;
    }
  }

  it(testName, testFn) {
    if (!this.currentSuite) {
      this.describe("Default Test Suite", () => {});
    }

    this.currentSuite.tests.push({
      name: testName,
      fn: testFn,
      status: "PENDING",
      error: null,
      durationMs: 0
    });
  }

  async run() {
    const totalStart = performance.now();
    let totalPassed = 0;
    let totalFailed = 0;

    console.log("\n" + c.bold(c.cyan("================================================================")));
    console.log(c.bold(c.cyan("🚀 ЗАПУСК ВЕРИФИКАЦИОННОГО РАННЕРА INDUKTR STUDIO")));
    console.log(c.bold(c.cyan("================================================================")) + "\n");

    for (const suite of this.suites) {
      suite.startTime = performance.now();
      console.log(c.bold(`📦 СЮИТА: ${suite.name}`));
      console.log(c.dim("─".repeat(60)));

      for (const t of suite.tests) {
        const testStart = performance.now();
        try {
          await Promise.resolve(t.fn());
          t.durationMs = performance.now() - testStart;
          t.status = "PASS";
          totalPassed++;

          const timeLabel = c.dim(`(${t.durationMs.toFixed(2)}ms)`);
          const badge = c.green("  ✅ PASS ");
          console.log(`${badge} ${safePadEnd(t.name, 42)} ${timeLabel}`);
        } catch (err) {
          t.durationMs = performance.now() - testStart;
          t.status = "FAIL";
          t.error = err;
          totalFailed++;

          const timeLabel = c.dim(`(${t.durationMs.toFixed(2)}ms)`);
          const badge = c.red("  ❌ FAIL ");
          console.log(`${badge} ${safePadEnd(t.name, 42)} ${timeLabel}`);
          console.log(c.red(`       └── Причина: ${err.message}`));
          if (err.expected !== undefined && err.actual !== undefined) {
            console.log(c.dim(`           Expected: ${JSON.stringify(err.expected)}`));
            console.log(c.dim(`           Received: ${JSON.stringify(err.actual)}`));
          }
        }
      }

      suite.endTime = performance.now();
      console.log("");
    }

    const totalDuration = performance.now() - totalStart;

    console.log(c.bold("┌────────────────────────────────────────────────────────────┐"));
    console.log(c.bold("│                      ИТОГОВЫЙ ОТЧЕТ                        │"));
    console.log(c.bold("├────────────────────────────────────────────────────────────┤"));
    
    const passLine = `  Успешно (Passed):    ${totalPassed}`;
    const failLine = `  Провалено (Failed):  ${totalFailed}`;
    const timeLine = `  Время выполнения:    ${totalDuration.toFixed(2)} ms`;

    console.log(`│ ${safePadEnd(passLine, 58)} │`);
    console.log(`│ ${safePadEnd(failLine, 58)} │`);
    console.log(`│ ${safePadEnd(timeLine, 58)} │`);
    console.log(c.bold("└────────────────────────────────────────────────────────────┘\n"));

    if (totalFailed === 0) {
      console.log(c.bgGreen(" ALL TESTS PASSED ") + c.green("  100% критериев приёмки (DoD) выполнены успешно!\n"));
    } else {
      console.log(c.bgRed(" TESTS FAILED ") + c.red(`  Обнаружено ${totalFailed} сбоев в инвариантах!\n`));
    }

    return {
      total: totalPassed + totalFailed,
      passed: totalPassed,
      failed: totalFailed,
      durationMs: totalDuration,
      suites: this.suites
    };
  }

  generateNotionReport() {
    let md = "### 🧪 Матрица Верификации (Acceptance Criteria Scorecard)\n\n";
    md += "| # | Проверка инварианта | Статус | Время |\n";
    md += "| :-: | :--- | :-: | :-: |\n";

    let index = 1;
    for (const suite of this.suites) {
      for (const t of suite.tests) {
        const icon = t.status === "PASS" ? "PASS ✅" : "FAIL ❌";
        md += `| **${index++}** | ${t.name} | **${icon}** | ${t.durationMs.toFixed(2)}ms |\n`;
      }
    }

    return md;
  }
}

export const testRunner = new TestContext();
export const describe = (name, fn) => testRunner.describe(name, fn);
export const suite = describe;
export const it = (name, fn) => testRunner.it(name, fn);
export const test = it;
export const runTests = () => testRunner.run();
export const generateNotionReport = () => testRunner.generateNotionReport();

export function testManager(status = "SUCCESS", type = "CHECK", ...msgs) {
  const isOk = status.toUpperCase() === "SUCCESS";
  const badge = isOk ? c.green(`[${type}:PASS]`) : c.red(`[${type}:FAIL]`);
  console.log(`${badge} ${msgs.join(" ")}`);
}