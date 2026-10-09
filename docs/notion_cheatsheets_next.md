# 📚 Мастер-База: 5 Шпаргалок по Next.js (App Router, Server Actions & Cache)
### Стандарт: Induktr Studio 4-Phase Notion Architecture

---

### [NEXT] 01. Server vs Client Component Boundary (`'use client'`)
* **Category:** `Next.js Architecture`
* **Quick Copy:** `'use client'; // Директива на границе интерактивности`
* **Status:** `Actual`
* **Tags:** `Nextjs`, `AppRouter`, `RSC`, `ServerComponents`, `Performance`

> 🛡️ **Главный инвариант:** В App Router все компоненты по умолчанию являются Server Components (RSC). Директива `'use client'` не превращает компонент в SPA-рендер «только на клиенте» — она лишь определяет точку разреза графа модулей (serialization boundary), добавляя JS-код этого поддерева в клиентский бандл.

#### 📌 Phase 1: Deconstruction (Architecture)
- **RSC (React Server Components):** Выполняются исключительно на сервере в Node.js/Edge рантайме. Имеют прямой доступ к БД, FS, закрытым ключам `process.env`. Возвращают легковесный RSC Payload (JSON-подобное дерево).
- **Client Components:** Всё равно гидрируются и рендерятся в HTML на сервере при SSR, но их код отправляется в браузер для поддержки хуков состояния (`useState`, `useEffect`) и слушателей событий (`onClick`).
- **Композиция:** Чтобы Server Component оказался внутри Client Component, передавайте его через `children` (слот). Не импортируйте RSC напрямую в файл с `'use client'`.

#### 💡 Phase 2: Analogy (Mental Model)
Server Components — это шеф-повар на закрытой кухне: готовит блюдо, используя тяжелое оборудование и тайные специи. Client Components — это интерактивный официант у столика: он принимает заказы и наливает напитки, но не знает рецептов кухни.

#### ⚡ Phase 3: Context (Production Code)
```tsx
// app/dashboard/page.tsx (Server Component по умолчанию)
import { db } from "@/lib/db";
import { InteractiveChart } from "./InteractiveChart";

export default async function DashboardPage() {
  // Прямой защищенный запрос к БД без публичных API-роутов
  const accounts = await db.accounts.findMany();

  return (
    <main>
      <h1>Ончейн Дашборд</h1>
      {/* Пробрасываем данные через сериализуемые пропсы */}
      <InteractiveChart initialData={accounts}>
        {/* RSC внутри Client-компонента через слот children */}
        <footer className="server-footer">
          Сгенерировано на сервере: {new Date().toISOString()}
        </footer>
      </InteractiveChart>
    </main>
  );
}

// app/dashboard/InteractiveChart.tsx
'use client';

import { useState } from "react";

export function InteractiveChart({ initialData, children }: { initialData: any[]; children: React.ReactNode }) {
  const [filter, setFilter] = useState("");
  return (
    <div className="chart-box">
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      {/* Рендеринг серверного слота без включения его в клиентский бандл */}
      {children}
    </div>
  );
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Пропсы, передаваемые от Server к Client Component, **обязаны быть сериализуемыми** (JSON-совместимыми). Передавать классы, функции или прототипы через эту границу запрещено.

---

### [NEXT] 02. Server Actions & Cache Revalidation (`revalidatePath` / `revalidateTag`)
* **Category:** `Next.js Data`
* **Quick Copy:** `'use server'; await mutate(); revalidateTag('accounts');`
* **Status:** `Actual`
* **Tags:** `Nextjs`, `ServerActions`, `Cache`, `Revalidation`, `Forms`

> 🛡️ **Главный инвариант:** Server Actions выполняются как скрытые POST-эндпоинты с автоматической CSRF-защитой. Вызов `revalidateTag()` или `revalidatePath()` внутри экшена очищает кэш на сервере и возвращает свежий RSC Payload обратно клиенту в одном сетевом раундтрипе.

#### 📌 Phase 1: Deconstruction (Architecture)
- **`'use server'`:** Директива на уровне файла или внутри асинхронной функции превращает ее в Server Action.
- **Очистка Data Cache:** `revalidateTag('key')` инвалидирует кэшированные вызовы `fetch(..., { next: { tags: ['key'] } })`.
- **Очистка Full Route Cache:** `revalidatePath('/dashboard')` сбрасывает статический снимок страницы.

#### 💡 Phase 2: Analogy (Mental Model)
Server Action — это пневмопочта в банк: вы отправляете подписанный чек, банк выполняет проводку и тут же присылает обновленную выписку по счету в той же капсуле.

#### ⚡ Phase 3: Context (Production Code)
```tsx
// app/actions/accountActions.ts
'use server';

import { revalidateTag } from "next/cache";

export async function updateAccountBalance(formData: FormData) {
  const pubKey = formData.get("pubKey") as string;
  const lamports = Number(formData.get("lamports"));

  // 1. Вызов бизнес-логики на сервере
  await fetch(`https://api.internal-node.io/account/${pubKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lamports })
  });

  // 2. Инвалидация кэша по тегу для мгновенного обновления UI
  revalidateTag("solana-accounts");
  return { ok: true };
}

// app/components/BalanceForm.tsx
'use client';
import { updateAccountBalance } from "@/app/actions/accountActions";

export function BalanceForm({ pubKey }: { pubKey: string }) {
  return (
    <form action={updateAccountBalance}>
      <input type="hidden" name="pubKey" value={pubKey} />
      <input type="number" name="lamports" required />
      <button type="submit">Обновить баланс</button>
    </form>
  );
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Server Actions внутри компонентов форм (`<form action={action}>`) работают даже до загрузки клиентского JS (прогрессивное улучшение).

---

### [NEXT] 03. Route Handlers & Web Standard Requests/Responses
* **Category:** `Next.js API`
* **Quick Copy:** `export async function GET(req: Request) { return Response.json({ ok: true }); }`
* **Status:** `Actual`
* **Tags:** `Nextjs`, `RouteHandlers`, `REST`, `WebStandards`, `API`

> 🛡️ **Главный инвариант:** В App Router файлы `route.ts` заменяют устаревший Pages Router `pages/api`. Они базируются строго на веб-стандартах `Request` и `Response` (Fetch API), поддерживая стриминг и Edge-рантайм без Express-подобных `(req, res)`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Именованные экспорты методов:** Поддерживаются `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`. Необъявленный метод автоматически возвращает `405 Method Not Allowed`.
- **Статический против динамического:** `GET` по умолчанию кэшируется статически при билде. Использование заголовков (`headers()`), cookies (`cookies()`) или объекта `request` автоматически переключает хэндлер в динамический режим.

#### 💡 Phase 2: Analogy (Mental Model)
Route Handlers (Web Fetch API) — это стандартные морские грузовые контейнеры. Вместо того чтобы упаковывать груз в проприетарные коробки конкретного курьера (как старые Express `req/res`), вы используете универсальный стандарт `Request/Response`, который моментально и одинаково обрабатывается в любом порту мира (Node.js, Edge, Deno, Cloudflare Workers).

#### ⚡ Phase 3: Context (Production Code)
```typescript
// app/api/solana/account/[pubKey]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pubKey: string }> }
) {
  const { pubKey } = await params;

  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(pubKey)) {
    return NextResponse.json(
      { error: "Невалидный публичный ключ Solana" },
      { status: 400 }
    );
  }

  const rpcRes = await fetch("https://api.devnet.solana.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getAccountInfo",
      params: [pubKey, { encoding: "jsonParsed" }]
    }),
    next: { revalidate: 60, tags: ["solana-accounts"] } // Кэш на 60 секунд
  });

  const data = await rpcRes.json();
  return NextResponse.json(data.result);
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- В Next.js 15+ объект `params` в `route.ts` и `page.tsx` является **асинхронным (Promise)** и требует обязательного `await params`.

---

### [NEXT] 04. Middleware Execution & Edge Matcher Hardening
* **Category:** `Next.js Security`
* **Quick Copy:** `export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] };`
* **Status:** `Actual`
* **Tags:** `Nextjs`, `Middleware`, `Edge`, `Security`, `Auth`

> 🛡️ **Главный инвариант:** `middleware.ts` запускается **перед** каждым запросом в легковесном Edge-рантайме. Некорректный `matcher` заставит middleware срабатывать на статические файлы шрифтов, изображений и JS-чанки, катастрофически замедляя TTFB сайта.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Edge Runtime:** Нет поддержки полноценных Node.js API (например, `fs`, тяжелых крипто-библиотек). Разрешены стандартные Web APIs.
- **Модификация заголовков:** Позволяет устанавливать `x-forwarded-*`, проверять JWT-токены сессий, делать редиректы (`NextResponse.redirect`) или переписывать пути (`NextResponse.rewrite`).

#### 💡 Phase 2: Analogy (Mental Model)
Middleware — это КПП службы безопасности на въезде в аэропорт. Если ваш `matcher` настроен неверно, охрана будет досматривать не только подозрительных пассажиров (API и страницы), но и каждую машину с хлебом, бензином и мусором (шрифты, картинки, `favicon.ico`), парализуя работу всего аэропорта (замедляя TTFB).

#### ⚡ Phase 3: Context (Production Code)
```typescript
// middleware.ts (в корне проекта рядом с app/)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session_auth")?.value;
  const isProtectedPath = request.nextUrl.pathname.startsWith("/admin");

  // Защита закрытых разделов до входа в рендеринг страницы
  if (isProtectedPath && !sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  // Добавление кастомного заголовка для защиты от кликджекинга
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

// Защищенный белый список: исключаем статику, картинки и favicon
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)"
  ]
};
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Не выполняйте тяжелые запросы к базе данных внутри middleware — держите его компактным (< 10мс), так как он блокирует ответ для всей цепочки маршрута.

---

### [NEXT] 05. Metadata API & Dynamic OpenGraph Generation
* **Category:** `Next.js SEO`
* **Quick Copy:** `export async function generateMetadata({ params }): Promise<Metadata> { return { title: '...' }; }`
* **Status:** `Actual`
* **Tags:** `Nextjs`, `Metadata`, `SEO`, `OpenGraph`, `AppRouter`

> 🛡️ **Главный инвариант:** Устаревший тег `next/head` запрещен в App Router. Вся генерация `<head>`, OpenGraph, Twitter Cards и канонических URL управляется строго через экспортируемый объект `metadata` или функцию `generateMetadata()`.

#### 📌 Phase 1: Deconstruction (Architecture)
- **Иерархическое слияние:** Метаданные из корневого `app/layout.tsx` наследуются дочерними страницами, позволяя переопределять только специфичные поля через шаблон (`title: { template: '%s | Induktr', default: 'Induktr' }`).
- **Автоматическая дедупликация:** Если в `generateMetadata()` и в `page.tsx` вызывается один и тот же запрос к БД/API, React автоматически дедуплицирует вызов `fetch` (выполняется ровно один сетевой запрос).

#### 💡 Phase 2: Analogy (Mental Model)
`generateMetadata` — это PR-отдел вашей страницы. В то время как обычные компоненты строят само здание (рендеринг контента), PR-отдел заранее печатает глянцевые визитки, готовит красивые заголовки для поисковиков и рекламные щиты (OpenGraph картинки) для Twitter и Telegram, выдавая их ботам еще до входа посетителей в само здание.

#### ⚡ Phase 3: Context (Production Code)
```tsx
// app/account/[pubKey]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ pubKey: string }> }
): Promise<Metadata> {
  const { pubKey } = await params;

  return {
    title: `Аккаунт: ${pubKey.slice(0, 8)}...`,
    description: `Ончейн телеметрия и снапшот баланса счета Solana: ${pubKey}`,
    openGraph: {
      title: `Solana Explorer | ${pubKey}`,
      description: "Аналитика защищенного реестра",
      url: `https://explorer.induktr.com/account/${pubKey}`,
      images: [
        {
          url: `/api/og?address=${pubKey}`, // Динамическая генерация og-image через @vercel/og
          width: 1200,
          height: 630,
          alt: "Solana Account Snapshot"
        }
      ]
    }
  };
}

export default async function AccountPage({ params }: { params: Promise<{ pubKey: string }> }) {
  const { pubKey } = await params;
  return <div>Детали аккаунта: {pubKey}</div>;
}
```

#### 💎 Phase 4: Crystallization (Key Insights)
- Внутри `generateMetadata` запрещено возвращать компоненты с интерактивностью или использовать хуки (`useRouter`, `usePathname`). Функция выполняется исключительно в контексте сервера.
