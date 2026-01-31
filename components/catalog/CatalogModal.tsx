"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { PsychologistCatalogItem } from "@/types/catalog";
import { Badge } from "@/components/ui";
import { normalizeImageSrc, isExternalImageSrc } from "@/lib/image-src";

type Props = {
  psychologist: PsychologistCatalogItem | null;
  onClose: () => void;
};

export function CatalogModal({ psychologist, onClose }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!psychologist) return null;

  const { slug, fullName, city, mainParadigm, certificationLevel, shortBio, price, images, educationCount, coursesCount } = psychologist;
  const rawImage = images[0] ?? null;
  const imageSrc = rawImage ? normalizeImageSrc(rawImage) : null;
  const unoptimized = rawImage ? isExternalImageSrc(rawImage) : false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Карточка психолога"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg md:max-w-2xl overflow-y-auto rounded-xl sm:rounded-2xl border-2 border-lime-500/30 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Кнопка закрытия - адаптивная */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-gray-100 p-1.5 text-gray-600 hover:bg-gray-200 sm:right-4 sm:top-4 sm:p-2"
          aria-label="Закрыть"
        >
          <span className="text-lg sm:text-xl">×</span>
        </button>

        <div className="p-4 sm:p-5 md:p-6">
          {/* Верхний блок - фото + информация */}
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-5 md:gap-6">
            {/* Фото - адаптивное */}
            <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 sm:h-56 sm:w-44 md:h-64 md:w-52">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={fullName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 176px, 208px"
                  unoptimized={unoptimized}
                  priority
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-gray-400 p-4">
                  <div className="text-3xl">👤</div>
                  <div className="mt-2 text-xs text-center">Нет фото</div>
                </div>
              )}
              
              {/* Акцентный уголок на фото */}
              <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-lime-500 rounded-br-lg"></div>
            </div>

            {/* Информация - адаптивная */}
            <div className="min-w-0 flex-1">
              {/* Заголовок и город */}
              <div className="mb-3">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{fullName}</h2>
                {city && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-gray-500 text-sm">📍</span>
                    <span className="text-sm text-gray-700 sm:text-base">{city}</span>
                  </div>
                )}
              </div>

              {/* Бейджи - адаптивные */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                <Badge variant="level" level={certificationLevel as 1 | 2 | 3} />
                {mainParadigm.slice(0, isMobile ? 2 : 3).map((p) => (
                  <Badge key={p} variant="primary" className="text-xs sm:text-sm">
                    {p}
                  </Badge>
                ))}
                {mainParadigm.length > (isMobile ? 2 : 3) && (
                  <Badge variant="outline" className="text-xs">
                    +{mainParadigm.length - (isMobile ? 2 : 3)}
                  </Badge>
                )}
              </div>

              {/* Статистика образования */}
              <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:gap-4">
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <div className="text-sm font-bold text-[#5858E2]">{educationCount}</div>
                  <div className="text-xs text-gray-600">дипломов</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-2 text-center">
                  <div className="text-sm font-bold text-lime-600">{coursesCount}</div>
                  <div className="text-xs text-gray-600">курсов</div>
                </div>
                <div className="col-span-2 rounded-lg bg-gray-50 p-2 text-center sm:col-span-1">
                  <div className="text-sm font-bold text-gray-900">{price} ₽</div>
                  <div className="text-xs text-gray-600">сессия</div>
                </div>
              </div>

              {/* Краткое описание */}
              <div className="mb-1">
                <div className="text-sm font-medium text-gray-700 mb-1">О специалисте:</div>
                <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 sm:line-clamp-4">
                  {shortBio}
                </p>
              </div>
            </div>
          </div>

          {/* Разделитель */}
          <div className="my-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent sm:my-5"></div>

          {/* Кнопки - адаптивные */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href={`/psy-list/${slug}`}
              className="order-2 sm:order-1 flex-1 rounded-lg bg-gradient-to-r from-[#5858E2] to-[#5858E2]/90 px-4 py-3 text-center font-medium text-white hover:from-[#4848d0] hover:to-[#4848d0]/90 sm:px-5"
            >
              <span className="flex items-center justify-center gap-2">
                <span>Подробнее на странице</span>
                <span className="text-lg">→</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="order-1 sm:order-2 rounded-lg border-2 border-gray-300 px-4 py-3 font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 sm:px-5"
            >
              {isMobile ? 'Назад' : 'Закрыть'}
            </button>
          </div>

          {/* Подсказка для мобильных */}
          {isMobile && (
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <div className="h-1 w-1 rounded-full bg-lime-500"></div>
                <span>Свайпните вверх, чтобы увидеть больше</span>
              </div>
            </div>
          )}
        </div>

        {/* Акцентные уголки на модалке */}
        <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-[#5858E2] rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-lime-500 rounded-tr-xl"></div>
      </div>
    </div>
  );
}