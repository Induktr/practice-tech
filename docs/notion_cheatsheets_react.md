# 📚 Мастер-База: 22 Шпаргалки по React 18 & 19 Architecture
### Стандарт: Induktr Studio 4-Phase Notion Architecture

---

### [REACT] 01. `useTransition` & Non-Blocking Concurrent Updates
* **Category:** `React Concurrent`
* **Quick Copy:** `const [isPending, startTransition] = useTransition(); startTransition(() => setQuery(val));`
* **Status:** `Actual`
* **Tags:** `React`, `React18`, `Concurrent`, `useTransition`, `Performance`

> 🛡️ **Главный инвариант:** Не все обновления состояния одинаково важны. Ввод текста в инпут — это срочное (Urgent) обновление, а фильтрация 10 000 элементов списка — фоновое (Transition). Оборачивание тяжелого стейта в `startTransition` сохраняет отклик клавиатуры на 120 FPS, прерывая тяжелый рендеринг при каждом новом нажатии клавиши.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Приоритеты в планировщике (Scheduler):** React делит задачи на уровни приоритета. Обновления внутри `startTransition` помечаются низким приоритетом (`TransitionLane`).
- **Прерываемый рендеринг (Interruptible Render):** Если пользователь продолжает печатать, React приостанавливает рендеринг тяжелого списка, обрабатывает нажатие клавиши, а затем возобновляет работу с новым значением.
- **Флаг `isPending`:** Позволяет показать ненавязчивый индикатор (полупрозрачность старого списка) вместо блокирующего экран спиннера.

#### 💡 Phase 2: Analogy (Mental Model)
Инпут — это разговор с живым клиентом у стойки (высокий приоритет). Тяжелый список — это заполнение архивных отчетов (низкий приоритет). С `useTransition` оператор не игнорирует клиента, а откладывает отчет в сторону при каждом новом вопросе.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useState, useTransition } from "react";

export function TransactionSearchFilter({ allTransactions }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredList, setFilteredList] = useState(allTransactions);
  const [isPending, startTransition] = useTransition();

  function handleInputChange(e) {
    const value = e.target.value;
    
    // 1. Срочное обновление: инпут откликается мгновенно
    setSearchTerm(value);

    // 2. Фоновое обновление: фильтрация не блокирует ввод текста
    startTransition(() => {
      const filtered = allTransactions.filter(tx => 
        tx.id.toLowerCase().includes(value.toLowerCase()) ||
        tx.recipient.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredList(filtered);
    });
  }

  return (
    <div className="filter-container">
      <input 
        type="search" 
        value={searchTerm} 
        onChange={handleInputChange} 
        placeholder="Поиск по хешу или адресу..."
      />

      {/* Индикация устаревшего состояния без скрытия контента */}
      <div style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}>
        {filteredList.map(tx => (
          <div key={tx.id} className="tx-row">{tx.id} — {tx.amount} SOL</div>
        ))}
      </div>
    </div>
  );
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Функция, переданная в `startTransition`, должна быть **строго синхронной**. Передавать внутрь `async () => { ... }` запрещено спецификацией React 18.
- Не оборачивайте в транзакции контролируемый ввод текста (`setSearchTerm`) — это приведет к ощутимому лагу отображения вводимых символов в самом инпуте.

---

### [REACT] 02. `useDeferredValue` with Stale UI Indication
* **Category:** `React Concurrent`
* **Quick Copy:** `const deferredVal = useDeferredValue(val); const isStale = val !== deferredVal;`
* **Status:** `Actual`
* **Tags:** `React`, `React18`, `Performance`, `useDeferredValue`, `Concurrent`

> 🛡️ **Главный инвариант:** В отличие от `useTransition` (который оборачивает вызов сеттера), `useDeferredValue` откладывает обновление **значения** (пропса или стейта), когда у вас нет прямого доступа к функции-сеттеру. Условие `value !== deferredValue` дает нативный флаг устаревшего состояния без оверхеда.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Механика двух проходов:** React сначала рендерит компонент с новым значением в инпуте и со *старым* `deferredValue`. После завершения критического кадра React инициирует второй фоновый проход для вычисления отложенного дерева.
- **Преимущество перед Debounce:** `useDeferredValue` не имеет фиксированной задержки (300мс). На мощном ПК он обновится за 5мс, на слабом смартфоне подождет освобождения потока.

#### 💡 Phase 2: Analogy (Mental Model)
Традиционный Debounce — это таймер на светофоре: вы стоите 300мс даже на пустой дороге. `useDeferredValue` — это умный датчик движения: как только на перекрестке нет помех, сразу включается зеленый свет.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useDeferredValue, memo } from "react";

export function AccountExplorer({ query }) {
  // Откладываем обновление тяжелого графа
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div className="explorer-layout" style={{ opacity: isStale ? 0.5 : 1 }}>
      <HeavyAccountGraph query={deferredQuery} />
    </div>
  );
}

// Дочерний компонент обязан быть обернут в memo, 
// чтобы React пропустил его рендер на первом срочном проходе!
const HeavyAccountGraph = memo(function HeavyAccountGraph({ query }) {
  // Тяжелые вычисления графа ончейн-связей...
  return <div className="graph-view">Данные для: {query}</div>;
});
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Дочерний компонент, принимающий `deferredValue`, **обязан быть мемоизирован через `React.memo`**, иначе родительский рендер все равно перерендерит его синхронно, нивелируя всю оптимизацию!
- В React 19 хук `useDeferredValue` получил поддержку второго аргумента `initialValue`: `useDeferredValue(val, '')` для оптимизации первого серверного рендера.

---

### [REACT] 03. `useOptimistic`: Instant Latency Elimination (React 19)
* **Category:** `React 19`
* **Quick Copy:** `const [optState, setOpt] = useOptimistic(state, (cur, update) => [...cur, update]);`
* **Status:** `Actual`
* **Tags:** `React`, `React19`, `useOptimistic`, `UX`, `ServerActions`

> 🛡️ **Главный инвариант:** Ожидание сетевого ответа перед обновлением UI создает ощущение медленного приложения. `useOptimistic` моментально отображает предполагаемый результат, а в случае ошибки сервера автоматически откатывает UI к исходному состоянию без ручного сохранения снапшотов.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Связка с Transitions:** Функция `setOptimistic` работает только внутри транзакций или Server Actions.
- **Автоматический откат:** Пока асинхронное действие активно, React отображает оптимистичное состояние. Как только промис завершается, React возвращается к истинному серверному стейту. Если промис упал с ошибкой, оптимистичное значение отбрасывается само.

#### 💡 Phase 2: Analogy (Mental Model)
Отправка сообщения в мессенджере: текст сразу появляется в ленте с серыми часиками. Если интернет пропал — появляется красный восклицательный знак. Вам не нужно ждать подтверждения от сервера, чтобы увидеть свои слова на экране.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useOptimistic, useState } from "react";

export function TransactionFeed({ initialTxs, sendTxAction }) {
  const [transactions, setTransactions] = useState(initialTxs);

  // Оптимистичный стейт с редюсером
  const [optimisticTxs, addOptimisticTx] = useOptimistic(
    transactions,
    (currentTxs, newTx) => [
      { ...newTx, status: "PENDING_CONFIRMATION", isOptimistic: true },
      ...currentTxs
    ]
  );

  async function handleSend(formData) {
    const amount = Number(formData.get("amount"));
    const tempTx = { id: `temp_${Date.now()}`, amount, recipient: "Solana Vault" };

    // 1. Мгновенное обновление UI для пользователя
    addOptimisticTx(tempTx);

    // 2. Реальный сетевой вызов
    try {
      const confirmedTx = await sendTxAction(formData);
      setTransactions(prev => [confirmedTx, ...prev]);
    } catch (err) {
      console.error("Транзакция отклонена нодой:", err);
      // useOptimistic автоматически сотрет временную запись при завершении action!
    }
  }

  return (
    <div>
      <form action={handleSend}>
        <input name="amount" type="number" required />
        <button type="submit">Отправить SOL</button>
      </form>

      <ul>
        {optimisticTxs.map(tx => (
          <li key={tx.id} style={{ color: tx.isOptimistic ? "#a1a1aa" : "#fff" }}>
            {tx.amount} SOL {tx.isOptimistic && "(Отправка в сеть...)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Не сохраняйте временные идентификаторы `temp_id` в базу данных. Оптимистичные объекты должны служить исключительно визуальной заглушкой до получения настоящего ончейн-хэша транзакции.
- `useOptimistic` не мутирует базовый стейт: он держит параллельный временный слой поверх актуального состояния, пока жива вызвавшая его транзакция.

---

### [REACT] 04. `useActionState`: Native Form Lifecycle (React 19)
* **Category:** `React 19`
* **Quick Copy:** `const [state, formAction, isPending] = useActionState(actionFn, initialState);`
* **Status:** `Actual`
* **Tags:** `React`, `React19`, `Forms`, `useActionState`, `ServerActions`

> 🛡️ **Главный инвариант:** Больше не нужно объявлять три независимых стейта (`isLoading`, `error`, `data`) для каждой формы. Хук `useActionState` берет на себя управление жизненным циклом отправки формы, возвращая актуальный стейт, экшен и индикатор `isPending`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Прогрессивное улучшение:** Формы с `action={formAction}` способны отправлять данные даже до завершения гидратации JavaScript на клиенте (через нативный браузерный HTTP POST).
- **Подпись экшена:** Функция-экшен принимает `(previousState, formData)` и обязана вернуть новое состояние. Внутренне экшен всегда выполняется внутри транзакции React.

#### 💡 Phase 2: Analogy (Mental Model)
`useActionState` — это пневмопочта в банке: вы опускаете капсулу с чеком в трубу (`formAction`), оператор в хранилище выполняет проводку, а окошко трубы само светится жёлтым (`isPending`), пока документ не вернётся с печатью или штампом «отказано» (`state.error`).

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useActionState } from "react";

async function updateLamportsAction(prevState, formData) {
  const newBalance = Number(formData.get("balance"));
  if (newBalance < 0) {
    return { success: false, error: "Баланс не может быть отрицательным", balance: prevState.balance };
  }

  const result = await fetch("/api/account/balance", {
    method: "POST",
    body: JSON.stringify({ balance: newBalance })
  });

  if (!result.ok) {
    return { success: false, error: "RPC ошибка обновления", balance: prevState.balance };
  }

  return { success: true, error: null, balance: newBalance };
}

export function BalanceEditor({ currentBalance }) {
  const [state, formAction, isPending] = useActionState(updateLamportsAction, {
    success: null,
    error: null,
    balance: currentBalance
  });

  return (
    <form action={formAction} className="balance-form">
      <p>Текущий баланс: {state.balance} lamports</p>
      
      <input name="balance" type="number" defaultValue={state.balance} disabled={isPending} />
      
      <button type="submit" disabled={isPending}>
        {isPending ? "Сохранение в блокчейне..." : "Обновить баланс"}
      </button>

      {state.error && <p className="error-banner">{state.error}</p>}
      {state.success && <p className="success-banner">Баланс синхронизирован!</p>}
    </form>
  );
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- `useActionState` не блокирует UI при отправке формы — внутри него неявно используется транзакция (`startTransition`), поэтому анимации и другие поля остаются отзывчивыми.
- Сигнатура экшена строго требует возврата нового стейта `(prevState, formData) => newState`. Если забыть вернуть предыдущий стейт при ошибке, локальное состояние сбросится в `undefined`.

---

### [REACT] 05. `useId`: Bulletproof SSR Accessible IDs
* **Category:** `React A11y`
* **Quick Copy:** `const id = useId(); <label htmlFor={id}>Name</label><input id={id} />`
* **Status:** `Actual`
* **Tags:** `React`, `useId`, `SSR`, `Hydration`, `A11y`

> 🛡️ **Главный инвариант:** Генерация идентификаторов через `Math.random()` или глобальные счетчики вызывает фатальную ошибку **Hydration Mismatch** (несовпадение HTML сервера и клиента). Хук `useId` генерирует стабильные детерминированные ID на основе позиции компонента в дереве React.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Иерархический путь:** `useId` кодирует путь к компоненту в дереве слотов (например, `:r1:`, `:r2:`). Сервер и клиент обходят дерево абсолютно одинаково, поэтому сгенерированные строки идентичны до байта.
- **Составные префиксы:** Один вызов `useId()` можно использовать для нескольких связанных полей одного компонента (`${id}-input`, `${id}-hint`, `${id}-error`).

#### 💡 Phase 2: Analogy (Mental Model)
`useId` — это генеалогический кадастровый номер земельного участка (улица 2, дом 4, комната 1), который одинаково читается геодезистами и на сервере, и в браузере. `Math.random()` — это случайное бросание костей, из-за которого сервер и браузер видят разные координаты одного и того же дома.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useId } from "react";

export function AccessibleTokenInput({ label, error }) {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const hintId = `${baseId}-hint`;
  const errorId = `${baseId}-error`;

  return (
    <div className="input-group">
      <label htmlFor={inputId}>{label}</label>
      <input 
        id={inputId} 
        aria-describedby={error ? errorId : hintId}
        aria-invalid={Boolean(error)}
      />
      <small id={hintId}>Введите сумму в целых Lamports</small>
      {error && <span id={errorId} role="alert" className="error">{error}</span>}
    </div>
  );
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Никогда не используйте `useId` для генерации CSS-селекторов (например, `.querySelector('#' + id)`) — двоеточия `:` внутри сгенерированной строки считаются недопустимыми символами в стандартных селекторах CSS без экранирования.
- `useId` не предназначен для генерации `key` в списках: ключи списков обязаны привязываться к уникальным идентификаторам данных, а не к позиции в дереве слотов.

---

### [REACT] 06. `useImperativeHandle`: Controlled Ref Encapsulation
* **Category:** `React Architecture`
* **Quick Copy:** `useImperativeHandle(ref, () => ({ focus: () => inputRef.current.focus() }));`
* **Status:** `Actual`
* **Tags:** `React`, `Refs`, `useImperativeHandle`, `Encapsulation`, `Security`

> 🛡️ **Главный инвариант:** Передача прямого доступа к реальному DOM-узлу (`ref`) родительскому компоненту нарушает инкапсуляцию: родитель может случайно удалить стили или сломать атрибуты ребенка. `useImperativeHandle` открывает строго определенный белый список методов (*Public API*).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Инкапсуляция DOM-дерева:** По умолчанию прямой доступ к `HTMLInputElement` позволяет родителю вызывать деструктивные методы (`remove()`, прямое изменение inline-стилей или приватных дата-атрибутов).
- **Инверсия контроля через прокси:** `useImperativeHandle` перехватывает ссылку, переданную в `ref`, и ассоциирует её с создаваемым кастомным объектом интерфейса. Внутренний DOM-узел остаётся полностью изолированным в замыкании компонента.

#### 💡 Phase 2: Analogy (Mental Model)
`useImperativeHandle` — это банковское окно с бронированным стеклом: клиент снаружи может передать паспорт и попросить выписку через лоток (`focusTerminal()`), но не может перелезть через стойку и самостоятельно нажимать кнопки на компьютере оператора.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useRef, useImperativeHandle } from "react";

// В React 19 проп ref передается напрямую без forwardRef!
export function SecureTerminal({ ref }) {
  const internalInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    // Предоставляем родителю ТОЛЬКО два безопасных метода:
    focusTerminal: () => {
      internalInputRef.current?.focus();
    },
    clearPayload: () => {
      if (internalInputRef.current) internalInputRef.current.value = "";
    }
  }), []);

  return <textarea ref={internalInputRef} className="secure-cli" />;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Всегда указывайте массив зависимостей третьим аргументом `useImperativeHandle(ref, createHandle, [deps])`. Пустой массив `[]` гарантирует стабильность ссылок на методы между рендерами.
- В React 19 больше не нужен `forwardRef` — компонент принимает `ref` прямо как стандартный пропс `{ ref, ...props }`.

---

### [REACT] 07. The Stale Closure Trap & Functional State Updates
* **Category:** `React Gotchas`
* **Quick Copy:** `setCount(prev => prev + 1); // ВСЕГДА вместо: setCount(count + 1)`
* **Status:** `Actual`
* **Tags:** `React`, `Hooks`, `useState`, `Closures`, `Gotchas`

> 🛡️ **Главный инвариант:** Асинхронные колбэки (`setTimeout`, `fetch.then`, WebSocket) замыкают значение стейта на момент своего создания. Вызов `setCount(count + 1)` в замыкании перезапишет актуальное состояние старым значением. Единственная защита — передача колбэка обновления `setCount(prev => prev + 1)`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Лексический снимок:** Функция закрывается над локальной константой `count`. Если за время сетевого запроса состояние изменилось 5 раз, вызов `setCount(count + 1)` сбросит счетчик назад.
- **Очередь вычислений V8:** Функция `prev => prev + 1` ставится в очередь ядра Fiber и вычисляется непосредственно перед следующим рендером с гарантированно самым свежим состоянием.

#### 💡 Phase 2: Analogy (Mental Model)
Вызов `setCount(count + 1)` внутри таймера похож на отправку почтового голубя с запиской «на складе сейчас 5 ящиков, добавь 1». Пока голубь летит, со склада уже отгрузили 10 ящиков. Функциональный апдейтер `setCount(prev => prev + 1)` — это приказ «добавь 1 ящик к тому, что лежит на складе прямо в момент прочтения».

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useState } from "react";

export function LiveTransactionCounter() {
  const [txCount, setTxCount] = useState(0);

  function simulateAsyncBatch() {
    setTimeout(() => {
      // ❌ БАГ УСТАРЕВШЕГО ЗАМЫКАНИЯ:
      // setTxCount(txCount + 1); 

      // ✅ ПРОДАКШН: Потокобезопасное обновление через актуальный prev
      setTxCount(prevCount => prevCount + 1);
    }, 1000);
  }

  return <button onClick={simulateAsyncBatch}>Обработано: {txCount}</button>;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Любое состояние, зависящее от собственного предыдущего значения, обязано обновляться через функцию: `setState(prev => ...)`.
- Для синхронного чтения свежего значения внутри долгих замыканий без ререндеров используйте реф-паттерн `useRef`: сохраняйте актуальное значение в `ref.current = state` при каждом рендере.

---

### [REACT] 08. `useLayoutEffect` vs `useEffect`: Paint Timing Matrix
* **Category:** `React Lifecycle`
* **Quick Copy:** `useLayoutEffect(() => { const rect = el.getBoundingClientRect(); ... }, []);`
* **Status:** `Actual`
* **Tags:** `React`, `useLayoutEffect`, `Performance`, `FOUC`, `DOM`

> 🛡️ **Главный инвариант:** `useEffect` выполняется **асинхронно после** того, как браузер нарисовал пиксели на экране (Paint). Если вы мутируете геометрию DOM в `useEffect`, пользователь заметит неприятное мерцание (Layout Flickering). `useLayoutEffect` срабатывает **синхронно до** отрисовки кадра.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Хронология:** React Commit Phase $	o$ **`useLayoutEffect`** $	o$ Расчет стилей и верстки браузером $	o$ **Paint на мониторе** $	o$ **`useEffect`**.
- **Блокировка потока:** Не выполняйте тяжелые математические расчеты в `useLayoutEffect` — они блокируют появление первого кадра на экране.

#### 💡 Phase 2: Analogy (Mental Model)
`useLayoutEffect` — это гример за кулисами: он поправляет галстук актеру до того, как открылся занавес. `useEffect` — это уборщик, который выносит мусор из зала уже после начала спектакля.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useState, useLayoutEffect, useRef } from "react";

export function AutoAlignedTooltip({ targetRect }) {
  const tooltipRef = useRef(null);
  const [topPos, setTopPos] = useState(0);

  // Измеряем высоту реального DOM элемента ДО того, как экран отобразит кадр
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      const { height } = tooltipRef.current.getBoundingClientRect();
      setTopPos(targetRect.top - height - 8); // Идеальное позиционирование без мерцания
    }
  }, [targetRect]);

  return <div ref={tooltipRef} style={{ position: "fixed", top: topPos }}>Тултип</div>;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- При SSR `useLayoutEffect` вызывает предупреждение в консоли, так как на сервере физически нет фазы Paint и DOM-дерева. Для универсальных компонентов используйте изоморфный хук (`typeof window !== 'undefined' ? useLayoutEffect : useEffect`).
- Использование `useLayoutEffect` для не-геометрических операций (например, сетевых запросов) неоправданно задерживает первый кадр отрисовки (FCP / LCP).

---

### [REACT] 09. React 19 Direct `ref` as Prop & Ref Cleanups
* **Category:** `React 19`
* **Quick Copy:** `function MyInput({ ref, ...props }) { return <input ref={ref} />; }`
* **Status:** `Actual`
* **Tags:** `React`, `React19`, `Refs`, `forwardRef`, `ModernReact`

> 🛡️ **Главный инвариант:** В React 19 обертка `forwardRef()` признана устаревшей (deprecated). Свойство `ref` теперь является обычным стандартным пропсом. Кроме того, колбэк-рефы теперь поддерживают функции очистки (`cleanup function`), аналогично `useEffect`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Отказ от forwardRef:** Исторически `ref` и `key` обрабатывались компилятором JSX особым образом и исключались из объекта `props`. В React 19 ядро унифицировало передачу `ref`, убрав необходимость в HOC-обёртке `forwardRef`.
- **Симметрия очистки колбэк-рефов:** Ранее при размонтировании ноды React вызывал `ref(null)`. В React 19 колбэк-реф может вернуть функцию очистки `() => void`, которая автоматически вызывается при смене ноды или размонтировании, решая проблему утечки сторонних инстансов (ResizeObserver, Chart.js, Three.js).

#### 💡 Phase 2: Analogy (Mental Model)
Раньше передача `ref` была как оформление дипломатической почты через спецкурьера (`forwardRef`). В React 19 `ref` стал обычной посылкой в рюкзаке с остальными пропсами. А функция очистки — это договор аренды, где прописан пункт об обязательной уборке помещения при выезде.

#### ⚡ Phase 3: Context (Production Code)
```jsx
// 1. Прямой проп ref без forwardRef в React 19
export function CustomSolanaField({ ref, label, ...rest }) {
  return (
    <label>
      {label}
      <input ref={ref} {...rest} />
    </label>
  );
}

// 2. Функция очистки в Callback Ref (React 19)
export function AutoResizeCanvas() {
  return (
    <canvas 
      ref={(node) => {
        if (!node) return;
        const observer = new ResizeObserver(() => console.log("Canvas resized"));
        observer.observe(node);

        // Возвращаем функцию очистки: React 19 вызовет ее при размонтировании!
        return () => {
          observer.disconnect();
        };
      }} 
    />
  );
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Если колбэк-реф возвращает функцию очистки, TypeScript и React 19 запрещают одновременную проверку `if (node === null)` внутри тела — очистка теперь изолирована в возвращаемом колбэке.
- Переход на прямой проп `ref` обратно совместим, но использование `forwardRef` в новых кодовых базах генерирует предупреждение депрекейшена в React 19.

---

### [REACT] 10. Automatic Batching & `flushSync` Escape Hatch
* **Category:** `React 18`
* **Quick Copy:** `flushSync(() => { setCount(c => c + 1); }); // Принудительный синхронный рендер`
* **Status:** `Actual`
* **Tags:** `React`, `React18`, `Batching`, `flushSync`, `Performance`

> 🛡️ **Главный инвариант:** Начиная с React 18, абсолютно все обновления состояния автоматически группируются в один рендер (Batching), даже внутри `setTimeout`, сетевых промисов и нативных слушателей. Для форсированного немедленного сброса DOM существует единственный аварийный люк: `flushSync`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Пакетная обработка в микротасках:** В React 18+ все вызовы сеттеров внутри одного тика Event Loop агрегируются в одну очередь `updateQueue` на узле Fiber. Рендеринг инициируется только после завершения всего синхронного блока кода.
- **Принудительный синхронный сброс (`flushSync`):** При вызове `flushSync(fn)` React прерывает батчинг и форсирует немедленный запуск фазы Render и Commit для переданного колбэка, синхронно мутируя DOM до перехода к следующей строке кода.

#### 💡 Phase 2: Analogy (Mental Model)
Автоматический батчинг — это официант, который собирает заказ у всех гостей за столиком и относит один общий чек на кухню. `flushSync` — это VIP-гость, требующий немедленно принести ему стакан воды прямо сейчас, заставляя официанта бросить всех остальных клиентов.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useState } from "react";
import { flushSync } from "react-dom";

export function ChatMessagesList() {
  const [messages, setMessages] = useState([]);

  function handleSend(newMsg) {
    // Принуждаем React обновить DOM немедленно, не дожидаясь конца функции
    flushSync(() => {
      setMessages(prev => [...prev, newMsg]);
    });

    // Теперь DOM гарантированно обновлен: скроллим к последнему элементу
    window.scrollTo(0, document.body.scrollHeight);
  }

  return <div>{messages.map((m, i) => <p key={i}>{m}</p>)}</div>;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Используйте `flushSync` крайне редко: он полностью отключает оптимизации батчинга и заставляет React выполнять синхронный проход по дереву компонентов.
- Никогда не оборачивайте вызовы `flushSync` внутрь другого `flushSync` — React выбросит ошибку при попытке повторного вложенного сброса очереди.

---

### [REACT] 11. Error Boundaries: Widget-Level Crash Isolation
* **Category:** `React Architecture`
* **Quick Copy:** `<ErrorBoundary fallback={<ErrorCard />} onReset={resetState}>...</ErrorBoundary>`
* **Status:** `Actual`
* **Tags:** `React`, `ErrorBoundaries`, `A11y`, `Resilience`, `ZeroCrash`

> 🛡️ **Главный инвариант:** Необработанная ошибка JavaScript внутри одного мелкого компонента (например, некорректный баланс в виджете) без Error Boundary приводит к полному размонтированию всего дерева React — пользователь получает белый экран смерти.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Перехват на фазе Render и Commit:** Error Boundary ловит ошибки во время рендеринга дочерних компонентов, в методах жизненного цикла и конструкторах.
- **Слепые зоны Error Boundary:** Не перехватывает ошибки внутри асинхронных колбэков (`setTimeout`, промисы), событийных обработчиков (`onClick`) и при SSR-рендеринге на сервере (там требуется `try/catch`).

#### 💡 Phase 2: Analogy (Mental Model)
Error Boundary — это герметичные водонепроницаемые отсеки на подводной лодке. Если один отсек пробит (упал виджет криптокошелька), изолирующая переборка опускается, сохраняя плавучесть и работу всей остальной подлодки (страницы).

#### ⚡ Phase 3: Context (Production Code)
```jsx
import React from "react";

export class WidgetErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Telemetry] Сбой в изолированном виджете:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback-card">
          <h4>Виджет временно недоступен</h4>
          <p>{this.state.error?.message}</p>
          <button onClick={this.handleReset}>Повторить попытку</button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Чтобы поймать асинхронную ошибку внутри Error Boundary, используйте трюк с пробросом ошибки в стейт рендера: `const [_, setError] = useState(); setError(() => { throw asyncError; })`.
- Всегда размещайте гранулированные Error Boundary вокруг каждого независимого микровиджета, а не только один глобальный на всю страницу.

---

### [REACT] 12. Fiber Architecture: The Double Buffering Pipeline
* **Category:** `React Core`
* **Quick Copy:** `// Fiber Tree: Current (на экране) <---> WorkInProgress (в памяти)`
* **Status:** `Actual`
* **Tags:** `React`, `Fiber`, `Reconciliation`, `V8`, `Internals`

> 🛡️ **Главный инвариант:** React никогда не мутирует живой DOM в процессе вычисления компонентного дерева. Он строит параллельное теневое дерево `workInProgress` в куче V8, и переключает указатель корня одной атомарной операцией (*Double Buffering*), как в игровых движках.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Узел Fiber:** Обычный JS-объект, представляющий элемент и его состояние (`memoizedState`, `child`, `sibling`, `return`).
- **Фаза Render (Чистая):** Построение дерева `workInProgress`. Может быть прервана, отменена или перезапущена при поступлении более приоритетных событий.
- **Фаза Commit (Мутационная):** Синхронное применение накопленного списка изменений к реальному DOM. Прерываться не может.

#### 💡 Phase 2: Analogy (Mental Model)
Двойная буферизация в Fiber работает в точности как видеопамять в 3D-играх: пока один буфер (экран) отображает текущий кадр пользователю, графический чип в скрытом заднем буфере (`workInProgress`) рисует следующий кадр. В момент готовности видеокарта мгновенно переключает указатель, предотвращая разрыв изображения (tearing).

#### ⚡ Phase 3: Context (Production Code)
```jsx
// Эмуляция архитектурной модели Fiber WorkLoop:
export function simulateFiberWorkLoop(workInProgressRoot) {
  let nextUnitOfWork = workInProgressRoot;

  function performConcurrentLoop(deadline) {
    // Прерываемый цикл рендеринга на основе выделенного кванта времени (time slicing)
    while (nextUnitOfWork && deadline.timeRemaining() > 1) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }

    if (!nextUnitOfWork && workInProgressRoot) {
      // Фаза Commit: атомарное переключение указателя Current на WorkInProgress
      commitRoot(workInProgressRoot);
    } else if (nextUnitOfWork) {
      // Планируем продолжение на следующий свободный кадр браузера
      requestIdleCallback(performConcurrentLoop);
    }
  }

  requestIdleCallback(performConcurrentLoop);
}

function performUnitOfWork(fiber) {
  // Вычисление хуков и дочерних элементов Fiber
  return fiber.child || fiber.sibling || fiber.return;
}

function commitRoot(root) {
  // Синхронный коммит мутаций в реальный DOM
  console.log("Fiber commit executed atomically.");
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Чистота функции рендера — абсолютный закон Fiber. Поскольку фаза Render может быть прервана или перезапущена многократно, любые побочные эффекты (мутация глобальных переменных, сетевые запросы) внутри тела компонента приведут к непредсказуемым гонкам данных.
- Структура Fiber связывает узлы не через массивы детей, а через односвязные списки (`child`, `sibling`, `return`), что позволяет V8 обходить дерево рекурсивно-независимым циклом без переполнения стека вызовов (*Call Stack*).

---

### [REACT] 13. The `key` Attribute as an Identity Reset Switch
* **Category:** `React Patterns`
* **Quick Copy:** `<UserProfile key={userId} /> // Мгновенный сброс всех внутренних стейтов`
* **Status:** `Actual`
* **Tags:** `React`, `Keys`, `StateReset`, `Patterns`, `CleanCode`

> 🛡️ **Главный инвариант:** Атрибут `key` нужен не только для списков. Изменение `key` на любом одиночном компоненте принуждает React полностью уничтожить старый инстанс со всеми его внутренними стейтами и создать чистый новый узел без использования костылей в `useEffect`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Идентификация узла Fiber:** При сверке дерева (*Reconciliation*) React проверяет совпадение пары `element.type` и `element.key`. Если `key` изменился, React не пытается найти diff свойств, а сразу помечает старый Fiber флажком `Deletion` и монтирует новый Fiber с чистым `memoizedState`.
- **Сброс DOM и фокуса:** Полный перемонтаж очищает не только стейт React, но и внутреннее состояние браузерных DOM-элементов (неуправляемые инпуты, позицию скролла внутри контейнера, видеоплееры).

#### 💡 Phase 2: Analogy (Mental Model)
Если вы перекрашиваете старую комнату — это обычный ре-рендер с новым пропсом. Если вы сносите дом бульдозером и строите на его месте новый коттедж с другим адресом — это смена `key`. Никакой старой пыли и забытых вещей в новом доме не останется.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useState } from "react";

function AccountEditorForm({ accountId }) {
  // Локальный стейт формы черновика:
  const [draftComment, setDraftComment] = useState("");
  const [securityPin, setSecurityPin] = useState("");

  return (
    <form className="account-editor">
      <h3>Редактирование аккаунта: {accountId}</h3>
      <input 
        value={draftComment} 
        onChange={e => setDraftComment(e.target.value)} 
        placeholder="Заметка к аккаунту..." 
      />
      <input 
        type="password" 
        value={securityPin} 
        onChange={e => setSecurityPin(e.target.value)} 
        placeholder="PIN" 
      />
    </form>
  );
}

export function AccountManager({ activeAccountId }) {
  // При смене activeAccountId компонент пересоздается с нуля:
  // Все поля ввода, черновики и локальные стейты гарантированно очищены!
  return <AccountEditorForm key={activeAccountId} accountId={activeAccountId} />;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Смена `key` эффективнее связки `useEffect(() => resetState(), [id])`: исключается промежуточный рендер с некорректным «мигающим» старым состоянием.
- Никогда не используйте случайные значения `key={Math.random()}` в стабильных списках — это уничтожает производительность виртуального DOM и ломает фокус клавиатуры при каждом кадре.

---

### [REACT] 14. Context Splitting: Separating State & Dispatch
* **Category:** `React Performance`
* **Quick Copy:** `const StateCtx = createContext(); const DispatchCtx = createContext();`
* **Status:** `Actual`
* **Tags:** `React`, `Context`, `Performance`, `ReRender`, `DesignSystems`

> 🛡️ **Главный инвариант:** Объединение `[state, dispatch]` в один объект Context приводит к тому, что компоненты, которым нужен **только** `dispatch` (например, кнопки действий), будут бессмысленно перерендериваться при каждом изменении `state`. Разделяйте стейт и диспетчер на два независимых провайдера!

#### 📌 Phase 1: Deconstruction (Architecture)
- **Каскад подписчиков Context:** Каждый компонент, вызывающий `useContext(MyContext)`, регистрируется как зависимость этого контекста. Когда ссылка на `value` меняется (`Object.is(oldVal, newVal) === false`), React форсированно ставит компонент в очередь на рендеринг, игнорируя `React.memo`.
- **Иммутабельность диспетчера:** Функция `dispatch` из `useReducer` гарантированно стабильна на протяжении всего жизненного цикла компонента. Разделение контекстов гарантирует, что компоненты, использующие только `dispatch`, никогда не перерендериваются при мутации стейта.

#### 💡 Phase 2: Analogy (Mental Model)
Смешанный контекст — это общий мегафон в офисе: каждый раз, когда меняется курс валют, мегафон орёт на весь зал, отвлекая даже тех сотрудников, которые просто хотели нажать кнопку вызова лифта. Разделение контекстов — это персональный пейджер для тех, кому нужны новости, и отдельная кнопка вызова, работающая бесшумно.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { createContext, useContext, useReducer } from "react";

const LedgerStateContext = createContext(null);
const LedgerDispatchContext = createContext(null);

function ledgerReducer(state, action) {
  switch (action.type) {
    case "ADD_TX":
      return { txs: [action.payload, ...state.txs] };
    default:
      return state;
  }
}

export function LedgerProvider({ children }) {
  const [state, dispatch] = useReducer(ledgerReducer, { txs: [] });

  return (
    <LedgerStateContext.Provider value={state}>
      <LedgerDispatchContext.Provider value={dispatch}>
        {children}
      </LedgerDispatchContext.Provider>
    </LedgerStateContext.Provider>
  );
}

// Компоненты-подписчики:
export const useLedgerState = () => {
  const ctx = useContext(LedgerStateContext);
  if (!ctx) throw new Error("useLedgerState must be inside LedgerProvider");
  return ctx;
};

export const useLedgerDispatch = () => {
  const ctx = useContext(LedgerDispatchContext);
  if (!ctx) throw new Error("useLedgerDispatch must be inside LedgerProvider");
  return ctx;
};
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Для предотвращения случайных перерендеров провайдера всегда оборачивайте составной `value` стейта в `useMemo`, если передаете объект: `value={useMemo(() => ({ a, b }), [a, b])}`.
- В библиотеках уровня Zustand или Jotai эта проблема решена на уровне селекторов без разделения контекстов, но в чистом React разделение `StateContext` и `DispatchContext` — канонический архитектурный стандарт.

---

### [REACT] 15. The 3 Strict Criteria for `useCallback` & `useMemo`
* **Category:** `React Optimization`
* **Quick Copy:** `// Используй ТОЛЬКО: 1) проп в memo-компонент, 2) зависимость хука, 3) тяжелый O(N²)`
* **Status:** `Actual`
* **Tags:** `React`, `useMemo`, `useCallback`, `Performance`, `AntiPattern`

> 🛡️ **Главный инвариант:** `useMemo` не бесплатен: он требует аллокации массива зависимостей, объекта замыкания и их попарного сравнения в каждом рендере. Если вы оборачиваете простую фильтрацию 10 элементов или хэндлер обычной кнопки — вы делаете код медленнее, чем чистый рендер без мемоизации.

#### 📌 Phase 1: Deconstruction (Architecture)
Используйте мемоизацию строго в трех случаях:
1. Вы передаете колбэк или объект в дочерний компонент, обернутый в `React.memo`.
2. Функция или объект передается в массив зависимостей другого хука (`useEffect`, `useMemo`).
3. Вычисление реально тяжелое (сортировка массивов от 1000+ элементов, криптография).

#### 💡 Phase 2: Analogy (Mental Model)
`useMemo` на копеечной операции — это наём нотариуса с оплатой $500 для заверения покупки буханки хлеба за $1. Затраты на проверку и оформление документов многократно превышают стоимость самой покупки.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useMemo, useCallback, memo } from "react";

// Дочерний компонент оптимизирован через React.memo:
const FilterButton = memo(function FilterButton({ onSelect, label }) {
  return <button onClick={onSelect}>{label}</button>;
});

export function AnalyticsDashboard({ rawData, targetThreshold }) {
  // КРИТЕРИЙ 1: Стабильная ссылка для React.memo
  const handleSelect = useCallback(() => {
    console.log("Threshold selected:", targetThreshold);
  }, [targetThreshold]);

  // КРИТЕРИЙ 3: Реально тяжелые O(N) вычисления над большим массивом (10 000+ строк)
  const computedMetrics = useMemo(() => {
    return rawData
      .filter(row => row.value > targetThreshold)
      .reduce((acc, row) => acc + Math.sqrt(row.value), 0);
  }, [rawData, targetThreshold]);

  return (
    <div>
      <h3>Суммарная метрика: {computedMetrics}</h3>
      <FilterButton onSelect={handleSelect} label="Применить порог" />
    </div>
  );
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Оборачивание инлайн-функций в `useCallback` без `React.memo` на принимающем компоненте является 100% бесполезной тратой CPU и памяти кучи V8.
- Простые операции фильтрации массивов до 100-200 элементов выполняются движком V8 за доли микросекунды — накладные расходы на работу хука и проверку массива зависимостей сопоставимы по времени.

---

### [REACT] 16. Strict Mode Double Mount & Effect Idempotency
* **Category:** `React Architecture`
* **Quick Copy:** `useEffect(() => { const ctrl = new AbortController(); return () => ctrl.abort(); }, []);`
* **Status:** `Actual`
* **Tags:** `React`, `StrictMode`, `useEffect`, `MemoryLeaks`, `Idempotency`

> 🛡️ **Главный инвариант:** В режиме разработки (`<StrictMode>`) React монтирует каждый компонент **дважды** (`Mount -> Unmount -> Mount`). Это сделано намеренно, чтобы сразу выявить функции без очистки эффектов: незакрытые сокеты, висящие слушатели и дублирующие запросы.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Подготовка к Concurrent React:** React резервирует за собой право сохранять и восстанавливать скрытые вкладки и деревья (Offscreen API). Для этого эффекты обязаны безболезненно переживать многократные циклы `setup -> cleanup -> setup`.
- **Двойной вызов конструкторов и рендеров:** В режиме разработки React вызывает рендер функции компонента, сеттеры стейта и хуки эффектов дважды, проверяя их математическую чистоту (отсутствие мутаций внешних переменных).

#### 💡 Phase 2: Analogy (Mental Model)
Строгий режим — это краш-тест пожарной сигнализации перед сдачей здания в эксплуатацию: инспекторы намеренно включают сирену, выключают её и включают снова, чтобы убедиться, что система не заклинит и не устроит короткое замыкание при реальной тревоге.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useEffect, useState } from "react";

export function RealtimeMarketData({ pairId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const res = await fetch(`/api/orderbook/${pairId}`, { 
          signal: controller.signal 
        });
        const json = await res.json();
        setData(json);
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("RPC Error:", e);
        }
      }
    }

    loadData();

    // Функция очистки обязана быть идемпотентной!
    return () => {
      controller.abort();
    };
  }, [pairId]);

  return <div>Стакан ордеров: {data ? JSON.stringify(data) : "Загрузка..."}</div>;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Запрещено использовать флаги-костыли вида `const isMounted = useRef(false); if (!isMounted.current) { ... }` для обхода строгого режима — это маскирует реальные утечки памяти и ломает логику в продакшене при переключениях страниц.
- Единственно верный способ борьбы с двойным запросом в `useEffect` — передача `AbortController.signal` в `fetch` внутри функции очистки.

---

### [REACT] 17. Hydration Mismatch Elimination Patterns
* **Category:** `React SSR`
* **Quick Copy:** `const [isMounted, setIsMounted] = useState(false); useEffect(() => setIsMounted(true), []);`
* **Status:** `Actual`
* **Tags:** `React`, `SSR`, `Hydration`, `Nextjs`, `CleanCode`

> 🛡️ **Главный инвариант:** Рендеринг клиентских данных (`window.innerWidth`, текущее локальное время `Date.now()`) на сервере порождает несовпадение текстовых узлов. Для компонентов, зависящих от браузера, первый рендер клиента обязан полностью соответствовать разметке сервера.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Сверка DOM-дерева при гидратации:** Браузерный скрипт React обходит сгенерированный сервером HTML и сопоставляет каждый узел с деревом VDOM. Если текст или атрибуты отличаются (например, часовой пояс сервера UTC, а у клиента UTC+3), React выбрасывает ошибку Hydration Mismatch и вынужден полностью пересоздать поддерево на клиенте, уничтожая выигрыш от SSR.
- **Двухэтапный клиентский монтаж:** Паттерн `mounted = true` гарантирует, что первый рендер в браузере сгенерирует абсолютно идентичный серверному HTML, а динамические клиентские свойства появятся только во втором кадре после завершения гидратации.

#### 💡 Phase 2: Analogy (Mental Model)
Гидратация — это примерка сшитого на заказ костюма. Если клиент внезапно изменил свои мерки (браузер подставил свои данные вместо серверных), костюм трещит по швам (Hydration Error), и портному приходится распарывать его и шить заново прямо на человеке.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useState, useEffect } from "react";

export function ClientOnlyTimestamp() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // На сервере и при первом проходе гидратации возвращаем нейтральный скелетон
    return <span className="skeleton-placeholder">Загрузка времени...</span>;
  }

  // Только после монтирования рендерим локальное время браузера
  return <span>{new Date().toLocaleTimeString()}</span>;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Атрибут `suppressHydrationWarning` допустимо вешать только на единичные текстовые узлы с датами/временем (`<span suppressHydrationWarning>{time}</span>`), но не на структурные обёртки или списки.
- В Next.js для компонентов с доступом к браузерным API (`localStorage`, `window`) рекомендуется динамический импорт с отключением SSR: `dynamic(() => import('./Widget'), { ssr: false })`.

---

### [REACT] 18. Portals & Synthetic Event Bubble Hierarchy
* **Category:** `React DOM`
* **Quick Copy:** `createPortal(<Modal />, document.body); // События всплывают по React-дереву!`
* **Status:** `Actual`
* **Tags:** `React`, `Portals`, `DOM`, `Events`, `Modals`

> 🛡️ **Главный инвариант:** Несмотря на то, что `createPortal` физически помещает HTML-узел в `document.body` (за пределы корня `#root`), **синтетические события React продолжают всплывать по виртуальному дереву компонентов**, а не по физическому дереву DOM.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Разрыв физического DOM vs целостность Fiber:** `createPortal` указывает узлу Fiber монтировать соответствующий DOM-элемент в произвольный контейнер (`document.body`). Однако в структуре Fiber родительский указатель `return` портала по-прежнему ссылается на React-компонент, объявивший этот портал.
- **Синтетическая диспетчеризация событий:** React перехватывает нативные события на уровне корневого контейнера (`#root` или `document`) и эмулирует всплытие вручную, поднимаясь вверх по цепочке указателей `return` в дереве Fiber, а не по `parentNode` в реальном DOM.

#### 💡 Phase 2: Analogy (Mental Model)
Портал — это филиал компании в другом городе: физически офис находится в тысяче километров (`document.body`), но по корпоративной иерархии все отчеты и решения (`events`) направляются напрямую генеральному директору в главный офис по защищенному каналу связи.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { createPortal } from "react-dom";

export function ModalPortalWrapper({ onClose, children }) {
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      {/* Клик по modal-body всплывет к родителю по виртуальному дереву React! */}
      <div className="modal-body" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Клик внутри портального модального окна всплывет к обёртке на странице, если не вызвать `e.stopPropagation()` на синтетическом событии React, что часто приводит к случайному срабатыванию кликов по фону или закрытию родительских карточек.
- Для обеспечения доступности (A11y) при открытии портала в `document.body` необходимо программно захватывать фокус клавиатуры (Focus Trap) и скрывать остальной контент через `aria-hidden="true"`.

---

### [REACT] 19. Suspense for Streaming Data & Selective Hydration
* **Category:** `React 18`
* **Quick Copy:** `<Suspense fallback={<Skeleton />}>{children}</Suspense>`
* **Status:** `Actual`
* **Tags:** `React`, `Suspense`, `Streaming`, `SSR`, `CoreWebVitals`

> 🛡️ **Главный инвариант:** Медленный блок страницы (например, список транзакций из удаленного RPC) больше не должен блокировать отправку всего HTML со стороны сервера. `<Suspense>` позволяет серверу отправить каркас страницы немедленно, а тяжелые блоки досылать стримингом по мере готовности (*Selective Hydration*).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Потоковый SSR (Streaming HTML):** Сервер генерирует HTML-разметку чанками через HTTP-заголовок `Transfer-Encoding: chunked`. Блоки внутри `<Suspense>` немедленно заменяются на fallback-плейсхолдеры, а реальный контент досылается в поток позже вместе с inline-скриптом замены DOM.
- **Селективная гидратация (Selective Hydration):** React начинает гидратировать готовые части страницы независимо от ожидающих блоков. Если пользователь кликает по интерактивному элементу внутри еще не загидратированного блока, React принудительно повышает приоритет этого блока и гидратирует его первым.

#### 💡 Phase 2: Analogy (Mental Model)
Стриминг с Suspense — это подача комплексного обеда в ресторане: вам сразу приносят хлеб и напитки (каркас страницы), пока горячее блюдо еще готовится на кухне. Традиционный SSR — это когда официант ждет готовности стейка 40 минут и только потом выносит весь заказ целиком голодному гостю.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { Suspense, use } from "react";

// В React 19 промис можно резолвить прямо в рендере через хук use()
function AsyncTransactionFeed({ transactionsPromise }) {
  const transactions = use(transactionsPromise);

  return (
    <ul className="tx-list">
      {transactions.map(tx => (
        <li key={tx.id}>{tx.hash} — {tx.sol} SOL</li>
      ))}
    </ul>
  );
}

export function DashboardPage({ txPromise }) {
  return (
    <div className="dashboard-grid">
      <header>Личный кабинет трейдера</header>
      
      {/* Медленная загрузка транзакций не блокирует отображение хедера и шапки */}
      <Suspense fallback={<div className="skeleton-feed">Загрузка ончейн-ленты...</div>}>
        <AsyncTransactionFeed transactionsPromise={txPromise} />
      </Suspense>
    </div>
  );
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Границы Suspense должны быть локальными: оборачивание всей страницы в один корневой Suspense полностью нивелирует преимущества потокового SSR и селективной гидратации.
- Вложенные промисы для хука `use(promise)` в React 19 обязаны кэшироваться вне рендера (например, через `cache()` или React Query), иначе на каждом шаге рендера будет создаваться новый промис с бесконечным циклом саспенса.

---

### [REACT] 20. Single-Responsibility Custom Hook Composition
* **Category:** `React Architecture`
* **Quick Copy:** `export function useDebouncedField(init) { const [v, set] = useState(init); return [v, useDebounce(v)]; }`
* **Status:** `Actual`
* **Tags:** `React`, `CustomHooks`, `Architecture`, `CleanCode`, `Composition`

> 🛡️ **Главный инвариант:** Пользовательский хук не должен быть «божественным объектом» (God Hook) на 300 строк. Идеальный кастомный хук инкапсулирует ровно одну ответственность (сетевой статус, медиа-запрос, форма) и компонуется из других примитивных хуков.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Композиция против монолитов:** Кастомный хук не имеет собственного состояния в ядре Fiber — он лишь делегирует вызовы нативным примитивам (`useState`, `useRef`, `useEffect`).
- **Чистый интерфейс (Clean API Contract):** Возвращаемый результат должен следовать принципу наименьшего удивления: кортеж `[value, setValue]` для одиночных значений или строго типизированный объект `{ data, isLoading, error, refetch }` для многосоставных состояний.

#### 💡 Phase 2: Analogy (Mental Model)
Качественные хуки — это блоки конструктора LEGO: у каждого блока один стандартный тип крепления, и из маленьких кубиков (дебаунс, таймер, слушатель сокета) собирается сложный космический корабль, а не монолитная пластиковая игрушка, которую невозможно разобрать или починить.

#### ⚡ Phase 3: Context (Production Code)
```jsx
import { useState, useEffect } from "react";

// Хук 1: Чистый статус подключения к интернету
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);

    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);
    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  return isOnline;
}

// Хук 2: Композитный хук синхронизации данных при появлении сети
export function useAutoSyncData(syncAction) {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isOnline) {
      syncAction();
    }
  }, [isOnline, syncAction]);

  return { isOnline };
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Не возвращайте из кастомных хуков анонимные нестабильные функции без `useCallback`, если они могут использоваться потребителями в зависимостях эффектов.
- Правило префикса `use`: линтеры React распознают хуки исключительно по префиксу `use*`. Функции без этого префикса не проверяются на соблюдение правил порядка вызова хуков.

---

### [REACT] 21. React Compiler (React Forget): Automated Memoization
* **Category:** `React 19`
* **Quick Copy:** `// React 19 Compiler автоматически мемоизирует граф выражений на этапе сборки`
* **Status:** `Actual`
* **Tags:** `React`, `ReactCompiler`, `React19`, `Memoization`, `Performance`

> 🛡️ **Главный инвариант:** React Compiler анализирует правила хуков на уровне Babel/AST и автоматически встраивает мемоизацию вычислений и JSX-элементов. Необходимость в ручных `useMemo`, `useCallback` и `React.memo` уходит в прошлое, если код соблюдает фундаментальные правила чистоты компонентов.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Статический анализ графа зависимостей:** Компилятор преобразует JSX и JavaScript-код компонентов в промежуточное представление (IR), вычисляет потоки данных и неявные зависимости между переменными.
- **Кэш-матрица Fiber (`useMemoCache`):** Компилятор автоматически генерирует низкоуровневые вызовы внутреннего хука кэширования для каждого вычисляемого выражения и фрагмента виртуального DOM, сохраняя результаты в кольцевом буфере памяти узла Fiber.

#### 💡 Phase 2: Analogy (Mental Model)
Ручные `useMemo` и `useCallback` — это ручная коробка передач в гоночном автомобиле, где водителю нужно идеально вовремя выжимать сцепление. React Compiler — это спортивная роботизированная коробка передач с двумя сцеплениями: она переключает передачи за миллисекунды сама, превосходя любого живого пилота.

#### ⚡ Phase 3: Context (Production Code)
```jsx
// КОД РАЗРАБОТЧИКА (Чистый, декларативный, без единого ручного useMemo / useCallback):
export function WalletPortfolioSummary({ transactions, selectedToken }) {
  // Компилятор автоматически мемоизирует фильтрацию и JSX дерево!
  const filtered = transactions.filter(tx => tx.token === selectedToken);
  const totalAmount = filtered.reduce((sum, tx) => sum + tx.amount, 0);

  function handleExport() {
    console.log("Экспорт портфеля для токена:", selectedToken);
  }

  return (
    <div className="portfolio-summary">
      <h2>Баланс токена: {totalAmount}</h2>
      <button onClick={handleExport}>Выгрузить отчет</button>
      <TransactionList items={filtered} />
    </div>
  );
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Компилятор строго требует соблюдения «Правил React» (Rules of React): компоненты обязаны быть идемпотентными и не мутировать пропсы или стейт напрямую. Нарушение правил приводит к автоматическому пропуску оптимизации для сбойного компонента (*bailout*).
- Не удаляйте существующие `useMemo` и `useCallback` принудительно до включения компилятора — они мирно сосуществуют во время поэтапной миграции проекта.

---

### [REACT] 22. Uncontrolled Forms with `FormData` & Native State
* **Category:** `React Forms`
* **Quick Copy:** `const handleSubmit = e => { e.preventDefault(); const data = new FormData(e.currentTarget); };`
* **Status:** `Actual`
* **Tags:** `React`, `Forms`, `FormData`, `Uncontrolled`, `Performance`

> 🛡️ **Главный инвариант:** Контролируемый инпут (`value={val} onChange={...}`) вызывает полный цикл рендеринга компонента на каждый введенный пользователем символ. Неконтролируемые формы с извлечением данных через `new FormData(event.currentTarget)` работают с нулевым количеством ререндеров.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Снижение давления на Virtual DOM:** При контролируемом инпуте на каждое нажатие клавиши браузер инициирует цепочку: нативное событие $	o$ синтетическое событие $	o$ вызов `setState` $	o$ планировщик Fiber $	o$ вычисление VDOM $	o$ reconciliation $	o$ коммит в DOM. Неконтролируемый инпут оставляет всё состояние внутри движка разметки браузера (C++ / Blink).
- **Парсинг через `FormData`:** Нативный Web API конструктор `new FormData(formElement)` обходит поля формы в C++ слое браузера и строит ключ-значение карту со всеми текстовыми полями, чекбоксами и бинарными файлами за доли миллисекунды.

#### 💡 Phase 2: Analogy (Mental Model)
Контролируемая форма — это микроменеджер, который стоит за спиной наборщика текста и сверяет каждую нажатую букву по списку инструкций, создавая задержку. Неконтролируемая форма — это сдача готового запечатанного конверта с отчетом в архив по факту завершения работы.

#### ⚡ Phase 3: Context (Production Code)
```jsx
export function NewOrderSubmissionForm({ onOrderSubmit }) {
  function handleSubmit(event) {
    event.preventDefault();
    
    // Мгновенный сбор всех полей через C++ движок браузера без единого ре-рендера:
    const formData = new FormData(event.currentTarget);
    
    const payload = {
      pair: formData.get("tradingPair"),
      amount: Number(formData.get("amount")),
      orderType: formData.get("orderType"),
      postOnly: formData.get("postOnly") === "on"
    };

    onOrderSubmit(payload);
    event.currentTarget.reset(); // Нативный сброс полей формы
  }

  return (
    <form onSubmit={handleSubmit} className="order-form">
      <input name="tradingPair" defaultValue="SOL/USDC" required />
      <input name="amount" type="number" step="0.001" placeholder="Сумма" required />
      
      <select name="orderType" defaultValue="LIMIT">
        <option value="LIMIT">Лимитный</option>
        <option value="MARKET">Рыночный</option>
      </select>

      <label>
        <input name="postOnly" type="checkbox" defaultChecked />
        Post-Only ордер
      </label>

      <button type="submit">Создать ордер</button>
    </form>
  );
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Все поля ввода в неуправляемой форме обязаны иметь атрибут `name`, иначе они будут проигнорированы конструктором `FormData`.
- Для сброса формы после успешной отправки вызывайте нативный метод `event.currentTarget.reset()` вместо ручного очищения каждого поля.
