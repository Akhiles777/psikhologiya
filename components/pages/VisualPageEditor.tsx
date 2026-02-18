"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Props = {
  title: string;
  publicPath: string;
  importSourcePath: string;
  autoImportFromLive?: boolean;
  backHref: string;
  initialHtml: string;
  initialCss: string;
  initialStyleHrefs: string[];
  initialPublished: boolean;
  submitAction: (formData: FormData) => void;
};

type EditorMode = "visual" | "code";

type GrapesEditor = {
  getHtml: () => string;
  getCss: () => string;
  setComponents: (html: string) => void;
  setStyle: (css: string) => void;
  destroy: () => void;
  BlockManager: {
    add: (id: string, options: { label: string; category: string; content: string }) => void;
  };
  Canvas?: {
    getDocument: () => Document;
  };
};

type GrapesJsGlobal = {
  init: (options: Record<string, unknown>) => GrapesEditor;
};

type ImportedPagePayload = {
  html: string;
  styleHrefs: string[];
  inlineStyles: string[];
  stylesheetRules: string;
  htmlClassName: string;
  bodyClassName: string;
  htmlStyleText: string;
  bodyStyleText: string;
  language: string;
};

declare global {
  interface Window {
    grapesjs?: GrapesJsGlobal;
  }
}

const GRAPES_CSS_ID = "grapesjs-css";
const GRAPES_JS_ID = "grapesjs-script";

function ensureGrapesCss(): void {
  if (document.getElementById(GRAPES_CSS_ID)) return;

  const link = document.createElement("link");
  link.id = GRAPES_CSS_ID;
  link.rel = "stylesheet";
  link.href = "https://unpkg.com/grapesjs/dist/css/grapes.min.css";
  document.head.appendChild(link);
}

function ensureGrapesScript(): Promise<void> {
  if (window.grapesjs) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById(GRAPES_JS_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("failed_to_load_grapesjs")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GRAPES_JS_ID;
    script.src = "https://unpkg.com/grapesjs";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("failed_to_load_grapesjs"));
    document.body.appendChild(script);
  });
}

function getParentStylesheets(): string[] {
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  return links
    .map((link) => link.getAttribute("href") ?? "")
    .filter(Boolean)
    .map((href) => new URL(href, window.location.origin).toString());
}

function defaultTemplate(): string {
  return [
    '<section style="padding:48px 24px;max-width:1100px;margin:0 auto;">',
    '<h1 style="font-size:44px;margin:0 0 12px;">Новый визуальный блок</h1>',
    '<p style="font-size:18px;color:#4b5563;margin:0 0 24px;">Перетащите блоки слева и соберите страницу как в конструкторе.</p>',
    '<a href="/contacts" style="display:inline-block;background:#5858E2;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;">Кнопка действия</a>',
    "</section>",
  ].join("");
}

function withVisualSourceParam(path: string): string {
  const url = new URL(path, window.location.origin);
  url.searchParams.set("visual_source", "1");
  url.searchParams.set("_vp", String(Date.now()));
  return url.toString();
}

function sanitizeNode(root: Element) {
  root.querySelectorAll("script,noscript").forEach((node) => node.remove());
}

function pickRootElement(doc: Document): Element {
  return (
    doc.querySelector("main.flex-1") ??
    doc.querySelector("main") ??
    (doc.body.firstElementChild as Element | null) ??
    doc.body
  );
}

function collectHeadStyles(doc: Document, base: string): { hrefs: string[]; inline: string[] } {
  const hrefs = Array.from(doc.querySelectorAll('head link[rel="stylesheet"]'))
    .map((link) => link.getAttribute("href") ?? "")
    .filter(Boolean)
    .map((href) => new URL(href, base).toString());

  const inline = Array.from(doc.querySelectorAll("head style"))
    .map((style) => style.textContent ?? "")
    .map((css) => css.trim())
    .filter(Boolean);

  return { hrefs, inline };
}

function collectStylesheetRules(doc: Document): string {
  const chunks: string[] = [];
  const sheets = Array.from(doc.styleSheets);

  for (const sheet of sheets) {
    try {
      const rules = (sheet as CSSStyleSheet).cssRules;
      if (!rules) continue;
      for (let i = 0; i < rules.length; i += 1) {
        chunks.push(rules[i].cssText);
      }
    } catch {
      // ignore cross-origin stylesheet access issues
    }
  }

  return chunks.join("\n");
}

function extractPayloadFromDocument(doc: Document, base: string): ImportedPagePayload {
  const root = pickRootElement(doc);
  const cloned = root.cloneNode(true) as Element;
  sanitizeNode(cloned);

  const html = cloned.outerHTML.trim();
  if (!html) throw new Error("empty_import");

  const { hrefs, inline } = collectHeadStyles(doc, base);
  const stylesheetRules = collectStylesheetRules(doc);

  return {
    html,
    styleHrefs: hrefs,
    inlineStyles: inline,
    stylesheetRules,
    htmlClassName: doc.documentElement.className ?? "",
    bodyClassName: doc.body.className ?? "",
    htmlStyleText: doc.documentElement.getAttribute("style") ?? "",
    bodyStyleText: doc.body.getAttribute("style") ?? "",
    language: doc.documentElement.lang ?? "ru",
  };
}

async function waitForIframeReady(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve) => {
    const onLoad = () => {
      const win = iframe.contentWindow;
      if (!win) return resolve();

      const finish = () => setTimeout(resolve, 120);
      const maybeFonts = (win.document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts;

      if (maybeFonts?.ready) {
        maybeFonts.ready.then(finish).catch(finish);
      } else {
        finish();
      }
    };

    iframe.addEventListener("load", onLoad, { once: true });
  });
}

async function importByIframe(path: string): Promise<ImportedPagePayload> {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-20000px";
  iframe.style.top = "0";
  iframe.style.width = "1440px";
  iframe.style.height = "3000px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.setAttribute("aria-hidden", "true");

  const cleanup = () => {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  try {
    document.body.appendChild(iframe);
    iframe.src = withVisualSourceParam(path);
    await waitForIframeReady(iframe);

    const doc = iframe.contentDocument;
    if (!doc) throw new Error("iframe_doc_unavailable");

    return extractPayloadFromDocument(doc, iframe.src);
  } finally {
    cleanup();
  }
}

async function importByFetch(path: string): Promise<ImportedPagePayload> {
  const url = withVisualSourceParam(path);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`fetch_failed_${response.status}`);
  }

  const htmlText = await response.text();
  const doc = new DOMParser().parseFromString(htmlText, "text/html");
  return extractPayloadFromDocument(doc, url);
}

function applyStylesToCanvas(editor: GrapesEditor, styleHrefs: string[], inlineCssList: string[]) {
  const canvasDoc = editor.Canvas?.getDocument();
  if (!canvasDoc) return;

  const existingLinks = new Set(
    Array.from(canvasDoc.querySelectorAll('link[data-vp-import-style="1"]')).map((el) => el.getAttribute("href") ?? "")
  );

  for (const href of styleHrefs) {
    if (existingLinks.has(href)) continue;
    const link = canvasDoc.createElement("link");
    link.setAttribute("data-vp-import-style", "1");
    link.rel = "stylesheet";
    link.href = href;
    canvasDoc.head.appendChild(link);
  }

  canvasDoc.querySelectorAll('style[data-vp-import-inline-style="1"]').forEach((node) => node.remove());

  for (const cssText of inlineCssList) {
    const style = canvasDoc.createElement("style");
    style.setAttribute("data-vp-import-inline-style", "1");
    style.textContent = cssText;
    canvasDoc.head.appendChild(style);
  }
}

function buildImportCss(payload: ImportedPagePayload, loadedStylesheetCss: string[]): string {
  const baseline = `
*,*::before,*::after{box-sizing:border-box}
img,video,canvas,svg{display:block;max-width:100%;height:auto}
  `.trim();

  const parts = [
    baseline,
    payload.stylesheetRules.trim(),
    ...loadedStylesheetCss.map((css) => css.trim()).filter(Boolean),
    ...payload.inlineStyles.map((css) => css.trim()).filter(Boolean),
  ].filter(Boolean);
  return parts.join("\n\n");
}

async function loadStylesheetContents(hrefs: string[]): Promise<string[]> {
  const cssList = await Promise.all(
    hrefs.map(async (href) => {
      try {
        const resp = await fetch(href, { cache: "no-store" });
        if (!resp.ok) return "";
        const text = await resp.text();
        return text.trim();
      } catch {
        return "";
      }
    })
  );

  return cssList.filter(Boolean);
}

function applyDocumentShellToCanvas(editor: GrapesEditor, payload: ImportedPagePayload) {
  const canvasDoc = editor.Canvas?.getDocument();
  if (!canvasDoc) return;

  canvasDoc.documentElement.lang = payload.language || "ru";
  canvasDoc.documentElement.className = payload.htmlClassName;
  canvasDoc.body.className = payload.bodyClassName;

  if (payload.htmlStyleText) {
    canvasDoc.documentElement.setAttribute("style", payload.htmlStyleText);
  } else {
    canvasDoc.documentElement.removeAttribute("style");
  }

  if (payload.bodyStyleText) {
    canvasDoc.body.setAttribute("style", payload.bodyStyleText);
  } else {
    canvasDoc.body.removeAttribute("style");
  }
}

export default function VisualPageEditor({
  title,
  publicPath,
  importSourcePath,
  autoImportFromLive = false,
  backHref,
  initialHtml,
  initialCss,
  initialStyleHrefs,
  initialPublished,
  submitAction,
}: Props) {
  const editorRef = useRef<GrapesEditor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const htmlInputRef = useRef<HTMLInputElement | null>(null);
  const cssInputRef = useRef<HTMLInputElement | null>(null);
  const styleHrefsInputRef = useRef<HTMLInputElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const importingRef = useRef(false);
  const baseImportedCssRef = useRef(initialCss);
  const importedStyleHrefsRef = useRef<string[]>(initialStyleHrefs);

  const [mode, setMode] = useState<EditorMode>("visual");
  const [codeHtml, setCodeHtml] = useState(initialHtml);
  const [codeCss, setCodeCss] = useState(initialCss);
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [isImporting, setIsImporting] = useState(false);

  const syncEditorToInputs = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const html = editor.getHtml();
    const visualCss = editor.getCss().trim();
    const baseCss = baseImportedCssRef.current.trim();
    const css = baseCss
      ? (visualCss ? (visualCss.includes(baseCss) ? visualCss : `${baseCss}\n\n${visualCss}`) : baseCss)
      : visualCss;

    setCodeHtml(html);
    setCodeCss(css);

    if (htmlInputRef.current) htmlInputRef.current.value = html;
    if (cssInputRef.current) cssInputRef.current.value = css;
  }, []);

  const importFromLivePage = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor || importingRef.current) return;

    importingRef.current = true;
    setIsImporting(true);

    try {
      let payload: ImportedPagePayload;
      let modeUsed: "iframe" | "fetch" = "iframe";

      try {
        payload = await importByIframe(importSourcePath);
      } catch {
        payload = await importByFetch(importSourcePath);
        modeUsed = "fetch";
      }

      editor.setComponents(payload.html);
      applyStylesToCanvas(editor, payload.styleHrefs, payload.inlineStyles);
      applyDocumentShellToCanvas(editor, payload);
      importedStyleHrefsRef.current = payload.styleHrefs;
      if (styleHrefsInputRef.current) {
        styleHrefsInputRef.current.value = payload.styleHrefs.join("\n");
      }
      const loadedStylesheetCss = await loadStylesheetContents(payload.styleHrefs);
      const importCss = buildImportCss(payload, loadedStylesheetCss);
      baseImportedCssRef.current = importCss;
      editor.setStyle(importCss);
      if (cssInputRef.current) cssInputRef.current.value = importCss;
      setCodeCss(importCss);
      syncEditorToInputs();

      if (statusRef.current) {
        statusRef.current.textContent =
          modeUsed === "iframe"
            ? "Импорт выполнен: загружены все блоки/изображения и подключены стили страницы."
            : "Импорт выполнен через fallback: блоки/изображения и стили загружены.";
        statusRef.current.className =
          modeUsed === "iframe"
            ? "mt-4 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs text-green-700"
            : "mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700";
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_import_error";
      if (statusRef.current) {
        statusRef.current.textContent = `Не удалось импортировать текущую страницу. ${message}`;
        statusRef.current.className = "mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700";
      }
    } finally {
      importingRef.current = false;
      setIsImporting(false);
    }
  }, [importSourcePath, syncEditorToInputs]);

  useEffect(() => {
    let isUnmounted = false;

    const init = async () => {
      try {
        ensureGrapesCss();
        await ensureGrapesScript();

        if (isUnmounted || !containerRef.current || !window.grapesjs) return;

        const editor = window.grapesjs.init({
          container: containerRef.current,
          fromElement: false,
          height: "70vh",
          storageManager: false,
          components: initialHtml || defaultTemplate(),
          style: initialCss || "",
          canvas: {
            styles: getParentStylesheets(),
          },
        });

        editor.BlockManager.add("section", {
          label: "Секция",
          category: "Блоки",
          content: '<section style="padding:32px;max-width:1100px;margin:0 auto;"><h2>Новая секция</h2><p>Добавьте текст</p></section>',
        });
        editor.BlockManager.add("text", {
          label: "Текст",
          category: "Блоки",
          content: "<p>Новый текстовый блок</p>",
        });
        editor.BlockManager.add("image", {
          label: "Изображение",
          category: "Блоки",
          content: '<img src="/images/hero.png" alt="image" style="max-width:100%;height:auto;"/>',
        });
        editor.BlockManager.add("button", {
          label: "Кнопка",
          category: "Блоки",
          content:
            '<a href="/contacts" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#5858E2;color:#fff;text-decoration:none;">Кнопка</a>',
        });

        editorRef.current = editor;
        if (statusRef.current) {
          statusRef.current.textContent = "Редактор загружен. Можно собирать страницу блоками.";
          statusRef.current.className = "mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700";
        }

        if (autoImportFromLive) {
          void importFromLivePage();
        }
      } catch {
        if (statusRef.current) {
          statusRef.current.textContent = "Не удалось загрузить визуальный редактор. Проверьте доступ к CDN unpkg.com.";
          statusRef.current.className = "mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700";
        }
      }
    };

    void init();

    return () => {
      isUnmounted = true;
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [initialHtml, initialCss, autoImportFromLive, importFromLivePage]);

  const applyCodeToEditor = () => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.setComponents(codeHtml || defaultTemplate());
    editor.setStyle(codeCss);
    baseImportedCssRef.current = "";
  };

  return (
    <div className="rounded-2xl border-2 border-[#5858E2]/20 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">{title}</h1>
        <Link
          href={publicPath}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg border border-[#A7FF5A] px-3 py-2 text-sm font-medium text-foreground hover:bg-[#A7FF5A]/10"
        >
          Открыть страницу
        </Link>
      </div>

      <div ref={statusRef} className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
        Загружаем визуальный редактор...
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("visual");
            applyCodeToEditor();
          }}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${mode === "visual" ? "bg-[#5858E2] text-white" : "bg-gray-100 text-gray-700"}`}
        >
          Визуальный режим
        </button>
        <button
          type="button"
          onClick={() => {
            syncEditorToInputs();
            setMode("code");
          }}
          className={`rounded-lg px-3 py-2 text-sm font-medium ${mode === "code" ? "bg-[#5858E2] text-white" : "bg-gray-100 text-gray-700"}`}
        >
          HTML/CSS код
        </button>
        <button
          type="button"
          onClick={() => {
            void importFromLivePage();
          }}
          disabled={isImporting}
          className="rounded-lg bg-[#A7FF5A] px-3 py-2 text-sm font-medium text-gray-900 hover:bg-[#96ec4f] disabled:opacity-60"
        >
          {isImporting ? "Импорт..." : "Импортировать текущую страницу"}
        </button>
      </div>

      <form
        action={submitAction}
        className="mt-6 space-y-4"
        onSubmit={() => {
          if (mode === "code") {
            if (htmlInputRef.current) htmlInputRef.current.value = codeHtml;
            if (cssInputRef.current) cssInputRef.current.value = codeCss;
          } else {
            syncEditorToInputs();
          }
          if (styleHrefsInputRef.current) {
            styleHrefsInputRef.current.value = importedStyleHrefsRef.current.join("\n");
          }
        }}
      >
        <div className={mode === "visual" ? "block" : "hidden"}>
          <div ref={containerRef} className="w-full overflow-hidden rounded-xl border border-gray-200" />
        </div>

        {mode === "code" && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">HTML</label>
              <textarea
                value={codeHtml}
                onChange={(event) => setCodeHtml(event.target.value)}
                rows={12}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 font-mono text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5858E2]/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">CSS</label>
              <textarea
                value={codeCss}
                onChange={(event) => setCodeCss(event.target.value)}
                rows={8}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 font-mono text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5858E2]/20"
              />
            </div>
            <button
              type="button"
              onClick={applyCodeToEditor}
              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Применить код в визуальный редактор
            </button>
          </div>
        )}

        <input ref={htmlInputRef} type="hidden" name="html" defaultValue={initialHtml} />
        <input ref={cssInputRef} type="hidden" name="css" defaultValue={initialCss} />
        <input
          ref={styleHrefsInputRef}
          type="hidden"
          name="styleHrefs"
          defaultValue={initialStyleHrefs.join("\n")}
        />
        <input type="hidden" name="isPublished" value="off" />

        <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
          <input
            type="checkbox"
            name="isPublished"
            value="on"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#5858E2] focus:ring-[#5858E2]"
          />
          Публиковать на сайте
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="rounded-lg bg-[#5858E2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4848d0]"
          >
            Сохранить
          </button>
          <Link
            href={backHref}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Назад
          </Link>
        </div>
      </form>
    </div>
  );
}
