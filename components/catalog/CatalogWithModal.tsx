"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { CatalogModal } from "./CatalogModal";
import { Badge } from "@/components/ui";
import { buildCatalogUrl } from "@/lib/url";
import { normalizeImageSrc, isExternalImageSrc } from "@/lib/image-src";
import type { PsychologistCatalogItem } from "@/types/catalog";
import { useRouter } from "next/navigation";

type Props = {
  items: PsychologistCatalogItem[];
  nextCursor: string | null;
  hasMore: boolean;
  searchParams: Record<string, string | string[] | undefined>;
};

/**
 * Каталог: карточки психологов.
 * Клик по карточке открывает модальное окно; из модалки можно перейти на полную страницу.
 */
export function CatalogWithModal({ items, nextCursor, hasMore, searchParams }: Props) {
  
  
  const router = useRouter()

  const [selected, setSelected] = useState<PsychologistCatalogItem | null>(null);

  const openModal = useCallback((p: PsychologistCatalogItem) => {
    setSelected(p);
  }, []);

  const closeModal = useCallback(() => {
    setSelected(null);
  }, []);

  const nextUrl = nextCursor != null ? buildCatalogUrl(searchParams, { cursor: nextCursor }) : null;

  function routerClick()  {

    router.push('/')
  }

  return (
    <div className="flex min-h-[60vh] ml-0 md:ml-15 flex-col gap-4 lg:flex-row lg:gap-8">
      {/* УДАЛИТЬ ЭТО: <CatalogSidebar initialParams={searchParams} /> */}
      <div className="min-w-0 flex-1">
        {items.length === 0 ? (
          <div className="rounded-xl border-2 border-[#A7FF5A]/50 bg-white/80 p-6 text-center shadow-lg sm:rounded-2xl sm:p-12">
            <p className="font-display text-base font-semibold text-foreground sm:text-lg">
              По заданным фильтрам никого не найдено
            </p>
            <p className="mt-2 text-xs text-neutral-dark sm:text-sm">Попробуйте ослабить условия поиска</p>
          </div>
        ) : (
          <>
            <div className="flex max-w-2xl flex-col gap-4 sm:gap-6">
              {items.map((p) => (
                <CardBlock
                  key={p.id}
                  psychologist={p}
                  onClick={() => openModal(p)}
                />
              ))}
            </div>
            {hasMore && nextUrl && (
              <div className="mt-6 flex justify-center sm:mt-10">
                <Link
                  href={nextUrl}
                  className="inline-block rounded-xl bg-[#5858E2] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4848d0] sm:px-8 sm:py-3 sm:text-base"
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
      className="group w-full rounded-xl border border-neutral-200 bg-white p-0 text-left shadow-sm transition hover:border-[#5858E2]/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#5858E2] sm:rounded-2xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-[#F5F5F7] sm:rounded-t-2xl">
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
      <div className="p-3 sm:p-4">
        <h3 className="font-display text-base font-semibold text-foreground group-hover:text-[#5858E2] sm:text-lg">
          {fullName}
        </h3>
        <p className="mt-1 text-xs text-neutral-dark sm:text-sm">{city}</p>
        <div className="mt-1.5 flex flex-wrap gap-1 sm:mt-2 sm:gap-1.5">
          {mainParadigm.slice(0, 3).map((p) => (
            <Badge key={p} variant="primary">
              {p}
            </Badge>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-neutral-dark sm:mt-2">
          Дипломов: {educationCount} · Курсов: {coursesCount}
        </p>
        <p className="mt-2 line-clamp-3 text-xs text-foreground sm:mt-3 sm:text-sm">{shortBio}</p>
        <p className="mt-2 font-bold text-[#5858E2] sm:mt-3 sm:text-base">{price} ₽ / сессия</p>
        <span className="mt-1.5 inline-block text-xs font-semibold text-[#5858E2] group-hover:underline sm:mt-2 sm:text-sm">
          Подробнее →
        </span>
      </div>
    </button>
  );
}