import { prisma } from "@/lib/db";

export const VISUAL_PAGE_CONFIG = {
  home: {
    key: "home",
    storageSlug: "visual-page-home",
    title: "Главная страница",
    publicPath: "/",
  },
  connect: {
    key: "connect",
    storageSlug: "visual-page-connect",
    title: "Страница Connect",
    publicPath: "/connect",
  },
} as const;

export type VisualPageKey = keyof typeof VISUAL_PAGE_CONFIG;

export type VisualPageData = {
  html: string;
  css: string;
  styleHrefs: string[];
  isPublished: boolean;
  updatedAt: Date | null;
  hasStoredContent: boolean;
};

const HOME_DEFAULT_HTML = `
<main class="vp-home">
  <section class="vp-hero">
    <div class="vp-container">
      <span class="vp-chip">Реестр психологов</span>
      <h1>Находим своего психолога вместе</h1>
      <p>«Давай вместе» — реестр психологов с прозрачной сертификацией. Подбор по подходу, цене, городу и уровню подготовки.</p>
      <div class="vp-actions">
        <a class="vp-btn vp-btn-primary" href="/psy-list">Подобрать психолога</a>
        <a class="vp-btn vp-btn-outline" href="/certification-levels">Уровни сертификации</a>
      </div>
      <img src="/images/hero.png" alt="Подбор психолога" />
    </div>
  </section>

  <section class="vp-section">
    <div class="vp-container">
      <h2>Почему наш реестр вызывает доверие</h2>
      <div class="vp-grid3">
        <article class="vp-card">
          <h3>Абсолютная прозрачность</h3>
          <p>Все дипломы, сертификаты и пройденные курсы доступны для просмотра.</p>
        </article>
        <article class="vp-card">
          <h3>Многоэтапная проверка</h3>
          <p>Документы, личное интервью и оценка практики. Проходят только лучшие.</p>
        </article>
        <article class="vp-card">
          <h3>Человечный подход</h3>
          <p>Фильтры по реальным параметрам: цена, метод, город, уровень.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="vp-section vp-section-muted">
    <div class="vp-container">
      <h2>Как это работает</h2>
      <div class="vp-grid3">
        <article class="vp-step"><strong>1. Задайте фильтры</strong><p>Парадигма, цена, город, уровень.</p></article>
        <article class="vp-step"><strong>2. Смотрите карточки</strong><p>Фото, опыт, образование, метод и контакты.</p></article>
        <article class="vp-step"><strong>3. Свяжитесь напрямую</strong><p>Без комиссий и посредников.</p></article>
      </div>
    </div>
  </section>
</main>
`.trim();

const CONNECT_DEFAULT_HTML = `
<main class="vp-connect">
  <section class="vp-connect-hero">
    <div class="vp-container">
      <h1>Присоединяйтесь к реестру «Давай вместе»</h1>
      <p>Место, где ваша практика встречает клиентов, которые ищут именно вас.</p>
      <div class="vp-actions">
        <a class="vp-btn vp-btn-primary" href="/contacts">Начать сотрудничество</a>
        <a class="vp-btn vp-btn-outline" href="/psy-list">Смотреть каталог</a>
      </div>
    </div>
  </section>

  <section class="vp-section">
    <div class="vp-container">
      <h2>Почему выбирают нас</h2>
      <div class="vp-grid3">
        <article class="vp-card"><h3>Качественный трафик</h3><p>Клиенты приходят с конкретными запросами.</p></article>
        <article class="vp-card"><h3>Прозрачная аналитика</h3><p>Понимайте, как клиенты находят вас.</p></article>
        <article class="vp-card"><h3>Быстрый старт</h3><p>От заявки до первой анкеты — за 72 часа.</p></article>
      </div>
    </div>
  </section>

  <section class="vp-section vp-section-muted">
    <div class="vp-container">
      <h2>Как присоединиться</h2>
      <ol class="vp-list">
        <li><strong>01. Знакомство:</strong> короткое интервью о вашей практике.</li>
        <li><strong>02. Верификация:</strong> проверка документов и уровня.</li>
        <li><strong>03. Оформление:</strong> создаем профессиональную анкету.</li>
        <li><strong>04. Запуск:</strong> размещение в каталоге и первые показы.</li>
      </ol>
    </div>
  </section>
</main>
`.trim();

const DEFAULT_VISUAL_CSS = `
.vp-container{max-width:1100px;margin:0 auto;padding:0 16px}
.vp-section{padding:56px 0}
.vp-section-muted{background:#f7fafc}
.vp-chip{display:inline-block;background:#a7ff5a;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:600}
h1{font-size:44px;line-height:1.1;margin:16px 0 12px}
h2{font-size:34px;line-height:1.2;margin:0 0 24px}
h3{font-size:20px;line-height:1.3;margin:0 0 8px}
p{font-size:16px;line-height:1.65;color:#374151}
.vp-hero{padding:64px 0;background:#f5f5f7;border-bottom:4px solid #5858E2}
.vp-hero img{display:block;width:100%;max-width:760px;margin:24px auto 0;border-radius:16px}
.vp-connect-hero{padding:80px 0;background:linear-gradient(135deg,#111827 0%,#1f2937 70%,#374151 100%);color:#fff}
.vp-connect-hero p{color:#e5e7eb}
.vp-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.vp-card,.vp-step{border:1px solid #e5e7eb;border-radius:14px;background:#fff;padding:18px}
.vp-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px}
.vp-btn{display:inline-block;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:600}
.vp-btn-primary{background:#5858E2;color:#fff}
.vp-btn-outline{border:2px solid #5858E2;color:#5858E2;background:transparent}
.vp-list{display:grid;gap:10px;padding-left:20px}
@media (max-width:900px){.vp-grid3{grid-template-columns:1fr}h1{font-size:34px}h2{font-size:28px}}
`.trim();

function getDefaultVisualTemplate(key: VisualPageKey): { html: string; css: string } {
  if (key === "connect") {
    return { html: CONNECT_DEFAULT_HTML, css: DEFAULT_VISUAL_CSS };
  }
  return { html: HOME_DEFAULT_HTML, css: DEFAULT_VISUAL_CSS };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseStoredVisualData(items: unknown): { html: string; css: string; styleHrefs: string[]; isPublished: boolean } {
  if (!isRecord(items)) {
    return { html: "", css: "", styleHrefs: [], isPublished: false };
  }

  const html = typeof items.html === "string"
    ? items.html
    : (typeof items.content === "string" ? items.content : "");
  const css = typeof items.css === "string" ? items.css : "";
  const styleHrefs = Array.isArray(items.styleHrefs)
    ? items.styleHrefs.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
  const isPublished = typeof items.isPublished === "boolean" ? items.isPublished : false;

  return { html, css, styleHrefs, isPublished };
}

export function isVisualPageKey(value: string): value is VisualPageKey {
  return value in VISUAL_PAGE_CONFIG;
}

export async function getVisualPage(key: VisualPageKey): Promise<VisualPageData> {
  if (!prisma) {
    const defaults = getDefaultVisualTemplate(key);
    return { ...defaults, styleHrefs: [], isPublished: false, updatedAt: null, hasStoredContent: false };
  }

  const config = VISUAL_PAGE_CONFIG[key];
  let record: { items: unknown; updatedAt: Date } | null = null;

  try {
    record = await prisma.dataList.findUnique({
      where: { slug: config.storageSlug },
      select: { items: true, updatedAt: true },
    });
  } catch {
    const defaults = getDefaultVisualTemplate(key);
    return { ...defaults, styleHrefs: [], isPublished: false, updatedAt: null, hasStoredContent: false };
  }

  if (!record) {
    const defaults = getDefaultVisualTemplate(key);
    return { ...defaults, styleHrefs: [], isPublished: false, updatedAt: null, hasStoredContent: false };
  }

  const parsed = parseStoredVisualData(record.items);
  if (!parsed.html.trim()) {
    const defaults = getDefaultVisualTemplate(key);
    return {
      ...defaults,
      styleHrefs: parsed.styleHrefs,
      isPublished: parsed.isPublished,
      updatedAt: record.updatedAt,
      hasStoredContent: false,
    };
  }

  if (!parsed.css.trim()) {
    const defaults = getDefaultVisualTemplate(key);
    return {
      html: parsed.html,
      css: defaults.css,
      styleHrefs: parsed.styleHrefs,
      isPublished: parsed.isPublished,
      updatedAt: record.updatedAt,
      hasStoredContent: true,
    };
  }

  return { ...parsed, updatedAt: record.updatedAt, hasStoredContent: true };
}

export async function getVisualPagesOverview() {
  const keys = Object.keys(VISUAL_PAGE_CONFIG) as VisualPageKey[];
  const pages = await Promise.all(
    keys.map(async (key) => {
      const config = VISUAL_PAGE_CONFIG[key];
      const data = await getVisualPage(key);
      return {
        ...config,
        ...data,
      };
    })
  );

  return pages;
}

export async function getPublishedVisualContent(key: VisualPageKey): Promise<string | null> {
  const page = await getVisualPage(key);
  if (!page.isPublished) return null;
  const normalizedHtml = page.html.trim();
  if (!normalizedHtml) return null;
  const normalizedCss = page.css.trim();
  const links = page.styleHrefs
    .filter((href) => /^https?:\/\//.test(href) || href.startsWith("/"))
    .map((href) => `<link rel="stylesheet" href="${href}">`)
    .join("");
  if (normalizedCss) {
    return `${links}<style>${normalizedCss}</style>${normalizedHtml}`;
  }
  return `${links}${normalizedHtml}`;
}

export async function upsertVisualPage(
  key: VisualPageKey,
  html: string,
  css: string,
  styleHrefs: string[],
  isPublished: boolean
) {
  if (!prisma) {
    throw new Error("db_unavailable");
  }

  const config = VISUAL_PAGE_CONFIG[key];
  await prisma.dataList.upsert({
    where: { slug: config.storageSlug },
    create: {
      slug: config.storageSlug,
      name: `Visual page: ${config.title}`,
      items: {
        html,
        css,
        styleHrefs,
        isPublished,
      },
    },
    update: {
      name: `Visual page: ${config.title}`,
      items: {
        html,
        css,
        styleHrefs,
        isPublished,
      },
    },
  });
}
