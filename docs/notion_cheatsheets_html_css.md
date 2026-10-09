# 📚 Мастер-База Шпаргалок по HTML5 & Modern CSS (52 Шпоры)
### Стандарт: Induktr Studio 4-Phase Architecture для Notion

---

### [HTML/CSS] 01. Resource Hints: Preload, Prefetch & Preconnect
* **Category:** `HTML/CSS Performance`
* **Quick Copy:** `<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin><link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Performance`, `Network`, `CoreWebVitals`, `Preload`

> 🛡️ **Главный инвариант:** `preload` инициирует немедленную загрузку ресурса с критическим приоритетом в текущей навигации. Если предзагруженный ресурс не используется на странице в течение 3 секунд, браузер Chrome выбрасывает предупреждение в консоль о неэффективном использовании полосы пропускания.

#### 📌 Phase 1: Deconstruction (Architecture)
- **`dns-prefetch`:** Выполняет только резолвинг DNS-имени в IP. Дешёвая операция (1 пакет туда-обратно).
- **`preconnect`:** Выполняет DNS-lookup + TCP-handshake + TLS-negotiation. Экономит до 300мс на внешних CDN (шрифты, аналитика).
- **`preload`:** Принудительно скачивает ресурс в память до того, как парсер HTML дойдет до тега `<link>` или CSS-правила `url()`. Требует атрибута `as="..."` для назначения правильного приоритета в очереди загрузки.
- **`prefetch`:** Скачивает ресурс с низким приоритетом в кэш браузера для *следующей* страницы, на которую пользователь, вероятно, перейдёт.

#### 💡 Phase 2: Analogy (Mental Model)
`dns-prefetch` — это найти адрес ресторана на карте. `preconnect` — это забронировать столик и вызвать такси. `preload` — это заказать блюдо ко времени приезда. `prefetch` — это положить меню соседнего ресторана в карман на завтра.

#### ⚡ Phase 3: Context (Production Code)
```html
<head>
  <!-- 1. Быстрое подключение к внешнему CDN (шрифты, медиа) -->
  <link rel="preconnect" href="https://cdn.example.com" crossorigin>
  
  <!-- 2. Критический шрифт для LCP без FOIT/FOUT -->
  <link 
    rel="preload" 
    href="/assets/fonts/inter-bold.woff2" 
    as="font" 
    type="font/woff2" 
    crossorigin
  >

  <!-- 3. Критический Hero Image для снижения LCP -->
  <link 
    rel="preload" 
    fetchpriority="high" 
    href="/assets/images/hero.webp" 
    as="image" 
    type="image/webp"
  >

  <!-- 4. Предзагрузка бандла для следующей вероятной страницы -->
  <link rel="prefetch" href="/js/checkout.chunk.js" as="script">
</head>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Для шрифтов атрибут `crossorigin` **обязателен** даже для локальных файлов, иначе браузер загрузит шрифт дважды (анонимно и с CORS-учетом).
- Атрибут `fetchpriority="high"` явно повышает приоритет в планировщике сетевого стека Blink/WebKit.

---

### [HTML/CSS] 02. Responsive Images: Picture, Srcset & CLS Prevention
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `<img src="fallback.jpg" srcset="img-400.webp 400w, img-800.webp 800w" sizes="(max-width: 600px) 100vw, 50vw" width="800" height="600" loading="lazy" decoding="async" alt="...">`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Images`, `Responsive`, `CLS`, `Performance`

> 🛡️ **Главный инвариант:** Тег `<img>` обязан иметь явные атрибуты `width` и `height` (либо CSS-свойство `aspect-ratio`). Это позволяет браузеру рассчитать пропорции до загрузки байтов и зарезервировать высоту в DOM, полностью устраняя сдвиг макета (Cumulative Layout Shift = 0).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Дескрипторы плотности (`1x, 2x`) против ширины (`w`):** Дескриптор `w` передает реальную ширину файла картинки в пикселях. Браузер сам делит `w` на значение `sizes` и плотность экрана (`devicePixelRatio`), выбирая оптимальный файл.
- **`<picture>`:** Используется для *Art Direction* (разное кадрирование под мобильные и десктоп) или форматов нового поколения (`AVIF` $\to$ `WebP` $\to$ `JPG`).
- **`decoding="async"`:** Декодирование сжатого изображения выносится из основного потока (Main Thread), предотвращая зависание скролла.

#### 💡 Phase 2: Analogy (Mental Model)
`srcset` и `sizes` — это меню одежды с точными размерами. Вы говорите браузеру габариты полки в шкафу (`sizes`), а он сам выбирает из коробки вещь нужного размера (`srcset`), не меряя всё подряд.

#### ⚡ Phase 3: Context (Production Code)
```html
<picture>
  <!-- 1. Современный формат с максимальным сжатием -->
  <source 
    type="image/avif" 
    srcset="/img/hero-mobile.avif 480w, /img/hero-desktop.avif 1200w" 
    sizes="(max-width: 768px) 100vw, 1200px"
  >
  <!-- 2. Широко поддерживаемый WebP -->
  <source 
    type="image/webp" 
    srcset="/img/hero-mobile.webp 480w, /img/hero-desktop.webp 1200w" 
    sizes="(max-width: 768px) 100vw, 1200px"
  >
  <!-- 3. Универсальный Fallback с фиксацией Aspect Ratio -->
  <img 
    src="/img/hero-desktop.jpg" 
    width="1200" 
    height="675" 
    loading="lazy" 
    decoding="async" 
    fetchpriority="auto" 
    alt="Архитектура облачной системы"
    style="width: 100%; height: auto; object-fit: cover;"
  >
</picture>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Для первой картинки на первом экране (Hero Image / LCP) **никогда не ставьте `loading="lazy"`**, иначе загрузка будет отложена, что уничтожит оценку LCP!
- На первом экране ставьте `loading="eager"` и `fetchpriority="high"`.

---

### [HTML/CSS] 03. Native Dialog API: Modals, Traps & Backdrops
* **Category:** `HTML/CSS A11y`
* **Quick Copy:** `<dialog id="d"><h3>Title</h3><form method="dialog"><button>Close</button></form></dialog>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Dialog`, `Modal`, `A11y`, `TopLayer`

> 🛡️ **Главный инвариант:** Метод `dialog.showModal()` помещает окно в нативный браузерный стек **Top Layer**. Элемент больше не зависит от родительских `z-index`, `overflow: hidden` или `transform`, и автоматически блокирует взаимодействие с остальным документом (Focus Trap & `inert`).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Top Layer:** Специальный слой рендеринга над DOM-деревом документа. Находится выше любого `z-index: 999999`.
- **Псевдоэлемент `::backdrop`:** Автоматически затемняет фон под модальным окном.
- **Встроенная доступность (A11y):** Нажатие `Escape` автоматически закрывает диалог, вызывая событие `'cancel'`. Фокус циклически удерживается внутри окна.
- **Формы с `method="dialog"`:** Нажатие кнопки внутри такой формы закрывает диалог и проставляет значение `dialog.returnValue`.

#### 💡 Phase 2: Analogy (Mental Model)
Обычный `div` модалки — это попытка вытолкнуть плот поверх волн через `z-index`. Тег `<dialog>` — это вертолет, который зависает над всей поверхностью океана: никакие подводные рифы (`overflow: hidden`) его физически не касаются.

#### ⚡ Phase 3: Context (Production Code)
```html
<button id="openBtn" type="button">Открыть аудит</button>

<dialog id="auditModal" aria-labelledby="modalTitle">
  <div class="modal-box">
    <h2 id="modalTitle">Подтверждение транзакции</h2>
    <p>Вы уверены, что хотите перевести 5 SOL?</p>
    
    <form method="dialog" class="actions">
      <button value="cancel">Отмена</button>
      <button value="confirm" class="primary">Подтвердить</button>
    </form>
  </div>
</dialog>

<style>
  dialog {
    border: none;
    border-radius: 12px;
    padding: 24px;
    background: #18181b;
    color: #fafafa;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
  }

  /* Нативное затемнение подложки */
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
  }
</style>

<script>
  const modal = document.getElementById('auditModal');
  document.getElementById('openBtn').addEventListener('click', () => modal.showModal());
  
  modal.addEventListener('close', () => {
    console.log('Пользователь выбрал:', modal.returnValue);
  });
</script>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Вызов `dialog.show()` открывает диалог как обычный элемент в потоке страницы (без Top Layer, без затемнения и без захвата фокуса). Всегда используйте `dialog.showModal()` для модалок.
- При открытии модалки фокус автоматически переходит на первый интерактивный элемент. Добавьте атрибут `autofocus` на желаемый элемент, если дефолтный порядок не подходит.

---

### [HTML/CSS] 04. Native Popover API: Zero-JS Menus & Tooltips
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `<button popovertarget="menu">Open</button><div id="menu" popover>Content</div>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Popover`, `ZeroJS`, `TopLayer`, `Tooltip`

> 🛡️ **Главный инвариант:** Атрибут `popover` переводит элемент в Top Layer без JavaScript. Браузер сам обрабатывает закрытие по клику вне элемента (*light dismiss*) и по нажатию клавиши `Escape`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **`popover="auto"` (по умолчанию):** Закрывается при клике вне попапа или при открытии другого поповера. Идеально для меню, селектов и подсказок.
- **`popover="manual"`:** Не закрывается автоматически по клику снаружи. Закрывается только явным триггером или через JS-вызов `element.hidePopover()`. Подходит для тостов и всплывающих уведомлений.
- **Управление через разметку:** `popovertarget="id"` на кнопке привязывает триггер, а `popovertargetaction="toggle|show|hide"` задает режим работы.

#### 💡 Phase 2: Analogy (Mental Model)
Вам больше не нужно вешать глобальный слушатель `window.addEventListener('click')` для закрытия меню и проверять `e.target.closest`. Браузер сам встроил эту логику в свой движок рендеринга на уровне языка C++.

#### ⚡ Phase 3: Context (Production Code)
```html
<!-- Кнопка-триггер без единой строчки JS -->
<button type="button" popovertarget="actionMenu" class="menu-btn">
  Действия ▾
</button>

<!-- Контейнер поповера: браузер сам скроет его при загрузке -->
<div id="actionMenu" popover class="dropdown-popover">
  <ul class="menu-list">
    <li><button type="button">Экспорт в CSV</button></li>
    <li><button type="button">Создать снапшот</button></li>
    <li><button type="button" class="danger">Заблокировать аккаунт</button></li>
  </ul>
</div>

<style>
  .dropdown-popover {
    margin: 0;
    inset: unset; /* Сброс браузерного центрирования */
    border: 1px solid #27272a;
    border-radius: 8px;
    background: #09090b;
    padding: 8px;
    color: #fff;
  }

  /* Стилизация состояния открытого поповера */
  .dropdown-popover:popover-open {
    opacity: 1;
    transform: translateY(4px);
  }
</style>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- В отличие от `<dialog>`, элемент с `popover` не блокирует взаимодействие с фоном страницы — пользователь может прокручивать страницу и кликать по другим элементам.

---

### [HTML/CSS] 05. Accessible Forms: Semantic Fieldsets & Validation Bindings
* **Category:** `HTML/CSS A11y`
* **Quick Copy:** `<fieldset><legend>Title</legend><label for="i">Label</label><input id="i" aria-describedby="err"></fieldset>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `A11y`, `Forms`, `Semantic`, `ARIA`

> 🛡️ **Главный инвариант:** Текстовая ошибка валидации или подсказка под полем ввода обязана быть связана с инпутом через `aria-describedby="id-ошибки"`, а при наличии ошибки поле должно получать `aria-invalid="true"`. Без этого скринридер не зачитает ошибку пользователю.

#### 📌 Phase 1: Deconstruction (Architecture)
- **`<fieldset>` и `<legend>`:** Группируют логически связанные радиокнопки, чекбоксы или секции форм. Скринридер зачитывает текст из `<legend>` перед каждым пунктом группы.
- **Связка `<label for="...">`:** Клик по тексту переводит фокус в инпут и увеличивает эффективную площадь тач-таргета на мобильных устройствах.
- **`autocomplete`:** Стандартизированные токены (`autocomplete="email"`, `current-password`, `one-time-code`) позволяют браузерам и менеджерам паролей заполнять поля без опечаток.

#### 💡 Phase 2: Analogy (Mental Model)
Инпут без `label` и `aria-describedby` — это неподписанная банка на полке. Человек со зрением может догадаться по цвету, но незрячий пользователь не знает, соль там или яд.

#### ⚡ Phase 3: Context (Production Code)
```html
<form novalidate class="secure-form">
  <fieldset>
    <legend>Параметры транзакции</legend>

    <div class="field-group">
      <label for="recipientAddress">Публичный ключ получателя (Solana Base58)</label>
      <input 
        id="recipientAddress" 
        name="recipient" 
        type="text" 
        required 
        pattern="^[1-9A-HJ-NP-Za-km-z]{32,44}$"
        autocomplete="off"
        spellcheck="false"
        aria-describedby="recipientHint recipientError"
        aria-invalid="false"
      >
      <small id="recipientHint" class="hint">От 32 до 44 символов base58</small>
      <span id="recipientError" class="error-msg" role="alert">Некорректный публичный адрес Solana</span>
    </div>
  </fieldset>
</form>

<style>
  /* Подсветка ошибки только после взаимодействия пользователя */
  input:user-invalid {
    border-color: #ef4444;
    outline-color: #ef4444;
  }
  
  input:user-invalid + .hint + .error-msg {
    display: block;
  }

  .error-msg {
    display: none;
    color: #ef4444;
    font-size: 0.875rem;
  }
</style>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Используйте селектор `:user-invalid` вместо `:invalid`. Псевдокласс `:invalid` срабатывает сразу при загрузке пустой формы, пугая пользователя красными рамками до ввода символов. `:user-invalid` ждет фокуса и ухода с поля (*blur*).

---

### [HTML/CSS] 06. Native Exclusive Accordion: Details & Summary with `name`
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `<details name="faq"><summary>Q1</summary><p>A1</p></details><details name="faq"><summary>Q2</summary><p>A2</p></details>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Accordion`, `Details`, `ZeroJS`, `Semantic`

> 🛡️ **Главный инвариант:** Добавление одинакового атрибута `name="..."` на несколько элементов `<details>` создает нативный эксклюзивный аккордеон. При открытии одной секции браузер сам плавно сворачивает остальные без единой строки JS-кода.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Группировка по имени:** В спецификацию HTML добавлен атрибут `name` для `<details>`, работающий аналогично группе радиокнопок `input[type="radio"]`.
- **Встроенный поиск по странице:** Браузерный поиск `Ctrl+F` автоматически находит скрытый текст внутри закрытого `<details>` и автоматически разворачивает его. Кастомные JS-аккордеоны с `display: none` лишают пользователей этой возможности!

#### 💡 Phase 2: Analogy (Mental Model)
Раньше аккордеон требовал 50 строк JS-кода с вычислением `scrollHeight` и слушателями кликов. Теперь это нативный механизм браузера, работающий со скоростью скомпилированного движка.

#### ⚡ Phase 3: Context (Production Code)
```html
<div class="faq-group">
  <details name="crypto-faq" open>
    <summary>Что такое Prototype Pollution?</summary>
    <div class="content">
      <p>Уязвимость, позволяющая злоумышленнику инъецировать свойства в глобальный прототип <code>Object.prototype</code>.</p>
    </div>
  </details>

  <details name="crypto-faq">
    <summary>Как защитить реестр транзакций?</summary>
    <div class="content">
      <p>Использовать стерильный словарь <code>Object.create(null)</code> и блокировать дескрипторы полей через <code>writable: false</code>.</p>
    </div>
  </details>
</div>

<style>
  details {
    border: 1px solid #27272a;
    border-radius: 8px;
    margin-bottom: 8px;
    background: #18181b;
    overflow: hidden;
  }

  summary {
    padding: 16px;
    font-weight: 600;
    cursor: pointer;
    list-style: none; /* Скрытие стандартного треугольника */
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  summary::after {
    content: "＋";
    font-size: 1.2rem;
    transition: transform 0.2s ease;
  }

  details[open] summary::after {
    transform: rotate(45deg);
  }

  .content {
    padding: 0 16px 16px;
    color: #a1a1aa;
  }
</style>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Псевдоэлемент `::details-content` в современных браузерах позволяет анимировать открытие/закрытие аккордеона на чистом CSS через свойство `interpolate-size: allow-keywords;`.

---

### [HTML/CSS] 07. Responsive Auto-Fit Grid: Zero Media Queries
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));`
* **Status:** `Actual`
* **Tags:** `CSS`, `Grid`, `Responsive`, `Layout`, `ZeroMediaQueries`

> 🛡️ **Главный инвариант:** Формула `repeat(auto-fit, minmax(min(100%, 300px), 1fr))` гарантирует идеальную адаптивность сетки карточек без единого медиа-запроса `@media`, предотвращая появление горизонтального скролла на экранах меньше 300px.

#### 📌 Phase 1: Deconstruction (Architecture)
- **`auto-fit`:** Растягивает доступные колонки на всю ширину контейнера, если элементов меньше, чем колонок. В отличие от `auto-fill`, не оставляет пустые пустые треки справа.
- **Опасность `minmax(300px, 1fr)`:** На мобильных устройствах с шириной экрана 280px (Galaxy Fold) фиксированные `300px` вызывают горизонтальный перелив (`overflow-x`).
- **Защита `min(100%, 300px)`:** На экранах шире 300px база равна 300px; на экранах уже 300px база автоматически сжимается до 100% ширины экрана.

#### 💡 Phase 2: Analogy (Mental Model)
Это умный стеллаж с резиновыми перегородками. Пока места много — коробки стоят в ряд по 300px. Если комната сужается, перегородка сама перепрыгивает на новый ярус, не требуя звонка строителю (`@media`).

#### ⚡ Phase 3: Context (Production Code)
```css
.card-grid {
  display: grid;
  /* Безопасная адаптивная сетка без медиа-выражений */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  gap: 24px;
  padding: 24px;
}

.card {
  display: flex;
  flex-direction: column;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 20px;
}

.card .footer {
  margin-top: auto; /* Прижимает футер карточки к низу независимо от объёма текста */
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Не используйте `auto-fill`, если карточек в каталоге может быть мало (например, 1-2 штуки). `auto-fill` сожмет их до минимальных 280px, оставив гигантскую дыру справа. `auto-fit` равномерно заполнит всю строку.

---

### [HTML/CSS] 08. CSS Subgrid: Perfect Alignment Across Rows
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `grid-template-rows: subgrid; grid-row: span 3;`
* **Status:** `Actual`
* **Tags:** `CSS`, `Subgrid`, `Grid`, `Alignment`, `ModernCSS`

> 🛡️ **Главный инвариант:** В стандартном CSS Grid карточки в одной строке не знают о содержимом друг друга. `grid-template-rows: subgrid` позволяет вложенным элементам карточки (заголовок, тело, футер) наследовать треки родительской сетки, гарантируя идеальное выравнивание базовых линий по горизонтали.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Изоляция независимых сеток:** Без `subgrid` каждая карточка строит свою внутреннюю независимую сетку. Если в одной карточке заголовок на 3 строки, а в соседней на 1 строку — их кнопки «Купить» разъедутся по высоте.
- **Подключение к трекам родителя:** Элемент объявляет `grid-row: span N` и `grid-template-rows: subgrid`. Все N детей этого элемента теперь участвуют в расчете высоты строк родительского грида.

#### 💡 Phase 2: Analogy (Mental Model)
Обычные карточки — это отдельные блокноты, лежащие рядом: строки на страницах не совпадают. `subgrid` — это одна большая разлинованная бухгалтерская книга, сквозь страницы которой просвечивают единые нерушимые горизонтальные линии.

#### ⚡ Phase 3: Context (Production Code)
```css
/* Родительская глобальная сетка */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  /* Каждая карточка займет 3 строки: [заголовок] [описание] [кнопка] */
  grid-auto-rows: auto;
}

.pricing-card {
  display: grid;
  grid-row: span 3; /* Карточка охватывает ровно 3 строки родителя */
  grid-template-rows: subgrid; /* Подключаемся к общему шагу строк! */
  background: #18181b;
  border-radius: 12px;
  padding: 24px;
}

.pricing-card h3 { margin: 0; }
.pricing-card p { margin: 0; color: #a1a1aa; }
.pricing-card button { align-self: end; }
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Внутри карточки с `subgrid` марджины и паддинги влияют на расчет общих треков строки родителя. Устанавливайте паддинги на уровне самого контейнера карточки аккуратно, чтобы не распирать сетку.

---

### [HTML/CSS] 09. Container Queries: Component-Driven Responsiveness
* **Category:** `HTML/CSS Responsive`
* **Quick Copy:** `container-type: inline-size; @container (min-width: 400px) { ... }`
* **Status:** `Actual`
* **Tags:** `CSS`, `ContainerQueries`, `Responsive`, `ModularCSS`, `cqw`

> 🛡️ **Главный инвариант:** Медиа-выражения `@media` ориентируются на глобальный экран (Viewport), ломая модульность компонентов. `@container` позволяет компоненту перестраивать свой дизайн в зависимости от ширины его **непосредственного родительского контейнера**, где бы он ни находился (сайдбар, модалка, центр страницы).

#### 📌 Phase 1: Deconstruction (Architecture)
- **`container-type: inline-size`:** Сообщает браузеру, что необходимо отслеживать горизонтальный размер данного контейнера.
- **Изоляция Layout Containment:** Браузер изолирует расчет компоновки контейнера от остального дерева страницы, предотвращая бесконечные циклы перерисовки.
- **Единицы измерения:** Доступны специальные единицы контейнера: `1cqw` (1% ширины контейнера), `1cqh` (1% высоты), `1cqi` (1% inline-размера).

#### 💡 Phase 2: Analogy (Mental Model)
`@media` — это термометр на крыше дома: он показывает погоду на улице, но ничего не знает о том, тепло ли в подвале. `@container` — это персональный климат-контроль в каждой отдельной комнате.

#### ⚡ Phase 3: Context (Production Code)
```html
<div class="sidebar-wrapper">
  <!-- Один и тот же компонент в узком сайдбаре -->
  <article class="user-card">...</article>
</div>

<div class="main-content-wrapper">
  <!-- И в широкой основной колонке -->
  <article class="user-card">...</article>
</div>

<style>
  /* 1. Объявляем родителя контекстом контейнера */
  .sidebar-wrapper, .main-content-wrapper {
    container-type: inline-size;
    container-name: cardContainer;
  }

  /* 2. Базовый мобильный вид карточки (стек) */
  .user-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* 3. Перестройка в горизонтальный вид при ширине РОДИТЕЛЯ >= 450px */
  @container cardContainer (min-width: 450px) {
    .user-card {
      flex-direction: row;
      align-items: center;
      padding: 16px;
    }
    .user-avatar {
      width: 64px;
      height: 64px;
    }
  }
</style>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Никогда не объявляйте `container-type: inline-size` на самом стилизуемом элементе. Правило `@container` слушает только **родительские** контейнеры выше по DOM-дереву.

---

### [HTML/CSS] 10. The Relational Selector `:has()`: Pure CSS State Architecture
* **Category:** `HTML/CSS Selectors`
* **Quick Copy:** `article:has(img) { grid-template-columns: 1fr 2fr; }`
* **Status:** `Actual`
* **Tags:** `CSS`, `Selectors`, `has`, `ParentSelector`, `ModernCSS`

> 🛡️ **Главный инвариант:** Селектор `:has()` — это долгожданный «селектор родителя». Он позволяет стилизовать элемент на основе наличия, состояния или количества его потомков без использования JavaScript и mutation observers.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Алгоритм сопоставления:** Движок браузера оценивает аргумент `:has(selector)` относительно текущего элемента.
- **Производительность:** Современные движки (Blink, WebKit, Gecko) оптимизируют вычисление `:has()` через инвалидационные хеш-таблицы деревьев DOM. Однако сложные цепочки `:has(:has(...))` могут замедлять глубокий рендеринг.

#### 💡 Phase 2: Analogy (Mental Model)
Раньше CSS мог смотреть только вниз (на детей) или вбок (на братьев). `:has()` дает CSS глаза на затылке: карточка может посмотреть внутрь себя и сказать: «Если внутри меня нажали чекбокс или загрузили картинку, я сама поменяю свой фон».

#### ⚡ Phase 3: Context (Production Code)
```css
/* 1. Блокировка прокрутки body при открытой нативной модалке */
body:has(dialog[open]) {
  overflow: hidden;
}

/* 2. Подсветка карточки при фокусе на ЛЮБОМ элементе внутри неё */
.account-card:has(:focus-visible) {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

/* 3. Стилизация кастомного лейбла, если вложенный инпут невалиден */
.form-field:has(input:user-invalid) {
  color: #ef4444;
}

/* 4. Карточка без картинки автоматически переходит в одну колонку */
.article-card:not(:has(img)) {
  grid-template-columns: 1fr;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Внутри псевдокласса `:has()` запрещено использовать другие псевдоэлементы (например, `:has(::after)` или `:has(::backdrop)` — не сработает по спецификации).

---

### [HTML/CSS] 11. CSS Cascade Layers: Strict Specificity Architecture
* **Category:** `HTML/CSS Architecture`
* **Quick Copy:** `@layer reset, base, components, utilities;`
* **Status:** `Actual`
* **Tags:** `CSS`, `CascadeLayers`, `Architecture`, `Specificity`, `layer`

> 🛡️ **Главный инвариант:** Порядок объявления `@layer` на самом верху файла определяет безусловный приоритет каскада. Стили в слое `utilities` всегда победят стили в слое `components`, даже если селектор компонента имеет более высокую специфичность (`#header .btn.active` проиграет простому `.hidden`).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Каскад до специфичности:** Спецификация CSS сначала оценивает принадлежность к слою `@layer`. Только внутри одного и того же слоя вступает в силу подсчет специфичности (`ID`, `Class`, `Tag`).
- **Стили без слоя (Unlayered Styles):** Любые стили, написанные вне `@layer`, имеют **наивысший приоритет** над всеми слоями. Это гарантирует обратную совместимость со сторонними библиотеками.

#### 💡 Phase 2: Analogy (Mental Model)
`@layer` — это воинские звания в армии. Генерал из слоя `utilities` всегда отдаст приказ капитану из слоя `components`, сколько бы медалей специфичности (классов и ID) ни висело на пиджаке у капитана.

#### ⚡ Phase 3: Context (Production Code)
```css
/* 1. Фиксация иерархии слоев в самом начале сборки */
@layer reset, tokens, components, utilities;

@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
  }
}

@layer components {
  /* Высокая специфичность, но низкий приоритет слоя */
  .card-container .btn-action.primary {
    background-color: #6366f1;
    color: white;
    padding: 12px 24px;
    display: inline-block;
  }
}

@layer utilities {
  /* Низкая специфичность, но ГАРАНТИРОВАННАЯ победа в каскаде */
  .hidden {
    display: none;
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Правило `!important` внутри `@layer` инвертирует порядок каскада: `!important` в нижнем слое `reset` победит `!important` в верхнем слое `utilities`! Используйте важные флаги внутри слоев с предельной осторожностью.

---

### [HTML/CSS] 12. Fluid Typography & Spacing via `clamp()`
* **Category:** `HTML/CSS Typography`
* **Quick Copy:** `font-size: clamp(1rem, 0.8rem + 1vw, 2rem);`
* **Status:** `Actual`
* **Tags:** `CSS`, `Typography`, `clamp`, `Fluid`, `Responsive`

> 🛡️ **Главный инвариант:** Использование чистых единиц `vw` для шрифтов ломает доступность (WCAG), так как при зуме страницы в браузере размер текста не увеличивается. Функция `clamp(min, val, max)` обязана комбинировать относительную величину `rem` с единицами экрана `vw` в среднем аргументе.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Формула `clamp(MIN, PREFERRED, MAX)`:**
  - `MIN`: Нижний порог размера (например, для мобильных устройств 320px).
  - `PREFERRED`: Динамическая интерполяция, например `calc(1rem + 1.5vw)`.
  - `MAX`: Верхний предел (для экранов 4K, чтобы текст не раздувался до гигантских масштабов).
- **Плавный скейлинг:** Ликвидирует скачки размеров шрифтов и отступов на контрольных точках медиа-запросов (Breakpoints).

#### 💡 Phase 2: Analogy (Mental Model)
`clamp()` — это амортизатор в автомобиле с жесткими отбойниками сверху и снизу. На ровной дороге кузов плавно качается вместе с рельефом (`vw`), но жесткие упоры (`min`/`max`) не позволяют подвеске пробиться или оторваться.

#### ⚡ Phase 3: Context (Production Code)
```css
:root {
  /* Плавный заголовок: от 24px (1.5rem) на 375px до 48px (3rem) на 1440px */
  --font-h1: clamp(1.5rem, 1.05rem + 1.9vw, 3rem);

  /* Плавный межсекционный паддинг: от 16px до 64px */
  --space-section: clamp(1rem, 0.4rem + 2.5vw, 4rem);
}

h1 {
  font-size: var(--font-h1);
  line-height: 1.1;
  text-wrap: balance; /* Предотвращает висячие слова в заголовках */
}

.section-wrapper {
  padding-block: var(--space-section);
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Всегда используйте свойство `text-wrap: balance` для заголовков. Браузер сам сбалансирует длину строк, исключив некрасивые одиночные слова на новой строке.

---

### [HTML/CSS] 13. Wide-Gamut Colors: OKLCH & Dynamic Theme Mixing
* **Category:** `HTML/CSS Color`
* **Quick Copy:** `color: oklch(0.65 0.24 260); background: color-mix(in oklch, var(--primary) 20%, transparent);`
* **Status:** `Actual`
* **Tags:** `CSS`, `OKLCH`, `ColorMix`, `DesignSystems`, `ModernCSS`

> 🛡️ **Главный инвариант:** Цветовая модель `RGB` и `HSL` перцептивно неоднородна (желтый цвет кажется глазу значительно ярче синего при одинаковой светлоте `Lightness = 50%`). Цветовое пространство `OKLCH` обеспечивает физически точное линейное восприятие яркости глазом человека.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Анатомия OKLCH:**
  - `L` (Lightness): Воспринимаемая глазом яркость от `0` (черный) до `1` (белый).
  - `C` (Chroma): Насыщенность цвета (от пастельного до сверхнасыщенного P3 Display).
  - `H` (Hue): Угол оттенка от 0 до 360 градусов.
- **`color-mix(in oklch, color1 ratio, color2)`:** Нативное смешивание цветов без деградации в грязные серые оттенки в полутонах.

#### 💡 Phase 2: Analogy (Mental Model)
Смешивать цвета в HSL — это как красить стену дешевой гуашью: при затемнении цвета превращаются в грязную жижу. OKLCH — это высокоточные пигменты спектрального лабораторного уровня: яркость меняется строго линейно.

#### ⚡ Phase 3: Context (Production Code)
```css
:root {
  /* Базовый фирменный фиолетовый бренд */
  --brand-h: 280;
  --brand-color: oklch(0.6 0.22 var(--brand-h));

  /* Автоматически вычисляемые тона дизайн-системы */
  --brand-hover: oklch(0.68 0.22 var(--brand-h)); /* Идентичный оттенок, выше яркость */
  --brand-subtle: color-mix(in oklch, var(--brand-color) 15%, transparent);
  --brand-contrast-text: oklch(0.98 0.01 var(--brand-h));
}

.button-primary {
  background-color: var(--brand-color);
  color: var(--brand-contrast-text);
  border: 1px solid color-mix(in oklch, var(--brand-color) 80%, black);
  transition: background 0.15s ease;
}

.button-primary:hover {
  background-color: var(--brand-hover);
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- В `oklch` вы можете безопасно менять оттенок `H` от 0 до 360, и контрастность текста к фону **останется математически неизменной**, гарантируя соблюдение норм контрастности WCAG!

---

### [HTML/CSS] 14. Scroll-Driven Animations: Zero-JS Sticky & Progress
* **Category:** `HTML/CSS Motion`
* **Quick Copy:** `animation-timeline: scroll(); animation: scaleDown linear both;`
* **Status:** `Actual`
* **Tags:** `CSS`, `ScrollDriven`, `Animations`, `Performance`, `ZeroJS`

> 🛡️ **Главный инвариант:** Scroll-Driven Animations связывают прогресс анимации с положением скроллбара на уровне аппаратного композитора GPU. Анимация выполняется с частотой 120 FPS без нагрузки на Main Thread и без тяжелых библиотек (GSAP / Framer Motion).

#### 📌 Phase 1: Deconstruction (Architecture)
- **`animation-timeline: scroll()`:** Привязывает таймлайн анимации к скроллу страницы (`root`) или ближайшего прокручиваемого предка.
- **`animation-timeline: view()`:** Привязывает анимацию к моменту входа и выхода конкретного элемента из зоны видимости окна (*Intersection Observer on GPU*).

#### 💡 Phase 2: Analogy (Mental Model)
Раньше для индикатора прокрутки требовался слушатель `window.onscroll` с расчетом `scrollTop / scrollHeight`. Теперь вы просто привязываете видеопленку к колесу мыши: крутите колесо вперед — пленка крутится вперед.

#### ⚡ Phase 3: Context (Production Code)
```css
/* 1. Полоса прогресса чтения статьи на чистом CSS */
.reading-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: #6366f1;
  transform-origin: 0% 50%;
  animation: growWidth linear both;
  animation-timeline: scroll();
  z-index: 9999;
}

@keyframes growWidth {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* 2. Плавное проявление карточки при появлении на экране */
.reveal-card {
  animation: fadeSlideIn linear both;
  animation-timeline: view();
  animation-range: entry 20% cover 40%;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Всегда добавляйте медиа-запрос `@media (prefers-reduced-motion: reduce)`, отключающий или смягчающий анимации прокрутки для пользователей с вестибулярными расстройствами.

---

### [HTML/CSS] 15. View Transitions API: Seamless Layout Morphing
* **Category:** `HTML/CSS Motion`
* **Quick Copy:** `view-transition-name: header-nav;`
* **Status:** `Actual`
* **Tags:** `CSS`, `ViewTransitions`, `SPA`, `Animations`, `ModernWeb`

> 🛡️ **Главный инвариант:** При вызове `document.startViewTransition()` браузер делает снимок старого и нового состояния DOM и выполняет бесшовную анимацию перехода между ними через псевдоэлементы `::view-transition`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Именованные переходы:** Свойство `view-transition-name: my-element;` указывает браузеру, что конкретный элемент на странице А и на странице Б — это одна и та же сущность. Браузер сам интерполирует координаты, размер и прозрачность.
- **Дерево псевдоэлементов:** Браузер создает изолированный псевдо-слой `::view-transition-old(name)` и `::view-transition-new(name)`.

#### 💡 Phase 2: Analogy (Mental Model)
Это кинематографический наплыв кадров (Cross-Fade) при монтаже фильма. Вместо резкого дерганья страницы браузер плавно переставляет объекты по экрану на уровне графического чипа.

#### ⚡ Phase 3: Context (Production Code)
```css
/* Привязка уникальных имен морфинга */
.hero-thumbnail {
  view-transition-name: active-article-poster;
}

.page-title {
  view-transition-name: main-title;
}

/* Кастомизация кривой перехода */
::view-transition-group(active-article-poster) {
  animation-duration: 0.35s;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
```
```javascript
// Запуск бесшовного обновления DOM в JS
function updateView(newData) {
  if (!document.startViewTransition) {
    render(newData); // Fallback для старых браузеров
    return;
  }

  document.startViewTransition(() => {
    render(newData); // Мутация DOM внутри снепшота
  });
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Значение `view-transition-name` обязано быть **уникальным** на текущей странице. Если два видимых элемента имеют одинаковый `view-transition-name`, анимация перехода сбрасывается с ошибкой.

---

### [HTML/CSS] 16. CSS Logical Properties: Frictionless Internationalization
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `margin-inline: auto; padding-block: 1.5rem; inset-inline-start: 0;`
* **Status:** `Actual`
* **Tags:** `CSS`, `LogicalProperties`, `i18n`, `RTL`, `Layout`

> 🛡️ **Главный инвариант:** Использование физических свойств (`left`, `right`, `margin-left`) требует написания дублирующих переопределений для языков с письмом справа налево (RTL, арабский/иврит). Логические свойства (`inline`, `block`) автоматически адаптируются под направление письма (`dir="rtl"` или `dir="ltr"`).

#### 📌 Phase 1: Deconstruction (Architecture)
- **Соответствие осей:**
  - `block` = Ось потока блоков (по вертикали в европейских языках: `top`/`bottom`).
  - `inline` = Ось строки текста (по горизонтали: `left`/`right`).
  - `margin-inline-start` = `margin-left` в LTR, но автоматически становится `margin-right` в RTL.
- **Позиционирование:** `inset-inline-start` заменяет `left` в абсолютном позиционировании.

#### 💡 Phase 2: Analogy (Mental Model)
Физические свойства — это указание "повернуть на запад" (зависит от компаса). Логические свойства — это указание "повернуть по ходу движения направо" (работает всегда независимо от того, куда движется поезд).

#### ⚡ Phase 3: Context (Production Code)
```css
/* ❌ УСТАРЕВШИЙ ПОДХОД: ручной оверхед для RTL */
.btn {
  margin-left: 8px;
  padding-left: 16px;
  padding-right: 16px;
}
[dir="rtl"] .btn {
  margin-left: 0;
  margin-right: 8px;
}

/* ✅ СОВРЕМЕННЫЙ ПРОДАКШН: 0 строчек для поддержки арабского/иврита */
.btn-modern {
  margin-inline-start: 8px;
  padding-inline: 16px;
  padding-block: 8px;
  border-inline-start: 3px solid #6366f1;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Для задания размеров используйте `inline-size` (вместо `width`) и `block-size` (вместо `height`).

---

### [HTML/CSS] 17. Content-Visibility: 10x DOM Rendering Boost
* **Category:** `HTML/CSS Performance`
* **Quick Copy:** `content-visibility: auto; contain-intrinsic-size: 0 500px;`
* **Status:** `Actual`
* **Tags:** `CSS`, `Performance`, `ContentVisibility`, `Virtualization`, `V8`

> 🛡️ **Главный инвариант:** Браузер тратит колоссальные ресурсы на расчет геометрии и отрисовку элементов, находящихся далеко за пределами первого экрана. Свойство `content-visibility: auto` пропускает фазы Layout и Paint для невидимых блоков, эмулируя виртуализацию списков без JS.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Пропуск рендеринга:** Элементы с `content-visibility: auto` не рендерятся, пока не приблизятся к области просмотра (Viewport).
- **Ловушка скроллбара:** Если браузер не знает высоту скрытого элемента, он считает ее равной `0`, что вызывает прыжки скроллбара при прокрутке.
- **Лекарство `contain-intrinsic-size`:** Задает резервную высоту плейсхолдера (например, `contain-intrinsic-size: auto 400px`), сохраняя стабильность полосы прокрутки.

#### 💡 Phase 2: Analogy (Mental Model)
Вместо того чтобы накрывать праздничный стол на 1000 персон сразу, ресторан сервирует только те 5 столов, за которые уже сели гости, экономя время и силы официантов.

#### ⚡ Phase 3: Context (Production Code)
```css
/* Оптимизация тяжелых длинных списков или статей */
.heavy-card-section {
  content-visibility: auto;
  /* Резервируем ориентировочную высоту блока для стабильности скролла */
  contain-intrinsic-size: auto 650px;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Ключевое слово `auto` внутри `contain-intrinsic-size: auto 650px` позволяет браузеру автоматически запомнить **реальную** высоту элемента после первого рендеринга и больше никогда не использовать догадку в 650px.

---

### [HTML/CSS] 18. CSS Anchor Positioning API: Tethering Popups to Triggers
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `anchor-name: --btn; position-anchor: --btn; top: anchor(bottom);`
* **Status:** `Actual`
* **Tags:** `CSS`, `AnchorPositioning`, `Popover`, `Tooltips`, `ZeroJS`

> 🛡️ **Главный инвариант:** Anchor Positioning API полностью устраняет необходимость в библиотеках позиционирования (Floating UI / Popper.js). Тултипы и выпадающие меню привязываются к координатам кнопки-якоря прямо в CSS.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Якорь (`anchor-name`):** Назначает элементу уникальный идентификатор в пространстве имен CSS (например, `--my-anchor`).
- **Связка (`position-anchor`):** Плавающий элемент указывает целевой якорь и вычисляет координаты через функцию `anchor(var(--my-anchor) edge)`.
- **Защита от вылета за экран:** `@position-try` автоматически перебрасывает тултип вниз, если сверху не хватает места.

#### 💡 Phase 2: Analogy (Mental Model)
Это воздушный шарик на веревочке: куда бы вы ни переместили руку (кнопку-якорь), шарик (тултип) летит следом за ней, автоматически уворачиваясь от потолка комнаты.

#### ⚡ Phase 3: Context (Production Code)
```css
/* 1. Элемент-якорь (кнопка) */
.anchor-trigger {
  anchor-name: --wallet-btn;
}

/* 2. Плавающий блок тултипа */
.anchor-tooltip {
  position: fixed;
  position-anchor: --wallet-btn;
  
  /* Позиционируем низ тултипа строго над верхом кнопки */
  bottom: anchor(top);
  left: anchor(center);
  transform: translateX(-50%);
  margin-bottom: 8px;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Элементы, позиционируемые через `anchor()`, могут находиться в совершенно разных ветках DOM-дерева и даже внутри Top Layer!

---

### [HTML/CSS] 19. Pure CSS Floating Label Pattern
* **Category:** `HTML/CSS Forms`
* **Quick Copy:** `input:focus ~ label, input:not(:placeholder-shown) ~ label { transform: translateY(-1.2rem); }`
* **Status:** `Actual`
* **Tags:** `CSS`, `Forms`, `FloatingLabel`, `UI`, `ZeroJS`

> 🛡️ **Главный инвариант:** Паттерн плавающего лейбла реализуется без JS с помощью псевдокласса `:placeholder-shown` и пустого пробела в `placeholder=" "`. Лейбл поднимается вверх при фокусе либо если инпут содержит хоть один символ.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Селектор `:not(:placeholder-shown)`:** Браузер считает плейсхолдер показанным, только пока инпут пуст. Как только пользователь ввел символ, плейсхолдер скрывается, что активирует CSS-правило сдвига лейбла.
- **Порядок в DOM:** Лейбл обязан идти **после** инпута в разметке, чтобы использовать комбинатор последующего соседа `~` или `+`.

#### 💡 Phase 2: Analogy (Mental Model)
Лейбл сидит внутри кресла (инпута). Когда гость садится в кресло (вводит текст), лейбл вежливо встает и встает на спинку кресла, чтобы не мешать чтению.

#### ⚡ Phase 3: Context (Production Code)
```html
<div class="floating-group">
  <input type="text" id="username" placeholder=" " required>
  <label for="username">Имя пользователя</label>
</div>

<style>
  .floating-group {
    position: relative;
    margin-block: 20px;
  }

  .floating-group input {
    width: 100%;
    padding: 16px 12px 6px;
    background: #18181b;
    border: 1px solid #3f3f46;
    border-radius: 8px;
    color: #fff;
    font-size: 1rem;
  }

  .floating-group label {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #a1a1aa;
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* Подъем лейбла при фокусе ИЛИ при наличии текста */
  .floating-group input:focus ~ label,
  .floating-group input:not(:placeholder-shown) ~ label {
    top: 10px;
    transform: translateY(0);
    font-size: 0.75rem;
    color: #6366f1;
  }
</style>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Обязательно добавляйте `pointer-events: none` на лейбл, чтобы клики сквозь него беспрепятственно активировали текстовый курсор инпута.

---

### [HTML/CSS] 20. Accessible Screen Reader Only (`.sr-only`) Pattern
* **Category:** `HTML/CSS A11y`
* **Quick Copy:** `.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }`
* **Status:** `Actual`
* **Tags:** `CSS`, `A11y`, `ScreenReader`, `WCAG`, `Utilities`

> 🛡️ **Главный инвариант:** Свойства `display: none` и `visibility: hidden` полностью вырезают элемент из дерева доступности (Accessibility Tree). Для скрытия текста от зрячих пользователей с сохранением его для скринридеров используется только утилита `.sr-only`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Вырезание из Render Tree:** Скринридеры игнорируют `display: none`, потому что движок рендеринга не строит для них геометрию.
- **Формула сжатия:** Класс `.sr-only` сжимает элемент в 1 пиксель, выносит его за пределы экрана и обрезает через `clip: rect(0, 0, 0, 0)`, сохраняя доступным для голосовых ассистентов.

#### 💡 Phase 2: Analogy (Mental Model)
`display: none` — это стереть страницу из книги ластиком. `.sr-only` — это написать текст невидимыми ультрафиолетовыми чернилами: глазами не видно, но специальный прибор скринридера четко считывает каждую букву.

#### ⚡ Phase 3: Context (Production Code)
```html
<!-- Кнопка-иконка закрытия без визуального текста -->
<button type="button" class="icon-button">
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
  </svg>
  <span class="sr-only">Закрыть окно редактирования транзакции</span>
</button>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Всегда вешайте `aria-hidden="true"` на декоративные SVG-иконки внутри интерактивных кнопок, чтобы скринридер не зачитывал бессмысленные пути векторов (`path d="..."`).

---

### [HTML/CSS] 21. Hardware Accelerated Layer Promotion (`will-change`)
* **Category:** `HTML/CSS Performance`
* **Quick Copy:** `will-change: transform, opacity;`
* **Status:** `Actual`
* **Tags:** `CSS`, `Performance`, `GPU`, `Compositor`, `will-change`

> 🛡️ **Главный инвариант:** Свойство `will-change` принудительно выносит элемент на отдельный композитный слой GPU. Не используйте его глобально на сотнях элементов, иначе видеопамять (VRAM) будет мгновенно переполнена, вызывая тормоза всего браузера.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Фазы рендеринга:** Layout (геометрия) $\to$ Paint (заливка пикселей) $\to$ Composite (композиция слоев).
- **Дешевые свойства:** Только `transform` и `opacity` анимируются на этапе композиции без вызова повторного Paint.
- **Очистка памяти:** Назначайте `will-change` в момент наведения курсора (`:hover`) и сбрасывайте после завершения анимации.

#### 💡 Phase 2: Analogy (Mental Model)
Композитный слой — это отдельный прозрачный лист кальки для художника. Вы рисуете анимацию на отдельном листе, не перерисовывая всю картину целиком на основном холсте.

#### ⚡ Phase 3: Context (Production Code)
```css
.animated-drawer {
  /* Продвижение на GPU для идеально плавных 120 FPS */
  will-change: transform;
  transform: translateZ(0); /* Дополнительный хак аппаратного ускорения */
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.animated-drawer:not(.is-animating) {
  will-change: auto; /* Освобождение памяти GPU в покое */
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Анимация свойств `width`, `height`, `margin` или `top` никогда не ускоряется GPU — она вызывает пересчет геометрии (Reflow) всего документа.

---

### [HTML/CSS] 22. Focus Rings & `:focus-visible` Precision
* **Category:** `HTML/CSS A11y`
* **Quick Copy:** `:focus:not(:focus-visible) { outline: none; } :focus-visible { outline: 2px solid #6366f1; outline-offset: 2px; }`
* **Status:** `Actual`
* **Tags:** `CSS`, `A11y`, `FocusVisible`, `KeyboardNavigation`, `WCAG`

> 🛡️ **Главный инвариант:** Никогда не удаляйте `outline: none` без предоставления альтернативы! Псевдокласс `:focus-visible` показывает рамку фокуса **только** тогда, когда пользователь перемещается по сайту с клавиатуры (клавиша `Tab`), и скрывает ее при клике мышью.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Эвристика браузера:** Браузер сам отслеживает тип ввода (мышь/тач против клавиатуры).
- **Разрыв `outline-offset`:** Свойство `outline-offset: 2px` создает воздушный зазор между элементом и рамкой, предотвращая слияние рамки с контрастным фоном кнопки.

#### 💡 Phase 2: Analogy (Mental Model)
Фокус с клавиатуры — это свет фонарика в темноте: без него незрячий или клавиатурный пользователь полностью теряется на экране.

#### ⚡ Phase 3: Context (Production Code)
```css
/* 1. Скрываем рамку для кликов мышью */
button:focus:not(:focus-visible) {
  outline: none;
}

/* 2. Высококонтрастная доступная рамка для клавиатуры */
button:focus-visible,
a:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 3px;
  border-radius: 4px;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- В отличие от `box-shadow`, контур `outline` не занимает места в геометрии и не вызывает пересчета размеров соседних элементов при появлении.

---

### [HTML/CSS] 23. CSS Custom Checkbox & Radio via Accent-Color
* **Category:** `HTML/CSS Forms`
* **Quick Copy:** `accent-color: #6366f1;`
* **Status:** `Actual`
* **Tags:** `CSS`, `Forms`, `accent-color`, `A11y`, `ZeroCSS`

> 🛡️ **Главный инвариант:** Одно свойство `accent-color` стилизует нативные чекбоксы, радиокнопки и полосы прогресса под цвет вашего бренда без костылей со скрытием инпута и эмуляцией через `::before`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Нативная доступность:** Сохраняются 100% нативной доступности ОС, анимации фокуса и поведение на мобильных устройствах.
- **Автоматический контраст:** Браузер сам вычисляет цвет галочки (черный или белый) в зависимости от темноты вашего акцентного цвета.

#### ⚡ Phase 3: Context (Production Code)
```css
:root {
  accent-color: #6366f1;
}

input[type="checkbox"],
input[type="radio"],
input[type="range"],
progress {
  accent-color: #6366f1;
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Используйте `accent-color` по умолчанию. Переходите к сложной верстке через SVG только тогда, когда дизайн-система жестко требует нестандартную форму галочки.

---

### [HTML/CSS] 24. Sticky Table Headers with Overflow Containment
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `th { position: sticky; top: 0; background: #18181b; z-index: 2; }`
* **Status:** `Actual`
* **Tags:** `CSS`, `Tables`, `Sticky`, `Overflow`, `DataGrid`

> 🛡️ **Главный инвариант:** Для работы `position: sticky` на заголовках таблиц `<th>` ни один из родительских контейнеров не должен иметь `overflow: hidden` (кроме непосредственного скролл-враппера таблицы). Заголовки обязаны иметь непрозрачный `background`, иначе данные строк будут просвечивать сквозь них.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Контекст прокрутки:** `sticky` работает только внутри своего ближайшего предка с `overflow: auto/scroll`.
- **Разделители строк:** Стандартный `border-collapse: collapse` ломает липкие рамки в ряде браузеров. Рекомендуется использовать `border-separate; border-spacing: 0;`.

#### ⚡ Phase 3: Context (Production Code)
```css
.table-scroll-container {
  max-height: 400px;
  overflow: auto;
  border: 1px solid #27272a;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th {
  position: sticky;
  top: 0;
  background: #18181b; /* Защита от просвечивания строк под шапкой */
  border-bottom: 2px solid #3f3f46;
  z-index: 2;
  padding: 12px 16px;
  text-align: left;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Для фиксации первой левой колонки таблицы используйте `left: 0` на первых ячейках с `z-index: 3` для левого верхнего угла.

---

### [HTML/CSS] 25. Text Truncation: Single-Line & Multiline Line-Clamp
* **Category:** `HTML/CSS Typography`
* **Quick Copy:** `display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;`
* **Status:** `Actual`
* **Tags:** `CSS`, `Typography`, `LineClamp`, `Overflow`, `Ellipsis`

> 🛡️ **Главный инвариант:** Однострочное обрезание требует `white-space: nowrap`, а многострочное — строго связку трех свойств `-webkit-box` и `overflow: hidden`.

#### ⚡ Phase 3: Context (Production Code)
```css
/* 1. Однострочный эллипсис */
.truncate-single {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 2. Многострочный эллипсис (ровно 3 строки) */
.truncate-multiline {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- В связке с `-webkit-line-clamp` не используйте фиксированную высоту `height`, иначе текст выйдет за пределы или оставит пустую дыру. Высота должна рассчитываться автоматически.

---

### [HTML/CSS] 26. CSS Masonry Layout (Native Grid Flow)
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `grid-template-rows: masonry;`
* **Status:** `Actual`
* **Tags:** `CSS`, `Masonry`, `Grid`, `ModernCSS`, `Gallery`

> 🛡️ **Главный инвариант:** Раскладка типа Pinterest (Masonry) в современном CSS объявляется нативно через сетку с заполнением пустых промежутков без тяжелых JS-библиотек.

#### ⚡ Phase 3: Context (Production Code)
```css
.masonry-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-template-rows: masonry; /* Стандарт W3C CSS Grid Level 3 */
  gap: 16px;
}
```

---

### [HTML/CSS] 27. CSS Aspect-Ratio: Responsive Box Preservation
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `aspect-ratio: 16 / 9; width: 100%; object-fit: cover;`
* **Status:** `Actual`
* **Tags:** `CSS`, `AspectRatio`, `Media`, `CLS`, `Layout`

> 🛡️ **Главный инвариант:** `aspect-ratio` полностью заменяет устаревший хак с `padding-top: 56.25%`, удерживая идеальные пропорции блока при адаптивном сжатии ширины.

#### ⚡ Phase 3: Context (Production Code)
```css
.video-responsive-box {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
}

.video-responsive-box iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
```

---

### [HTML/CSS] 28. CSS Scroll Snap: Native Mobile Touch Carousel
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `scroll-snap-type: x mandatory; scroll-snap-align: start;`
* **Status:** `Actual`
* **Tags:** `CSS`, `ScrollSnap`, `Carousel`, `Touch`, `Mobile`

> 🛡️ **Главный инвариант:** Создание идеально прилипающих тач-каруселей на мобильных без JS: родитель объявляет `scroll-snap-type: x mandatory`, а элементы списка — `scroll-snap-align: start`.

#### ⚡ Phase 3: Context (Production Code)
```css
.carousel-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  gap: 16px;
  padding: 16px;
}

.carousel-slide {
  flex: 0 0 85%;
  scroll-snap-align: center;
  scroll-snap-stop: always; /* Останавливает инерцию на каждом слайде */
}
```

---

### [HTML/CSS] 29. Safe Center: Flexbox Overflow Fix
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `justify-content: safe center; align-items: safe center;`
* **Status:** `Actual`
* **Tags:** `CSS`, `Flexbox`, `Alignment`, `SafeCenter`, `Gotchas`

> 🛡️ **Главный инвариант:** При `justify-content: center`, если контент превышает размер экрана, левый край контента обрезается за пределами окна и его невозможно прокрутить. Ключевое слово `safe center` автоматически переключает выравнивание на `start` при переполнении!

#### ⚡ Phase 3: Context (Production Code)
```css
.modal-overlay {
  display: flex;
  /* Защита контента от обрезания на маленьких экранах */
  justify-content: safe center;
  align-items: safe center;
  overflow: auto;
}
```

---

### [HTML/CSS] 30. CSS Nesting: Modern Native SASS-Free Architecture
* **Category:** `HTML/CSS Architecture`
* **Quick Copy:** `.card { background: red; & .title { color: white; } &:hover { opacity: 0.9; } }`
* **Status:** `Actual`
* **Tags:** `CSS`, `Nesting`, `ModernCSS`, `Architecture`, `BEM`

> 🛡️ **Главный инвариант:** Нативный CSS теперь поддерживает вложенность без препроцессоров. Знак амперсанда `&` представляет весь родительский селектор, обернутый в `:is()`.

#### ⚡ Phase 3: Context (Production Code)
```css
.nav-menu {
  background: #18181b;

  & .menu-item {
    color: #a1a1aa;

    &:hover {
      color: #fff;
    }

    &.active {
      color: #6366f1;
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
}
```

---

### [HTML/CSS] 31. CSS `:where()` vs `:is()`: Specificity Resetter
* **Category:** `HTML/CSS Selectors`
* **Quick Copy:** `:where(.btn, .link) { color: inherit; } /* Специфичность = 0! */`
* **Status:** `Actual`
* **Tags:** `CSS`, `Specificity`, `where`, `is`, `DesignSystems`

> 🛡️ **Главный инвариант:** Псевдокласс `:where()` всегда имеет **нулевую специфичность `(0,0,0)`**. Любой базовый стиль в `:where()` легко переопределяется одиночным классом пользователя без применения `!important`.

#### ⚡ Phase 3: Context (Production Code)
```css
/* Базовый дизайн-компонент с нулевой специфичностью */
:where(.design-system-button, .design-system-input) {
  padding: 8px 16px;
  border-radius: 6px;
}

/* Пользователь легко переопределяет одной строкой */
.my-custom-btn {
  padding: 12px 24px;
}
```

---

### [HTML/CSS] 32. Backdrop Blur & Frosted Glass Effect
* **Category:** `HTML/CSS Visuals`
* **Quick Copy:** `backdrop-filter: blur(12px); background: rgba(24, 24, 27, 0.7);`
* **Status:** `Actual`
* **Tags:** `CSS`, `BackdropFilter`, `Glassmorphism`, `UI`, `Visuals`

> 🛡️ **Главный инвариант:** `backdrop-filter` требует полупрозрачного цвета фона (`rgba` или `oklch` с альфа-каналом), иначе эффект размытия подложки не будет виден.

#### ⚡ Phase 3: Context (Production Code)
```css
.sticky-glass-header {
  position: sticky;
  top: 0;
  background-color: color-mix(in oklch, #09090b 75%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #27272a;
  z-index: 100;
}
```

---

### [HTML/CSS] 33. CSS Font Display & FOUT/FOIT Elimination
* **Category:** `HTML/CSS Performance`
* **Quick Copy:** `@font-face { font-family: 'Inter'; font-display: swap; src: url(...) format('woff2'); }`
* **Status:** `Actual`
* **Tags:** `CSS`, `Fonts`, `Performance`, `FOUT`, `CoreWebVitals`

> 🛡️ **Главный инвариант:** `font-display: swap` немедленно отображает системный резервный шрифт, заменяя его кастомным по мере скачивания. Это предотвращает появление невидимого текста (Flash of Invisible Text — FOIT).

#### ⚡ Phase 3: Context (Production Code)
```css
@font-face {
  font-family: 'InterVariable';
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url('/fonts/InterVariable.woff2') format('woff2-variations');
}
```

---

### [HTML/CSS] 34. Prevent Layout Shift on Custom Scrollbars
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `scrollbar-gutter: stable;`
* **Status:** `Actual`
* **Tags:** `CSS`, `Scrollbar`, `CLS`, `LayoutShift`, `ModernCSS`

> 🛡️ **Главный инвариант:** При появлении и исчезновении скроллбара страница дергается по горизонтали на 15 пикселей. Свойство `scrollbar-gutter: stable;` резервирует место под полосу прокрутки заранее.

#### ⚡ Phase 3: Context (Production Code)
```css
html {
  scrollbar-gutter: stable;
  scrollbar-color: #3f3f46 transparent;
  scrollbar-width: thin;
}
```

---

### [HTML/CSS] 35. Touch Target Size Compliance (WCAG 2.2)
* **Category:** `HTML/CSS A11y`
* **Quick Copy:** `min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center;`
* **Status:** `Actual`
* **Tags:** `CSS`, `A11y`, `Touch`, `Mobile`, `WCAG`

> 🛡️ **Главный инвариант:** Согласно стандарту доступности WCAG 2.2, интерактивные элементы обязаны иметь минимальную область нажатия 44x44px (или 24x24px с отступами), чтобы предотвратить случайные клики на мобильных экранах.

#### ⚡ Phase 3: Context (Production Code)
```css
.clickable-icon {
  position: relative;
  /* Даже если иконка 20px, область нажатия строго 44px */
}

.clickable-icon::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 44px;
  min-height: 44px;
}
```

---

### [HTML/CSS] 36. High-Contrast & Forced Colors Mode
* **Category:** `HTML/CSS A11y`
* **Quick Copy:** `@media (forced-colors: active) { border: 1px solid ButtonText; }`
* **Status:** `Actual`
* **Tags:** `CSS`, `A11y`, `ForcedColors`, `HighContrast`, `Windows`

> 🛡️ **Главный инвариант:** В режиме высокой контрастности Windows браузер удаляет все фоновые цвета и тени `box-shadow`. Кнопки и карточки без физических границ `border` становятся невидимыми.

#### ⚡ Phase 3: Context (Production Code)
```css
.card {
  border: 1px solid transparent; /* В обычном режиме не виден */
}

@media (forced-colors: active) {
  .card {
    border-color: CanvasText; /* Становится четким контрастным контуром в Windows */
  }
}
```

---

### [HTML/CSS] 37. CSS Safe Area Insets (iPhone Notch & Home Indicator)
* **Category:** `HTML/CSS Mobile`
* **Quick Copy:** `padding-bottom: env(safe-area-inset-bottom);`
* **Status:** `Actual`
* **Tags:** `CSS`, `Mobile`, `iOS`, `Notch`, `SafeArea`

> 🛡️ **Главный инвариант:** Фиксированные футеры и панели на iPhone перекрываются системной полосой Home Indicator без добавления отступа через `env(safe-area-inset-bottom)`.

#### ⚡ Phase 3: Context (Production Code)
```html
<!-- Обязательный метатег в <head> -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

<style>
  .fixed-bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }
</style>
```

---

### [HTML/CSS] 38. Skip to Content Link (A11y Navigation Highway)
* **Category:** `HTML/CSS A11y`
* **Quick Copy:** `<a href="#main" class="skip-link">Перейти к контенту</a>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `A11y`, `SkipLink`, `Keyboard`, `WCAG`

> 🛡️ **Главный инвариант:** Клавиатурные пользователи не должны нажимать клавишу Tab 50 раз, чтобы пройти сквозь шапку сайта. Первая ссылка страницы обязана вести на `#main-content`.

#### ⚡ Phase 3: Context (Production Code)
```html
<a href="#main-content" class="skip-link">Перейти к основному содержимому</a>

<style>
  .skip-link {
    position: absolute;
    top: -100px;
    left: 16px;
    background: #6366f1;
    color: #fff;
    padding: 12px 20px;
    z-index: 99999;
    font-weight: 700;
  }

  .skip-link:focus {
    top: 16px; /* Появляется только при фокусе с клавиатуры */
  }
</style>
```

---

### [HTML/CSS] 39. CSS Print Optimization & Page Breaks
* **Category:** `HTML/CSS Print`
* **Quick Copy:** `@media print { .no-print { display: none; } .page-card { break-inside: avoid; } }`
* **Status:** `Actual`
* **Tags:** `CSS`, `Print`, `Media`, `PageBreak`, `Reporting`

> 🛡️ **Главный инвариант:** При печати страниц таблицы и карточки не должны разрываться пополам между листами бумаги: свойство `break-inside: avoid;` предотвращает разрыв блока.

#### ⚡ Phase 3: Context (Production Code)
```css
@media print {
  /* Скрываем навигацию, баннеры и сайдбары */
  nav, footer, .sidebar, button {
    display: none !important;
  }

  body {
    background: white;
    color: black;
    font-size: 12pt;
  }

  .report-table-row, .audit-card {
    break-inside: avoid; /* Защита от разрезания на две страницы */
  }
}
```

---

### [HTML/CSS] 40. Interactive Widget Mobile Keyboard Resizing
* **Category:** `HTML/CSS Mobile`
* **Quick Copy:** `<meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content">`
* **Status:** `Actual`
* **Tags:** `HTML5`, `Mobile`, `VirtualKeyboard`, `Viewport`, `Forms`

> 🛡️ **Главный инвариант:** Значение `interactive-widget=resizes-content` в метатеге `viewport` заставляет браузер сжимать высоту страницы при открытии виртуальной клавиатуры на Android/Chrome, сохраняя поле ввода в фокусе.

---

### [HTML/CSS] 41. CSS Motion Path (`offset-path`): Curved Animations
* **Category:** `HTML/CSS Motion`
* **Quick Copy:** `offset-path: path('M 0 0 Q 100 -50 200 0'); animation: move 2s linear infinite;`
* **Status:** `Actual`
* **Tags:** `CSS`, `MotionPath`, `SVG`, `Animation`, `Creative`

> 🛡️ **Главный инвариант:** Перемещение объектов по сложным кривым Безье без JavaScript: `offset-path` задает траекторию, а свойство `offset-distance: 0%` $\to$ `100%` анимирует движение.

---

### [HTML/CSS] 42. CSS Grid: Holy Grail Layout with Grid-Template-Areas
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `grid-template-areas: "header header" "sidebar main" "footer footer";`
* **Status:** `Actual`
* **Tags:** `CSS`, `Grid`, `HolyGrail`, `LayoutAreas`, `Architecture`

> 🛡️ **Главный инвариант:** Декларативная карта раскладки страницы `grid-template-areas` позволяет менять положение сайдбара и контента на мобильных одной строкой в медиа-выражении.

---

### [HTML/CSS] 43. Safe Auto-Sizing Textarea (Zero JS Growth)
* **Category:** `HTML/CSS Forms`
* **Quick Copy:** `form-sizing: normal; field-sizing: content;`
* **Status:** `Actual`
* **Tags:** `CSS`, `Forms`, `Textarea`, `field-sizing`, `ES2024`

> 🛡️ **Главный инвариант:** Новое CSS-свойство `field-sizing: content` заставляет текстовое поле `<textarea>` и инпуты автоматически расти в высоту по мере ввода текста пользователем без JS-слушателей `input`!

---

### [HTML/CSS] 44. CSS Mask Image: Transparent Gradients & Cutouts
* **Category:** `HTML/CSS Visuals`
* **Quick Copy:** `mask-image: linear-gradient(to bottom, black 80%, transparent 100%);`
* **Status:** `Actual`
* **Tags:** `CSS`, `Masking`, `Visuals`, `Gradients`, `Design`

> 🛡️ **Главный инвариант:** Плавное затухание текста в карточках в прозрачность без наложения плашек: `mask-image` обрезает альфа-канал самого элемента.

---

### [HTML/CSS] 45. CSS Font Palette: Color Vector Fonts
* **Category:** `HTML/CSS Typography`
* **Quick Copy:** `@font-palette-values --DarkPalette { font-family: 'Bungee'; override-colors: 0 #6366f1; }`
* **Status:** `Actual`
* **Tags:** `CSS`, `Typography`, `COLRv1`, `FontPalette`, `Fonts`

> 🛡️ **Главный инвариант:** Нативная перекраска многоцветных векторных шрифтов и эмодзи-шрифтов через правило `@font-palette-values`.

---

### [HTML/CSS] 46. Responsive Table via CSS Grid Transformation
* **Category:** `HTML/CSS Tables`
* **Quick Copy:** `@media (max-width: 600px) { table, tr, td { display: block; } }`
* **Status:** `Actual`
* **Tags:** `CSS`, `Tables`, `Responsive`, `Mobile`, `Layout`

> 🛡️ **Главный инвариант:** Превращение широкой таблицы данных в набор карточек на мобильных экранах с помощью атрибутов `data-label` и псевдоэлементов `td::before { content: attr(data-label); }`.

---

### [HTML/CSS] 47. Inert Attribute: Non-Modal Background Freezing
* **Category:** `HTML/CSS A11y`
* **Quick Copy:** `<main inert>...</main>`
* **Status:** `Actual`
* **Tags:** `HTML5`, `A11y`, `Inert`, `FocusTrap`, `Modal`

> 🛡️ **Главный инвариант:** Атрибут `inert` делает целый кусок DOM-дерева полностью невидимым для фокуса, скринридеров и кликов, предотвращая утечку фокуса за пределы кастомных боковых шторок (Drawers).

---

### [HTML/CSS] 48. CSS Hyphens & Text Break Control
* **Category:** `HTML/CSS Typography`
* **Quick Copy:** `hyphens: auto; overflow-wrap: break-word;`
* **Status:** `Actual`
* **Tags:** `CSS`, `Typography`, `Hyphens`, `i18n`, `A11y`

> 🛡️ **Главный инвариант:** Предотвращает выбивание длинных слов (немецкие термины, длинные крипто-хеши) за границы карточки: `hyphens: auto` расставляет нативные переносы по слогам на основе атрибута `<html lang="...">`.

---

### [HTML/CSS] 49. Viewport Units: Small, Large & Dynamic (`svh`, `lvh`, `dvh`)
* **Category:** `HTML/CSS Mobile`
* **Quick Copy:** `min-height: 100dvh;`
* **Status:** `Actual`
* **Tags:** `CSS`, `Mobile`, `Viewport`, `dvh`, `100vh`

> 🛡️ **Главный инвариант:** Устаревший `100vh` перекрывается адресной строкой мобильного браузера Safari/Chrome. Используйте `100dvh` (Dynamic Viewport Height) для идеального первого экрана без сдвигов.

---

### [HTML/CSS] 50. Micro-Layout Gap Management in Modern Flexbox
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `display: flex; gap: 12px;`
* **Status:** `Actual`
* **Tags:** `CSS`, `Flexbox`, `Gap`, `Layout`, `CleanCode`

> 🛡️ **Главный инвариант:** Забудьте про `margin-right: 10px` на детях и отменяющие псевдоклассы `:last-child`. Свойство `gap` во Flexbox распределяет отступы строго между элементами.

---

### [HTML/CSS] 51. Shadow DOM Custom Styling via `::part()`
* **Category:** `HTML/CSS WebComponents`
* **Quick Copy:** `my-custom-element::part(submit-btn) { background: #6366f1; }`
* **Status:** `Actual`
* **Tags:** `CSS`, `WebComponents`, `ShadowDOM`, `part`, `Encapsulation`

> 🛡️ **Главный инвариант:** Позволяет безопасно стилизовать закрытые элементы внутри Shadow DOM Web-компонентов, помеченные атрибутом `part="..."`, сохраняя инкапсуляцию скриптов.

---

### [HTML/CSS] 52. CSS Scroll-Padding for Sticky Headers
* **Category:** `HTML/CSS Layout`
* **Quick Copy:** `html { scroll-padding-top: 80px; scroll-behavior: smooth; }`
* **Status:** `Actual`
* **Tags:** `CSS`, `Navigation`, `Anchor`, `Sticky`, `ScrollPadding`

> 🛡️ **Главный инвариант:** При клике по ссылке-якорю (`#section-2`) заголовок секции не прячется под фиксированной липкой шапкой сайта, если на `html` задан `scroll-padding-top: [высота шапки]`.
