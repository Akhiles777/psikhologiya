"use client";

import Image from "next/image";
import Link from "next/link";
import type { PsychologistCatalogItem } from "@/types/catalog";
import { Badge } from "@/components/ui";
import { normalizeImageSrc, isExternalImageSrc } from "@/lib/image-src";

type Props = {
  psychologist: PsychologistCatalogItem | null;
  onClose: () => void;
};

/**
 * Модальное окно с краткой информацией о психологе и ссылкой на полную анкету.
 */
export function CatalogModal({ psychologist, onClose }: Props) {
  if (!psychologist) return null;

  const { slug, fullName, city, mainParadigm, certificationLevel, shortBio, price, images, educationCount, coursesCount } = psychologist;
  const rawImage = images[0] ?? null;
  const imageSrc = rawImage ? normalizeImageSrc(rawImage) : null;
  const unoptimized = rawImage ? isExternalImageSrc(rawImage) : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Карточка психолога"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-[#5858E2]/30 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-neutral-100 p-2 text-neutral-600 hover:bg-neutral-200"
          aria-label="Закрыть"
        >
          ✕
        </button>
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="relative h-56 w-full shrink-0 overflow-hidden rounded-xl bg-[#F5F5F7] sm:h-64 sm:w-52">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={fullName}
                fill
                className="object-cover"
                sizes="208px"
                unoptimized={unoptimized}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-500">Нет фото</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-bold text-foreground">{fullName}</h2>
            <p className="mt-1 text-sm text-neutral-dark">{city}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="level" level={certificationLevel as 1 | 2 | 3} />
              {mainParadigm.slice(0, 3).map((p) => (
                <Badge key={p} variant="primary">
                  {p}
                </Badge>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-dark">
              Дипломов: {educationCount} · Курсов: {coursesCount}
            </p>
            <p className="mt-3 font-semibold text-[#5858E2]">{price} ₽ / сессия</p>
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-foreground">{shortBio}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/psy-list/${slug}`}
            className="inline-block rounded-xl bg-[#5858E2] px-6 py-3 font-semibold text-white hover:bg-[#4848d0]"
          >
            Подробнее на странице
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border-2 border-neutral-300 px-6 py-3 font-semibold text-foreground hover:bg-neutral-100"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
