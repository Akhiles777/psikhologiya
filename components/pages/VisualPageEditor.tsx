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
  restoreAction?: (formData: FormData) => void;
  canRestorePrevious?: boolean;
};

type EditorMode = "visual" | "code";

type GrapesEditor = {
  getHtml: () => string;
  getCss: () => string;
  setComponents: (html: string) => void;
  setStyle: (css: string) => void;
  setDevice?: (deviceName: string) => void;
  getDevice?: () => string;
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
  htmlClassName: string;
  bodyClassName: string;
  htmlStyleText: string;
  bodyStyleText: string;
  language: string;
  nodeSnapshot: NodeSnapshotMap;
};

type NodeSnapshot = {
  tagName: string;
  className: string;
  styleText: string;
};

type NodeSnapshotMap = Record<string, NodeSnapshot>;

declare global {
  interface Window {
    grapesjs?: GrapesJsGlobal;
  }
}

const GRAPES_CSS_ID = "grapesjs-css";
const GRAPES_JS_ID = "grapesjs-script";
const CANVAS_GUARDS_STYLE_ID = "vp-canvas-guards";
const CLASS_BACKUP_ATTR = "data-vp-class-backup";
const NODE_ID_ATTR = "data-vp-node-id";
const GRAPES_CSS_URLS = [
  "https://unpkg.com/grapesjs/dist/css/grapes.min.css",
  "https://cdn.jsdelivr.net/npm/grapesjs/dist/css/grapes.min.css",
] as const;
const GRAPES_JS_URLS = [
  "https://unpkg.com/grapesjs",
  "https://cdn.jsdelivr.net/npm/grapesjs",
] as const;
const DANGEROUS_PROTOCOLS = ["javascript:", "vbscript:", "data:text/html"] as const;
const DANGEROUS_INLINE_STYLE = /expression\s*\(|url\s*\(\s*['"]?\s*javascript:/i;
const URL_ATTRS = new Set(["href", "src", "xlink:href", "formaction", "action", "poster"]);
const COMPLEX_CLASS_PATTERN = /[:\[\]\\/()%]/;
const RESPONSIVE_STYLE_PROPS = [
  "position",
  "inset",
  "top",
  "right",
  "bottom",
  "left",
  "width",
  "height",
  "min-height",
  "max-height",
  "max-width",
  "object-fit",
  "object-position",
  "aspect-ratio",
  "overflow",
  "display",
] as const;

const VIEWPORT_OPTIONS: Array<{ key: EditorViewport; label: string }> = [
  { key: "desktop", label: "Desktop" },
  { key: "tablet", label: "Tablet" },
  { key: "mobile", label: "Mobile" },
];

type HtmlDomParser = {
  parseFromString: (source: string, mimeType: string) => Document;
};

type EditorViewport = "desktop" | "tablet" | "mobile";

function parseHtmlDocument(html: string): Document | null {
  const ParserConstructor = (globalThis as { DOMParser?: new () => HtmlDomParser }).DOMParser;
  if (!ParserConstructor) return null;
  try {
    return new ParserConstructor().parseFromString(html, "text/html");
  } catch {
    return null;
  }
}

function isAllowedStyleHref(href: string): boolean {
  if (!href) return false;
  if (!/^https?:\/\//.test(href) && !href.startsWith("/")) return false;
  return true;
}

function normalizeImportedHref(href: string, base: string): string {
  try {
    const resolved = new URL(href, base);
    if (resolved.origin === window.location.origin) {
      return `${resolved.pathname}${resolved.search}${resolved.hash}`;
    }
    return resolved.toString();
  } catch {
    return href.trim();
  }
}

function uniqueStyleHrefs(hrefs: string[]): string[] {
  return Array.from(new Set(hrefs.filter((href) => isAllowedStyleHref(href.trim())).map((href) => href.trim())));
}

function ensureGrapesCss(): { element: HTMLLinkElement; created: boolean } {
  const existing = document.getElementById(GRAPES_CSS_ID) as HTMLLinkElement | null;
  if (existing) {
    return { element: existing, created: false };
  }

  const link = document.createElement("link");
  link.id = GRAPES_CSS_ID;
  link.rel = "stylesheet";
  link.crossOrigin = "anonymous";
  link.setAttribute("data-vp-managed", "1");

  let attempt = 0;
  link.href = GRAPES_CSS_URLS[attempt];
  link.addEventListener("error", () => {
    attempt += 1;
    if (attempt < GRAPES_CSS_URLS.length) {
      link.href = GRAPES_CSS_URLS[attempt];
    }
  });

  document.head.appendChild(link);
  return { element: link, created: true };
}

function ensureGrapesScript(): Promise<{ element: HTMLScriptElement | null; created: boolean }> {
  return new Promise((resolve, reject) => {
    if (window.grapesjs) {
      const existing = document.getElementById(GRAPES_JS_ID) as HTMLScriptElement | null;
      resolve({ element: existing, created: false });
      return;
    }

    const existing = document.getElementById(GRAPES_JS_ID) as HTMLScriptElement | null;
    if (existing) {
      if (existing.getAttribute("data-vp-ready") === "1") {
        resolve({ element: existing, created: false });
        return;
      }

      let timedOut = false;
      const cleanup = () => {
        existing.removeEventListener("load", onLoad);
        existing.removeEventListener("error", onError);
      };
      const timeoutId = window.setTimeout(() => {
        timedOut = true;
        cleanup();
        reject(new Error("failed_to_load_grapesjs"));
      }, 7000);

      const onLoad = () => {
        if (timedOut) return;
        window.clearTimeout(timeoutId);
        cleanup();
        resolve({ element: existing, created: false });
      };
      const onError = () => {
        if (timedOut) return;
        window.clearTimeout(timeoutId);
        cleanup();
        reject(new Error("failed_to_load_grapesjs"));
      };
      existing.addEventListener("load", onLoad, { once: true });
      existing.addEventListener("error", onError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GRAPES_JS_ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-vp-managed", "1");

    let attempt = 0;
    const cleanup = () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
    const onLoad = () => {
      script.setAttribute("data-vp-ready", "1");
      cleanup();
      resolve({ element: script, created: true });
    };
    const onError = () => {
      attempt += 1;
      if (attempt < GRAPES_JS_URLS.length) {
        script.src = GRAPES_JS_URLS[attempt];
        return;
      }
      cleanup();
      reject(new Error("failed_to_load_grapesjs"));
    };

    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError);
    script.src = GRAPES_JS_URLS[attempt];
    document.body.appendChild(script);
  });
}

function getParentStylesheets(): string[] {
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  return Array.from(
    new Set(
      links
        .filter((link) => link.id !== GRAPES_CSS_ID)
        .map((link) => link.getAttribute("href") ?? "")
        .filter(Boolean)
        .map((href) => new URL(href, window.location.origin).toString())
    )
  );
}

function getParentInlineStyles(): string[] {
  return Array.from(document.querySelectorAll("head style"))
    .map((node) => node.textContent ?? "")
    .map((text) => text.trim())
    .filter(Boolean);
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

function isDangerousUrl(value: string): boolean {
  const normalized = value.replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();
  return DANGEROUS_PROTOCOLS.some((protocol) => normalized.startsWith(protocol));
}

function sanitizeNode(root: Element) {
  root.querySelectorAll("script,noscript,base,object,embed,applet,meta[http-equiv='refresh' i]").forEach((node) => node.remove());

  const allElements = [root, ...Array.from(root.querySelectorAll("*"))];

  for (const element of allElements) {
    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value ?? "";

      if (name.startsWith("on") || name === "srcdoc") {
        element.removeAttribute(attr.name);
        continue;
      }

      if (name === "style" && DANGEROUS_INLINE_STYLE.test(value)) {
        element.removeAttribute(attr.name);
        continue;
      }

      if (URL_ATTRS.has(name) && isDangerousUrl(value)) {
        element.removeAttribute(attr.name);
      }
    }
  }
}

function splitClassTokens(value: string): string[] {
  return value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function mergeClassValues(current: string, backup: string): string {
  const tokens = splitClassTokens(current);
  const set = new Set(tokens);

  for (const token of splitClassTokens(backup)) {
    if (!set.has(token)) {
      set.add(token);
      tokens.push(token);
    }
  }

  return tokens.join(" ").trim();
}

function hasComplexClasses(value: string): boolean {
  return splitClassTokens(value).some((token) => COMPLEX_CLASS_PATTERN.test(token));
}

function addClassBackups(root: Element): void {
  const allElements = [root, ...Array.from(root.querySelectorAll("*"))];
  for (const element of allElements) {
    const currentClass = (element.getAttribute("class") ?? "").trim();
    if (!currentClass || !hasComplexClasses(currentClass)) continue;
    if (!element.hasAttribute(CLASS_BACKUP_ATTR)) {
      element.setAttribute(CLASS_BACKUP_ATTR, currentClass);
    }
  }
}

function stabilizeComplexClassesInHtml(html: string): string {
  const value = html.trim();
  if (!value) return value;

  const doc = parseHtmlDocument(value);
  if (!doc) return value;
  const body = doc.body;
  if (!body) return value;

  for (const element of Array.from(body.querySelectorAll<HTMLElement>("*"))) {
    const currentClass = (element.getAttribute("class") ?? "").trim();
    if (currentClass && hasComplexClasses(currentClass) && !element.hasAttribute(CLASS_BACKUP_ATTR)) {
      element.setAttribute(CLASS_BACKUP_ATTR, currentClass);
    }

    const backupClass = (element.getAttribute(CLASS_BACKUP_ATTR) ?? "").trim();
    if (!backupClass) continue;

    const merged = mergeClassValues(currentClass, backupClass);
    if (merged) {
      element.setAttribute("class", merged);
      continue;
    }

    element.removeAttribute("class");
  }

  const output = body.innerHTML.trim();
  return output || value;
}

function toStylePropertyMap(styleText: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const part of styleText.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex <= 0) continue;
    const rawName = trimmed.slice(0, separatorIndex).trim().toLowerCase();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (!rawName || !rawValue) continue;
    map.set(rawName, rawValue);
  }
  return map;
}

function fromStylePropertyMap(map: Map<string, string>): string {
  return Array.from(map.entries())
    .map(([name, value]) => `${name}:${value}`)
    .join(";");
}

function mergeResponsiveStyleText(currentStyleText: string, snapshotStyleText: string): string {
  if (!snapshotStyleText.trim()) return currentStyleText.trim();

  const current = toStylePropertyMap(currentStyleText);
  const snapshot = toStylePropertyMap(snapshotStyleText);

  for (const property of RESPONSIVE_STYLE_PROPS) {
    const key = property.toLowerCase();
    const snapshotValue = snapshot.get(key);
    if (!snapshotValue) continue;
    if (!current.has(key)) {
      current.set(key, snapshotValue);
    }
  }

  return fromStylePropertyMap(current);
}

function snapshotNode(node: Element): NodeSnapshot {
  return {
    tagName: node.tagName.toLowerCase(),
    className: (node.getAttribute("class") ?? "").trim(),
    styleText: (node.getAttribute("style") ?? "").trim(),
  };
}

function assignNodeIdsAndBuildSnapshot(root: Element): NodeSnapshotMap {
  const snapshot: NodeSnapshotMap = {};
  const nodes = [root, ...Array.from(root.querySelectorAll("*"))];

  nodes.forEach((node, index) => {
    const element = node as Element;
    const existingId = (element.getAttribute(NODE_ID_ATTR) ?? "").trim();
    const nodeId = existingId || `vp-${index.toString(36)}`;
    if (!existingId) {
      element.setAttribute(NODE_ID_ATTR, nodeId);
    }
    snapshot[nodeId] = snapshotNode(element);
  });

  return snapshot;
}

function buildSnapshotFromDocumentBody(body: HTMLElement): NodeSnapshotMap {
  const snapshot: NodeSnapshotMap = {};
  for (const element of Array.from(body.querySelectorAll<HTMLElement>(`[${NODE_ID_ATTR}]`))) {
    const nodeId = (element.getAttribute(NODE_ID_ATTR) ?? "").trim();
    if (!nodeId) continue;
    snapshot[nodeId] = snapshotNode(element);
  }
  return snapshot;
}

function extractNodeSnapshotFromHtml(html: string): NodeSnapshotMap {
  const value = html.trim();
  if (!value) return {};
  const doc = parseHtmlDocument(value);
  if (!doc) return {};
  return buildSnapshotFromDocumentBody(doc.body);
}

function serializeNodeSnapshot(snapshot: NodeSnapshotMap): string {
  try {
    return JSON.stringify(snapshot);
  } catch {
    return "{}";
  }
}

function hasSnapshotEntries(snapshot: NodeSnapshotMap): boolean {
  return Object.keys(snapshot).length > 0;
}

function ensureNodeIdsInHtml(html: string): { html: string; snapshot: NodeSnapshotMap } {
  const value = html.trim();
  if (!value) {
    return { html: value, snapshot: {} };
  }

  const doc = parseHtmlDocument(value);
  if (!doc) {
    return { html: value, snapshot: {} };
  }
  const body = doc.body;
  if (!body) {
    return { html: value, snapshot: {} };
  }

  const used = new Set<string>();
  for (const element of Array.from(body.querySelectorAll<HTMLElement>(`[${NODE_ID_ATTR}]`))) {
    const nodeId = (element.getAttribute(NODE_ID_ATTR) ?? "").trim();
    if (nodeId) used.add(nodeId);
  }

  let counter = 0;
  for (const element of Array.from(body.querySelectorAll<HTMLElement>("*"))) {
    const existing = (element.getAttribute(NODE_ID_ATTR) ?? "").trim();
    if (existing) continue;

    let candidate = `vp-${counter.toString(36)}`;
    while (used.has(candidate)) {
      counter += 1;
      candidate = `vp-${counter.toString(36)}`;
    }
    element.setAttribute(NODE_ID_ATTR, candidate);
    used.add(candidate);
    counter += 1;
  }

  return {
    html: body.innerHTML.trim() || value,
    snapshot: buildSnapshotFromDocumentBody(body),
  };
}

function restoreHtmlFromSnapshot(html: string, snapshot: NodeSnapshotMap): string {
  const value = html.trim();
  if (!value || !Object.keys(snapshot).length) return value;

  const doc = parseHtmlDocument(value);
  if (!doc) return value;
  const body = doc.body;
  if (!body) return value;

  for (const element of Array.from(body.querySelectorAll<HTMLElement>(`[${NODE_ID_ATTR}]`))) {
    const nodeId = (element.getAttribute(NODE_ID_ATTR) ?? "").trim();
    if (!nodeId) continue;

    const source = snapshot[nodeId];
    if (!source) continue;
    if (source.tagName && source.tagName !== element.tagName.toLowerCase()) continue;

    const currentClassName = (element.getAttribute("class") ?? "").trim();
    const backupClassName = (element.getAttribute(CLASS_BACKUP_ATTR) ?? "").trim();

    let mergedClassName = currentClassName;
    if (backupClassName) {
      mergedClassName = mergeClassValues(mergedClassName, backupClassName);
    }
    if (source.className) {
      mergedClassName = mergeClassValues(mergedClassName, source.className);
    }

    if (mergedClassName) {
      element.setAttribute("class", mergedClassName);
      if (!element.hasAttribute(CLASS_BACKUP_ATTR) && hasComplexClasses(mergedClassName)) {
        element.setAttribute(CLASS_BACKUP_ATTR, mergedClassName);
      }
    } else {
      element.removeAttribute("class");
    }

    const currentStyleText = (element.getAttribute("style") ?? "").trim();
    const mergedStyleText = mergeResponsiveStyleText(currentStyleText, source.styleText).trim();
    if (mergedStyleText) {
      element.setAttribute("style", mergedStyleText);
    } else {
      element.removeAttribute("style");
    }
  }

  return body.innerHTML.trim() || value;
}

function normalizeHtmlForStorage(html: string, snapshot: NodeSnapshotMap): string {
  const stabilizedHtml = stabilizeComplexClassesInHtml(html);
  const restoredHtml = restoreHtmlFromSnapshot(stabilizedHtml, snapshot);
  return stabilizeComplexClassesInHtml(restoredHtml);
}

function pickRootElement(doc: Document): Element {
  return (
    doc.querySelector("[data-vp-import-root]") ??
    doc.querySelector("main") ??
    (doc.body.firstElementChild as Element | null) ??
    doc.body
  );
}

function collectHeadStyles(doc: Document, base: string): { hrefs: string[]; inline: string[] } {
  const hrefs = uniqueStyleHrefs(
    Array.from(doc.querySelectorAll('head link[rel="stylesheet"]'))
    .map((link) => link.getAttribute("href") ?? "")
    .filter(Boolean)
    .map((href) => normalizeImportedHref(href, base))
  );

  const inline = Array.from(doc.querySelectorAll("head style"))
    .map((style) => style.textContent ?? "")
    .map((css) => css.trim())
    .filter(Boolean);

  return { hrefs, inline };
}

function extractPayloadFromDocument(doc: Document, base: string): ImportedPagePayload {
  const root = pickRootElement(doc);
  const cloned = root.cloneNode(true) as Element;
  sanitizeNode(cloned);
  const nodeSnapshot = assignNodeIdsAndBuildSnapshot(cloned);
  addClassBackups(cloned);

  const html = stabilizeComplexClassesInHtml(cloned.outerHTML.trim());
  if (!html) throw new Error("empty_import");

  const { hrefs, inline } = collectHeadStyles(doc, base);

  return {
    html,
    styleHrefs: hrefs,
    inlineStyles: inline,
    htmlClassName: doc.documentElement.className ?? "",
    bodyClassName: doc.body.className ?? "",
    htmlStyleText: doc.documentElement.getAttribute("style") ?? "",
    bodyStyleText: doc.body.getAttribute("style") ?? "",
    language: doc.documentElement.lang ?? "ru",
    nodeSnapshot,
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
  const doc = parseHtmlDocument(htmlText);
  if (!doc) {
    throw new Error("dom_parser_unavailable");
  }
  return extractPayloadFromDocument(doc, url);
}

function applyStylesToCanvas(editor: GrapesEditor, styleHrefs: string[], inlineCssList: string[]) {
  const canvasDoc = editor.Canvas?.getDocument();
  if (!canvasDoc) return;

  canvasDoc.querySelectorAll('link[data-vp-import-style="1"]').forEach((node) => node.remove());

  for (const href of styleHrefs) {
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

function applyCanvasGuards(editor: GrapesEditor) {
  const canvasDoc = editor.Canvas?.getDocument();
  if (!canvasDoc) return;

  let style = canvasDoc.getElementById(CANVAS_GUARDS_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = canvasDoc.createElement("style");
    style.id = CANVAS_GUARDS_STYLE_ID;
    canvasDoc.head.appendChild(style);
  }

  style.textContent = [
    "html,body{max-width:100%;overflow-x:hidden;}",
    "body *{min-width:0;}",
    "img,video,canvas,svg,picture,figure,iframe{max-width:100%;}",
    "img:not([style*='position:absolute']):not([style*='position: absolute']){height:auto;}",
    "img[data-nimg='fill']{width:100% !important;height:100% !important;}",
    "pre{max-width:100%;overflow-x:auto;}",
    "table{max-width:100%;overflow-x:auto;}",
    "iframe{width:100%;}",
    "@media (min-width:868px) and (max-width:1023.98px){img[data-nimg='fill']{width:100% !important;height:100% !important;}}",
  ].join("");
}

function applyParentInlineStylesToCanvas(editor: GrapesEditor) {
  const canvasDoc = editor.Canvas?.getDocument();
  if (!canvasDoc) return;

  const incoming = getParentInlineStyles();
  if (!incoming.length) return;

  canvasDoc.querySelectorAll('style[data-vp-parent-inline-style="1"]').forEach((node) => node.remove());

  for (const cssText of incoming) {
    const style = canvasDoc.createElement("style");
    style.setAttribute("data-vp-parent-inline-style", "1");
    style.textContent = cssText;
    canvasDoc.head.appendChild(style);
  }
}

function applyInitialCanvasStyles(editor: GrapesEditor, styleHrefs: string[]) {
  const prepared = uniqueStyleHrefs(styleHrefs);
  applyStylesToCanvas(editor, prepared, []);
  applyParentInlineStylesToCanvas(editor);
  applyCanvasGuards(editor);
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

function setEditorViewport(editor: GrapesEditor | null, viewport: EditorViewport) {
  if (!editor?.setDevice) return;
  editor.setDevice(viewport);
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
  restoreAction,
  canRestorePrevious = false,
}: Props) {
  const initialPayloadRef = useRef({
    html: initialHtml,
    css: initialCss,
    styleHrefs: uniqueStyleHrefs(initialStyleHrefs),
    autoImportFromLive,
    importSourcePath,
  });
  const editorRef = useRef<GrapesEditor | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const htmlInputRef = useRef<HTMLInputElement | null>(null);
  const cssInputRef = useRef<HTMLInputElement | null>(null);
  const styleHrefsInputRef = useRef<HTMLInputElement | null>(null);
  const nodeSnapshotInputRef = useRef<HTMLInputElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);
  const grapesCssNodeRef = useRef<HTMLLinkElement | null>(null);
  const grapesScriptNodeRef = useRef<HTMLScriptElement | null>(null);
  const importSourcePathRef = useRef(initialPayloadRef.current.importSourcePath);
  const importingRef = useRef(false);
  const hasAutoImportedRef = useRef(false);
  const importedStyleHrefsRef = useRef<string[]>(initialPayloadRef.current.styleHrefs);
  const nodeSnapshotRef = useRef<NodeSnapshotMap>(extractNodeSnapshotFromHtml(initialPayloadRef.current.html));

  const [mode, setMode] = useState<EditorMode>("visual");
  const [codeHtml, setCodeHtml] = useState(() => initialPayloadRef.current.html);
  const [codeCss, setCodeCss] = useState(() => initialPayloadRef.current.css);
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [viewport, setViewport] = useState<EditorViewport>("desktop");

  useEffect(() => {
    importSourcePathRef.current = importSourcePath;
  }, [importSourcePath]);

  const writeInputs = useCallback((html: string, css: string, snapshotOverride?: NodeSnapshotMap) => {
    const activeSnapshot = snapshotOverride ?? nodeSnapshotRef.current;
    let sourceHtml = html;
    let sourceSnapshot = activeSnapshot;

    if (!hasSnapshotEntries(sourceSnapshot)) {
      const ensured = ensureNodeIdsInHtml(sourceHtml);
      sourceHtml = ensured.html;
      sourceSnapshot = ensured.snapshot;
    }

    const normalizedHtml = normalizeHtmlForStorage(sourceHtml, sourceSnapshot);
    const extractedSnapshot = extractNodeSnapshotFromHtml(normalizedHtml);
    if (hasSnapshotEntries(extractedSnapshot)) {
      nodeSnapshotRef.current = extractedSnapshot;
    } else if (snapshotOverride) {
      nodeSnapshotRef.current = snapshotOverride;
    }
    if (htmlInputRef.current) htmlInputRef.current.value = normalizedHtml;
    if (cssInputRef.current) cssInputRef.current.value = css;
    if (nodeSnapshotInputRef.current) {
      nodeSnapshotInputRef.current.value = serializeNodeSnapshot(nodeSnapshotRef.current);
    }
    return normalizedHtml;
  }, []);

  const syncEditorToInputs = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const css = editor.getCss().trim();
    const html = writeInputs(editor.getHtml(), css);

    setCodeHtml(html);
    setCodeCss(css);
    if (cssInputRef.current) cssInputRef.current.value = css;
  }, [writeInputs]);

  const importFromLivePage = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor || importingRef.current) return;

    importingRef.current = true;
    setIsImporting(true);

    try {
      const sourcePath = importSourcePathRef.current;
      let payload: ImportedPagePayload;
      let modeUsed: "iframe" | "fetch" = "iframe";

      try {
        payload = await importByIframe(sourcePath);
      } catch {
        payload = await importByFetch(sourcePath);
        modeUsed = "fetch";
      }

      const preparedStyleHrefs = uniqueStyleHrefs(payload.styleHrefs);

      editor.setComponents(payload.html);
      applyStylesToCanvas(editor, preparedStyleHrefs, payload.inlineStyles);
      applyParentInlineStylesToCanvas(editor);
      applyCanvasGuards(editor);
      applyDocumentShellToCanvas(editor, payload);
      importedStyleHrefsRef.current = preparedStyleHrefs;
      nodeSnapshotRef.current = payload.nodeSnapshot;
      if (styleHrefsInputRef.current) {
        styleHrefsInputRef.current.value = preparedStyleHrefs.join("\n");
      }
      if (nodeSnapshotInputRef.current) {
        nodeSnapshotInputRef.current.value = serializeNodeSnapshot(nodeSnapshotRef.current);
      }
      editor.setStyle("");
      setCodeCss("");
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
  }, [syncEditorToInputs]);

  useEffect(() => {
    let isUnmounted = false;

    const init = async () => {
      try {
        const cssAsset = ensureGrapesCss();
        if (cssAsset.created) grapesCssNodeRef.current = cssAsset.element;

        const scriptAsset = await ensureGrapesScript();
        if (scriptAsset.created) grapesScriptNodeRef.current = scriptAsset.element;

        if (isUnmounted || !containerRef.current || !window.grapesjs) return;

        const editor = window.grapesjs.init({
          container: containerRef.current,
          fromElement: false,
          height: "760px",
          storageManager: false,
          components: initialPayloadRef.current.html || defaultTemplate(),
          style: initialPayloadRef.current.css || "",
          canvas: {
            styles: getParentStylesheets(),
          },
          deviceManager: {
            devices: [
              { id: "desktop", name: "Desktop", width: "" },
              { id: "tablet", name: "Tablet", width: "900px", widthMedia: "1023px" },
              { id: "mobile", name: "Mobile", width: "375px", widthMedia: "767px" },
            ],
          },
          styleManager: {
            sectors: [
              {
                id: "typography",
                name: "Typography",
                open: true,
                buildProps: [
                  "font-family",
                  "font-size",
                  "font-weight",
                  "letter-spacing",
                  "line-height",
                  "color",
                  "text-align",
                  "text-decoration",
                  "text-transform",
                ],
              },
              {
                id: "dimension",
                name: "Dimension",
                open: true,
                buildProps: ["width", "max-width", "min-height", "height", "margin", "padding"],
              },
              {
                id: "decorations",
                name: "Decorations",
                open: false,
                buildProps: ["background-color", "border", "border-radius", "box-shadow", "opacity"],
              },
            ],
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
        editor.BlockManager.add("heading", {
          label: "Заголовок",
          category: "Блоки",
          content: '<h2 style="font-size:36px;line-height:1.2;margin:0 0 12px;">Новый заголовок</h2>',
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
        editor.BlockManager.add("columns-2", {
          label: "2 колонки",
          category: "Блоки",
          content: [
            '<section style="padding:24px 0;">',
            '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;">',
            '<div><h3>Левая колонка</h3><p>Текст блока.</p></div>',
            '<div><h3>Правая колонка</h3><p>Текст блока.</p></div>',
            "</div>",
            "</section>",
          ].join(""),
        });
        editor.BlockManager.add("spacer", {
          label: "Отступ",
          category: "Блоки",
          content: '<div style="height:32px;"></div>',
        });

        editorRef.current = editor;
        setViewport("desktop");
        setEditorViewport(editor, "desktop");
        applyInitialCanvasStyles(editor, importedStyleHrefsRef.current);
        setIsEditorReady(true);
        syncEditorToInputs();
        if (statusRef.current) {
          statusRef.current.textContent = "Редактор загружен. Сохраненные стили и блоки применены.";
          statusRef.current.className = "mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700";
        }

        if (initialPayloadRef.current.autoImportFromLive && !hasAutoImportedRef.current) {
          hasAutoImportedRef.current = true;
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
      if (grapesCssNodeRef.current && grapesCssNodeRef.current.parentNode) {
        grapesCssNodeRef.current.parentNode.removeChild(grapesCssNodeRef.current);
      }
      if (grapesScriptNodeRef.current && grapesScriptNodeRef.current.parentNode) {
        grapesScriptNodeRef.current.parentNode.removeChild(grapesScriptNodeRef.current);
      }
      grapesCssNodeRef.current = null;
      grapesScriptNodeRef.current = null;
    };
  }, [importFromLivePage, syncEditorToInputs]);

  const applyCodeToEditor = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const normalizedHtml = stabilizeComplexClassesInHtml(codeHtml || defaultTemplate());
    const snapshotFromCode = extractNodeSnapshotFromHtml(normalizedHtml);
    nodeSnapshotRef.current = snapshotFromCode;
    const storedHtml = writeInputs(normalizedHtml, codeCss.trim(), snapshotFromCode);
    editor.setComponents(storedHtml);
    editor.setStyle(codeCss);
    setCodeHtml(storedHtml);
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
            applyCodeToEditor();
            setMode("visual");
          }}
          disabled={!isEditorReady}
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
        <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-1">
          {VIEWPORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              disabled={!isEditorReady}
              onClick={() => {
                setViewport(option.key);
                setEditorViewport(editorRef.current, option.key);
              }}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                viewport === option.key ? "bg-[#5858E2] text-white" : "text-gray-700 hover:bg-gray-100"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {option.label}
            </button>
          ))}
        </div>
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
        {restoreAction && (
          <form
            action={restoreAction}
            onSubmit={(event) => {
              if (!canRestorePrevious || isRestoring) {
                event.preventDefault();
                return;
              }

              const confirmed = window.confirm(
                "Вернуть прошлую сохраненную версию страницы? Текущая сохраненная версия станет прошлой."
              );
              if (!confirmed) {
                event.preventDefault();
                return;
              }

              setIsRestoring(true);
            }}
          >
            <button
              type="submit"
              disabled={!canRestorePrevious || isRestoring || isImporting || isSaving}
              className="rounded-lg border border-[#5858E2] px-3 py-2 text-sm font-medium text-[#5858E2] hover:bg-[#5858E2]/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRestoring ? "Восстановление..." : "Вернуть прошлую версию"}
            </button>
          </form>
        )}
      </div>
      {restoreAction && !canRestorePrevious && (
        <p className="mt-2 text-xs text-gray-500">Прошлая версия появится после следующего сохранения.</p>
      )}
      <p className="mt-2 text-xs text-gray-500">
        Выберите элемент на холсте: в панели стилей доступны размер текста, цвет, отступы, ширина и другие параметры.
      </p>

      <form
        action={submitAction}
        className="mt-6 space-y-4"
        onSubmit={() => {
          setIsSaving(true);
          if (mode === "code") {
            const snapshotFromCode = extractNodeSnapshotFromHtml(codeHtml);
            nodeSnapshotRef.current = snapshotFromCode;
            const normalizedHtml = writeInputs(codeHtml, codeCss.trim(), snapshotFromCode);
            setCodeHtml(normalizedHtml);
          } else {
            syncEditorToInputs();
          }
          if (styleHrefsInputRef.current) {
            styleHrefsInputRef.current.value = importedStyleHrefsRef.current.join("\n");
          }
        }}
      >
        <div className={mode === "visual" ? "block" : "hidden"}>
          {!isEditorReady && (
            <div className="mb-3 flex min-h-[600px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
              Загружаем визуальный редактор...
            </div>
          )}
          <div
            ref={containerRef}
            className={`w-full overflow-hidden rounded-xl border border-gray-200 ${isEditorReady ? "block" : "hidden"}`}
          />
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

        <input ref={htmlInputRef} type="hidden" name="html" defaultValue={initialPayloadRef.current.html} />
        <input ref={cssInputRef} type="hidden" name="css" defaultValue={initialPayloadRef.current.css} />
        <input
          ref={styleHrefsInputRef}
          type="hidden"
          name="styleHrefs"
          defaultValue={initialPayloadRef.current.styleHrefs.join("\n")}
        />
        <input
          ref={nodeSnapshotInputRef}
          type="hidden"
          name="nodeSnapshot"
          defaultValue={serializeNodeSnapshot(nodeSnapshotRef.current)}
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
            disabled={isSaving || (mode === "visual" && !isEditorReady)}
            className="rounded-lg bg-[#5858E2] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#4848d0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
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
