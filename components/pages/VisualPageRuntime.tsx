"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  html: string;
  css: string;
  styleHrefs: string[];
};

const MIN_HEIGHT = 720;

function isAllowedHref(href: string): boolean {
  return /^https?:\/\//.test(href) || href.startsWith("/");
}

function canonicalizeHref(href: string): string {
  if (!href) return "";
  if (typeof window === "undefined") return href;
  try {
    return new URL(href, window.location.origin).toString();
  } catch {
    return href;
  }
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function escapeStyleTag(value: string): string {
  return value.replace(/<\/style/gi, "<\\/style");
}

function resolveHref(href: string): string {
  return new URL(href, window.location.origin).toString();
}

function getParentStylesheetHrefs(): string[] {
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((node) => node.getAttribute("href") ?? "")
    .filter(Boolean)
    .map((href) => resolveHref(href))
    .map((href) => canonicalizeHref(href))
    .filter(Boolean);
}

function getParentInlineStyles(): string[] {
  if (typeof document === "undefined") return [];
  return Array.from(document.querySelectorAll("head style"))
    .map((node) => node.textContent ?? "")
    .map((text) => text.trim())
    .filter(Boolean);
}

function buildSrcDoc(html: string, css: string, styleHrefs: string[]): string {
  const links = Array.from(new Set(styleHrefs))
    .filter(isAllowedHref)
    .map((href) => `<link rel="stylesheet" href="${escapeAttr(href)}" />`)
    .join("");

  const runtimeGuards = [
    "*,*::before,*::after{box-sizing:border-box;}",
    "img,video,canvas,svg{display:block;max-width:100%;height:auto;}",
    "pre,table,iframe{max-width:100%;}",
    "iframe{width:100%;}",
    "table{display:block;overflow-x:auto;}",
    "html,body{max-width:100%;overflow-x:hidden;}",
    "p,h1,h2,h3,h4,h5,h6{overflow-wrap:anywhere;word-break:break-word;}",
    "[data-vp-runtime-root]{width:100%;max-width:100%;overflow-x:hidden;}",
    "[data-vp-runtime-root] *{min-width:0;}",
  ].join("");

  return [
    "<!doctype html>",
    '<html lang="ru">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<base href="/" target="_top" />',
    links,
    `<style>html,body{margin:0;padding:0;}${runtimeGuards}${escapeStyleTag(css)}</style>`,
    "</head>",
    `<body><div data-vp-runtime-root>${html}</div></body>`,
    "</html>",
  ].join("");
}

export default function VisualPageRuntime({ html, css, styleHrefs }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState<number>(MIN_HEIGHT);

  const srcDoc = useMemo(() => buildSrcDoc(html, css, styleHrefs), [html, css, styleHrefs]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer: ResizeObserver | null = null;
    let intervalId: number | null = null;
    let imageCleanup: (() => void) | null = null;
    let initialized = false;

    const measure = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const docHeight = Math.max(
        doc.documentElement?.scrollHeight ?? 0,
        doc.documentElement?.offsetHeight ?? 0,
        doc.body?.scrollHeight ?? 0,
        doc.body?.offsetHeight ?? 0
      );

      const nextHeight = Math.max(docHeight, MIN_HEIGHT);
      setHeight((prev) => (Math.abs(prev - nextHeight) > 1 ? nextHeight : prev));
    };

    const syncParentStyles = (doc: Document) => {
      const parentHrefs = getParentStylesheetHrefs();
      const existing = new Set(
        Array.from(doc.querySelectorAll('link[rel="stylesheet"]'))
          .map((node) => node.getAttribute("href") ?? "")
          .map((href) => canonicalizeHref(href))
          .filter(Boolean)
      );

      for (const href of parentHrefs) {
        const normalizedHref = canonicalizeHref(href);
        if (!isAllowedHref(normalizedHref) || existing.has(normalizedHref)) continue;
        const link = doc.createElement("link");
        link.rel = "stylesheet";
        link.href = normalizedHref;
        link.setAttribute("data-vp-parent-style", "1");
        link.addEventListener("load", () => measure(), { once: true });
        doc.head.appendChild(link);
        existing.add(normalizedHref);
      }

      const parentInlineStyles = getParentInlineStyles();
      const existingInline = new Set(
        Array.from(doc.querySelectorAll('style[data-vp-parent-inline-style="1"]'))
          .map((node) => (node.textContent ?? "").trim())
          .filter(Boolean)
      );

      for (const cssText of parentInlineStyles) {
        if (!cssText || existingInline.has(cssText)) continue;
        const style = doc.createElement("style");
        style.setAttribute("data-vp-parent-inline-style", "1");
        style.textContent = cssText;
        doc.head.appendChild(style);
        existingInline.add(cssText);
      }
    };

    const onLoad = () => {
      if (initialized) return;
      initialized = true;

      const doc = iframe.contentDocument;
      if (!doc) return;

      syncParentStyles(doc);
      measure();

      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => measure());
        observer.observe(doc.documentElement);
        if (doc.body) observer.observe(doc.body);
      }

      const imgs = Array.from(doc.images ?? []);
      const listeners = imgs.map((img) => {
        const handler = () => measure();
        img.addEventListener("load", handler);
        return { img, handler };
      });
      imageCleanup = () => {
        for (const { img, handler } of listeners) {
          img.removeEventListener("load", handler);
        }
      };

      intervalId = window.setInterval(measure, 1000);
    };

    iframe.addEventListener("load", onLoad);
    if (iframe.contentDocument?.readyState === "complete") {
      onLoad();
    }

    return () => {
      iframe.removeEventListener("load", onLoad);
      observer?.disconnect();
      imageCleanup?.();
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [srcDoc]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      suppressHydrationWarning
      title="Visual page content"
      className="block w-full border-0"
      style={{ height }}
      sandbox="allow-same-origin allow-top-navigation-by-user-activation"
    />
  );
}
