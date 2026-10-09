# 📚 Мастер-База: 24 Шпаргалки по Advanced TypeScript
### Стандарт: Induktr Studio 4-Phase Notion Architecture

---

### [TS] 01. Discriminated Unions & Exhaustiveness Checking with `never`
* **Category:** `TypeScript Architecture`
* **Quick Copy:** `function assertNever(x: never): never { throw new Error('Unhandled case: ' + x); }`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `Types`, `DiscriminatedUnions`, `never`, `PatternMatching`

> 🛡️ **Главный инвариант:** Любой полиморфный `switch` по дискриминантному типу обязан иметь ветку `default: assertNever(action)`. Если в будущем разработчик добавит новое состояние в `Union`, компилятор TypeScript выбросит ошибку на этапе сборки, указав, где забыта обработка.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Дискриминант:** Общее поле с литеральным типом (например, `kind: "TRANSFER"`), присутствующее в каждом типе объединения.
- **Анализ потока управления (Control Flow Analysis):** Компилятор последовательно сужает тип в каждом `case`. В блоке `default` тип объединения полностью исчерпывается до `never`.

#### 💡 Phase 2: Analogy (Mental Model)
Сортировочная станция почты: каждая посылка имеет наклейку цвета (`type`). Ветка `assertNever` — это контролер в самом конце конвейера: если мимо него проезжает неопознанная посылка, он немедленно дергает стоп-кран всего завода.

#### ⚡ Phase 3: Context (Production Code)
```typescript
// 1. Дискриминантное объединение ончейн-событий
export type SolanaTransactionEvent =
  | { kind: "TRANSFER"; from: string; to: string; lamports: bigint }
  | { kind: "PROGRAM_DEPLOY"; programId: string; bytecodeLength: number }
  | { kind: "ACCOUNT_FREEZE"; targetPubkey: string };

// 2. Функция исчерпывающей проверки (Exhaustiveness Check)
export function assertNever(value: never): never {
  throw new Error(`[TypeScript Guard] Необработанное событие: ${JSON.stringify(value)}`);
}

// 3. Обработчик с гарантией 100% покрытия вариантов
export function processOnChainEvent(event: SolanaTransactionEvent): string {
  switch (event.kind) {
    case "TRANSFER":
      return `Перевод ${event.lamports} lamports от ${event.from}`;
    case "PROGRAM_DEPLOY":
      return `Деплой программы ${event.programId}`;
    case "ACCOUNT_FREEZE":
      return `Заморозка счета ${event.targetPubkey}`;
    default:
      // Если добавить новый kind в Union, здесь возникнет ошибка компиляции TS!
      return assertNever(event);
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Не делайте дискриминант опциональным (`kind?: string`), иначе TypeScript не сможет сузить типы внутри блоков `case`.
- При возникновении ошибки компиляции в `assertNever(event)` текст ошибки покажет в точности тот тип, для которого не написан `case`.

---

### [TS] 02. Type Predicates: Custom Type Guards (`val is Type`)
* **Category:** `TypeScript Narrowing`
* **Quick Copy:** `function isAccount(val: unknown): val is Account { return typeof val === 'object' && val !== null && 'pubKey' in val; }`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `TypeGuards`, `TypePredicates`, `unknown`, `Narrowing`

> 🛡️ **Главный инвариант:** Обычная булева функция `boolean` не сужает тип в вызывающем коде. Сигнатура предиката `value is TargetType` принуждает компилятор считать переменную типом `TargetType` внутри ветки `if (isTarget(x))`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Связка с `unknown`:** Безопасная граница для входящих JSON-данных или сетевых ответов `fetch()`. Мы принимаем `unknown` и пропускаем через валидатор.
- **Опасность самообмана:** TypeScript безоговорочно верит вашему предикату. Если внутри функции написана ложь (`return true`), компилятор пропустит невалидный объект дальше, вызвав крах в рантайме.

#### 💡 Phase 2: Analogy (Mental Model)
Предикат — это нотариус с печатью. Таможня (компилятор) не читает весь документ, а верит штампу нотариуса (`val is Account`). Но если нотариус поставил печать не глядя, на борт самолета пройдет нелегал.

#### ⚡ Phase 3: Context (Production Code)
```typescript
export interface ValidTransaction {
  id: string;
  amount: number;
  currency: string;
}

// Предикат типов со строгой рантайм-валидацией
export function isValidTransaction(payload: unknown): payload is ValidTransaction {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.amount === "number" &&
    Number.isFinite(candidate.amount) &&
    typeof candidate.currency === "string"
  );
}

// Использование:
function handleExternalPayload(rawInput: unknown) {
  if (isValidTransaction(rawInput)) {
    // Внутри блока rawInput имеет тип ValidTransaction!
    console.log(rawInput.id, rawInput.amount.toFixed(2));
  } else {
    console.error("Невалидная полезная нагрузка");
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Тайпчекер доверяет реализации предиката без математической верификации. Ложная проверка внутри (`return true`) пропустит поврежденные данные в рантайм.
- Для объектов со сложными схемами предпочтительно генерировать предикаты автоматически через Zod (`z.infer` / `schema.safeParse`) или Valibot.

---

### [TS] 03. Assertion Signatures (`asserts condition` & `asserts val is T`)
* **Category:** `TypeScript Narrowing`
* **Quick Copy:** `function assertDefined<T>(val: T): asserts val is NonNullable<T> { if (val == null) throw new Error(); }`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `Assertions`, `asserts`, `Narrowing`, `CleanCode`

> 🛡️ **Главный инвариант:** В отличие от Type Predicate (который требует оборачивать код в `if`), функция с сигнатурой `asserts val is T` сужает тип **для всех последующих строк текущей функции**. Если проверка провалилась — функция обязана выбросить `throw`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Сужение линейного потока:** Обычный `if (isFoo(x))` требует создания вложенного блока кода. Сигнатура `asserts val is T` сужает тип переменной для всего оставшегося скоупа функции без лестниц отступов.
- **Отказоустойчивость:** Если условие ложно, функция обязана прервать нормальный поток выполнения через выброс исключения (`throw new Error`).

#### 💡 Phase 2: Analogy (Mental Model)
Турникет с биометрическим сканером на входе в охраняемый дата-центр: если сканирование пройдено, посетитель дальше перемещается по залу без необходимости предъявлять паспорт у каждой двери. Если отпечаток не совпал — охрана немедленно выводит нарушителя (`throw`).

#### ⚡ Phase 3: Context (Production Code)
```typescript
export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}

export function assertNonNull<T>(value: T, message?: string): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new AssertionError(message ?? "Значение не должно быть null или undefined");
  }
}

// Использование:
function processAccountBalance(balance: number | null) {
  // balance: number | null
  assertNonNull(balance, "Баланс еще не загружен из RPC");
  
  // Ниже этой строки balance СТРОГО number! Без лишних if-обёрток!
  const formatted = balance.toFixed(4);
  console.log("Баланс:", formatted);
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Функции-ассерты не могут быть объявлены как анонимные стрелочные функции без явной аннотации типа переменной (ограничение синтаксиса TS).
- Никогда не используйте ассерты для подавления ошибок типов без реальной рантайм-проверки — это эквивалентно скрытому опасному `as unknown as T`.

---

### [TS] 04. Template Literal Types & Dynamic Event Handlers
* **Category:** `TypeScript Advanced`
* **Quick Copy:** `type EventHandler = \`on\${Capitalize<EventName>}\`;`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `TemplateLiterals`, `Generics`, `Metaprogramming`

> 🛡️ **Главный инвариант:** Шаблонные строковые типы позволяют выполнять конкатенацию, интерполяцию и паттерн-матчинг над строковыми литералами на уровне системы типов, динамически генерируя строгие контракты API.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Комбинаторная генерация:** Объединение шаблонных литералов `${Prefix}:${Action}` производит декартово произведение всех строковых комбинаций на уровне компилятора.
- **Встроенные интринсик-типы:** `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` обрабатываются напрямую ядром TypeScript без генерации JS-кода.

#### 💡 Phase 2: Analogy (Mental Model)
Шаблонные литералы — это наборные штампы типографского станка: вместо ручной гравировки каждого слова из букв составляется матрица, которая за один оттиск печатает все возможные заголовки газеты.

#### ⚡ Phase 3: Context (Production Code)
```typescript
type SystemEvent = "transfer" | "freeze" | "mint";
type Scope = "internal" | "external";

// Автоматическая генерация: "internal:onTransfer" | "internal:onFreeze" | ...
export type ScopedEventHandlerName = `${Scope}:on${Capitalize<SystemEvent>}`;

// Типизация строгого роутера путей REST API
export type ApiRoute = `/api/v1/${string}`;
export function createEndpoint(route: ApiRoute) {
  return `Registered: ${route}`;
}

createEndpoint("/api/v1/accounts"); // ✅ Валидно
// createEndpoint("/v2/accounts");    // ❌ Ошибка компиляции!
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Остерегайтесь бесконечного декартова произведения: комбинация трех Union по 20 элементов породит 8 000 типов, что приведет к ошибке компилятора `Expression produces a union type that is too complex to represent`.
- Шаблонные типы идеально подходят для статической валидации семантических версий (`${number}.${number}.${number}`) и HEX-цветов (`#${string}`).

---

### [TS] 05. Conditional Types & Distributive Law
* **Category:** `TypeScript Types`
* **Quick Copy:** `type NonNullableType<T> = T extends null | undefined ? never : T;`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `ConditionalTypes`, `Distributive`, `Generics`

> 🛡️ **Главный инвариант:** Необернутый (голый) параметр типа `T` в условии `T extends U` **автоматически дистрибутируется (распределяется) по элементам объединения**. Если передать `A | B`, условие превратится в `(A extends U ? X : Y) | (B extends U ? X : Y)`. Оборачивание в кортеж `[T] extends [U]` блокирует дистрибуцию.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Механика дистрибуции:** Если параметр типа `T` является "голым" (naked generic) в конструкции `T extends U ? X : Y`, то при передаче `A | B` вычисление распределяется: `(A extends U ? X : Y) | (B extends U ? X : Y)`.
- **Подавление дистрибуции:** Оборачивание в кортеж `[T] extends [U]` заставляет компилятор оценивать все объединение как единый неделимый тип.

#### 💡 Phase 2: Analogy (Mental Model)
Дистрибутивный тип работает как таможенник, проверяющий каждого пассажира в очереди по отдельности (паспортный контроль). Оборачивание в кортеж `[T]` — это взвешивание всего автобуса целиком на автомобильных весах.

#### ⚡ Phase 3: Context (Production Code)
```typescript
// 1. Дистрибутивный тип: отфильтровывает null и undefined
export type SafePrimitive<T> = T extends null | undefined ? never : T;
type Cleaned = SafePrimitive<string | null | number>; // string | number

// 2. Блокировка дистрибуции через кортеж [T]
// Проверяет, является ли ВСЁ объединение подтипом массива целиком
export type IsFullUnionArray<T> = [T] extends [unknown[]] ? true : false;
type Test1 = IsFullUnionArray<string[] | number[]>; // true
type Test2 = IsFullUnionArray<string[] | number>;   // false (не размазывается на части!)
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Поведение дистрибуции часто является причиной скрытых багов, когда тип внезапно "размазывается" на объединение ответов вместо единого типа.
- Проверка на `never` через условный тип требует обязательного оборачивания: `[T] extends [never] ? true : false`, потому что `never` в голом виде дистрибутируется в пустое множество `never` и условие вообще не выполняется!

---

### [TS] 06. The `infer` Keyword: Type Pattern Extraction
* **Category:** `TypeScript Advanced`
* **Quick Copy:** `type UnpackPromise<T> = T extends Promise<infer R> ? R : T;`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `infer`, `Generics`, `Metaprogramming`, `Unpack`

> 🛡️ **Главный инвариант:** Ключевое слово `infer` объявляет переменную типа внутри условия `extends`, заставляя компилятор автоматически вывести и извлечь тип вложенного значения (возврат функции, аргументы, тип промиса).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Паттерн-матчинг типов:** Ключевое слово `infer R` указывает компилятору решить уравнение типов относительно неизвестной `R` внутри ветки `extends`.
- **Скоуп видимости:** Переменная `R` доступна исключительно в истинной (`true`) ветке тернарного условного оператора.

#### 💡 Phase 2: Analogy (Mental Model)
`infer` — это рентгеновский сканер багажа: чемодан запечатан (`Promise<T>`), но сканер просвечивает корпус и извлекает точный контур лежащего внутри предмета (`T`), не требуя вскрытия замков.

#### ⚡ Phase 3: Context (Production Code)
```typescript
// 1. Извлечение первого элемента кортежа
export type Head<T extends unknown[]> = T extends [infer First, ...unknown[]] ? First : never;

// 2. Извлечение типа данных из обернутого ончейн-RPC ответа
export interface RpcResponse<TData> {
  jsonrpc: "2.0";
  result: {
    value: TData;
  };
}

export type ExtractRpcData<T> = T extends RpcResponse<infer TData> ? TData : never;

// Тест:
type TargetData = ExtractRpcData<RpcResponse<{ lamports: number; owner: string }>>;
// TargetData -> { lamports: number; owner: string }
```

#### 💎 Phase 4: Crystallization (Key Insights)
- В одном условном типе можно использовать несколько `infer` одновременно (например, распаковывать аргументы и возврат функции: `T extends (...args: infer Args) => infer Ret`).
- При наличии нескольких кандидатов на один и тот же `infer` в ковариантной позиции компилятор выводит их объединение (`Union`), а в контравариантной (аргументы) — пересечение (`Intersection`).

---

### [TS] 07. Mapped Types with Key Remapping via `as`
* **Category:** `TypeScript Types`
* **Quick Copy:** `type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `MappedTypes`, `KeyRemapping`, `Generics`

> 🛡️ **Главный инвариант:** Конструкция `as` внутри сопоставленного типа `[K in keyof T as NewKey]` позволяет переименовывать ключи или фильтровать их: если `as` возвращает `never`, ключ полностью удаляется из результирующего интерфейса.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Синтаксис `as NewKey`:** Начиная с TypeScript 4.1, сопоставленные типы могут изменять имена ключей с помощью строковых шаблонных типов или фильтровать их.
- **Фильтрация через `never`:** Если трансформация ключа вычисляется в `never`, этот ключ полностью удаляется из результирующего типа.

#### 💡 Phase 2: Analogy (Mental Model)
Key Remapping — это конвейер с лазерным гравировщиком и отбраковщиком: детали с дефектом или ненужным типом скидываются в корзину (`never`), а на годные детали наносится новый штрихкод и префикс (`get${Name}`).

#### ⚡ Phase 3: Context (Production Code)
```typescript
interface RawAccountModel {
  pubKey: string;
  balance: number;
  isExecutable: boolean;
  internalSignatureHash: string; // Чувствительное служебное поле
}

// Фильтруем интерфейс: оставляем ТОЛЬКО строковые поля и добавляем префикс
export type SanitizedStringView<T> = {
  [K in keyof T as T[K] extends string ? `str_${string & K}` : never]: T[K];
};

type ResultView = SanitizedStringView<RawAccountModel>;
// ResultView -> { str_pubKey: string; str_internalSignatureHash: string }
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Не забывайте пересекать ключ с `string` (`K & string`), так как ключи объекта могут быть типа `symbol` или `number`, что сломает строковую интерполяцию.
- С помощью `as` можно инвертировать словарь (поменять ключи и значения местами): `[K in keyof T as T[K]]: K`.

---

### [TS] 08. Branded / Nominal Types: Zero-Cost Type Safety
* **Category:** `TypeScript Architecture`
* **Quick Copy:** `type Brand<T, B> = T & { readonly [__brand]: B };`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `BrandedTypes`, `NominalTyping`, `DomainDrivenDesign`, `Web3`

> 🛡️ **Главный инвариант:** TypeScript использует структурную типизацию: если два типа имеют одинаковую структуру (например, строки `type UserId = string` и `type OrderId = string`), компилятор позволяет случайно перепутать их местами. Брендирование (Branding) внедряет уникальную метку типов с нулевым оверхедом в рантайме.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Структурная эквивалентность vs номинальная строгость:** По умолчанию TS считает два типа взаимозаменяемыми, если у них одинаковый набор полей.
- **Фантомные типы (Phantom Types):** Поле `__brand: unique symbol` существует только в таблице символов компилятора и вырезается при транспиляции в JS, гарантируя нулевой оверхед по памяти и процессору.

#### 💡 Phase 2: Analogy (Mental Model)
Обычная типизация — это купюра без водяного знака: бумага одинаковая. Брендированный тип — это купюра с уникальной защитной голограммой: кассир (компилятор) моментально отклонит попытку расплатиться билетом метро вместо денег.

#### ⚡ Phase 3: Context (Production Code)
```typescript
declare const __brand: unique symbol;
export type Brand<T, TBrandName extends string> = T & {
  readonly [__brand]: TBrandName;
};

// Создаем два номинальных несовместимых типа на базе строк:
export type SolanaPublicKey = Brand<string, "SolanaPublicKey">;
export type EthereumAddress = Brand<string, "EthereumAddress">;

// Фабрика-валидатор с приведением типа
export function parseSolanaPubkey(raw: string): SolanaPublicKey {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(raw)) {
    throw new TypeError("Некорректный base58 адрес Solana");
  }
  return raw as SolanaPublicKey;
}

export function querySolanaAccount(key: SolanaPublicKey) {
  return `Fetch: ${key}`;
}

// Тест защиты:
const solKey = parseSolanaPubkey("11111111111111111111111111111111");
querySolanaAccount(solKey); // ✅ Успешно!

const rawString = "some_random_string";
// querySolanaAccount(rawString); 
// ❌ Ошибка компиляции: Type 'string' is not assignable to type 'SolanaPublicKey'!
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Всегда используйте `unique symbol` для ключа бренда, чтобы избежать случайного совпадения имен свойств из разных библиотек.
- Создавайте фабричные функции-валидаторы (Smart Constructors) — единственные точки в коде, где разрешено принудительное приведение `as Brand<T>`.

---

### [TS] 09. The `satisfies` Operator vs Type Annotations
* **Category:** `TypeScript Modern`
* **Quick Copy:** `const config = { port: 8080 } satisfies Config; // Сохраняет точные литералы!`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `satisfies`, `TypeScript4.9`, `TypeInference`, `CleanCode`

> 🛡️ **Главный инвариант:** Аннотация `: Type` расширяет тип переменной до базового интерфейса, теряя точные литеральные значения и автокомплит конкретных ключей. Оператор `satisfies Type` проверяет соответствие контракту, но **сохраняет максимально узкий выведенный тип** значения.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Проблема аннотации типа `const x: T`:** Сужает валидацию до минимального общего интерфейса, превращая конкретные литералы в примитивные `string`, `number` или общие объединения.
- **Механика `satisfies T`:** Валидирует выражение на соответствие контракту `T`, но сохраняет наиболее точный выведенный тип (Inferred Type) присваиваемого литерала.

#### 💡 Phase 2: Analogy (Mental Model)
Аннотация типа — это покупка одежды универсального безразмерного кроя (One Size Fits All): она подходит по стандарту, но сидит мешковато. `satisfies` — это индивидуальная подгонка костюма по фигуре с гарантией соответствия корпоративному дресс-коду.

#### ⚡ Phase 3: Context (Production Code)
```typescript
type Palette = Record<string, string | [number, number, number]>;

// ❌ СТАРАЯ АННОТАЦИЯ: теряется информация о типе каждого конкретного ключа
const badPalette: Palette = {
  primary: "#6366f1",
  secondary: [255, 0, 0]
};
// badPalette.primary.toUpperCase(); 
// 💣 Ошибка TS: Property 'toUpperCase' does not exist on type 'string | [number, number, number]'!

// ✅ СОВРЕМЕННЫЙ SATISFIES: проверяет контракт И сохраняет точные типы!
const modernPalette = {
  primary: "#6366f1",
  secondary: [255, 0, 0]
} satisfies Palette;

modernPalette.primary.toUpperCase(); // ✅ TS ТОЧНО знает, что это строка!
modernPalette.secondary.map(x => x * 2); // ✅ TS ТОЧНО знает, что это массив!
```

#### 💎 Phase 4: Crystallization (Key Insights)
- `satisfies` ловит опечатки в ключах конфигурации и сохраняет точные имена свойств без необходимости объявлять сложный дженерик.
- Комбинируйте `satisfies` с `as const`: `const config = { ... } as const satisfies Config;` для достижения максимальной иммутабельности и точечной типизации.

---

### [TS] 10. `const` Type Parameters (TypeScript 5.0+)
* **Category:** `TypeScript Modern`
* **Quick Copy:** `function createRoutes<const T extends string[]>(routes: T): T { return routes; }`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `TS5.0`, `constGenerics`, `Immutability`, `Tuples`

> 🛡️ **Главный инвариант:** Раньше для вывода точного кортежа литералов вызывающий код был обязан дописывать `as const` на аргументе. Модификатор `<const T>` в объявлении дженерика заставляет компилятор автоматически считать переданные аргументы глубоко неизменяемыми литералами.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Автоматическое выведение кортежей:** Модификатор `const` перед параметром типа `<const T>` инструктирует компилятор выводить литеральные типы кортежей и объектов по умолчанию, как если бы вызывающая сторона дописала `as const`.
- **Устранение шаблонного кода:** Разработчикам библиотек больше не нужно требовать от пользователей ручного аннотирования аргументов литералами.

#### 💡 Phase 2: Analogy (Mental Model)
Раньше передача аргумента в функцию была как отправка пластилина: функция получала податливый ком `string[]`. Модификатор `const T` — это мгновенная заморозка: аргумент поступает в виде нерушимого кристаллического слепка с фиксированными гранями.

#### ⚡ Phase 3: Context (Production Code)
```typescript
// До TS 5.0 возвращался string[]
// В TS 5.0+ с модификатором const возвращается readonly ["SOL", "USDC"]!
export function declareSupportedCurrencies<const T extends readonly string[]>(currencies: T): T {
  return currencies;
}

const tokens = declareSupportedCurrencies(["SOL", "USDC"]);
// tokens имеет тип: readonly ["SOL", "USDC"] без единого "as const" у вызывающей стороны!
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Модификатор `const` влияет только на вывод типов при непосредственной передаче литералов. Если передать уже существующую переменную `let arr = [...]`, компилятор сохранит её исходный тип.
- Объекты, выведенные через `const T`, получают свойства с модификатором `readonly`.

---

### [TS] 11. Function Variance & Strict Function Types
* **Category:** `TypeScript Theory`
* **Quick Copy:** `// В аргументах: контравариантность. В возврате: ковариантность.`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `Variance`, `Contravariance`, `Covariance`, `Subtyping`

> 🛡️ **Главный инвариант:** При включенном флаге `--strictFunctionTypes` параметры функций ведут себя **контравариантно** (функция, ожидающая более общий тип `Animal`, может быть безопасно передана туда, где ждут обработчик частного типа `Dog`, но не наоборот!).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Ковариантность (Возврат):** Если `Dog` подтип `Animal`, то `() => Dog` подтип `() => Animal`.
- **Контравариантность (Параметры):** Если `Dog` подтип `Animal`, то `(x: Animal) => void` является подтипом `(x: Dog) => void`! Обработчик `Animal` гарантированно справится с собакой, но обработчик `Dog` упадет, если ему передать кота.

#### 💡 Phase 2: Analogy (Mental Model)
Если вам в ресторан требуется повар для приготовления любой еды (`AnimalHandler`), он без труда пожарит рыбу (`FishHandler`). Но если позвать повара, умеющего готовить исключительно фугу, он отравит гостей, если ему принесут говядину.

#### ⚡ Phase 3: Context (Production Code)
```typescript
class Animal { name = "Animal"; }
class Dog extends Animal { bark() { console.log("Woof"); } }

type AnimalHandler = (a: Animal) => void;
type DogHandler = (d: Dog) => void;

let handleAnimal: AnimalHandler = (a) => console.log(a.name);
let handleDog: DogHandler = (d) => d.bark();

// При --strictFunctionTypes:
handleDog = handleAnimal; // ✅ Безопасно: AnimalHandler справится с Dog
// handleAnimal = handleDog; // ❌ Ошибка TS: DogHandler не сможет обработать произвольного Animal!
```

#### 💎 Phase 4: Crystallization (Key Insights)
- В TypeScript методы интерфейсов исторически бивариантны (`{ fn(x: T): void }`), а свойства-стрелки строго контравариантны (`{ fn: (x: T) => void }`).
- Флаг `strictFunctionTypes: true` входит в пресет `strict: true` и должен быть включен в любом продакшн `tsconfig.json`.

---

### [TS] 12. Deep Readonly & Immutable Domain Models
* **Category:** `TypeScript Types`
* **Quick Copy:** `type DeepReadonly<T> = { readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P] };`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `DeepReadonly`, `Immutability`, `CleanCode`, `Generics`

> 🛡️ **Главный инвариант:** Встроенный `Readonly<T>` замораживает только свойства первого уровня. Вложенные объекты остаются полностью мутируемыми на уровне типов. Рекурсивный `DeepReadonly<T>` блокирует мутацию всего графа.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Поверхностность стандартного `Readonly<T>`:** Интерфейс `Readonly<{ nested: { val: number } }>` защищает от записи только свойство `nested`, но `nested.val = 2` остается валидным.
- **Рекурсивный обход типов:** Условный сопоставленный тип инспектирует свойства на `object` и рекурсивно накладывает `readonly`, поддерживая примитивы, массивы, `Map` и `Set`.

#### 💡 Phase 2: Analogy (Mental Model)
Обычный `Readonly` — это бронированная внешняя дверь в квартиру с картонными межкомнатными перегородками. `DeepReadonly` — это цельнолитой банковский сейф, где каждая ячейка и каждая шкатулка внутри намертво заварены титаном.

#### ⚡ Phase 3: Context (Production Code)
```typescript
export type DeepReadonly<T> = T extends Function | boolean | number | string | symbol | bigint | null | undefined
  ? T
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends Set<infer M>
  ? ReadonlySet<DeepReadonly<M>>
  : { readonly [K in keyof T]: DeepReadonly<T[K]> };

// Использование:
interface LedgerConfig {
  network: {
    endpoint: string;
    limits: { maxRetries: number };
  };
}

type ImmutableConfig = DeepReadonly<LedgerConfig>;
// const config: ImmutableConfig = ...;
// config.network.limits.maxRetries = 10; // ❌ Ошибка TS: Cannot assign to read only property!
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Обязательно исключайте из рекурсивного обхода тип `Function`, иначе компилятор попытается обойти внутренние свойства методов объекта и сломает вызовы.
- Помните, что `DeepReadonly` существует только на этапе проверки типов. Для физической защиты в рантайме используйте `Object.freeze()`.

---

### [TS] 13. Indexed Access Types & Tuple Element Extraction
* **Category:** `TypeScript Types`
* **Quick Copy:** `type ArrayElement = typeof myArray[number]; type DictValue = Record[keyof Record];`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `IndexedAccess`, `Tuples`, `Unions`, `Inference`

> 🛡️ **Главный инвариант:** Индексирование массива через специальный индекс `[number]` извлекает объединение (Union) всех возможных типов элементов массива. Это исключает дублирование списков констант и типов.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Индексация числом `[number]`:** Обращение к типу массива по индексу `number` извлекает тип его элементов. В сочетании с `as const` это позволяет получить точный литеральный `Union`.
- **Извлечение значений словаря `T[keyof T]`:** Возвращает объединение типов всех возможных значений объекта.

#### 💡 Phase 2: Analogy (Mental Model)
`T[number]` — это сито: вы высыпаете в него ящик с фруктами (кортеж констант), и сито отсеивает все этикетки и порядок укладки, оставляя только сорта фруктов, лежащих внутри.

#### ⚡ Phase 3: Context (Production Code)
```typescript
export const SUPPORTED_RPC_METHODS = [
  "getAccountInfo",
  "getBalance",
  "sendTransaction",
  "getSlot"
] as const;

// Автоматическое получение типа Union: "getAccountInfo" | "getBalance" | ...
export type RpcMethod = typeof SUPPORTED_RPC_METHODS[number];

export function executeRpcCall(method: RpcMethod) {
  console.log("Вызов RPC метода:", method);
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Паттерн `Single Source of Truth`: объявляйте массив констант через `as const`, а тип выводите через `typeof arr[number]`, избегая дублирования списка значений.
- Доступ по индексу работает с именованными полями: `Config["network"]["timeout"]` возвращает тип конкретного глубокого свойства.

---

### [TS] 14. `unknown` vs `any` vs `never`: Type Lattice Hierarchy
* **Category:** `TypeScript Core`
* **Quick Copy:** `// unknown: Top (безопасный). never: Bottom (пустой). any: Дыра (отключает проверки).`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `TypeSystem`, `unknown`, `never`, `any`

> 🛡️ **Главный инвариант:** Использование `any` заражает кодовую базу как вирус, отключая проверку типов во всех связанных местах. Любые внешние нетипизированные данные обязаны маркироваться как `unknown` и сужаться через валидаторы.

#### 📌 Phase 1: Deconstruction (Architecture)
- **`any`:** Отключает работу тайпчекера. Разрешает любые операции и вызовы методов вслепую.
- **`unknown`:** Разрешает присвоить любое значение, но **запрещает вызывать любые методы или читать поля**, пока тип не будет доказан компилятору через `typeof`, `instanceof` или Type Guard.
- **`never`:** Множество, не содержащее элементов. Нельзя присвоить ничего.

#### 💡 Phase 2: Analogy (Mental Model)
`unknown` — это запечатанная посылка из неизвестного источника: её можно принять на склад, но нельзя открывать без сапёров. `any` — это отключение всех детекторов и пропуск посылки прямо в зал заседаний. `never` — это черная дыра, куда не может проникнуть ни одна частица материи.

#### ⚡ Phase 3: Context (Production Code)
```typescript
// Демонстрация безопасного шлюза:
export function parseExternalMessage(rawJson: string): unknown {
  return JSON.parse(rawJson); // Возвращаем unknown ВМЕСТО any!
}

export function handleIncoming(rawPayload: string) {
  const data: unknown = parseExternalMessage(rawPayload);

  // data.doSomething(); // ❌ Ошибка TS: 'data' is of type 'unknown'!

  if (typeof data === "object" && data !== null && "cmd" in data) {
    // Сужение до безопасного подтипа
    const candidate = data as { cmd: unknown };
    console.log("Команда принята:", candidate.cmd);
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Замените все возвраты внешних парсеров (`JSON.parse`, сетевые библиотеки) с `any` на `unknown`.
- Пересечение с `never` дает `never` (`T & never = never`), а объединение с `never` поглощается (`T | never = T`).

---

### [TS] 15. Method Shorthand vs Property Bivariance Trap
* **Category:** `TypeScript Gotchas`
* **Quick Copy:** `interface Safe { fn: (x: string) => void; } // НЕ: { fn(x: string): void; }`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `Gotchas`, `Bivariance`, `MethodShorthand`, `Strict`

> 🛡️ **Главный инвариант:** Метод, объявленный через синтаксис сокращения `{ method(arg: string): void }`, по историческим причинам остается **бивариантным** даже при флаге `--strictFunctionTypes`. Для строгой контравариантной проверки параметров всегда объявляйте методы как свойства со стрелочной функцией `{ method: (arg: string) => void }`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Исторический компромисс:** Синтаксис `{ method(x: T): void }` был разработан до появления строгой проверки функций и оставлен бивариантным ради совместимости с встроенными массивами `Array<T>`.
- **Синтаксис функционального свойства:** `{ method: (x: T) => void }` подчиняется флагу `--strictFunctionTypes` и проверяет параметры контравариантно.

#### 💡 Phase 2: Analogy (Mental Model)
Методный синтаксис — это старая деревянная калитка с щеколдой, которую открыли для удобства прохода 20 лет назад. Функциональное свойство — это современный электронный турникет с антипаникой, строго следящий за направлением движения.

#### ⚡ Phase 3: Context (Production Code)
```typescript
interface InsecureHandler {
  // ❌ БИВАРИАНТНЫЙ МЕТОД: компилятор пропустит опасное присваивание!
  process(data: string): void;
}

interface SecureHandler {
  // ✅ СТРОГОЕ ФУНКЦИОНАЛЬНОЕ СВОЙСТВО: контравариантная проверка!
  process: (data: string) => void;
}

let genericLogger = (x: string | number) => console.log(x);
let strictKeyLogger = (x: "SPECIAL_KEY") => console.log(x.toLowerCase());

// InsecureHandler разрешит присвоить strictKeyLogger, что приведет к падению в рантайме!
// SecureHandler выдаст строгую ошибку компиляции TS!
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Все интерфейсы сервисов, колбэков и обработчиков событий объявляйте через синтаксис свойств со стрелочной функцией: `handle: (event: Event) => void`.
- Используйте методный синтаксис только если вам намеренно требуется перегрузка методов внутри одного интерфейса.

---

### [TS] 16. Utility Types Deconstructed: Inside `ReturnType` & `Awaited`
* **Category:** `TypeScript Advanced`
* **Quick Copy:** `type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : any;`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `UtilityTypes`, `ReturnType`, `Awaited`, `Internals`

> 🛡️ **Главный инвариант:** Стандартные утилитарные типы TypeScript — это не магия компилятора, а компактные комбинации условных типов и ключевого слова `infer`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Механика `ReturnType<T>`:** Проверка `T extends (...args: any[]) => infer R ? R : any`. Если передан тип функции, компилятор извлекает тип возвращаемого значения.
- **Рекурсивный `Awaited<T>`:** Разворачивает `thenable`-структуры до базового значения, проходя сквозь любые уровни вложенных промисов `Promise<Promise<T>>`.

#### 💡 Phase 2: Analogy (Mental Model)
Утилитарные типы — это рецепты на кухне молекулярной кулинарии: они не создают новые ингредиенты из воздуха, а разделяют молекулы исходного блюда (`infer`) и собирают из них чистую эссенцию.

#### ⚡ Phase 3: Context (Production Code)
```typescript
// Деконструкция нативного Awaited (рекурсивная распаковка всех вложенных Promise)
export type CustomAwaited<T> = T extends null | undefined
  ? T
  : T extends object & { then(onfulfilled: infer F, ...args: infer _): any }
  ? F extends (value: infer V, ...args: infer _) => any
    ? CustomAwaited<V>
    : never
  : T;

type DeepPromise = Promise<Promise<Promise<number>>>;
type CleanNumber = CustomAwaited<DeepPromise>; // number!
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Изучение исходников `lib.es5.d.ts` позволяет быстро освоить продвинутые техники создания кастомных мета-типов.
- При создании кастомных аналогов утилит всегда учитывайте граничные значения `null` и `undefined`.

---

### [TS] 17. Decorators in TypeScript 5.0 (ECMAScript Stage 3)
* **Category:** `TypeScript Modern`
* **Quick Copy:** `function logged(target: Function, ctx: ClassMethodDecoratorContext) { ... }`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `TS5.0`, `Decorators`, `Metaprogramming`, `ES2024`

> 🛡️ **Главный инвариант:** Устаревшие `experimentalDecorators` требовали генерации лишних метаданных `reflect-metadata`. Стандартные декораторы TypeScript 5.0+ полностью соответствуют спецификации TC39 и типизируют методы через типизированный `ClassMethodDecoratorContext`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Стандарт TC39 Stage 3:** Новые декораторы являются чистыми функциями, принимающими декорируемую сущность и типизированный объект контекста (`ClassMethodDecoratorContext`, `ClassFieldDecoratorContext`).
- **Отсутствие полифилов:** Больше не требуется флаг `experimentalDecorators` и библиотека `reflect-metadata`.

#### 💡 Phase 2: Analogy (Mental Model)
Старые декораторы были как неофициальная перепланировка квартиры с установкой нестандартных труб. Стандартные декораторы TS 5.0 — это модульные умные розетки, сертифицированные по международному стандарту ISO.

#### ⚡ Phase 3: Context (Production Code)
```typescript
export function auditLogMethod<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>
) {
  const methodName = String(context.name);

  return function (this: This, ...args: Args): Return {
    console.log(`[Audit] Вызов метода ${methodName} с аргументами:`, args);
    const result = target.apply(this, args);
    console.log(`[Audit] Метод ${methodName} вернул:`, result);
    return result;
  };
}

export class VaultService {
  @auditLogMethod
  transferLamports(to: string, amount: bigint) {
    return `OK: ${amount} to ${to}`;
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Для использования стандартных декораторов удалите `"experimentalDecorators": true` из `tsconfig.json`.
- Объект `context` предоставляет метаданные о приватности (`context.private`), статичности (`context.static`) и методе добавления инициализатора (`context.addInitializer`).

---

### [TS] 18. Module Augmentation & Declaration Merging
* **Category:** `TypeScript Architecture`
* **Quick Copy:** `declare global { namespace Express { interface Request { user: User; } } }`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `ModuleAugmentation`, `DeclarationMerging`, `Types`, `Express`

> 🛡️ **Главный инвариант:** Вместо грязного приведения типов `(req as any).user` расширяйте существующие интерфейсы сторонних библиотек через механизм слияния объявлений (Declaration Merging).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Слияние интерфейсов (Interface Merging):** Два интерфейса с одинаковым именем в одной области видимости объединяют свои поля.
- **Расширение модулей (Module Augmentation):** Конструкция `declare module 'pkg'` позволяет дописать свойства к объектам внешних библиотек без форка репозитория.

#### 💡 Phase 2: Analogy (Mental Model)
Module Augmentation — это официальное внесение дополнительной страницы в заграничный паспорт: вам не нужно менять паспорт целиком, чтобы консульство вклеило новую действующую визу.

#### ⚡ Phase 3: Context (Production Code)
```typescript
// types/environment.d.ts
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NODE_ENV: "development" | "production" | "test";
      readonly SOLANA_RPC_URL: string;
      readonly PRIVATE_MASTER_KEY: string;
    }
  }
}

// Теперь process.env.SOLANA_RPC_URL строго типизирован и автодополняется в IDE!
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Файл с расширением обязан быть модулем (содержать хотя бы один `import` или `export {}`), иначе он будет воспринят как глобальный скрипт и перезапишет модуль вместо расширения.
- Расширяйте только интерфейсы, но не алиасы типов (`type`), так как типы не поддерживают Declaration Merging.

---

### [TS] 19. Ambient Declarations & Untyped JS Wrapping
* **Category:** `TypeScript Types`
* **Quick Copy:** `declare module 'legacy-crypto-pkg' { export function hash(data: string): string; }`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `AmbientDeclarations`, `Legacy`, `dts`, `Interoperability`

> 🛡️ **Главный инвариант:** При подключении старых NPM-библиотек без типов не отключайте `noImplicitAny`. Создайте файл `declarations.d.ts` и опишите строгий контракт нужного модуля через `declare module`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Файлы объявлений (`.d.ts`):** Сообщают компилятору форму API без генерации JavaScript-бандла.
- **Ключевое слово `declare`:** Указывает тайпчекеру, что сущность существует в рантайме (создана другим скриптом или внешней средой).

#### 💡 Phase 2: Analogy (Mental Model)
Ambient Declaration — это архитектурный чертеж здания, построенного 100 лет назад: он не содержит кирпичей, но позволяет современным инженерам точно знать, где проходят несущие балки и водопровод.

#### ⚡ Phase 3: Context (Production Code)
```typescript
// declarations/legacy-crypto.d.ts
declare module "legacy-crypto-pkg" {
  export interface HashOptions {
    algorithm: "sha256" | "sha512";
    encoding?: "hex" | "base64";
  }

  export function createSecureHash(data: string, options?: HashOptions): string;
  export const ENGINE_VERSION: string;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Не объявляйте внешние типы как `any` внутри `d.ts` файлов — описывайте хотя бы базовые контракты функций и параметров.
- Убедитесь, что папка с декларациями включена в массив `"include"` в `tsconfig.json`.

---

### [TS] 20. Function Overloads vs Conditional Return Types
* **Category:** `TypeScript Patterns`
* **Quick Copy:** `function fetch(id: string): Item; function fetch(): Item[];`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `Overloads`, `Generics`, `CleanCode`

> 🛡️ **Главный инвариант:** Сигнатура реализации перегруженной функции **не видна вызывающему коду снаружи**. Снаружи видны исключительно перегруженные сигнатуры (Overload Signatures).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Разделение интерфейса и реализации:** Публичные перегрузки определяют внешние контракты, а единая функция реализации (Implementation Signature) агрегирует типы аргументов и возврата.
- **Порядок вычисления:** Компилятор сопоставляет аргументы с первой подходящей сигнатурой сверху вниз.

#### 💡 Phase 2: Analogy (Mental Model)
Перегрузки функций — это фасад многоквартирного дома с отдельными входами для жильцов и для службы доставки. Снаружи кажется, что это два разных входа, но внутри они ведут в единую служебную зону.

#### ⚡ Phase 3: Context (Production Code)
```typescript
// 1. Публичные перегрузки (API контракт)
export function getStorageData(key: string): string;
export function getStorageData(key: null): Record<string, string>;

// 2. Сигнатура реализации (скрыта внутри)
export function getStorageData(key: string | null): string | Record<string, string> {
  if (key) return `value_for_${key}`;
  return { all: "data" };
}

const single = getStorageData("token"); // Возвращает строго string
const batch = getStorageData(null);     // Возвращает строго Record<string, string>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Сигнатуры перегрузок обязаны идти строго друг за другом без промежуточных строк кода перед сигнатурой реализации.
- Порядок перегрузок имеет значение: более специфичные типы должны идти первыми, иначе более широкий тип перехватит все вызовы.

---

### [TS] 21. Enums vs Const Objects with `as const`
* **Category:** `TypeScript BestPractices`
* **Quick Copy:** `export const Status = { PENDING: 'PENDING' } as const; export type Status = typeof Status[keyof typeof Status];`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `Enums`, `asConst`, `Performance`, `AntiPattern`

> 🛡️ **Главный инвариант:** Традиционные `enum` в TypeScript генерируют дополнительный JavaScript-код со сложными обратными связями (Reverse Mapping) и не поддерживают изоляцию модулей (`isolatedModules`). Идиоматический современный стандарт — использование `const object` с фиксацией `as const`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Проблемы TS `enum`:** Генерируют IIFE-функцию в рантайме, добавляют избыточный JS-код, числовые енамы небезопасны (допускают присваивание любого `number`).
- **Преимущества `const object`:** Нулевой оверхед, тривиальная изоляция модулей (`isolatedModules`), идеальная сериализация в JSON и совместимость со всеми бандлерами.

#### 💡 Phase 2: Analogy (Mental Model)
Enum — это громоздкий механический телефонный коммутатор 1950-х годов с проводами и оператором. Объект `as const` — это быстрый QR-код со списком прямых номеров: компактный, невесомый и считываемый моментально.

#### ⚡ Phase 3: Context (Production Code)
```typescript
// ✅ ИДИОМАТИЧЕСКИЙ СТАНДАРТ ТИПИЗАЦИИ СТАТУСОВ
export const TxStatus = {
  SUBMITTED: "SUBMITTED",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED"
} as const;

// Единое имя для значения и типа:
export type TxStatus = typeof TxStatus[keyof typeof TxStatus];

export function checkStatus(status: TxStatus) {
  if (status === TxStatus.CONFIRMED) {
    console.log("Успех!");
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Имя объекта и имя типа объявляются с одним и тем же идентификатором: `export const Role = { ... } as const; export type Role = typeof Role[keyof typeof Role];`.
- Это позволяет использовать `Role` и как значение в рантайме (`Role.ADMIN`), и как тип в аргументах (`userRole: Role`).

---

### [TS] 22. Deep Path Dot-Notation Autocomplete
* **Category:** `TypeScript Advanced`
* **Quick Copy:** `type Path<T> = T extends object ? { [K in keyof T]: \`\${K & string}.\${Path<T[K]>}\` }[keyof T] : '';`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `PathTraversal`, `Autocomplete`, `Generics`, `Metaprogramming`

> 🛡️ **Главный инвариант:** Рекурсивные шаблонные типы вычисляют все возможные строковые пути к вложенным свойствам объекта, предоставляя идеальный автокомплит в IDE для функций типа `get(obj, "user.wallet.balance")`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Рекурсивный шаблонный поиск:** Компилятор обходит граф объекта и строит объединение строк вида `${K}.${SubPath}`.
- **Ограничение глубины рекурсии:** Для предотвращения переполнения стека компилятора глубина обхода ограничивается базовым условием или счетчиком кортежа.

#### 💡 Phase 2: Analogy (Mental Model)
Dot-Notation Autocomplete — это спутниковый навигатор в автомобиле: как только вы вводите первый поворот (`account.`), он моментально подсвечивает все существующие улицы и дома внутри этого района.

#### ⚡ Phase 3: Context (Production Code)
```typescript
export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

interface UserState {
  account: {
    address: string;
    metrics: {
      score: number;
    };
  };
}

// Допустимые пути: "account" | "account.address" | "account.metrics" | "account.metrics.score"
export function watchField<T extends object>(state: T, path: NestedKeyOf<T>) {
  console.log("Слушаем поле:", path);
}

watchField({ account: { address: "0x1", metrics: { score: 10 } } }, "account.metrics.score");
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Избегайте применения глубоких путей на циклических структурах данных — TypeScript завершит работу с ошибкой рекурсии.
- Для извлечения типа значения по пути объединяйте `NestedKeyOf<T>` с утилитой `DeepValue<T, Path>`.

---

### [TS] 23. Type-Safe State Machine Builder (Fluent API)
* **Category:** `TypeScript Architecture`
* **Quick Copy:** `class Builder<State> { step1(): Builder<State & HasStep1> { ... } }`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `BuilderPattern`, `StateMachine`, `Architecture`

> 🛡️ **Главный инвариант:** Паттерн Строитель на дженериках состояний делает невозможным вызов метода `.build()` до тех пор, пока не были вызваны все обязательные методы конфигурации (проверка инвариантов на уровне типов во время набора кода).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Фантомные состояния в дженериках:** Класс отслеживает накопленные свойства через параметр типа `TState`, объединяя интерфейсы шагов через пересечение (`TState & HasStep`).
- **Ограничение контекста `this`:** Метод `.build()` требует `this: Builder<CompleteState>`, делая его невидимым или ошибочным при вызове на незавершенном объекте.

#### 💡 Phase 2: Analogy (Mental Model)
Type-Safe Builder — это посадка в самолет по посадочному талону: вы не можете пройти в телетрап (`build`), пока на талоне не появятся все обязательные печати (досмотр безопасности и паспортный контроль).

#### ⚡ Phase 3: Context (Production Code)
```typescript
interface EmptyState {}
interface HasRecipient { recipient: string }
interface HasAmount { amount: number }

export class SafeTransactionBuilder<TState = EmptyState> {
  private data: Partial<HasRecipient & HasAmount> = {};

  setRecipient(recipient: string): SafeTransactionBuilder<TState & HasRecipient> {
    this.data.recipient = recipient;
    return this as any;
  }

  setAmount(amount: number): SafeTransactionBuilder<TState & HasAmount> {
    this.data.amount = amount;
    return this as any;
  }

  // Метод build доступен ТОЛЬКО когда TState содержит и получателя, и сумму!
  build(this: SafeTransactionBuilder<HasRecipient & HasAmount>) {
    return {
      recipient: this.data.recipient!,
      amount: this.data.amount!,
      timestamp: Date.now()
    };
  }
}

// Тест:
new SafeTransactionBuilder()
  .setRecipient("Solana_Vault_Key")
  .setAmount(100)
  .build(); // ✅ Успех!

// new SafeTransactionBuilder().setRecipient("Key").build(); 
// ❌ Ошибка TS: Property 'amount' is missing in type!
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Приведение `return this as any;` изолировано внутри методов билдера и не протекает в клиентский код.
- Данный паттерн гарантирует, что ошибки сборки конфигурации ловятся еще в процессе набора текста в IDE, а не при падении продакшн-сервера.

---

### [TS] 24. NoInfer Utility: Targeted Generic Suppression (TS 5.4+)
* **Category:** `TypeScript Modern`
* **Quick Copy:** `function select<T>(options: T[], defaultVal: NoInfer<T>): T { ... }`
* **Status:** `Actual`
* **Tags:** `TypeScript`, `TS5.4`, `NoInfer`, `Generics`, `Inference`

> 🛡️ **Главный инвариант:** По умолчанию TypeScript пытается вывести дженерик `T` из всех аргументов, где он упомянут, что приводит к нежелательному расширению типов объединения. Встроенная утилита `NoInfer<T>` запрещает компилятору выводить тип из конкретного параметра.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Проблема жадного вывода типов:** Если параметр типа `T` используется в нескольких аргументах, TypeScript вычисляет объединение (Union) всех переданных типов.
- **Изоляция вывода через `NoInfer<T>`:** Компилятор блокирует вывод типа `T` из помеченного аргумента, заставляя определять `T` исключительно по другим неизолированным параметрам.

#### 💡 Phase 2: Analogy (Mental Model)
Обычный вывод типов — это демократическое голосование, где каждый аргумент предлагает свой вариант типа. `NoInfer` лишает конкретный аргумент права голоса: он обязан подчиниться тому решению, которое принял первый аргумент.

#### ⚡ Phase 3: Context (Production Code)
```typescript
// Без NoInfer: если передать defaultOption = "DOG", TypeScript расширит T до ("CAT" | "DOG")!
// С NoInfer: T выводится СТРОГО из первого аргумента!
export function createStrictSelector<T extends string>(
  validOptions: T[],
  defaultOption: NoInfer<T> // Запрещаем вывод типа из этого параметра
) {
  return { validOptions, defaultOption };
}

// Допустимые опции строго "SOL" и "USDC"
createStrictSelector(["SOL", "USDC"], "SOL"); // ✅ Успех

// createStrictSelector(["SOL", "USDC"], "BTC");
// ❌ Ошибка компиляции TS 5.4: Argument of type '"BTC"' is not assignable to parameter of type '"SOL" | "USDC"'!
```

#### 💎 Phase 4: Crystallization (Key Insights)
- До появления `NoInfer` в TS 5.4 разработчики использовали костыли вида `[T][T extends any ? 0 : never]`. Теперь есть официальный чистый примитив.
- Используйте `NoInfer` в фабриках, селекторах и функциях с параметрами по умолчанию, чтобы избежать случайного расширения допустимых вариантов.
