"use client";

import { useEffect, useMemo, useRef } from "react";

type Props = {
  html: string;
  css: string;
  styleHrefs: string[];
  pageKey?: "home" | "connect";
};

const STYLE_LINK_ATTR = "data-vp-runtime-style";
const OVERFLOW_FIX_ATTR = "data-vp-overflow-fix";
const CONNECT_HERO_ATTR = "data-vp-connect-hero";
const TABLET_MIN_WIDTH = 868;
const TABLET_MAX_WIDTH = 1023.98;

function isAllowedHref(href: string): boolean {
  if (!href) return false;
  return /^https?:\/\//.test(href) || href.startsWith("/");
}

function canonicalizeHref(href: string): string {
  if (!href || typeof window === "undefined") return href;
  try {
    return new URL(href, window.location.origin).toString();
  } catch {
    return href;
  }
}

function normalizeStyleHrefs(styleHrefs: string[]): string[] {
  return Array.from(new Set(styleHrefs.map((href) => href.trim()).filter(isAllowedHref).map(canonicalizeHref))).filter(Boolean);
}

function isTabletViewport(viewportWidth: number): boolean {
  return viewportWidth >= TABLET_MIN_WIDTH && viewportWidth <= TABLET_MAX_WIDTH;
}

function markOverflowChain(start: HTMLElement | null, root: HTMLElement, viewportWidth: number): void {
  let current = start;
  while (current && current !== root) {
    const parent = current.parentElement as HTMLElement | null;
    if (!parent) {
      current.setAttribute(OVERFLOW_FIX_ATTR, "1");
      break;
    }

    const currentWidth = current.getBoundingClientRect().width;
    const parentWidth = parent.getBoundingClientRect().width || viewportWidth;
    const allowedWidth = Math.min(viewportWidth, parentWidth);

    if (currentWidth > allowedWidth + 1) {
      current.setAttribute(OVERFLOW_FIX_ATTR, "1");
      current = parent;
      continue;
    }

    break;
  }
}

function markConnectHero(root: HTMLElement, pageKey?: "home" | "connect"): void {
  root.querySelectorAll<HTMLElement>(`[${CONNECT_HERO_ATTR}="1"]`).forEach((node) => node.removeAttribute(CONNECT_HERO_ATTR));
  if (pageKey !== "connect") return;

  const firstBlock = root.firstElementChild as HTMLElement | null;
  if (!firstBlock) return;
  if (!firstBlock.querySelector('img[data-nimg="fill"]')) return;

  firstBlock.setAttribute(CONNECT_HERO_ATTR, "1");
}

function fixOverflow(root: HTMLElement, pageKey?: "home" | "connect"): void {
  const viewportWidth = window.innerWidth || root.clientWidth;
  if (!viewportWidth) return;
  const tabletViewport = isTabletViewport(viewportWidth);
  markConnectHero(root, pageKey);

  root.querySelectorAll<HTMLElement>(`[${OVERFLOW_FIX_ATTR}="1"]`).forEach((node) => node.removeAttribute(OVERFLOW_FIX_ATTR));

  const media = Array.from(root.querySelectorAll<HTMLElement>("img,video,canvas,svg,iframe,picture,figure"));
  for (const node of media) {
    const parent = node.parentElement as HTMLElement | null;
    if (!parent) continue;

    const nodeWidth = node.getBoundingClientRect().width;
    const parentWidth = parent.getBoundingClientRect().width || viewportWidth;
    const allowedWidth = Math.min(viewportWidth, parentWidth);
    const isOverflowing = nodeWidth > allowedWidth + 1;
    const isFillImage = node.tagName === "IMG" && node.getAttribute("data-nimg") === "fill";

    if (isOverflowing) {
      node.setAttribute(OVERFLOW_FIX_ATTR, "1");
      markOverflowChain(parent, root, viewportWidth);
      continue;
    }

    if (tabletViewport && isFillImage) {
      parent.setAttribute(OVERFLOW_FIX_ATTR, "1");
    }
  }
}

export default function VisualPageRuntime({ html, css, styleHrefs, pageKey }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const normalizedStyleHrefs = useMemo(() => normalizeStyleHrefs(styleHrefs), [styleHrefs]);
  const hrefsKey = normalizedStyleHrefs.join("|");

  useEffect(() => {
    if (typeof document === "undefined") return;

    const existing = new Set(
      Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map((node) => canonicalizeHref(node.getAttribute("href") ?? ""))
        .filter(Boolean)
    );

    const created: HTMLLinkElement[] = [];
    for (const href of normalizedStyleHrefs) {
      const canonical = canonicalizeHref(href);
      if (!canonical || existing.has(canonical)) continue;

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = canonical;
      link.setAttribute(STYLE_LINK_ATTR, "1");
      document.head.appendChild(link);

      existing.add(canonical);
      created.push(link);
    }

    return () => {
      for (const link of created) {
        if (link.parentNode) link.parentNode.removeChild(link);
      }
    };
  }, [hrefsKey, normalizedStyleHrefs]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let rafId = 0;
    const runFix = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => fixOverflow(root, pageKey));
    };

    runFix();

    const resizeObserver = new ResizeObserver(runFix);
    resizeObserver.observe(root);

    const mutationObserver = new MutationObserver(runFix);
    mutationObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "width", "height", "src", "sizes"],
    });

    const onWindowResize = () => runFix();
    window.addEventListener("resize", onWindowResize);

    const onLoadCapture = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.tagName === "IMG" || target.tagName === "VIDEO" || target.tagName === "IFRAME") {
        runFix();
      }
    };
    root.addEventListener("load", onLoadCapture, true);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", onWindowResize);
      root.removeEventListener("load", onLoadCapture, true);
    };
  }, [html, css, hrefsKey, pageKey]);

  return (
    <>
      {css.trim() ? (
        <style
          data-vp-runtime-custom="1"
          dangerouslySetInnerHTML={{ __html: css }}
        />
      ) : null}
      <style
        data-vp-runtime-guards="1"
        dangerouslySetInnerHTML={{
          __html: [
            "[data-vp-runtime-root]{width:100%;max-width:100%;}",
            "[data-vp-runtime-root] *{min-width:0;}",
            "[data-vp-runtime-root] img,[data-vp-runtime-root] video,[data-vp-runtime-root] canvas,[data-vp-runtime-root] svg,[data-vp-runtime-root] picture,[data-vp-runtime-root] figure,[data-vp-runtime-root] iframe{max-width:100%;}",
            `[data-vp-runtime-root] [${OVERFLOW_FIX_ATTR}="1"]{max-width:100% !important;}`,
            `[data-vp-runtime-root] :where(div,section,article,picture,figure,span)[${OVERFLOW_FIX_ATTR}="1"]{max-width:100% !important;}`,
            `[data-vp-runtime-root] iframe[${OVERFLOW_FIX_ATTR}="1"]{width:100% !important;}`,
            `[data-vp-runtime-root] img[${OVERFLOW_FIX_ATTR}="1"]:not([data-nimg="fill"]){height:auto !important;}`,
            `[data-vp-runtime-root] img[data-nimg="fill"][${OVERFLOW_FIX_ATTR}="1"]{width:100% !important;height:100% !important;}`,
            `[data-vp-runtime-root][data-vp-page="connect"] > [${CONNECT_HERO_ATTR}="1"]{position:relative;overflow:hidden;width:100vw;max-width:100vw;margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);}`,
            `[data-vp-runtime-root][data-vp-page="connect"] > [${CONNECT_HERO_ATTR}="1"] img[data-nimg="fill"]{width:100% !important;height:100% !important;object-fit:cover !important;}`,
            `@media (min-width:${TABLET_MIN_WIDTH}px) and (max-width:${TABLET_MAX_WIDTH}px){`,
            `[data-vp-runtime-root] :where(div,section,article,picture,figure,span)[${OVERFLOW_FIX_ATTR}="1"]{width:100% !important;overflow:hidden !important;}`,
            `[data-vp-runtime-root][data-vp-page="connect"] > [${CONNECT_HERO_ATTR}="1"]{width:100vw !important;max-width:100vw !important;margin-left:calc(50% - 50vw) !important;margin-right:calc(50% - 50vw) !important;}`,
            "}",
          ].join(""),
        }}
      />
      <div
        ref={rootRef}
        data-vp-runtime-root
        data-vp-page={pageKey}
        className="w-full max-w-full overflow-x-clip"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
