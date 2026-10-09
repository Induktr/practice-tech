# 📚 Мастер-База Шпаргалок по HTML5 (20 Шпор)
### Стандарт: Induktr Studio 4-Phase Architecture для Notion

---

## 🧭 Карта 20 Чистых HTML5-Шпор по Направлениям

1. **Безопасность & Песочницы (Security & Sandbox):**
   - **`[HTML] 01`**: Матрица загрузки скриптов (`defer` vs `async` vs `type="module"`).
   - **`[HTML] 02`**: Бронирование `<iframe>` через `sandbox` (защита от кражи cookies и XSS).
   - **`[HTML] 11`**: Subresource Integrity (SRI: `integrity="sha384-..."` — защита от взлома CDN).
   - **`[HTML] 12`**: Cross-Origin Isolation (`COOP` и `COEP` для включения `SharedArrayBuffer`).

2. **Продвинутые Формы & Инпуты (Forms & State):**
   - **`[HTML] 03`**: Мультиэкшен формы через `formaction` и `formmethod` на кнопках без JS.
   - **`[HTML] 06`**: Автокомплит поиска через `<datalist>` и `<input list="...">` без библиотек.
   - **`[HTML] 09`**: Ввод чистого текста через `contenteditable="plaintext-only"` (защита от мусорного HTML).
   - **`[HTML] 18`**: Реактивные вычисления в формах через нативный `<output for="...">`.

3. **Семантика, Структура & SEO (Semantic & Landmarks):**
   - **`[HTML] 04`**: Иерархия заголовков (`<h1>` - `<h6>`) и крах HTML5 Outline Algorithm.
   - **`[HTML] 07`**: Разница между индикатором выполнения `<progress>` и шкалой измерения `<meter>`.
   - **`[HTML] 08`**: Прецизионные даты ISO 8601 в `<time datetime="...">`.
   - **`[HTML] 16`**: Академические цитаты: разница между `<blockquote>`, `<q>` и тегом `<cite>`.
   - **`[HTML] 19`**: Архитектура социальных превью (OpenGraph + Twitter Card для Telegram/Slack).
   - **`[HTML] 20`**: Новый стандартный ориентир поиска `<search>` (замена `role="search"`).

4. **Доступность & Интернационализация (A11y & i18n):**
   - **`[HTML] 05`**: Субтитры `<track kind="captions">` и мобильный атрибут `playsinline`.
   - **`[HTML] 15`**: Инвариант фокуса: почему `tabindex="1+"` строго запрещен в продакшене.
   - **`[HTML] 17`**: Двунаправленная изоляция текста `<bdi>` (защита от сбоя верстки при вставке арабского/иврита).

5. **Мобильные ОС & Архитектура DOM (Mobile & Web Components):**
   - **`[HTML] 10`**: Declarative Shadow DOM (`<template shadowrootmode="open">`) для SSR без гидратации.
   - **`[HTML] 13`**: Динамический `theme-color` с медиа-запросами dark/light для тулбара смартфона.
   - **`[HTML] 14`**: Принудительное скачивание файлов через `<a download="...">` с ограничением Same-Origin.

---

### [HTML] 01. Script Loading Matrix: Defer, Async & Type="Module"
* **Category:** `HTML5 Architecture`
* **Quick Copy:** `<script src="app.js" defer></script><script type="module" src="main.js"></script>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Scripts`, `Performance`, `DOMParser`, `EventLoop`

> 🛡️ **Главный инвариант:** Обычный `<script src="...">` полностью блокирует парсер HTML (Stop-the-World). Атрибут `defer` скачивает скрипт параллельно в фоновом потоке и гарантирует выполнение строго в порядке появления в DOM перед событием `DOMContentLoaded`. Скрипты с `type="module"` всегда работают как `defer` по умолчанию.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Синхронный скрипт:** Парсер HTML останавливается, браузер отправляет сетевой запрос, скачивает файл, компилирует V8 и выполняет. Рендеринг страницы заблокирован.
- **`async`:** Скачивается параллельно. Выполняется **немедленно по готовности**, прерывая HTML-парсер. Порядок выполнения нескольких `async`-скриптов недетерминирован (кто раньше скачался, тот и выполнился). Подходит только для независимой аналитики.
- **`defer`:** Скачивается параллельно. Выполняется **после** завершения построения DOM-дерева, но **до** `DOMContentLoaded`. Сохраняет строгий порядок выполнения `1.js -> 2.js`.
- **`type="module"`:** Обладает семантикой `defer`, поддерживает синтаксис ES-модулей (`import/export`) и выполняется в строгом режиме `'use strict'` с собственной областью видимости.

#### 💡 Phase 2: Analogy (Mental Model)
Синхронный скрипт — это шлагбаум на трассе: все машины (DOM-узлы) встали в пробку и ждут, пока проедет поезд. `async` — это метеорит: упадет в случайный момент и прервет стройку. `defer` — это курьер, который привез обои заранее, но ждет, пока строители полностью закончат возводить стены.

#### ⚡ Phase 3: Context (Production Code)
```html
<head>
  <!-- 1. Сторонняя аналитика: независима от DOM, максимальная скорость -->
  <script async src="https://cdn.telemetry.io/tracker.js"></script>

  <!-- 2. Критическое ядро приложения: сохраняет порядок зависимостей -->
  <script defer src="/js/vendor-runtime.js"></script>
  <script defer src="/js/app-core.js"></script>

  <!-- 3. Современный ESM-модуль: defer по умолчанию, строгий режим -->
  <script type="module">
    import { initApp } from '/js/bootstrap.js';
    initApp();
  </script>
</head>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Атрибут `defer` полностью игнорируется браузером для инлайн-скриптов без атрибута `src`.
- Если вам нужен динамический импорт внутри обычного скрипта — используйте нативный `import('/path.js')`, возвращающий Promise.

---

### [HTML] 02. Iframe Hardening & Security Sandbox
* **Category:** `HTML5 Security`
* **Quick Copy:** `<iframe src="embed.html" sandbox="allow-scripts allow-same-origin" loading="lazy" referrerpolicy="no-referrer"></iframe>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Security`, `Iframe`, `Sandbox`, `ZeroTrust`

> 🛡️ **Главный инвариант:** Встраивание сторонних виджетов через `<iframe>` без атрибута `sandbox` дает фрейму доступ к выполнению скриптов, чтению cookie вашего домена и открытию неконтролируемых всплывающих окон. Пустой `sandbox=""` включает абсолютную изоляцию (Origin = `null`).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Токены Sandbox:**
  - `allow-scripts`: Разрешает выполнение JS внутри фрейма.
  - `allow-same-origin`: Позволяет фрейму сохранять свой реальный origin (вместо уникального `null`).
  - `allow-forms`: Разрешает отправку форм.
  - `allow-popups`: Разрешает вызовы `window.open()`.
- **Токсичная комбинация:** Никогда не объединяйте одновременно `allow-scripts` и `allow-same-origin` для недоверенного контента! Фрейм сможет программно снять собственный `sandbox` через обращение к DOM родителя.

#### 💡 Phase 2: Analogy (Mental Model)
`sandbox` — это защитный бокс в биолаборатории. Перчатки позволяют трогать образец (`allow-scripts`), но микробы не могут пробить стекло и заразить воздух в здании института.

#### ⚡ Phase 3: Context (Production Code)
```html
<iframe 
  src="https://external-exchange.com/widget"
  title="Виджет котировок Solana"
  sandbox="allow-scripts allow-forms"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
  credentialless
  width="100%" 
  height="450"
  style="border: 0; border-radius: 12px;"
></iframe>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Атрибут `title` на теге `<iframe>` **обязателен по WCAG**. Скринридер объявляет пользователю назначение фрейма до входа в него.

---

### [HTML] 03. Form Security: Multi-Action & Method Spoilers
* **Category:** `HTML5 Forms`
* **Quick Copy:** `<button type="submit" formaction="/draft" formmethod="POST">Сохранить черновик</button>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Forms`, `Security`, `HTTP`, `ZeroJS`

> 🛡️ **Главный инвариант:** Атрибуты `formaction`, `formmethod`, `formnovalidate` и `formenctype` на кнопках `<button type="submit">` позволяют одной форме отправлять данные на разные эндпоинты разными HTTP-методами без JavaScript.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Переопределение действия формы:** Браузер при отправке берет целевой URL из атрибута нажатой кнопки `formaction`, полностью игнорируя `action` самого тега `<form>`.
- **Отключение валидации:** Кнопка «Сохранить черновик» с атрибутом `formnovalidate` отправляет частично заполненную форму в обход встроенных ограничений `required` и `pattern`.

#### 💡 Phase 2: Analogy (Mental Model)
Форма — это почтовое отделение. Раньше для отправки письма в другой город требовался отдельный курьер (JS). Теперь на конверте две кнопки: «Обычная почта» и «Экспресс-доставка» — почтальон сам выбирает маршрут по нажатой марке.

#### ⚡ Phase 3: Context (Production Code)
```html
<form action="/transactions/publish" method="POST" class="tx-form">
  <label for="payload">Полезная нагрузка транзакции:</label>
  <textarea id="payload" name="data" required></textarea>

  <div class="actions">
    <!-- 1. Основное действие: валидация + публикация -->
    <button type="submit" class="btn-primary">
      Подписать и Отправить
    </button>

    <!-- 2. Альтернативное действие: черновик без валидации -->
    <button 
      type="submit" 
      formaction="/transactions/save-draft" 
      formnovalidate
      class="btn-secondary"
    >
      Сохранить как черновик
    </button>
  </div>
</form>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Всегда явно указывайте `type="button"` для не-сабмитящих кнопок. По умолчанию в стандарте HTML любая кнопка внутри формы имеет `type="submit"`!

---

### [HTML] 04. Modern Semantic Document Outlining
* **Category:** `HTML5 Semantic`
* **Quick Copy:** `<h1>Главный заголовок</h1><section><h2>Раздел</h2><h3>Подраздел</h3></section>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Semantic`, `Accessibility`, `SEO`, `Headings`

> 🛡️ **Главный инвариант:** Концепция HTML5 Outline Algorithm (когда в каждом `<section>` можно было начинать заново с `<h1>`) была **официально удалена из спецификации W3C** из-за отсутствия поддержки браузерами и скринридерами. На странице обязан быть строго один `<h1>`, а заголовки `<h2>`-`<h6>` должны следовать строгой математической иерархии без пропусков уровней.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Иерархическое дерево:** Вспомогательные технологии строят оглавление документа исключительно по числовому рангу тегов от `h1` до `h6`.
- **Пропуск уровней:** Переход от `<h2>` сразу к `<h4>` сбивает скринридеры с толку, создавая ложное впечатление, что родительский раздел был пропущен.

#### 💡 Phase 2: Analogy (Mental Model)
Заголовки — это оглавление научной диссертации: Глава 1 (`h1`) -> Раздел 1.1 (`h2`) -> Пункт 1.1.1 (`h3`). Вы не можете начать книгу с Пункта 1.1.1 без Главы 1.

#### ⚡ Phase 3: Context (Production Code)
```html
<header>
  <nav aria-label="Основная навигация">...</nav>
</header>

<main id="main-content">
  <header>
    <h1>Панель Управления Реестром Транзакций</h1>
    <p class="subtitle">Zero-Trust V8 Архитектура</p>
  </header>

  <article class="ledger-report">
    <h2>Сводный ончейн-аудит Solana</h2>
    
    <section>
      <h3>Стерильность Хранилища</h3>
      <p>Прототипы изолированы через <code>Object.create(null)</code>.</p>
    </section>

    <section>
      <h3>Телеметрия RPC Нод</h3>
      <p>Подключение к Devnet активно.</p>
    </section>
  </article>
</main>

<footer>
  <p>&copy; 2026 Induktr Studio. Все права защищены.</p>
</footer>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Никогда не используйте теги `<section>` или `<article>` просто как обёртки для применения CSS-стилей. Для стилизации используйте обычный семантически нейтральный `<div>`.

---

### [HTML] 05. Responsive & Accessible Audio/Video Subtitles
* **Category:** `HTML5 Media`
* **Quick Copy:** `<video controls playsinline preload="metadata"><track kind="captions" src="sub.vtt" srclang="ru" label="Русский" default></video>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Video`, `A11y`, `Captions`, `WebVTT`

> 🛡️ **Главный инвариант:** Воспроизведение видео на мобильных устройствах iOS без атрибута `playsinline` разворачивает плеер на весь экран, блокируя кастомный интерфейс. Видео без тега `<track kind="captions">` нарушает критерий доступности WCAG 1.2.2.

#### 📌 Phase 1: Deconstruction (Architecture)
- **`playsinline`:** Позволяет видео воспроизводиться прямо в теле документа на iPhone.
- **`preload="metadata"`:** Оптимальный режим: скачивает только продолжительность и первый кадр, экономя мегабайты мобильного трафика.
- **`<track kind="captions">`:** Подключает текстовую дорожку в формате WebVTT (`.vtt`). В отличие от `subtitles`, `captions` включают описание звуков окружения (звук взрыва, шаги) для людей с нарушениями слуха.

#### 💡 Phase 2: Analogy (Mental Model)
Видео без субтитров и `playsinline` — это телевизор в аэропорту без звука и пульта: зрители видят шевеление губ, но ничего не понимают.

#### ⚡ Phase 3: Context (Production Code)
```html
<video 
  controls 
  playsinline 
  preload="metadata" 
  poster="/media/poster.webp"
  width="1280" 
  height="720"
>
  <!-- Современные кодеки с постепенной деградацией -->
  <source src="/media/ledger-demo.av1.mp4" type="video/mp4; codecs=av01">
  <source src="/media/ledger-demo.h265.mp4" type="video/mp4">
  <source src="/media/ledger-demo.h264.mp4" type="video/mp4">

  <!-- Дорожка субтитров для скринридеров и доступности -->
  <track 
    kind="captions" 
    src="/media/subs-ru.vtt" 
    srclang="ru" 
    label="Русские субтитры" 
    default
  >
  <track 
    kind="captions" 
    src="/media/subs-en.vtt" 
    srclang="en" 
    label="English Captions"
  >

  <p>Ваш браузер не поддерживает встроенное видео. <a href="/media/ledger-demo.mp4">Скачать видео</a>.</p>
</video>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Если видео имеет атрибут `autoplay`, современные браузеры заблокируют его воспроизведение, если одновременно не указан атрибут `muted`.

---

### [HTML] 06. Searchable Datalist: Native Zero-JS Autocomplete
* **Category:** `HTML5 Forms`
* **Quick Copy:** `<input list="tokens" name="token"><datalist id="tokens"><option value="SOL"><option value="USDC"></datalist>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Forms`, `Datalist`, `Autocomplete`, `ZeroJS`

> 🛡️ **Главный инвариант:** Тег `<datalist>` объединяет удобство текстового поля (свободный ввод) и выпадающего списка (подсказки при наборе) на чистом HTML без тяжелых JS-плагинов (Select2).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Связка через ID:** Инпут указывает `list="id"`, привязываясь к скрытому контейнеру `<datalist>`.
- **Нативная фильтрация:** Браузер сам фильтрует опции по мере ввода символов пользователем с учетом локали.
- **Поддержка текстовых меток:** Тег `<option value="SOL" label="Solana Native">` выводит расширенную подсказку в выпадающем окне.

#### 💡 Phase 2: Analogy (Mental Model)
`<select>` — это закрытое меню в ресторане: нельзя заказать то, чего нет в списке. `<datalist>` — это умный официант: вы можете заказать любое блюдо, но официант подсказывает популярные варианты по первым буквам.

#### ⚡ Phase 3: Context (Production Code)
```html
<label for="tokenSelect">Выберите токен для оплаты комиссии:</label>
<input 
  type="text" 
  id="tokenSelect" 
  name="feeToken" 
  list="supportedTokens" 
  placeholder="Начните ввод тикера (SOL, USDC)..."
  autocomplete="off"
>

<datalist id="supportedTokens">
  <option value="SOL" label="Solana (Native)">
  <option value="USDC" label="USD Coin (SPL)">
  <option value="USDT" label="Tether USD (SPL)">
  <option value="BONK" label="Bonk Meme Token">
</datalist>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- В отличие от `<select>`, при отправке формы на сервер уйдет то значение, которое пользователь ввел в поле руками, даже если его нет в списке подсказок.

---

### [HTML] 07. Native Gauges: Meter vs Progress Semantics
* **Category:** `HTML5 Semantic`
* **Quick Copy:** `<meter value="85" min="0" max="100" low="30" high="80" optimum="95"></meter>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Meter`, `Progress`, `Semantic`, `A11y`

> 🛡️ **Главный инвариант:** Тег `<progress>` предназначен исключительно для отображения **прогресса выполнения задачи во времени** (загрузка файла). Тег `<meter>` предназначен для отображения **скалярных измерений в заданном диапазоне** (остаток диска, уровень заряда, оценка безопасности).

#### 📌 Phase 1: Deconstruction (Architecture)
- **`<progress>`:** Принимает только `value` и `max`. Если атрибут `value` опущен, браузер переходит в режим неопределенного ожидания (*indeterminate spinner*).
- **`<meter>`:** Принимает `min`, `max`, `low`, `high`, `optimum`. Браузер сам перекрашивает полосу в зеленый, желтый или красный цвет в зависимости от того, находится ли значение близко к `optimum`.

#### 💡 Phase 2: Analogy (Mental Model)
`<progress>` — это бегун на стометровке: чем ближе к финишу, тем лучше. `<meter>` — это спидометр или уровень бензина в баке: шкала показывает текущий статус, а не ход работы.

#### ⚡ Phase 3: Context (Production Code)
```html
<!-- 1. Ход выполнения ончейн-транзакции -->
<div class="status-item">
  <label for="txProgress">Подтверждение блоков (24/32):</label>
  <progress id="txProgress" value="24" max="32">75%</progress>
</div>

<!-- 2. Оценка покрытия тестами безопасности (Meter) -->
<div class="status-item">
  <label for="securityScore">Индекс безопасности ядра:</label>
  <meter 
    id="securityScore" 
    value="92" 
    min="0" 
    max="100" 
    low="40" 
    high="80" 
    optimum="100"
  >92 из 100</meter>
</div>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Всегда дублируйте текстовое значение внутри тегов `<progress>75%</progress>`, чтобы старые клиенты или текстовые браузеры отображали информацию.

---

### [HTML] 08. Precision Date & Time Semantics with `<time>`
* **Category:** `HTML5 Semantic`
* **Quick Copy:** `<time datetime="2026-10-04T14:30:00Z">4 октября 2026</time>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Time`, `ISO8601`, `SEO`, `Microdata`

> 🛡️ **Главный инвариант:** Текстовая дата «вчера» или «3 часа назад» непонятна поисковым роботам и скринридерам. Тег `<time datetime="...">` предоставляет строго стандартизированную временную метку по стандарту ISO 8601.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Синтаксис `datetime`:**
  - Точная дата: `YYYY-MM-DD` (`2026-10-04`).
  - Время с таймзоной: `2026-10-04T14:30:00+03:00`.
  - Длительность (Duration): `PT2H30M` (2 часа 30 минут).
- **SEO & AI:** Поисковые пауки Google и AI-агенты извлекают дату публикации статьи или транзакции именно из атрибута `datetime`.

#### 💡 Phase 2: Analogy (Mental Model)
Человеческое «вчера в обед» — это записка от руки на холодильнике: вы понимаете контекст, но робот-пылесос не знает, когда убирать. `<time datetime="...">` — это штрих-код всемирного атомного времени GPS: и человек видит привычный текст, и машина точно знает миллисекунду события.

#### ⚡ Phase 3: Context (Production Code)
```html
<p class="ledger-timestamp">
  Транзакция зафиксирована в блоке:
  <time datetime="2026-10-04T11:27:00Z" title="4 октября 2026, 14:27 MSK">
    только что
  </time>
</p>

<p class="lock-duration">
  Период блокировки стейкинга:
  <time datetime="P14D">14 дней</time>
</p>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Не оборачивайте в `<time>` даты до нашей эры или неточные исторические эпохи («палеолит») — синтаксис ISO 8601 валидирует только григорианский календарь.

---

### [HTML] 09. Contenteditable="Plaintext-Only": Clean Native Inputs
* **Category:** `HTML5 Forms`
* **Quick Copy:** `<div contenteditable="plaintext-only"></div>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Contenteditable`, `Forms`, `Sanitization`, `RichText`

> 🛡️ **Главный инвариант:** Стандартный `contenteditable="true"` при вставке из буфера (Ctrl+V) затягивает грязные сторонние теги `<span>`, инлайн-стили и `<div>`, ломая разметку. Значение `contenteditable="plaintext-only"` гарантирует прием строго чистого сырого текста.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Исключение XSS:** Вставляемый текст автоматически экранируется браузером на уровне парсера, предотвращая инъекции HTML-разметки.
- **Уничтожение переносов через `<div>`:** Браузер перестает оборачивать каждую новую строку в `<p>` или `<div>`, сохраняя стандартные переносы строк `
`.

#### 💡 Phase 2: Analogy (Mental Model)
Обычный `contenteditable="true"` — это впустить гостей с улицы в белых носках прямо в грязных ботинках: они приносят с собой комья чужой грязи (стили Word, спаны, шрифты). Значение `plaintext-only` — это герметичный шлюз дезинфекции: на входе у всех отбирают обувь и одежду, пропуская только чистый сырой текст.

#### ⚡ Phase 3: Context (Production Code)
```html
<div 
  class="code-input-area"
  contenteditable="plaintext-only"
  spellcheck="false"
  autocorrect="off"
  autocapitalize="off"
  role="textbox"
  aria-multiline="true"
  aria-label="Ввод JSON полезной нагрузки"
>
  {"amount": 100, "currency": "SOL"}
</div>

<style>
  .code-input-area {
    font-family: monospace;
    background: #09090b;
    color: #fafafa;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 16px;
    min-height: 120px;
    white-space: pre-wrap;
  }
</style>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- При использовании `contenteditable` обязательно добавляйте атрибут `role="textbox"` и `aria-multiline="true"`, чтобы скринридер корректно распознал элемент как поле ввода.

---

### [HTML] 10. Declarative Shadow DOM (SSR Web Components)
* **Category:** `HTML5 WebComponents`
* **Quick Copy:** `<host-elem><template shadowrootmode="open"><style>p{color:red}</style><p>Hello</p></template></host-elem>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `ShadowDOM`, `SSR`, `WebComponents`, `Templates`

> 🛡️ **Главный инвариант:** Раньше Shadow DOM можно было создать только в JS через `attachShadow()`, что вызывало вспышку нестилизованного контента (FOUC) при SSR. Атрибут `<template shadowrootmode="open">` заставляет парсер браузера построить изолированный Shadow Root немедленно при парсинге HTML.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Мгновенный парсинг:** Браузер встречает тег `<template shadowrootmode="open">`, автоматически удаляет его из DOM и превращает его содержимое в Shadow Root родителя до выполнения какого-либо клиентского скрипта.
- **Изоляция стилей:** Стили `<style>` внутри такого шаблона физически не просачиваются наружу в глобальный документ.

#### 💡 Phase 2: Analogy (Mental Model)
Клиентский Shadow DOM через JS — это сборка мебели прямо в квартире заказчика посреди ночи со стуком молотка (FOUC). Декларативный Shadow DOM — это готовый модуль дома, собранный на заводе (сервере): его привезли, поставили краном, и в нем уже горят лампы и стоят перегородки до прихода жильцов.

#### ⚡ Phase 3: Context (Production Code)
```html
<!-- Серверный рендеринг изолированного веб-компонента -->
<secure-badge status="verified">
  <template shadowrootmode="open">
    <style>
      :host {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: system-ui, sans-serif;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #22c55e;
      }
      .label {
        font-weight: 600;
        font-size: 0.875rem;
      }
    </style>

    <span class="dot"></span>
    <span class="label"><slot>Верифицировано V8</slot></span>
  </template>
</secure-badge>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- В устаревших спецификациях атрибут назывался `shadowroot`. Современный стандарт — строго `shadowrootmode="open"` или `"closed"`.

---

### [HTML] 11. Subresource Integrity (SRI): CDN Attack Shield
* **Category:** `HTML5 Security`
* **Quick Copy:** `<script src="..." integrity="sha384-..." crossorigin="anonymous"></script>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Security`, `SRI`, `SupplyChain`, `CDN`

> 🛡️ **Главный инвариант:** Если внешний CDN взломают и подменят файл библиотеки вредоносным кодом, атрибут `integrity` заблокирует выполнение скрипта: браузер вычисляет криптографический хеш скачанного файла и сбрасывает его при несовпадении.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Алгоритм проверки:** Браузер выполняет хэширование по алгоритму `sha256`, `sha384` или `sha512`.
- **Обязательность CORS:** Атрибут `crossorigin="anonymous"` строго обязателен, иначе браузер не имеет права читать байты ответа с другого домена для вычисления хэша.

#### 💡 Phase 2: Analogy (Mental Model)
Подключение скрипта с CDN без SRI — это заказ лекарства в случайной аптеке без проверки пломбы. SRI — это сургучная печать с контрольной суммой: если по дороге курьера перехватили и подменили ампулу хоть на один байт, охрана на входе (браузер) мгновенно уничтожает посылку.

#### ⚡ Phase 3: Context (Production Code)
```html
<script 
  src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.7.0/ethers.umd.min.js"
  integrity="sha384-B52zNqK670+2L1K5F2nK1/Yl3kEwQv10j5bVvN9sQy0wR3k8nZ4/k4r8zK0v2nK1"
  crossorigin="anonymous"
  defer
></script>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Всегда используйте хэш `sha384` — он рекомендован W3C как оптимальный баланс между стойкостью к коллизиям и скоростью вычисления.

---

### [HTML] 12. Cross-Origin Isolation (COOP & COEP Meta Tags)
* **Category:** `HTML5 Security`
* **Quick Copy:** `<meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">`
* **Status:** `Actual`
* **Tags:** `HTML5`, `COOP`, `COEP`, `Security`, `SharedArrayBuffer`

> 🛡️ **Главный инвариант:** Доступ к высокоточным таймерам (`performance.now()`) и многопоточной разделяемой памяти (`SharedArrayBuffer`) заблокирован по умолчанию из-за атак Spectre/Meltdown. Включение заголовков COOP и COEP изолирует процесс в памяти ОС.

#### 📌 Phase 1: Deconstruction (Architecture)
- **COOP (`same-origin`):** Запрещает другим сайтам открывать вашу страницу во всплывающем окне и получать ссылку `window.opener`.
- **COEP (`require-corp`):** Запрещает загрузку любых внешних ресурсов, которые явно не разрешили это через заголовок Cross-Origin Resource Policy (CORP).

#### 💡 Phase 2: Analogy (Mental Model)
Обычная веб-страница — это коммунальная квартира с тонкими стенами: соседи через замочную скважину (Spectre/Meltdown) могут засекать время и подслушивать чужие пароли. COOP и COEP превращают квартиру в автономный бункер с метровыми железобетонными стенами, в котором разрешено использовать сверхточное ядерное оборудование (`SharedArrayBuffer`).

#### ⚡ Phase 3: Context (Production Code)
```html
<head>
  <!-- Изоляция окна от внешних атак перехвата контекста -->
  <meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
  <meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
</head>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Проверить активацию изоляции в JS можно через вызов `window.crossOriginIsolated === true`.

---

### [HTML] 13. Dynamic Theme Color with Media Matching
* **Category:** `HTML5 Mobile`
* **Quick Copy:** `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#09090b">`
* **Status:** `Actual`
* **Tags:** `HTML5`, `ThemeColor`, `Mobile`, `UI`, `DarkMode`

> 🛡️ **Главный инвариант:** Метатег `theme-color` окрашивает системную панель браузера на смартфонах (Safari iOS, Chrome Android). Добавление атрибута `media` переключает цвет панели автоматически при смене темы ОС без единой строки JS.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Интеграция с UI операционной системы:** Метатег `<meta name="theme-color">` транслирует HEX-код в системный композитор ОС (Android System UI и Safari Titlebar).
- **Медиа-запрос `prefers-color-scheme`:** Браузер переключает значение метатега в момент смены глобальной темы устройства без ререндеринга страницы и без пересчета DOM-дерева.

#### 💡 Phase 2: Analogy (Mental Model)
`theme-color` — это цвет козырька бейсболки на вашей голове. Когда на улице день — козырек становится белым от солнца; когда наступает ночь — вы нажимаете кнопку на очках (смена темы ОС), и козырек мгновенно сливается с темнотой.

#### ⚡ Phase 3: Context (Production Code)
```html
<head>
  <!-- Светлая тема: чистый светлый интерфейс -->
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
  
  <!-- Тёмная тема: глубокий чёрный интерфейс под AMOLED -->
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#09090b">
</head>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- В Safari на iOS цвет тулбара берется из первого подходящего метатега `theme-color`, но если цвет фона `body` сильно контрастирует с `theme-color`, браузер может автоматически переопределить его для читаемости часов.
- Не используйте альфа-канал или полупрозрачные цвета в `content` — значение обязано быть непрозрачным (6-символьный HEX).

---

### [HTML] 14. Programmatic File Downloads with `<a download>`
* **Category:** `HTML5 Navigation`
* **Quick Copy:** `<a href="/exports/report.csv" download="ledger-snapshot.csv">Экспорт</a>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Download`, `Links`, `Files`, `DataExport`

> 🛡️ **Главный инвариант:** Атрибут `download` сообщает браузеру, что ресурс по ссылке должен быть сохранен на диск, а не открыт в новой вкладке. Значение атрибута задает имя файла по умолчанию.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Same-Origin Restriction:** По соображениям безопасности атрибут `download` работает только для ссылок с **того же домена** или для локальных `blob:` / `data:` URI. Для внешних доменов браузер проигнорирует имя файла и выполнит обычный переход.
- **Взаимодействие с Content-Disposition:** Если сервер присылает HTTP-заголовок `Content-Disposition: attachment; filename="server-name.csv"`, заголовок сервера имеет безусловный приоритет над атрибутом в HTML.

#### 💡 Phase 2: Analogy (Mental Model)
Обычная ссылка — это витрина музея: вы подходите и смотрите на экспонат через стекло. Ссылка с атрибутом `download` — это касса выдачи заказов: при нажатии вам сразу упаковывают товар в коробку и вручают в руки (на жесткий диск).

#### ⚡ Phase 3: Context (Production Code)
```html
<!-- Прямое сохранение локального снепшота -->
<a 
  href="data:text/json;charset=utf-8,%7B%22status%22%3A%22ok%22%7D" 
  download="solana-account-snapshot.json"
  class="download-button"
>
  Скачать снапшот аккаунта (.json)
</a>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Для динамически сгенерированных в JS данных всегда используйте `URL.createObjectURL(blob)` в связке с `download`, и не забывайте вызывать `URL.revokeObjectURL()` для освобождения оперативной памяти.

---

### [HTML] 15. The Tabindex Invariant: Strict Keyboard Order
* **Category:** `HTML5 A11y`
* **Quick Copy:** `tabindex="0" /* В потоке */ tabindex="-1" /* Только JS */ Никогда: tabindex="1+"`
* **Status:** `Actual`
* **Tags:** `HTML5`, `A11y`, `Tabindex`, `Keyboard`, `AntiPattern`

> 🛡️ **Главный инвариант:** Использование положительного `tabindex="1"`, `tabindex="2"` — грубейшая ошибка верстки. Оно ломает естественный порядок навигации браузера. В продакшене допустимы только два значения: `0` и `-1`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **`tabindex="0"`:** Добавляет неинтерактивный элемент (кастомный чекбокс, `div`) в естественный порядок обхода клавиатуры по ходу DOM-дерева.
- **`tabindex="-1"`:** Исключает элемент из обхода по Tab, но позволяет перевести на него фокус программно через JavaScript (`element.focus()`). Незаменимо для фокуса заголовка открытой модалки.
- **Катастрофа `tabindex="1+"`:** Любой положительный индекс вырывает элемент из очереди и ставит его раньше **всех** стандартных кнопок и ссылок страницы. Если на странице 10 элементов с `tabindex="1"`, пользователь клавиатуры будет хаотично прыгать по экрану.

#### 💡 Phase 2: Analogy (Mental Model)
Порядок в DOM — это живая очередь людей к кассе по талончикам. Положительный `tabindex="1"` — это наглец, который лезет без очереди с криком «мне только спросить!». Если таких наглецов несколько, в очереди начинается хаос и драка.

#### ⚡ Phase 3: Context (Production Code)
```html
<!-- Контейнер ошибки, получающий фокус программно при сбое -->
<div 
  id="errorSummary" 
  tabindex="-1" 
  role="alert" 
  class="error-banner"
>
  Ошибка подписи транзакции: недостаточный баланс SOL
</div>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Линтеры (`eslint-plugin-jsx-a11y`) по умолчанию помечают `tabindex > 0` как критическую ошибку, блокирующую сборку CI/CD.

---

### [HTML] 16. Semantic Quotations & Machine Citations
* **Category:** `HTML5 Semantic`
* **Quick Copy:** `<blockquote cite="https://solana.com"><p>Quote</p></blockquote><cite>Source</cite>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Semantic`, `Blockquote`, `Cite`, `SEO`

> 🛡️ **Главный инвариант:** Тег `<cite>` по спецификации HTML5 должен содержать название произведения, документа или источника, но **не имя человека-автора**. Атрибут `cite="..."` на `<blockquote>` предназначен строго для машиночитаемого URL источника.

#### 📌 Phase 1: Deconstruction (Architecture)
- **`<blockquote>` против `<q>`:** `<blockquote>` предназначен для крупных многострочных цитат (блочный элемент); `<q>` — для встроенных инлайн-цитат (браузер сам добавляет типографические кавычки с учетом языка документа `lang`).
- **Машиночитаемый атрибут `cite`:** Атрибут `cite="..."` на `<blockquote>` принимает валидный URL источника. Он невидим пользователю, но считывается поисковыми роботами.
- **Тег `<cite>`:** По стандарту W3C HTML5 тег `<cite>` должен содержать строго название произведения (книги, статьи, спецификации), но не имя автора!

#### 💡 Phase 2: Analogy (Mental Model)
`<blockquote>` — это картина в раме, повешенная на стену. `<q>` — это прямая речь в диалоге персонажей книги. Тег `<cite>` — это табличка на раме с названием картины, а не имя художника.

#### ⚡ Phase 3: Context (Production Code)
```html
<figure class="quote-wrapper">
  <blockquote cite="https://docs.solanalabs.com/consensus">
    <p>Все ончейн-аккаунты Solana являются базовыми единицами хранения состояния в рантайме Sealevel.</p>
  </blockquote>
  <figcaption>
    Источник: <cite>Solana Architecture Documentation</cite>
  </figcaption>
</figure>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Не пишите кавычки руками внутри тега `<q>` — браузер автоматически подставит правильные региональные кавычки (лапки в Германии, елочки в России) в зависимости от атрибута `lang="..."` у тега `html`.

---

### [HTML] 17. Bidirectional Text Isolation (`<bdi>` & `<bdo>`)
* **Category:** `HTML5 i18n`
* **Quick Copy:** `<p>Пользователь <bdi>اسم</bdi> перевел 5 SOL</p>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `i18n`, `RTL`, `bdi`, `Unicode`

> 🛡️ **Главный инвариант:** Если имя пользователя написано на арабском или иврите (справа налево), его вставка в середину русского предложения без тега `<bdi>` перевернет порядок стоящих рядом цифр и скобок. Тег `<bdi>` (Bi-directional Isolation) полностью изолирует алгоритм Юникода.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Алгоритм Unicode BiDi:** Браузерный алгоритм двунаправленного текста определяет направление символов по первому сильному символу. Если арабское имя вставляется перед числом, число может уехать влево.
- **`<bdi>` (Bi-directional Isolate):** Полностью изолирует встроенный текст от окружающего контекста. Направление текста внутри `<bdi>` не влияет на порядок слов и знаков препинания снаружи.
- **`<bdo>` (Bi-directional Override):** Принудительно меняет направление письма на обратное (например, `<bdo dir="rtl">` для реверсивного чтения).

#### 💡 Phase 2: Analogy (Mental Model)
Текст LTR и RTL — это поезда, едущие навстречу друг другу по одному пути. Без `<bdi>` они врезаются, и вагоны (скобки, цифры) разлетаются в хаотичном порядке. `<bdi>` — это отдельный изолированный тоннель под землей: поезд проезжает внутри, не задевая движение на поверхности.

#### ⚡ Phase 3: Context (Production Code)
```html
<ul class="transactions-list">
  <li>
    Отправитель: <bdi dir="auto">أحمد</bdi> — Сумма: <strong>1.5 SOL</strong>
  </li>
  <li>
    Отправитель: <bdi dir="auto">Alex</bdi> — Сумма: <strong>0.5 SOL</strong>
  </li>
</ul>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Всегда оборачивайте любые имена пользователей, комментарии или никнеймы из Web3/базы данных в `<bdi dir="auto">`, если платформа поддерживает международную аудиторию.

---

### [HTML] 18. The Output Element for Calculated State
* **Category:** `HTML5 Forms`
* **Quick Copy:** `<form oninput="r.value=parseInt(a.value)+parseInt(b.value)"><output name="r" for="a b"></output></form>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Forms`, `Output`, `A11y`, `Calculations`

> 🛡️ **Главный инвариант:** Результаты математических калькуляторов и конвертеров валют обязаны выводиться в теге `<output>`, связанном через атрибут `for="id1 id2"` с источниками данных. Скринридер объявляет изменение значения в `<output>` автоматически без дополнительных `aria-live`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Связка через атрибут for:** Атрибут `for="id1 id2"` программно связывает выходной результат с инпутами-источниками в Accessibility Tree.
- **Автоматический aria-live:** Тег `<output>` имеет неявную роль `role="status"` и по умолчанию ведет себя как live region (`aria-live="polite"`). Когда значение меняется, скринридер зачитывает обновленную цифру без прерывания речи.

#### 💡 Phase 2: Analogy (Mental Model)
`<output>` — это цифровое табло на весах в супермаркете. Вы кладете яблоки на платформу (инпуты), а табло само вспыхивает новой цифрой и озвучивает вес через динамик кассиру.

#### ⚡ Phase 3: Context (Production Code)
```html
<form class="fee-calculator">
  <label for="lamports">Количество Lamports:</label>
  <input type="range" id="lamports" name="l" min="1000" max="50000" value="5000" step="1000">

  <p>Комиссия сети: 
    <output id="feeResult" name="fee" for="lamports">0.000005 SOL</output>
  </p>
</form>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Значение `<output>` не отправляется на сервер при submit формы, если у него нет явного атрибута `name`, но семантически оно всегда должно оставаться частью элемента `<form>`.

---

### [HTML] 19. Social Meta Graph Architecture (OpenGraph & Twitter)
* **Category:** `HTML5 SEO`
* **Quick Copy:** `<meta property="og:title" content="..."><meta property="og:image" content="...">`
* **Status:** `Actual`
* **Tags:** `HTML5`, `OpenGraph`, `SEO`, `SocialMedia`, `Metadata`

> 🛡️ **Главный инвариант:** Мессенджеры (Telegram, Slack) и соцсети генерируют карточку предпросмотра ссылки строго по тегам OpenGraph. Картинка `og:image` обязана иметь абсолютный URL с протоколом `https://` и разрешение 1200x630px.

#### 📌 Phase 1: Deconstruction (Architecture)
- **OpenGraph (`og:*`):** Протокол Facebook/Telegram. Ключевые поля: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`.
- **Twitter Cards:** Расширение X/Twitter. Атрибут `twitter:card="summary_large_image"` разворачивает изображение во всю ширину ленты вместо мелкой иконки слева.
- **Кэширование ботами:** Мессенджеры кэшируют OpenGraph наглухо по URL. При смене баннера необходимо сбрасывать кэш через Telegram @WebpageBot или менять query-параметр версии (`?v=2`).

#### 💡 Phase 2: Analogy (Mental Model)
OpenGraph — это обложка книги в магазине. Если обложки нет — мессенджер показывает серый прямоугольник. Если обложка сочная, с крупным названием и ярким артом 1200x630 — вероятность клика вырастает на 300%.

#### ⚡ Phase 3: Context (Production Code)
```html
<head>
  <!-- OpenGraph Primary Metadata -->
  <meta property="og:site_name" content="Induktr Studio">
  <meta property="og:title" content="Secure Ledger Engine: Zero-Trust Ядро Транзакций">
  <meta property="og:description" content="Отказоустойчивое ядро учета транзакций на чистом JavaScript с защитой от Prototype Pollution.">
  <meta property="og:image" content="https://induktr.com/assets/og-secure-ledger.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:type" content="article">
  <meta property="og:url" content="https://induktr.com/security/secure-ledger">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@induktr">
</head>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Размер `og:image` строго 1200x630 px (соотношение 1.91:1), вес файла до 5 МБ (лучше до 1 МБ), формат PNG или WebP.
- Протокол URL в `og:image` и `og:url` обязан быть абсолютным `https://`. Относительные пути `/img/banner.png` мессенджерами игнорируются.

---

### [HTML] 20. Modern Native Search Landmark (`<search>`)
* **Category:** `HTML5 Semantic`
* **Quick Copy:** `<search><form action="/search"><input type="search" name="q"></form></search>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Search`, `Semantic`, `A11y`, `Landmarks`

> 🛡️ **Главный инвариант:** Тег `<search>` (стандарт HTML5.3) заменяет устаревшую конструкцию `<form role="search">`. Он определяет нативный ориентир (Landmark) для ассистивных технологий, позволяя пользователю мгновенно перепрыгнуть к поисковой строке сайта из любого места страницы.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Нативный ориентир W3C:** Тег `<search>` имеет встроенную семантическую роль `role="search"`. В Accessibility Tree он регистрируется как поисковый регион документа.
- **Быстрая навигация клавиатурой:** Пользователи скринридеров (NVDA, VoiceOver) используют горячую клавишу `D` для циклического перемещения по ключевым ориентирам страницы (`banner` -> `main` -> `search` -> `contentinfo`).

#### 💡 Phase 2: Analogy (Mental Model)
Тег `<search>` — это яркая светящаяся вывеска «ИНФОРМАЦИЯ & СПРАВКА» в центре огромного вокзала: пассажиру не нужно блуждать по этажам, он сразу видит маяк и направляется к нему.

#### ⚡ Phase 3: Context (Production Code)
```html
<header class="app-header">
  <a href="/" class="brand-logo">Ledger Explorer</a>

  <!-- Нативный поисковый ориентир поисковой строки -->
  <search>
    <form action="/explorer/search" method="GET">
      <label for="globalSearch" class="sr-only">Поиск аккаунта или транзакции</label>
      <input 
        type="search" 
        id="globalSearch" 
        name="q" 
        placeholder="Поиск по PubKey или Signature..."
        autocomplete="off"
        spellcheck="false"
      >
      <button type="submit">Найти</button>
    </form>
  </search>
</header>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Внутри тега `<search>` инпут поиска должен иметь тип `type="search"`. Это активирует нативную кнопку быстрой очистки (крестик) в браузерах Chrome и Safari.
