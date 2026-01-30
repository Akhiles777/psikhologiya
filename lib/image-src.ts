/**
 * Нормализует src изображения для Next/Image: всегда отдаём путь без хоста,
 * чтобы сервер и клиент рендерили одинаково (нет hydration mismatch).
 * Для внешних URL (другой домен) оставляем как есть и используем unoptimized.
 */
export function normalizeImageSrc(src: string): string {
  if (!src || !src.trim()) return "";
  const s = src.trim();
  if (s.startsWith("http://") || s.startsWith("https://")) {
    try {
      const u = new URL(s);
      return u.pathname;
    } catch {
      return s;
    }
  }
  return s.startsWith("/") ? s : "/" + s;
}

/** true, если src — внешний URL (другой домен), для unoptimized. */
export function isExternalImageSrc(src: string): boolean {
  if (!src || !src.trim()) return false;
  return src.trim().startsWith("http");
}
