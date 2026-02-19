import { prisma } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";

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
  hasPreviousVersion: boolean;
};

export type PublishedVisualPage = {
  html: string;
  css: string;
  styleHrefs: string[];
};

type StoredVisualVersion = {
  html: string;
  css: string;
  styleHrefs: string[];
  isPublished: boolean;
  savedAt: string;
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

const LEGACY_DEFAULT_VISUAL_CSS = `
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

const DEFAULT_VISUAL_CSS = `
.vp-home,.vp-connect{width:100%;max-width:100%;overflow-x:hidden}
.vp-home *,.vp-connect *{min-width:0}
.vp-home .vp-container,.vp-connect .vp-container{max-width:1100px;margin:0 auto;padding:0 16px}
.vp-home .vp-section,.vp-connect .vp-section{padding:56px 0}
.vp-home .vp-section-muted,.vp-connect .vp-section-muted{background:#f7fafc}
.vp-home .vp-chip,.vp-connect .vp-chip{display:inline-block;background:#a7ff5a;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:600}
.vp-home h1,.vp-connect h1{font-size:44px;line-height:1.1;margin:16px 0 12px;overflow-wrap:anywhere}
.vp-home h2,.vp-connect h2{font-size:34px;line-height:1.2;margin:0 0 24px;overflow-wrap:anywhere}
.vp-home h3,.vp-connect h3{font-size:20px;line-height:1.3;margin:0 0 8px;overflow-wrap:anywhere}
.vp-home p,.vp-connect p,.vp-home li,.vp-connect li{font-size:16px;line-height:1.65;color:#374151;overflow-wrap:anywhere;word-break:break-word}
.vp-home .vp-hero{padding:64px 0;background:#f5f5f7;border-bottom:4px solid #5858E2}
.vp-home .vp-hero img{display:block;width:min(100%,760px);height:auto;margin:24px auto 0;border-radius:16px;object-fit:cover}
.vp-connect .vp-connect-hero{padding:80px 0;background:linear-gradient(135deg,#111827 0%,#1f2937 70%,#374151 100%);color:#fff}
.vp-connect .vp-connect-hero p{color:#e5e7eb}
.vp-home .vp-grid3,.vp-connect .vp-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.vp-home .vp-card,.vp-connect .vp-card,.vp-home .vp-step,.vp-connect .vp-step{border:1px solid #e5e7eb;border-radius:14px;background:#fff;padding:18px;height:100%}
.vp-home .vp-step p,.vp-connect .vp-step p{margin-top:8px}
.vp-home .vp-actions,.vp-connect .vp-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px}
.vp-home .vp-btn,.vp-connect .vp-btn{display:inline-block;text-decoration:none;padding:11px 16px;border-radius:10px;font-weight:600}
.vp-home .vp-btn-primary,.vp-connect .vp-btn-primary,.vp-home .vp-btn-primary:visited,.vp-connect .vp-btn-primary:visited{background:#5858E2;color:#fff !important}
.vp-home .vp-btn-outline,.vp-connect .vp-btn-outline{border:2px solid #5858E2;color:#5858E2;background:transparent}
.vp-home .vp-list,.vp-connect .vp-list{display:grid;gap:10px;padding-left:20px}
.vp-home img,.vp-connect img{display:block;max-width:100%;height:auto}
.vp-home table,.vp-connect table{display:block;max-width:100%;overflow-x:auto}
@media (min-width:1200px){
  .vp-home .vp-container,.vp-connect .vp-container{max-width:1200px}
  .vp-home .vp-hero img{width:min(100%,860px)}
}
@media (min-width:1536px){
  .vp-home .vp-container,.vp-connect .vp-container{max-width:1280px}
}
@media (max-width:1024px){
  .vp-home h1,.vp-connect h1{font-size:38px}
  .vp-home h2,.vp-connect h2{font-size:30px}
}
@media (max-width:900px){
  .vp-home .vp-grid3,.vp-connect .vp-grid3{grid-template-columns:1fr}
  .vp-home h1,.vp-connect h1{font-size:34px}
  .vp-home h2,.vp-connect h2{font-size:28px}
}
@media (max-width:640px){
  .vp-home .vp-section,.vp-connect .vp-section{padding:44px 0}
  .vp-home .vp-hero{padding:44px 0}
  .vp-connect .vp-connect-hero{padding:56px 0}
  .vp-home h1,.vp-connect h1{font-size:30px}
  .vp-home h2,.vp-connect h2{font-size:24px}
}
`.trim();

const LEGACY_IMPORTED_CSS_RULES = [
  "*,*::before,*::after{box-sizing:border-box}",
  "img,video,canvas,svg{display:block;max-width:100%;height:auto}",
  "pre,table,iframe{max-width:100%}",
  "p,h1,h2,h3,h4,h5,h6{overflow-wrap:anywhere}",
];
const DANGEROUS_PROTOCOLS = ["javascript:", "vbscript:", "data:text/html"];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripLegacyImportedCss(value: string): string {
  let css = value;
  for (const rule of LEGACY_IMPORTED_CSS_RULES) {
    const pattern = new RegExp(`${escapeRegExp(rule)}\\s*`, "g");
    css = css.replace(pattern, "");
  }
  return css.trim();
}

function hasDangerousUrlProtocol(value: string): boolean {
  const normalized = value.replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();
  return DANGEROUS_PROTOCOLS.some((protocol) => normalized.startsWith(protocol));
}

function encodeHtmlAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function sanitizeUnsafeAttributes(html: string): string {
  let sanitized = html;

  sanitized = sanitized.replace(/\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  sanitized = sanitized.replace(/\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  sanitized = sanitized.replace(/<meta[^>]*http-equiv\s*=\s*['"]?\s*refresh\s*['"]?[^>]*>/gi, "");

  sanitized = sanitized.replace(
    /\s+(href|src|xlink:href|formaction|action|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (_fullMatch, attrName: string, dq?: string, sq?: string, bare?: string) => {
      const value = (dq ?? sq ?? bare ?? "").trim();
      if (!value || hasDangerousUrlProtocol(value)) {
        return "";
      }
      return ` ${attrName}="${encodeHtmlAttribute(value)}"`;
    }
  );

  sanitized = sanitized.replace(
    /\s+style\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (_fullMatch, dq?: string, sq?: string, bare?: string) => {
      const value = (dq ?? sq ?? bare ?? "").trim();
      if (!value) return "";
      if (/expression\s*\(|url\s*\(\s*['"]?\s*javascript:/i.test(value)) {
        return "";
      }
      return ` style="${encodeHtmlAttribute(value)}"`;
    }
  );

  return sanitized;
}

function normalizeCssSignature(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isDefaultVisualCss(value: string): boolean {
  const normalized = normalizeCssSignature(value);
  return normalized === normalizeCssSignature(DEFAULT_VISUAL_CSS) || normalized === normalizeCssSignature(LEGACY_DEFAULT_VISUAL_CSS);
}

function getDefaultVisualTemplate(key: VisualPageKey): { html: string; css: string } {
  if (key === "connect") {
    return { html: CONNECT_DEFAULT_HTML, css: DEFAULT_VISUAL_CSS };
  }
  return { html: HOME_DEFAULT_HTML, css: DEFAULT_VISUAL_CSS };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeVisualHtml(value: string): string {
  let html = value.trim();
  if (!html) return "";

  html = html.replace(/<!doctype[^>]*>/gi, "").trim();

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    html = bodyMatch[1].trim();
  } else if (/^<body[\s>]/i.test(html)) {
    html = html.replace(/^<body[^>]*>/i, "").replace(/<\/body>\s*$/i, "").trim();
  }

  html = html.replace(/<\/?(html|head)[^>]*>/gi, "").trim();
  html = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<base[^>]*>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[^>]*>/gi, "")
    .replace(/<applet[\s\S]*?<\/applet>/gi, "")
    .trim();
  html = sanitizeUnsafeAttributes(html);

  return html;
}

function normalizeVisualCss(value: string): string {
  let css = value.trim();
  if (!css) return "";

  if (/<style[\s>]/i.test(css)) {
    const matches = Array.from(css.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi))
      .map((match) => (match[1] ?? "").trim())
      .filter(Boolean);
    if (matches.length) {
      css = matches.join("\n\n");
    }
  }

  return stripLegacyImportedCss(css.trim());
}

function isAllowedStyleHref(href: string): boolean {
  return /^https?:\/\//.test(href) || href.startsWith("/");
}

function normalizeStyleHrefs(hrefs: string[]): string[] {
  return Array.from(new Set(hrefs.map((href) => href.trim()).filter((href) => isAllowedStyleHref(href)))).sort((a, b) =>
    a.localeCompare(b)
  );
}

function createStoredVisualVersion(
  value: { html: string; css: string; styleHrefs: string[]; isPublished: boolean },
  savedAt: string = new Date().toISOString()
): StoredVisualVersion | null {
  const html = normalizeVisualHtml(value.html);
  if (!html.trim()) return null;

  return {
    html,
    css: normalizeVisualCss(value.css),
    styleHrefs: normalizeStyleHrefs(value.styleHrefs),
    isPublished: value.isPublished,
    savedAt,
  };
}

function parseStoredVersion(value: unknown): StoredVisualVersion | null {
  if (!isRecord(value)) return null;

  const rawHtml = typeof value.html === "string"
    ? value.html
    : (typeof value.content === "string" ? value.content : "");
  const rawCss = typeof value.css === "string" ? value.css : "";
  const rawStyleHrefs = Array.isArray(value.styleHrefs)
    ? value.styleHrefs.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
  const isPublished = typeof value.isPublished === "boolean" ? value.isPublished : false;
  const savedAt =
    typeof value.savedAt === "string" && value.savedAt.trim().length > 0
      ? value.savedAt.trim()
      : new Date(0).toISOString();

  return createStoredVisualVersion(
    {
      html: rawHtml,
      css: rawCss,
      styleHrefs: rawStyleHrefs,
      isPublished,
    },
    savedAt
  );
}

function parseStoredVisualData(items: unknown): {
  html: string;
  css: string;
  styleHrefs: string[];
  isPublished: boolean;
  previousVersion: StoredVisualVersion | null;
} {
  if (!isRecord(items)) {
    return { html: "", css: "", styleHrefs: [], isPublished: false, previousVersion: null };
  }

  const rawHtml = typeof items.html === "string"
    ? items.html
    : (typeof items.content === "string" ? items.content : "");
  const rawCss = typeof items.css === "string" ? items.css : "";
  const rawStyleHrefs = Array.isArray(items.styleHrefs)
    ? items.styleHrefs.filter((item): item is string => typeof item === "string" && item.length > 0)
    : [];
  const isPublished = typeof items.isPublished === "boolean" ? items.isPublished : false;
  const previousVersion = parseStoredVersion(items.previousVersion);

  return {
    html: normalizeVisualHtml(rawHtml),
    css: normalizeVisualCss(rawCss),
    styleHrefs: normalizeStyleHrefs(rawStyleHrefs),
    isPublished,
    previousVersion,
  };
}

export function isVisualPageKey(value: string): value is VisualPageKey {
  return value in VISUAL_PAGE_CONFIG;
}

export async function getVisualPage(key: VisualPageKey): Promise<VisualPageData> {
  noStore();

  if (!prisma) {
    const defaults = getDefaultVisualTemplate(key);
    return { ...defaults, styleHrefs: [], isPublished: false, updatedAt: null, hasStoredContent: false, hasPreviousVersion: false };
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
    return { ...defaults, styleHrefs: [], isPublished: false, updatedAt: null, hasStoredContent: false, hasPreviousVersion: false };
  }

  if (!record) {
    const defaults = getDefaultVisualTemplate(key);
    return { ...defaults, styleHrefs: [], isPublished: false, updatedAt: null, hasStoredContent: false, hasPreviousVersion: false };
  }

  const parsed = parseStoredVisualData(record.items);
  const hasPreviousVersion = Boolean(parsed.previousVersion);
  if (!parsed.html.trim()) {
    const defaults = getDefaultVisualTemplate(key);
    return {
      ...defaults,
      styleHrefs: parsed.styleHrefs,
      isPublished: parsed.isPublished,
      updatedAt: record.updatedAt,
      hasStoredContent: false,
      hasPreviousVersion,
    };
  }

  if (!parsed.css.trim()) {
    const isDefaultTemplate = parsed.html.trim() === getDefaultVisualTemplate(key).html.trim();
    return {
      html: parsed.html,
      css: isDefaultTemplate ? getDefaultVisualTemplate(key).css : "",
      styleHrefs: parsed.styleHrefs,
      isPublished: parsed.isPublished,
      updatedAt: record.updatedAt,
      hasStoredContent: true,
      hasPreviousVersion,
    };
  }

  return {
    html: parsed.html,
    css: parsed.css,
    styleHrefs: parsed.styleHrefs,
    isPublished: parsed.isPublished,
    updatedAt: record.updatedAt,
    hasStoredContent: true,
    hasPreviousVersion,
  };
}

export async function getVisualPagesOverview() {
  noStore();

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
  noStore();

  const page = await getPublishedVisualPage(key);
  if (!page) return null;
  const links = page.styleHrefs.map((href) => `<link rel="stylesheet" href="${href}">`).join("");
  return `${links}<style>${page.css}</style>${page.html}`;
}

export async function getPublishedVisualPage(key: VisualPageKey): Promise<PublishedVisualPage | null> {
  noStore();

  const page = await getVisualPage(key);
  if (!page.isPublished) return null;

  const html = normalizeVisualHtml(page.html);
  if (!html) return null;

  const css = normalizeVisualCss(page.css);
  const normalizedCss = isDefaultVisualCss(css) && !html.includes("vp-") ? "" : css;
  const styleHrefs = normalizeStyleHrefs(page.styleHrefs);

  return {
    html,
    css: normalizedCss,
    styleHrefs,
  };
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
  const normalizedHtml = normalizeVisualHtml(html);
  const normalizedCss = normalizeVisualCss(css);
  const normalizedStyleHrefs = normalizeStyleHrefs(styleHrefs);
  const existing = await prisma.dataList.findUnique({
    where: { slug: config.storageSlug },
    select: { items: true },
  });
  const existingParsed = existing ? parseStoredVisualData(existing.items) : null;
  const nextPreviousVersion =
    existingParsed
      ? (createStoredVisualVersion({
          html: existingParsed.html,
          css: existingParsed.css,
          styleHrefs: existingParsed.styleHrefs,
          isPublished: existingParsed.isPublished,
        }) ?? existingParsed.previousVersion)
      : null;

  await prisma.dataList.upsert({
    where: { slug: config.storageSlug },
    create: {
      slug: config.storageSlug,
      name: `Visual page: ${config.title}`,
      items: {
        html: normalizedHtml,
        css: normalizedCss,
        styleHrefs: normalizedStyleHrefs,
        isPublished,
        previousVersion: null,
      },
    },
    update: {
      name: `Visual page: ${config.title}`,
      items: {
        html: normalizedHtml,
        css: normalizedCss,
        styleHrefs: normalizedStyleHrefs,
        isPublished,
        previousVersion: nextPreviousVersion,
      },
    },
  });
}

export async function restorePreviousVisualPage(key: VisualPageKey): Promise<boolean> {
  if (!prisma) {
    throw new Error("db_unavailable");
  }

  const config = VISUAL_PAGE_CONFIG[key];
  const record = await prisma.dataList.findUnique({
    where: { slug: config.storageSlug },
    select: { items: true },
  });

  if (!record) return false;

  const parsed = parseStoredVisualData(record.items);
  const previous = parsed.previousVersion;
  if (!previous) return false;

  const swappedPrevious = createStoredVisualVersion({
    html: parsed.html,
    css: parsed.css,
    styleHrefs: parsed.styleHrefs,
    isPublished: parsed.isPublished,
  });

  await prisma.dataList.update({
    where: { slug: config.storageSlug },
    data: {
      name: `Visual page: ${config.title}`,
      items: {
        html: previous.html,
        css: previous.css,
        styleHrefs: previous.styleHrefs,
        isPublished: previous.isPublished,
        previousVersion: swappedPrevious,
      },
    },
  });

  return true;
}
