"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

type ProfileGalleryProps = {
  images: string[];
  fullName: string;
};

function resolveSrc(src: string, base: string): string {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  const baseClean = base.replace(/\/$/, "");
  return src.startsWith("/") ? `${baseClean}${src}` : `${baseClean}/${src}`;
}

export function ProfileGallery({ images, fullName }: ProfileGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL ?? "";

  const validImages = images.filter((s) => s && s.trim() !== "");
  if (validImages.length === 0) {
    return (
      <div className="flex h-64 w-full shrink-0 items-center justify-center rounded-2xl bg-[#F5F5F7] text-neutral sm:h-72 sm:w-56">
        Нет фото
      </div>
    );
  }

  const goPrev = useCallback(() => {
    setCurrent((c) => (c === 0 ? validImages.length - 1 : c - 1));
  }, [validImages.length]);
  const goNext = useCallback(() => {
    setCurrent((c) => (c === validImages.length - 1 ? 0 : c + 1));
  }, [validImages.length]);

  const currentSrc = resolveSrc(validImages[current], base);

  return (
    <>
      <div className="w-full shrink-0 sm:w-56">
        <div
          className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F5F5F7] sm:aspect-[3/4] sm:h-72 sm:w-56"
          role="img"
          aria-label={`Фото ${current + 1} из ${validImages.length}`}
        >
          <Image
            src={currentSrc}
            alt={`${fullName} — фото ${current + 1}`}
            fill
            className="cursor-zoom-in object-cover"
            sizes="(max-width: 640px) 100vw, 224px"
            priority
            unoptimized={currentSrc.startsWith("http")}
            onClick={() => setLightbox(true)}
          />
        </div>
        {validImages.length > 1 && (
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-lg border border-neutral-light/80 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-neutral-light/50"
              aria-label="Предыдущее фото"
            >
              ←
            </button>
            <span className="text-sm text-neutral-dark">
              {current + 1} / {validImages.length}
            </span>
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg border border-neutral-light/80 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-neutral-light/50"
              aria-label="Следующее фото"
            >
              →
            </button>
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Увеличить фото"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
            onClick={() => setLightbox(false)}
            aria-label="Закрыть"
          >
            ✕
          </button>
          {validImages.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Предыдущее фото"
              >
                ←
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Следующее фото"
              >
                →
              </button>
            </>
          )}
          <div
            className="relative max-h-full max-w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentSrc}
              alt={`${fullName} — фото ${current + 1}`}
              width={1200}
              height={900}
              className="max-h-[90vh] w-auto object-contain"
              unoptimized={currentSrc.startsWith("http")}
            />
          </div>
        </div>
      )}
    </>
  );
}
