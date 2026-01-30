"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { CatalogSidebar } from "./CatalogSidebar";
import { CatalogModal } from "./CatalogModal";
import { Badge } from "@/components/ui";
import { buildCatalogUrl } from "@/lib/url";
import { normalizeImageSrc, isExternalImageSrc } from "@/lib/image-src";
import type { PsychologistCatalogItem } from "@/types/catalog";

type Props = {
  items: PsychologistCatalogItem[];
  nextCursor: string | null;
  hasMore: boolean;
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * Каталог: слева — фильтры (чекбоксы), в центре — карточки психологов.
 * Клик по карточке открывает модальное окно; из модалки можно перейти на полную страницу.
 */
export function CatalogWithModal({ items, nextCursor, hasMore, searchParams }: Props) {
  const [selected, setSelected] = useState<PsychologistCatalogItem | null>(null);

  const openModal = useCallback((p: PsychologistCatalogItem) => {
    setSelected(p);
  }, []);

  const closeModal = useCallback(() => {
    setSelected(null);
  }, []);

  const nextUrl = nextCursor != null ? buildCatalogUrl(searchParams, { cursor: nextCursor }) : null;

  return (
    <div className="flex min-h-[60vh] gap-8">
      <CatalogSidebar initialParams={searchParams} />
      <div className="min-w-0 flex-1">
        {items.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#A7FF5A]/50 bg-white/80 p-12 text-center shadow-lg">
            <p className="font-display text-lg font-semibold text-foreground">
              По заданным фильтрам никого не найдено
            </p>
            <p className="mt-2 text-sm text-neutral-dark">Попробуйте ослабить условия поиска</p>
          </div>
        ) : (
          <>
            <div className="flex max-w-2xl flex-col gap-6">
              {items.map((p) => (
                <CardBlock
                  key={p.id}
                  psychologist={p}
                  onClick={() => openModal(p)}
                />
              ))}
            </div>
            {hasMore && nextUrl && (
              <div className="mt-10 flex justify-center">
                <Link
                  href={nextUrl}
                  className="inline-block rounded-xl bg-[#5858E2] px-8 py-3 font-semibold text-white hover:bg-[#4848d0]"
                >
                  Показать ещё
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      <CatalogModal psychologist={selected} onClose={closeModal} />
    </div>
  );
}

/** Карточка психолога в каталоге: клик открывает модалку */
function CardBlock({
  psychologist,
  onClick,
}: {
  psychologist: PsychologistCatalogItem;
  onClick: () => void;
}) {
  const { fullName, city, mainParadigm, certificationLevel, shortBio, price, images, educationCount, coursesCount } = psychologist;
  const rawImage = images[0] ?? null;
  const imageSrc = rawImage ? normalizeImageSrc(rawImage) : null;
  const unoptimized = rawImage ? isExternalImageSrc(rawImage) : false;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-neutral-200 bg-white p-0 text-left shadow-sm transition hover:border-[#5858E2]/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#5858E2]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-[#F5F5F7]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={fullName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 340px"
            unoptimized={unoptimized}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-500">Нет фото</div>
        )}
        <div className="absolute right-3 top-3">
          <Badge variant="level" level={certificationLevel as 1 | 2 | 3} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-[#5858E2]">
          {fullName}
        </h3>
        <p className="mt-1 text-sm text-neutral-dark">{city}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {mainParadigm.slice(0, 3).map((p) => (
            <Badge key={p} variant="primary">
              {p}
            </Badge>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-dark">
          Дипломов: {educationCount} · Курсов: {coursesCount}
        </p>
        <p className="mt-3 line-clamp-3 text-sm text-foreground">{shortBio}</p>
        <p className="mt-3 font-bold text-[#5858E2]">{price} ₽ / сессия</p>
        <span className="mt-2 inline-block text-sm font-semibold text-[#5858E2] group-hover:underline">
          Подробнее →
        </span>
      </div>
    </button>
  );
}
