# 📚 Мастер-База: 25 Шпаргалок по JavaScript (Async, Memory, Event Loop, ES2024)
### Стандарт: Induktr Studio 4-Phase Notion Architecture

---

### [JS-CORE] 01. Promise.withResolvers: External Promise Inversion (ES2024)
* **Category:** `JS Async`
* **Quick Copy:** `const { promise, resolve, reject } = Promise.withResolvers();`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `ES2024`, `Promises`, `Async`, `Patterns`

> 🛡️ **Главный инвариант:** Устаревший паттерн `Deferred` (ручное извлечение `resolve/reject` наружу через замыкание конструктора `new Promise`) больше не нужен. `Promise.withResolvers()` стандартизирован в ES2024 и аллоцирует промис и его резолверы в единой операции без оверхеда на промежуточные замыкания.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Устранение вложенности:** В классическом `new Promise((res, rej) => ...)` весь код обязан находиться внутри колбэка. `Promise.withResolvers()` разделяет объявление промиса и управление его состоянием во времени.
- **Очереди событий и стримы:** Идеально для привязки внешних событий (WebSocket-сообщения, клики, таймауты) к асинхронным цепочкам без создания промежуточных эмиттеров.

#### 💡 Phase 2: Analogy (Mental Model)
`new Promise` — это подарок в запечатанной коробке: вы можете открыть его только изнутри. `Promise.withResolvers()` — это пульт дистанционного управления: коробка лежит на столе, а кнопка открытия (`resolve`) находится у вас в руке в любом месте программы.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export class AsyncQueue {
  #queue = [];
  #waitingResolvers = [];

  enqueue(item) {
    if (this.#waitingResolvers.length > 0) {
      const resolver = this.#waitingResolvers.shift();
      resolver.resolve(item);
    } else {
      this.#queue.push(item);
    }
  }

  async dequeue() {
    if (this.#queue.length > 0) {
      return this.#queue.shift();
    }

    // ES2024: Нативное создание внешнего промиса ожидания
    const { promise, resolve, reject } = Promise.withResolvers();
    this.#waitingResolvers.push({ resolve, reject });
    return promise;
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Повторные вызовы `resolve` или `reject` на извлеченных хэндлерах молча игнорируются, так как внутреннее состояние промиса переходит в `Settled` ровно один раз.

---

### [JS-CORE] 02. Promise.try: Universal Sync/Async Error Boundary (ES2024)
* **Category:** `JS Async`
* **Quick Copy:** `const res = await Promise.try(() => riskyFunction(param));`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `ES2024`, `Promises`, `ErrorHandling`, `Async`

> 🛡️ **Главный инвариант:** Функция может выбросить синхронное исключение (`throw new Error`) или вернуть отклоненный промис (`Promise.reject`). `Promise.try()` гарантирует, что оба типа ошибок будут пойманы и обернуты в стандартный `.catch()` без уродливого дублирования блоков `try { ... } catch`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Унификация исключений:** Если колбэк в `Promise.try(fn)` синхронно выбрасывает `throw`, функция не прерывает текущий стек, а возвращает `rejected Promise`.
- **Поддержка возврата значений:** Если функция возвращает синхронное значение — возвращается `fulfilled Promise`. Если возвращает промис — он автоматически распаковывается.

#### 💡 Phase 2: Analogy (Mental Model)
`Promise.try` — это страховочная сетка под канатоходцем. Не важно, споткнется ли он на первом шаге (синхронный сбой) или упадет на середине пути (асинхронный сбой сети) — он гарантированно приземлится в сетку `.catch()`.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export async function safeExecuteEndpoint(handler, payload) {
  // Ловит и синхронные ошибки валидации, и асинхронные ошибки сети
  return Promise.try(() => handler(payload))
    .then(data => ({ ok: true, data }))
    .catch(err => ({ 
      ok: false, 
      error: err instanceof Error ? err.message : String(err) 
    }));
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- `Promise.try(fn)` превосходит `new Promise(res => res(fn()))` тем, что лучше оптимизируется движком V8 и не требует создания лишнего контекста выполнения в куче.

---

### [JS-CORE] 03. Microtask Queue vs Macrotasks: Event Loop Starvation
* **Category:** `JS Runtime`
* **Quick Copy:** `queueMicrotask(() => { /* Выполнится до рендеринга и таймеров */ });`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `EventLoop`, `Microtasks`, `V8`, `Performance`

> 🛡️ **Главный инвариант:** Очередь микрозадач (`Microtask Queue`: промисы, `queueMicrotask`, `MutationObserver`) выполняется **полностью до исчерпания** перед переходом к следующей макрозадаче (`setTimeout`) и перед фазой отрисовки экрана (Render/Paint). Бесконечное порождение микрозадач намертво вешает поток и интерфейс браузера.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Порядок тика Event Loop:**
  1. Выполнить 1 макрозадачу из Macrotask Queue.
  2. Опустошить **ВСЮ** очередь микрозадач Microtask Queue (включая микрозадачи, порожденные внутри других микрозадач!).
  3. Выполнить фазу анимаций (`requestAnimationFrame`).
  4. Выполнить рендеринг (Style $	o$ Layout $	o$ Paint).
- **Разделение задач:** Для передачи управления браузеру и снятия зависания интерфейса необходимо использовать макрозадачи (`setTimeout(fn, 0)` или `scheduler.yield()`), а не `Promise.resolve()`.

#### 💡 Phase 2: Analogy (Mental Model)
Микрозадачи — это внеочередные звонки от директора: секретарша бросает всю текущую работу и не начнет обслуживать очередь клиентов (макрозадачи/рендеринг), пока директор не положит трубку.

#### ⚡ Phase 3: Context (Production Code)
```javascript
// Разбиение тяжелого массива вычислений без блокировки UI (Time-Slicing)
export async function processChunksNonBlocking(items, processItem) {
  for (let i = 0; i < items.length; i++) {
    processItem(items[i]);

    // Каждые 100 элементов отдаем квант времени браузеру для перерисовки
    if (i % 100 === 0) {
      await yieldToMainThread();
    }
  }
}

function yieldToMainThread() {
  if (globalThis.scheduler?.yield) {
    return scheduler.yield(); // Современный стандарт ES2024
  }
  // Fallback через макрозадачу MessageChannel (быстрее setTimeout 4ms)
  const { port1, port2 } = new MessageChannel();
  return new Promise(resolve => {
    port1.onmessage = () => resolve();
    port2.postMessage(null);
  });
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Минимальная задержка `setTimeout(fn, 0)` в спецификации HTML составляет **4 миллисекунды** при вложенности вызовов более 5 раз. `MessageChannel` и `queueMicrotask` лишены этого лимита.

---

### [JS-CORE] 04. AbortSignal.any & AbortSignal.timeout: Clean Cancellation
* **Category:** `JS Async`
* **Quick Copy:** `const signal = AbortSignal.any([userSignal, AbortSignal.timeout(5000)]);`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `AbortController`, `Async`, `Timeout`, `ES2024`

> 🛡️ **Главный инвариант:** Ручная очистка слушателей событий и таймеров через `clearTimeout` чревата утечками памяти при аварийных сбоях. `AbortSignal.any()` объединяет несколько сигналов отмены (пользовательский клик, системный таймаут, закрытие страницы) в один общий сигнал.

#### 📌 Phase 1: Deconstruction (Architecture)
- **`AbortSignal.timeout(ms)`:** Нативно создает сигнал, который переходит в состояние `aborted` с ошибкой `TimeoutError` через `ms` миллисекунд.
- **`AbortSignal.any([sig1, sig2])`:** Срабатывает, как только **любой** из переданных сигналов отменен.
- **Очистка слушателей:** Метод `addEventListener(type, fn, { signal })` автоматически удаляет слушатель при срабатывании сигнала без вызова `removeEventListener`.

#### 💡 Phase 2: Analogy (Mental Model)
`AbortSignal.any` — это система пожарной тревоги: тревога включится, если сработал датчик дыма (таймаут) ИЛИ если кто-то нажал красную кнопку на стене (пользователь нажал "Отмена").

#### ⚡ Phase 3: Context (Production Code)
```javascript
export async function fetchWithCompositeTimeout(url, externalSignal, timeoutMs = 8000) {
  // Композитный сигнал: отмена по таймауту ИЛИ по сигналу от пользователя
  const internalTimeoutSignal = AbortSignal.timeout(timeoutMs);
  const combinedSignal = AbortSignal.any([externalSignal, internalTimeoutSignal]);

  try {
    const response = await fetch(url, { signal: combinedSignal });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (err) {
    if (combinedSignal.aborted) {
      if (combinedSignal.reason?.name === "TimeoutError") {
        throw new Error(`[Network] Запрос прерван по таймауту (${timeoutMs}мс)`);
      }
      throw new Error("[Network] Запрос отменен пользователем");
    }
    throw err;
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Свойство `signal.reason` содержит точную причину отмены (объект `DOMException` или кастомное значение, переданное в `controller.abort(reason)`).

---

### [JS-CORE] 05. Exponential Backoff with Decorrelated Jitter
* **Category:** `JS Networking`
* **Quick Copy:** `const delay = Math.min(maxDelay, baseDelay * (2 ** attempt)) + Math.random() * 100;`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Networking`, `Retry`, `Algorithms`, `Web3`

> 🛡️ **Главный инвариант:** Повторные сетевые запросы без случайной задержки (Jitter) вызывают эффект набегающей волны (*Thundering Herd Problem*): тысячи упавших клиентов одновременно долбят сервер в одну и ту же миллисекунду, добивая упавшую базу данных.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Экспоненциальный рост:** `baseDelay * (2 ** attempt)` увеличивает интервал ожидания в 2 раза с каждой неудачей.
- **Decorrelated Jitter:** Добавление псевдослучайного шума рандомизирует распределение запросов во времени, сглаживая пиковую нагрузку на бэкенд.

#### 💡 Phase 2: Analogy (Mental Model)
Если мост рухнул, нельзя отправлять всю колонну грузовиков на него каждые ровно 5 минут. Нужно рассредоточить выезды машин по случайному графику, чтобы не создать затор на въезде.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export async function retryWithJitter(
  asyncTask, 
  { maxAttempts = 5, baseDelay = 300, maxDelay = 5000, signal } = {}
) {
  let attempt = 0;

  while (attempt < maxAttempts) {
    if (signal?.aborted) throw signal.reason;

    try {
      return await asyncTask(attempt);
    } catch (error) {
      attempt++;
      if (attempt >= maxAttempts) {
        throw new Error(`Превышен лимит попыток (${maxAttempts}). Причина: ${error.message}`);
      }

      // Формула Full Jitter
      const expDelay = Math.min(maxDelay, baseDelay * (2 ** (attempt - 1)));
      const jitteredDelay = Math.random() * expDelay;

      console.warn(`[Retry] Попытка ${attempt} сбоила. Ждем ${Math.round(jitteredDelay)}мс...`);
      await new Promise((res, rej) => {
        const timer = setTimeout(res, jitteredDelay);
        signal?.addEventListener("abort", () => {
          clearTimeout(timer);
          rej(signal.reason);
        }, { once: true });
      });
    }
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Никогда не повторяйте запросы со статусами клиента `400 Bad Request`, `401 Unauthorized`, `403 Forbidden` — они никогда не станут успешными сами по себе. Повторяйте только `429 Too Many Requests` и `5xx Server Error`.

---

### [JS-CORE] 06. Result Type Pattern: Throw-Free Error Handling
* **Category:** `JS Architecture`
* **Quick Copy:** `const ok = v => ({ ok: true, val: v }); const err = e => ({ ok: false, err: e });`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Architecture`, `ResultType`, `TypeScript`, `CleanCode`

> 🛡️ **Главный инвариант:** Использование `throw` для бизнес-ошибок ломает предсказуемость потока управления и заставляет V8 деоптимизировать функции. Паттерн `Result` возвращает ошибку как обычное значение, принуждая разработчика явно обработать оба исхода.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Стоимость `throw`:** Генерация трассировки стека (`Error.captureStackTrace`) в V8 — тяжелая операция, сканирующая физические фреймы памяти.
- **Типобезопасность:** Паттерн заимствован из Rust (`Result<T, E>`) и Go, превращая скрытые падения в строгие ветвления `if (result.ok)`.

#### 💡 Phase 2: Analogy (Mental Model)
`throw` — это нажать на пожарную сигнализацию в офисе: работа прекращается, все бегут на улицу. `Result` — это курьерская накладная со статусом "Доставлено" или "Адресат не найден": рабочий день идет своим чередом.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export const Result = {
  ok: (value) => Object.freeze({ ok: true, value, error: null }),
  err: (error) => Object.freeze({ ok: false, value: null, error })
};

export function parseTransactionPayload(rawJson) {
  if (typeof rawJson !== "string") {
    return Result.err(new TypeError("Ожидалась строка"));
  }

  try {
    const data = JSON.parse(rawJson);
    if (!data.id || !Number.isFinite(data.amount)) {
      return Result.err(new Error("Неполные реквизиты транзакции"));
    }
    return Result.ok(data);
  } catch (parseError) {
    return Result.err(new Error(`Невалидный JSON: ${parseError.message}`));
  }
}

// Потребление без try/catch блоков:
const res = parseTransactionPayload('{"id":"tx_1","amount":100}');
if (res.ok) {
  console.log("Успех:", res.value.amount);
} else {
  console.error("Ошибка:", res.error.message);
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- В TypeScript дискриминантное объединение `type Result<T, E> = { ok: true, value: T } | { ok: false, error: E }` автоматически сужает типы внутри блока `if (res.ok)`.

---

### [JS-CORE] 07. Error Chaining via Error.cause: Forensic Preservation
* **Category:** `JS Architecture`
* **Quick Copy:** `throw new Error('Фатальный сбой', { cause: originalError });`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `ErrorHandling`, `cause`, `Debugging`, `ES2022`

> 🛡️ **Главный инвариант:** Перехват и проброс новой высокоуровневой ошибки без свойства `{ cause }` безвозвратно уничтожает исходный стек вызовов и первопричину сетевого или дискового сбоя.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Стандарт ES2022:** Конструктор `new Error(message, { cause })` сохраняет ссылку на вложенную ошибку.
- **Инспекция консоли:** Node.js и Chrome DevTools рекурсивно выводят все вложенные причины `Caused by: Error...`, позволяя восстановить полную хронологию инцидента.

#### 💡 Phase 2: Analogy (Mental Model)
Без `{ cause }` вы сообщаете: "Машина сломалась". С `{ cause }` вы передаете инженеру: "Машина сломалась, потому что лопнул ремень, потому что заклинило генератор, потому что попала гайка".

#### ⚡ Phase 3: Context (Production Code)
```javascript
export async function executeSolanaTransfer(pubKey, lamports) {
  try {
    return await sendRawRpcTransaction(pubKey, lamports);
  } catch (networkError) {
    // Сохраняем техническую низкоуровневую ошибку внутри бизнес-ошибки
    throw new Error(`[Ledger] Не удалось выполнить перевод на адрес ${pubKey}`, {
      cause: networkError
    });
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Свойство `cause` может хранить не только другой `Error`, но и произвольный DTO с диагностическими данными: `{ cause: { code: 404, queryId: 'q_123' } }`.

---

### [JS-CORE] 08. ES2024 Set Methods: Native Mathematical Set Operations
* **Category:** `JS Collections`
* **Quick Copy:** `const common = setA.intersection(setB); const diff = setA.difference(setB);`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `ES2024`, `Set`, `Mathematics`, `Performance`

> 🛡️ **Главный инвариант:** Больше не нужно писать медленные самодельные функции через `new Set([...setA].filter(x => setB.has(x)))`. В ES2024 добавлены нативные C++ методы `intersection`, `union`, `difference`, `symmetricDifference`, работающие в 10 раз быстрее.

#### 📌 Phase 1: Deconstruction (Architecture)
- **`a.union(b)`:** Все уникальные элементы из `a` и `b`.
- **`a.intersection(b)`:** Только элементы, присутствующие и в `a`, и в `b`.
- **`a.difference(b)`:** Элементы, которые есть в `a`, но отсутствуют в `b`.
- **`a.symmetricDifference(b)`:** Элементы, присутствующие только в одном из множеств (XOR).
- **Предикаты:** `a.isSubsetOf(b)`, `a.isSupersetOf(b)`, `a.isDisjointFrom(b)`.

#### 💡 Phase 2: Analogy (Mental Model)
Это диаграммы Эйлера-Венна, реализованные на уровне машинного кода процессора без промежуточных аллокаций массивов в памяти V8.

#### ⚡ Phase 3: Context (Production Code)
```javascript
const authorizedAdminPubkeys = new Set(["KeyA", "KeyB", "KeyC"]);
const activeSigners = new Set(["KeyB", "KeyC", "KeyD"]);

// 1. Полномочные подписанты (Пересечение)
const validSigners = authorizedAdminPubkeys.intersection(activeSigners);
// Set { 'KeyB', 'KeyC' }

// 2. Неавторизованные посторонние подписанты (Разность)
const intruders = activeSigners.difference(authorizedAdminPubkeys);
// Set { 'KeyD' }

// 3. Проверка: все ли админы присутствуют
const isComplete = authorizedAdminPubkeys.isSubsetOf(activeSigners); // false
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Методы принимают не только другой `Set`, но и любой объект, реализующий протокол `Set-like` (имеющий `size`, `has`, `keys`).

---

### [JS-CORE] 09. Binary Data & Endianness: DataView vs TypedArrays
* **Category:** `JS Binary`
* **Quick Copy:** `const view = new DataView(buf); const num = view.getUint32(0, true); // true = little-endian`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Binary`, `DataView`, `ArrayBuffer`, `Web3`

> 🛡️ **Главный инвариант:** Обычные `Uint32Array` читают байты в порядке, зависящем от процессора вашего устройства (обычно Little-Endian на x86/ARM). Сетевые протоколы и бинарные ончейн-сериализаторы (Borsh, Solana) требуют строгого контроля порядка байтов через `DataView`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **`ArrayBuffer`:** Сырой блок непрерывной физической памяти. Напрямую читать байты нельзя.
- **TypedArray (`Uint8Array`, `BigInt64Array`):** Фиксированное представление с привязкой к нативному порядку байтов платформы.
- **`DataView`:** Низкоуровневый интерфейс с явным флагом `littleEndian` во всех методах `getUint16`, `setBigUint64`, исключающий сетевые коллизии.

#### 💡 Phase 2: Analogy (Mental Model)
`ArrayBuffer` — это кусок магнитной ленты с намагниченными частицами. `DataView` — это считывающая головка магнитофона, которая может воспроизводить трек как слева направо, так и справа налево по вашей команде.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export function serializeSolanaLamportsInstruction(recipientPubkeyBytes, lamportsAmount) {
  // Выделяем 40 байт: 32 байта для ключа + 8 байт для 64-битного числа (uint64)
  const buffer = new ArrayBuffer(40);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // Записываем 32 байта публичного ключа
  bytes.set(recipientPubkeyBytes, 0);

  // Записываем баланс lamports строго в формате Little-Endian (стандарт Solana)
  view.setBigUint64(32, BigInt(lamportsAmount), true);

  return bytes;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Числа размером 64 бита (uint64 / int64) обязаны записываться через тип `BigInt` (`100n`), иначе JavaScript выбросит `TypeError: Cannot convert a Number to a BigInt`.

---

### [JS-CORE] 10. Native Base64 & Hex Conversion: Uint8Array.fromBase64 (ES2024)
* **Category:** `JS Binary`
* **Quick Copy:** `const bytes = Uint8Array.fromBase64(b64String); const hex = bytes.toHex();`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `ES2024`, `Base64`, `Hex`, `Binary`

> 🛡️ **Главный инвариант:** Устаревшие методы `atob()` и `btoa()` падают с ошибкой при наличии UTF-8 символов и создают лишние строковые аллокации. В ES2024 методы `fromBase64`, `toBase64`, `fromHex`, `toHex` встроены прямо в прототип `Uint8Array`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Нулевой оверхед:** Преобразование выполняется напрямую между массивом байтов памяти и строкой без промежуточных буферов Node.js (`Buffer.from`) и без сторонних библиотек.
- **Поддержка URL-Safe Base64:** Опция `alphabet: 'base64url'` нативно заменяет символы `+` и `/` на `-` и `_`.

#### 💡 Phase 2: Analogy (Mental Model)
`atob()` — это старый советский транзисторный приемник: при малейшей помехе (кириллица, UTF-8) он свистит и взрывается ошибкой. `Uint8Array.fromBase64` — это современный оптоволоконный модем: он перегоняет сырые бинарные пакеты прямо в память чипа без перекодировок.

#### ⚡ Phase 3: Context (Production Code)
```javascript
// Конвертация приватных ключей и хешей без зависимостей
export function formatHashPayload(rawHex) {
  // ES2024: Нативный парсинг Hex-строки в байты
  const bytes = Uint8Array.fromHex ? Uint8Array.fromHex(rawHex) : fallbackHex(rawHex);

  // Обратная конвертация в безопасный Base64 для URL
  return bytes.toBase64({ alphabet: "base64url" });
}

function fallbackHex(hex) {
  const match = hex.match(/.{1,2}/g) || [];
  return new Uint8Array(match.map(byte => parseInt(byte, 16)));
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Метод `bytes.toHex()` возвращает строку в нижнем регистре. Если нужен верхний регистр — используйте `toHex().toUpperCase()`.

---

### [JS-CORE] 11. Async Generators & Backpressure-Aware Pipelines
* **Category:** `JS Async`
* **Quick Copy:** `async function* stream() { for (const x of src) yield await transform(x); }`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `AsyncGenerators`, `Streams`, `Backpressure`, `Pipelines`

> 🛡️ **Главный инвариант:** Загрузка миллионов строк из базы данных или RPC-ноды в обычный массив вызывает мгновенное переполнение памяти кучи V8 (`JavaScript heap out of memory`). Асинхронные генераторы реализуют потоковую обработку с контролем противодавления (*Backpressure*).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Протокол Async Iterable:** Объект реализует метод `[Symbol.asyncIterator]()`.
- **Потребитель управляет скоростью:** Значение вычисляется и скачивается **только тогда**, когда вызывающий цикл `for await (const chunk of stream)` запрашивает следующий шаг `iterator.next()`.

#### 💡 Phase 2: Analogy (Mental Model)
Обычный массив — это попытка выпить всю бочку воды за один глоток. Асинхронный генератор — это соломинка: вы делаете ровно один глоток тогда, когда готовы проглотить предыдущий.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export async function* fetchTransactionsStream(rpcEndpoint, batchSize = 100) {
  let beforeSignature = null;
  let hasMore = true;

  while (hasMore) {
    const batch = await fetchBatchFromRpc(rpcEndpoint, batchSize, beforeSignature);
    if (!batch || batch.length === 0) {
      hasMore = false;
      break;
    }

    for (const tx of batch) {
      yield tx; // Потоковая передача каждого элемента потребителю
    }

    beforeSignature = batch[batch.length - 1].signature;
  }
}

// Потребление без риска переполнения памяти:
// for await (const tx of fetchTransactionsStream('https://api.devnet.solana.com')) {
//   await saveToDatabase(tx);
// }
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Внутри асинхронного генератора конструкция `try ... finally` гарантированно выполняется даже если потребитель прервал цикл через `break` или выбросил ошибку!

---

### [JS-CORE] 12. Infinite Generators for Deterministic ID & Nonce Sequences
* **Category:** `JS Iteration`
* **Quick Copy:** `function* counter(i = 0) { while(true) yield i++; }`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Generators`, `Nonce`, `Sequences`, `CleanCode`

> 🛡️ **Главный инвариант:** Использование глобальных мутируемых переменных `let currentId = 0` для генерации идентификаторов транзакций нарушает изоляцию модулей. Генераторы инкапсулируют состояние и шаг последовательности внутри своего замыкания.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Ленивое вычисление (Lazy Evaluation):** Бесконечный цикл `while(true)` в генераторе безопасен, так как выполнение функции приостанавливается на операторе `yield` до следующего вызова `.next()`.
- **Инкапсуляция состояния в замыкании:** Переменная `nonce` не доступна для внешней мутации и защищена от случайного сброса или коллизий в конкурентных асинхронных вызовах.

#### 💡 Phase 2: Analogy (Mental Model)
Генератор — это автомат с талонами в очереди банка. Автомат не печатает миллион билетов заранее, чтобы не засорять пол. Он выдает ровно один талон со следующим номером строго тогда, когда очередной клиент нажимает кнопку.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export function* createTransactionNonceGenerator(prefix = "tx", initialNonce = 1000n) {
  let nonce = initialNonce;
  while (true) {
    yield `${prefix}_${nonce.toString(16)}`;
    nonce += 1n; // Безопасное инкрементирование BigInt без переполнения Number
  }
}

// Использование:
const nonceSeq = createTransactionNonceGenerator("sol");
console.log(nonceSeq.next().value); // "sol_3e8"
console.log(nonceSeq.next().value); // "sol_3e9"
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Всегда используйте `BigInt` (`1000n`) для ончейн-nonce и счетчиков транзакций, чтобы исключить потерю точности при превышении лимита `Number.MAX_SAFE_INTEGER` ($2^{53} - 1$).

---

### [JS-CORE] 13. Production Debounce with Leading Edge & Immediate Flush
* **Category:** `JS Optimization`
* **Quick Copy:** `const debounced = debounce(fn, 300, { leading: true });`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Performance`, `Debounce`, `Timers`, `UI`

> 🛡️ **Главный инвариант:** Наивный debounce без поддержки немедленного сброса (`flush`) теряет последнее введенное значение формы, если пользователь нажал кнопку отправки до истечения таймера ожидания.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Таймер задержки:** Каждый новый вызов функции сбрасывает предыдущий таймер через `clearTimeout(timerId)` и взводит новый.
- **Флаг leading:** При `leading: true` функция выполняется немедленно при первом вызове, а последующие вызовы в течение `waitMs` блокируются.
- **Метод flush:** Принудительно выполняет отложенный вызов и очищает таймер, гарантируя сохранение данных при размонтировании UI или сабмите формы.

#### 💡 Phase 2: Analogy (Mental Model)
Debounce — это автоматические двери в супермаркете: пока люди непрерывно идут (пользователь быстро печатает), двери остаются открытыми и таймер сбрасывается. Как только поток стихает на 300мс — двери плавно закрываются.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export function debounce(callback, waitMs = 300, { leading = false } = {}) {
  let timerId = null;
  let lastArgs = null;
  let lastThis = null;

  function invoke() {
    if (lastArgs) {
      callback.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  }

  function debounced(...args) {
    lastArgs = args;
    lastThis = this;

    const callNow = leading && !timerId;

    if (timerId) clearTimeout(timerId);

    timerId = setTimeout(() => {
      timerId = null;
      if (!leading) invoke();
    }, waitMs);

    if (callNow) invoke();
  }

  debounced.cancel = () => {
    if (timerId) clearTimeout(timerId);
    timerId = null;
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
      invoke();
    }
  };

  return debounced;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Сохраняйте контекст `this` (через `callback.apply(lastThis, lastArgs)`), иначе вызовы методов классов потеряют доступ к приватным полям экземпляра.

---

### [JS-CORE] 14. High-Precision Throttle with Trailing Call Recovery
* **Category:** `JS Optimization`
* **Quick Copy:** `const throttled = throttle(fn, 100);`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Performance`, `Throttle`, `Scroll`, `Events`

> 🛡️ **Главный инвариант:** Троттлинг ограничивает частоту вызовов до одного раза в `N` миллисекунд. Продакшн-версия обязана гарантировать вызов последнего хвостового события (*Trailing Call*), иначе конечное состояние скролла или ресайза будет потеряно.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Ограничение частоты:** Блокирует выполнение функции до истечения лимита `limitMs`.
- **Trailing Call (хвостовой вызов):** Если во время блокировки произошли новые вызовы, последний из них сохраняется в буфере `lastArgs` и автоматически срабатывает по истечении интервала.

#### 💡 Phase 2: Analogy (Mental Model)
Throttle — это пропускной пункт со шлагбаумом: он пропускает одну машину каждые 5 секунд, независимо от того, сколько машин скопилось перед въездом.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export function throttle(callback, limitMs = 100) {
  let inThrottle = false;
  let lastArgs = null;
  let lastContext = null;

  return function throttled(...args) {
    if (!inThrottle) {
      callback.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          throttled.apply(lastContext, lastArgs);
          lastArgs = null;
          lastContext = null;
        }
      }, limitMs);
    } else {
      lastArgs = args;
      lastContext = this;
    }
  };
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Для анимаций интерфейса вместо throttle лучше использовать `requestAnimationFrame`, который автоматически синхронизируется с частотой развертки монитора (60/120 Гц).

---

### [JS-CORE] 15. Tagged Template Literals: SQL & HTML Zero-Injection Engines
* **Category:** `JS Security`
* **Quick Copy:** `const sql = (strings, ...values) => ({ text: strings.join('?'), values });`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Security`, `TemplateLiterals`, `SQLInjection`, `Sanitization`

> 🛡️ **Главный инвариант:** Прямая конкатенация строк в SQL или HTML (`` `SELECT * FROM users WHERE id = ${id}` ``) — причина 90% уязвимостей SQL Injection и XSS. Тегированные шаблоны перехватывают статические строки и динамические переменные раздельно до их склейки.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Первый аргумент:** Неизменяемый массив статических фрагментов строки (`TemplateStringsArray`). Свойство `strings.raw` хранит сырой текст без экранирования слэшей.
- **Остальные аргументы:** Сырые переменные, переданные пользователем. Это позволяет параметризовать запрос к базе данных без риска выполнения инъекции.

#### 💡 Phase 2: Analogy (Mental Model)
Обычная интерполяция строк — это смешать сырое мясо с тортом в блендере: на выходе каша, и вы не можете отделить ингредиенты. Тегированный шаблон — это ланчбокс с секциями: мясо лежит в одном отсеке, торт в другом. Движок базы данных сам решает, как безопасно приготовить каждый компонент.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export function safeSql(strings, ...values) {
  let queryText = "";
  const queryParams = [];

  for (let i = 0; i < strings.length; i++) {
    queryText += strings[i];
    if (i < values.length) {
      queryParams.push(values[i]);
      queryText += `$${queryParams.length}`; // Параметризованный плейсхолдер PostgreSQL ($1, $2...)
    }
  }

  return Object.freeze({
    text: queryText,
    values: Object.freeze(queryParams)
  });
}

// Использование:
const userInput = "'; DROP TABLE accounts; --";
const query = safeSql`SELECT * FROM accounts WHERE id = ${userInput} AND status = ${'ACTIVE'}`;
// query.text -> "SELECT * FROM accounts WHERE id = $1 AND status = $2"
// query.values -> ["'; DROP TABLE accounts; --", "ACTIVE"] (Инъекция нейтрализована!)
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Массив `strings` заморожен движком V8 (`Object.isFrozen(strings) === true`) и кэшируется между вызовами одной и той же строки шаблона в коде.

---

### [JS-CORE] 16. Function Composition & Piping (Point-Free Architecture)
* **Category:** `JS Functional`
* **Quick Copy:** `const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Functional`, `Pipe`, `CleanCode`, `Composition`

> 🛡️ **Главный инвариант:** Вложенные вызовы функций `fn3(fn2(fn1(data)))` читаются изнутри наружу, затрудняя отладку. Паттерн `pipe` выстраивает линейный конвейер трансформации данных слева направо.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Линейный поток данных:** `pipe` передает результат работы функции `f(x)` на вход функции `g`, формируя конвейер `g(f(x))`.
- **Чистые функции:** Каждый шаг конвейера обязан быть детерминированным и не вызывать сторонних сайд-эффектов, упрощая модульное тестирование.

#### 💡 Phase 2: Analogy (Mental Model)
`Pipe` — это конвейер сборки на автомобильном заводе. Каркас едет по ленте слева направо: робот 1 ставит колеса, робот 2 монтирует двигатель, робот 3 красит кузов.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export const pipe = (...fns) => (initialValue) => {
  return fns.reduce((currentValue, currentFunction) => {
    return currentFunction(currentValue);
  }, initialValue);
};

export const asyncPipe = (...fns) => async (initialValue) => {
  let result = initialValue;
  for (const fn of fns) {
    result = await fn(result);
  }
  return result;
};

// Пример пайплайна санитизации транзакции:
const processTransaction = pipe(
  tx => ({ ...tx, amount: Number(tx.amount) }),
  tx => ({ ...tx, currency: tx.currency.toUpperCase() }),
  tx => Object.freeze(tx)
);
```

#### 💎 Phase 4: Crystallization (Key Insights)
- В асинхронном пайплайне (`asyncPipe`) избегайте создания `Promise.all` внутри шагов, если данные между шагами имеют строгую причинно-следственную зависимость.

---

### [JS-CORE] 17. LRU Cache on Map: O(1) Reordering via Iteration Order
* **Category:** `JS Collections`
* **Quick Copy:** `map.delete(k); map.set(k, v); // Перемещение ключа в конец итерации!`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Collections`, `Map`, `LRU`, `Algorithms`

> 🛡️ **Главный инвариант:** Стандарт ECMAScript гарантирует, что коллекция `Map` обходит элементы строго в порядке их вставки. Перезапись ключа через `map.delete(k); map.set(k, v)` моментально перемещает его в конец очереди за $O(1)$ без создания связных списков.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Детерминированный порядок ключей:** Спецификация ECMAScript гарантирует, что `Map.prototype.keys()` возвращает ключи в хронологическом порядке вставки.
- **$O(1)$ перемещение:** Вызов `delete(key)` удаляет запись из внутреннего связного списка V8, а повторный `set(key, value)` добавляет её в хвост списка за константное время $O(1)$.

#### 💡 Phase 2: Analogy (Mental Model)
LRU-кэш — это стопка книг на столе. Когда вы берете почитать книгу с середины стопки, вы кладете её на самый верх стопки. Книга на самом дне (к которой дольше всего не прикасались) выбрасывается первой, когда стопка становится слишком высокой.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export class FastLruCache {
  #maxSize;
  #cache = new Map();

  constructor(maxSize = 100) {
    this.#maxSize = maxSize;
  }

  get(key) {
    if (!this.#cache.has(key)) return undefined;

    // Считывание обновляет "свежесть": переносим в конец очереди
    const val = this.#cache.get(key);
    this.#cache.delete(key);
    this.#cache.set(key, val);
    return val;
  }

  set(key, value) {
    if (this.#cache.has(key)) {
      this.#cache.delete(key);
    } else if (this.#cache.size >= this.#maxSize) {
      // Удаляем самый старый (первый в порядке обхода) элемент
      const oldestKey = this.#cache.keys().next().value;
      this.#cache.delete(oldestKey);
    }
    this.#cache.set(key, value);
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Итератор `cache.keys().next().value` извлекает самый старый ключ за $O(1)$ без необходимости аллоцировать массив через `Array.from(cache.keys())`.

---

### [JS-CORE] 18. Bitwise Bitmask Flags: High-Density State Packing
* **Category:** `JS Performance`
* **Quick Copy:** `const HAS_AUTH = 1 << 0; const IS_EXEC = 1 << 1; state |= HAS_AUTH;`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Bitwise`, `Performance`, `Memory`, `Binary`

> 🛡️ **Главный инвариант:** Хранение десятков булевых флагов (`{ isAdmin: true, isBanned: false... }`) тратит сотни байт кучи V8. Побитовые битовые маски упаковывают до 31 независимого флага состояния в один 32-битный SMI-целочисленный примитив V8 с мгновенными операциями проверки за $O(1)$.

#### 📌 Phase 1: Deconstruction (Architecture)
- **SMI Оптимизация V8:** Числа до 31 бита хранятся движком V8 как малые целые числа (Small Integers, SMI) прямо в указателе без аллокации объекта в куче (Zero Allocation).
- **Побитовые операторы:** `|` (установка флага), `&` (проверка), `& ~` (сброс), `^` (переключение). Все операции компилируются в 1 машинную инструкцию процессора.

#### 💡 Phase 2: Analogy (Mental Model)
Битовая маска — это панель тумблеров на приборной панели самолета. Вместо того чтобы нанимать 30 стюардесс для записи статусов на бумажках, пилот одним взглядом на ряд щелкающих переключателей видит полную картину полета.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export const AccountFlags = {
  ACTIVE:     1 << 0, // 0001 (1)
  EXECUTABLE: 1 << 1, // 0010 (2)
  FROZEN:     1 << 2, // 0100 (4)
  SYSTEM:     1 << 3  // 1000 (8)
};

export class BitmaskAccountStatus {
  #flags = 0;

  addFlag(flag) { this.#flags |= flag; }
  removeFlag(flag) { this.#flags &= ~flag; }
  hasFlag(flag) { return (this.#flags & flag) === flag; }
  toggleFlag(flag) { this.#flags ^= flag; }
  get raw() { return this.#flags; }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Побитовые операции в JavaScript всегда приводят операнды к 32-битным знаковым целым числам (Int32). Не используйте битовые маски для чисел больше $2^{30}$ (флаг `1 << 31` станет отрицательным).

---

### [JS-CORE] 19. Web Workers: Zero-Freeze UI Off-Main-Thread Compute
* **Category:** `JS Concurrency`
* **Quick Copy:** `const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `WebWorkers`, `Concurrency`, `Performance`, `MultiThreading`

> 🛡️ **Главный инвариант:** Любая синхронная математическая операция (криптографическое хеширование, парсинг гигабайтного JSON), выполняющаяся дольше 16мс, замораживает главный поток (Main Thread), вызывая пропуск кадров и лаг ввода. Тяжелые расчеты обязаны жить в изолированном потоке Web Worker.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Изолированный поток ОС:** Web Worker запускается в отдельном системном потоке со своим собственным Event Loop, кучей V8 и сборщиком мусора.
- **Сериализация сообщений:** Передача данных через `postMessage` использует Structured Clone Algorithm. Для мгновенной передачи тяжелых массивов без копирования используйте Transferable Objects (`ArrayBuffer`).

#### 💡 Phase 2: Analogy (Mental Model)
Главный поток — это кассир в банке, который общается с клиентами. Web Worker — это бухгалтер в закрытом кабинете на втором этаже: кассир передает ему пачку документов на аудит, продолжая с улыбкой обслуживать очередь.

#### ⚡ Phase 3: Context (Production Code)
```javascript
// main.js - Запуск потока без блокировки рендеринга
export function computeHashInWorker(payload) {
  const { promise, resolve, reject } = Promise.withResolvers();

  // Безопасное инстанцирование модуля Worker
  const worker = new Worker(
    new URL("./cryptoWorker.js", import.meta.url),
    { type: "module" }
  );

  worker.onmessage = (e) => {
    resolve(e.data);
    worker.terminate(); // Немедленное освобождение потока ОС
  };

  worker.onerror = (err) => {
    reject(err);
    worker.terminate();
  };

  worker.postMessage(payload);
  return promise;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Внутри Web Worker нет доступа к объектам `window`, `document` и DOM. Передавайте только сырые данные и бинарные буферы.

---

### [JS-CORE] 20. BroadcastChannel: Cross-Tab State Synchronization
* **Category:** `JS WebAPIs`
* **Quick Copy:** `const ch = new BroadcastChannel('auth'); ch.postMessage({ type: 'LOGOUT' });`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `BroadcastChannel`, `CrossTab`, `StateManagement`, `WebAPIs`

> 🛡️ **Главный инвариант:** Синхронизация состояния между разными вкладками одного домена через поллинг `localStorage` с событиями `'storage'` устарела. `BroadcastChannel` предоставляет прямой шинный канал связи между вкладками, воркерами и ифреймами с минимальной задержкой.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Шинная архитектура:** `BroadcastChannel` создает именованный канал в рамках текущего Origin, связывающий все открытые вкладки, окна, Service Workers и Web Workers.
- **Низкая задержка (IPC):** Сообщения доставляются мгновенно через межпроцессный обмен браузера без необходимости периодического поллинга или дискового ввода-вывода.

#### 💡 Phase 2: Analogy (Mental Model)
`BroadcastChannel` — это рация у охранников в супермаркете: когда старший смены объявляет в рацию «Магазин закрывается», все охранники на всех этажах (вкладках) одновременно слышат команду и блокируют двери.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export class CrossTabSessionSync {
  #channel;

  constructor(channelName = "app_auth_bus") {
    this.#channel = new BroadcastChannel(channelName);
  }

  notifyLogout() {
    this.#channel.postMessage({ action: "LOGOUT", timestamp: Date.now() });
  }

  onMessage(callback) {
    this.#channel.onmessage = (event) => {
      callback(event.data);
    };
  }

  destroy() {
    this.#channel.close();
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Всегда вызывайте `channel.close()` при размонтировании компонентов в SPA (например, в `useEffect` cleanup), иначе браузер продолжит удерживать канал открытым в фоне.

---

### [JS-CORE] 21. Structured AggregateError Handling in Promise.any
* **Category:** `JS Async`
* **Quick Copy:** `try { await Promise.any(promises); } catch (e) { console.log(e.errors); }`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `PromiseAny`, `AggregateError`, `Async`, `ErrorHandling`

> 🛡️ **Главный инвариант:** `Promise.any` возвращает результат первого успешно разрешенного промиса. Если **все** переданные промисы упали, выбрасывается специальный класс ошибок `AggregateError`, массив причин которых инкапсулирован в свойстве `error.errors`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Спецификация ES2021:** Если все промисы в `Promise.any` отклонены, генерируется экземпляр класса `AggregateError`.
- **Массив errors:** Свойство `err.errors` хранит массив исходных причин сбоев в строгом порядке исходных промисов, сохраняя диагностический контекст каждого узла сети.

#### 💡 Phase 2: Analogy (Mental Model)
`Promise.any` — это вызов нескольких пожарных расчетов из разных частей города: побеждает тот, кто приехал первым. Если ни одна машина не смогла доехать (пробки, поломки), диспетчер получает единый сводный протокол всех аварий (`AggregateError`).

#### ⚡ Phase 3: Context (Production Code)
```javascript
export async function queryFastestRpcEndpoint(endpointsList) {
  const requests = endpointsList.map(async (url) => {
    const res = await fetch(`${url}/health`);
    if (!res.ok) throw new Error(`Нода ${url} вернула статус ${res.status}`);
    return url;
  });

  try {
    return await Promise.any(requests);
  } catch (err) {
    if (err instanceof AggregateError) {
      console.error("[RPC] Все резервные ноды недоступны!");
      err.errors.forEach((e, idx) => console.error(`  - Нода ${idx + 1}: ${e.message}`));
    }
    throw err;
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- В отличие от `Promise.all` (где падение одного промиса мгновенно роняет всё), `Promise.any` игнорирует отказы до тех пор, пока есть хоть один шанс на успешный ответ.

---

### [JS-CORE] 22. Scheduler API & RequestIdleCallback: Background Chunking
* **Category:** `JS Performance`
* **Quick Copy:** `requestIdleCallback(deadline => { while(deadline.timeRemaining() > 0) doWork(); });`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Scheduler`, `Performance`, `IdleCallback`, `CoreWebVitals`

> 🛡️ **Главный инвариант:** Вторичные задачи (отправка телеметрии, предрасчет графов) не должны конкурировать со скроллом и анимацией. `requestIdleCallback` передает управление скрипту строго тогда, когда процессор свободен до следующего кадра экрана.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Квантование времени простоя:** `requestIdleCallback` вызывает переданный колбэк в промежутках между отрисовкой кадров, когда у браузера остается свободное процессорное время.
- **`deadline.timeRemaining()`:** Метод возвращает количество миллисекунд (от 0 до 50мс), оставшихся до начала подготовки следующего кадра экрана.

#### 💡 Phase 2: Analogy (Mental Model)
`requestIdleCallback` — это уборка на кухне ресторана во время затишья между наплывом гостей: повар моет посуду только тогда, когда нет активных заказов, и мгновенно откладывает тряпку, как только официант приносит новый чек.

#### ⚡ Phase 3: Context (Production Code)
```javascript
export function scheduleLowPriorityTask(taskFn) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback((deadline) => {
      // Выполняем работу порциями, пока остается свободное время в миллисекундах
      if (deadline.timeRemaining() > 0 || deadline.didTimeout) {
        taskFn();
      }
    }, { timeout: 2000 }); // Принудительный вызов через 2 сек, если браузер загружен
  } else {
    setTimeout(taskFn, 50);
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Никогда не мутируйте DOM внутри колбэка `requestIdleCallback`! Изменение стилей и геометрии заставит браузер инвалидировать Layout прямо перед отрисовкой, вызвав просадку FPS.

---

### [JS-CORE] 23. Currying & Partial Application for Configurable Factories
* **Category:** `JS Functional`
* **Quick Copy:** `const add = a => b => a + b; const addFive = add(5);`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Functional`, `Currying`, `PartialApplication`, `CleanCode`

> 🛡️ **Главный инвариант:** Каррирование преобразует функцию от многих аргументов в цепочку функций от одного аргумента. Это позволяет фиксировать общие конфигурации (эндпоинты, ключи авторизации) один раз, переиспользуя специализированную функцию в бизнес-коде.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Свойство `fn.length`:** Рефлексия `fn.length` возвращает количество объявленных формальных параметров функции (арность), позволяя универсальному карринг-декоратору понять, когда собраны все аргументы.
- **Замыкания аргументов:** Каждый промежуточный вызов возвращает новую функцию, удерживающую накопленный массив `args` в области видимости лексического окружения.

#### 💡 Phase 2: Analogy (Mental Model)
Каррирование — это сборочный конвейер пиццы: сначала повар раскатывает тесто и кладет соус (фиксирует конфигурацию окружения), а затем начинка (пользовательские данные) выбирается клиентом в самый последний момент.

#### ⚡ Phase 3: Context (Production Code)
```javascript
// Автоматический карринг функции произвольной арности
export function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

// Пример:
const log = curry((level, moduleName, message) => {
  console.log(`[${level}] [${moduleName}]: ${message}`);
});

const securityAuditLog = log("CRITICAL")("SolanaStorage");
securityAuditLog("Обнаружена попытка мутации дескриптора!");
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Функции с параметрами по умолчанию (`a, b = 10`) или rest-параметрами (`...args`) имеют `fn.length`, не отражающий их реальную арность. Каррируйте функции с явными позиционными аргументами.

---

### [JS-CORE] 24. Atomics & SharedArrayBuffer: Lock-Free Concurrency
* **Category:** `JS Concurrency`
* **Quick Copy:** `Atomics.add(int32Array, 0, 1); // Атомарный инкремент в разделяемой памяти`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Atomics`, `SharedArrayBuffer`, `MultiThreading`, `V8`

> 🛡️ **Главный инвариант:** Когда несколько Web Worker читают и пишут в один и тот же `SharedArrayBuffer`, обычные операции (`i++`) вызывают состояние гонки (*Race Condition*). Объект `Atomics` гарантирует атомарность операций на уровне процессорных инструкций шины памяти.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Атомарные инструкции:** `Atomics.add`, `Atomics.load`, `Atomics.compareExchange` транслируются в аппаратные инструкции процессора с блокировкой шины памяти (`LOCK XADD` на x86).
- **Wait & Notify:** Методы `Atomics.wait` и `Atomics.notify` реализуют эффективную синхронизацию потоков (усыпление и пробуждение воркеров) без активного цикла ожидания (*busy-waiting*).

#### 💡 Phase 2: Analogy (Mental Model)
Обычная переменная в общей памяти — это доска, на которой два человека одновременно пытаются писать одним маркером, размазывая буквы. `Atomics` — это турникет: он пропускает ровно одного человека за раз, гарантируя идеальный порядок записей.

#### ⚡ Phase 3: Context (Production Code)
```javascript
// Инициализация общего счетчика между потоками
export function createSharedAtomicCounter() {
  const sab = new SharedArrayBuffer(4); // 4 байта = 1 Int32
  const sharedArray = new Int32Array(sab);

  return {
    buffer: sab,
    increment() {
      // Атомарное потокобезопасное увеличение на 1
      return Atomics.add(sharedArray, 0, 1);
    },
    getValue() {
      return Atomics.load(sharedArray, 0);
    }
  };
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Метод `Atomics.wait()` заблокирован в основном потоке браузера (выбросит `TypeError`), так как блокировка главного потока намертво замораживает весь интерфейс. Он разрешен только внутри Web Workers.

---

### [JS-CORE] 25. Custom Symbol.iterator: Transforming Any Object into Iterable
* **Category:** `JS Iteration`
* **Quick Copy:** `[Symbol.iterator]() { let i = 0; return { next: () => ({ value: i++, done: i > 5 }) }; }`
* **Status:** `Actual`
* **Tags:** `JavaScript`, `Symbols`, `Iterator`, `IterationProtocol`, `CleanCode`

> 🛡️ **Главный инвариант:** Обычный объект нельзя обойти через цикл `for...of` или развернуть через `[...obj]`. Реализация нативного метода `[Symbol.iterator]` подключает любой кастомный класс или сущность к протоколу итерации языка JavaScript.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Протокол итератора:** Объект обязан вернуть структуру с методом `next()`, возвращающим `{ value: any, done: boolean }`.
- **Генератор как короткий путь:** Объявление `*[Symbol.iterator]() { yield... }` автоматически генерирует полностью совместимый объект-итератор без ручной реализации объекта с методом `next()`.

#### 💡 Phase 2: Analogy (Mental Model)
Обычный объект — это закрытая шкатулка с драгоценностями. `Symbol.iterator` — это выдвижная лента-эскалатор: она аккуратно выносит по одной драгоценности прямо в руки тому, кто её осматривает (цикл `for...of`).

#### ⚡ Phase 3: Context (Production Code)
```javascript
export class TransactionLedgerCollection {
  #transactions = [];

  constructor(initialTxs = []) {
    this.#transactions = [...initialTxs];
  }

  add(tx) {
    this.#transactions.push(tx);
  }

  // Подключение объекта к операторам for...of, Spread [...], Array.from
  *[Symbol.iterator]() {
    for (let i = 0; i < this.#transactions.length; i++) {
      yield this.#transactions[i];
    }
  }
}

// Использование:
const ledgerCollection = new TransactionLedgerCollection([{ id: "1" }, { id: "2" }]);
for (const tx of ledgerCollection) {
  console.log("Транзакция:", tx.id);
}
const txListArray = [...ledgerCollection]; // Работает нативно!
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Если итератор поддерживает прерывание (`break`, `return` в цикле `for...of`), реализуйте метод `return()` у итератора для корректного освобождения дескрипторов и ресурсов.
