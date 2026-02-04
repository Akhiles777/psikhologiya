/**
 * Нормализует src изображения для Next/Image: всегда отдаём путь без хоста,
 * чтобы сервер и клиент рендерили одинаково (нет hydration mismatch).
 * Для внешних URL (другой домен) оставляем как есть и используем unoptimized.
 */
export function normalizeImageSrc(src: string): string {
  if (!src || !src.trim()) return "";
  const s = src.trim();
  
  // Для внешних URL - возвращаем как есть
  if (s.startsWith("http://") || s.startsWith("https://")) {
    return s;
  }
  
  // Для локальных путей
  return s.startsWith("/") ? s : "/" + s;
}

export function isExternalImageSrc(src: string): boolean {
  if (!src || !src.trim()) return false;
  const s = src.trim();
  return s.startsWith("http://") || s.startsWith("https://");
}