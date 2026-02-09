'use client';

import Link from "next/link";
import { useState, useMemo } from "react";
import { DB_SYNC_MESSAGE } from "@/lib/db-error";

interface PsychologistItem {
  id: string;
  slug: string;
  fullName: string;
  city: string | null;
  isPublished: boolean;
  price: number | null;
}

interface Props {
  initialList: PsychologistItem[];
  searchParams: Record<string, string | string[] | undefined>;
}

/**
 * Список психологов для менеджеров с поиском по ФИО.
 */
export default function PsychologistsListPage({ initialList, searchParams }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyPublished, setShowOnlyPublished] = useState(false);
  
  const showDbSyncBanner = searchParams.error === "db_sync";

  // Функция для поиска по ФИО
  const searchPsychologists = useMemo(() => {
    if (!searchQuery.trim()) {
      return initialList;
    }

    const searchLower = searchQuery.toLowerCase().trim();
    
    return initialList.filter((psychologist) => {
      if (showOnlyPublished && !psychologist.isPublished) {
        return false;
      }

      const fullNameLower = psychologist.fullName.toLowerCase();
      
      if (fullNameLower.includes(searchLower)) {
        return true;
      }
      
      const nameParts = psychologist.fullName.split(' ');
      const hasMatchInParts = nameParts.some(part => 
        part.toLowerCase().includes(searchLower)
      );
      
      if (hasMatchInParts) {
        return true;
      }
      
      const initials = nameParts.map(part => part.charAt(0).toLowerCase()).join('');
      if (initials.includes(searchLower)) {
        return true;
      }
      
      return false;
    });
  }, [initialList, searchQuery, showOnlyPublished]);

  // Функция для подсветки найденного текста
  const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) return <>{text}</>;

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-200 font-semibold px-0.5">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  // Статистика
  const totalCount = initialList.length;
  const filteredCount = searchPsychologists.length;
  const unpublishedCount = initialList.filter(p => !p.isPublished).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {showDbSyncBanner && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 sm:mb-6 sm:rounded-xl sm:p-4">
            <p className="font-medium text-sm sm:text-base">Ошибка базы данных</p>
            <p className="mt-1 text-xs sm:text-sm">{DB_SYNC_MESSAGE}</p>
          </div>
        )}
        
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="font-display text-xl font-bold text-gray-900 sm:text-2xl">
                Психологи
              </h1>
              <div className="mt-1 text-sm text-gray-600">
                Всего: {totalCount} {unpublishedCount > 0 && `(${unpublishedCount} неопубликованных)`}
              </div>
            </div>
            <Link
              href="/managers/psychologists/new" // Менеджерский путь
              className="rounded-lg bg-[#4CAF50] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#43A047] text-center sm:rounded-xl sm:px-4 sm:py-2 sm:text-base whitespace-nowrap"
            >
              Добавить психолога
            </Link>
          </div>

          {/* Поиск и фильтры */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Поиск по ФИО (Иванов, Иван, Ива)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50]/20 focus:border-[#4CAF50] outline-none"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publishedOnly"
                  checked={showOnlyPublished}
                  onChange={(e) => setShowOnlyPublished(e.target.checked)}
                  className="h-4 w-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50]"
                />
                <label htmlFor="publishedOnly" className="text-sm text-gray-700 whitespace-nowrap">
                  Только опубликованные
                </label>
              </div>
            </div>
            
            {searchQuery && (
              <div className="text-sm text-gray-600">
                Найдено: {filteredCount} психологов по запросу "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-2 text-[#4CAF50] hover:text-[#43A047] font-medium"
                >
                  Сбросить поиск
                </button>
              </div>
            )}
          </div>

          {searchPsychologists.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 mb-2">
                {searchQuery 
                  ? 'Психологи по запросу "' + searchQuery + '" не найдены'
                  : 'Пока нет ни одной анкеты. Создайте первую!'
                }
              </p>
              {searchQuery && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Попробуйте:</p>
                  <ul className="text-sm text-gray-500">
                    <li>• Искать только по фамилии</li>
                    <li>• Искать только по имени</li>
                    <li>• Упростить запрос</li>
                    <li>• Проверить правописание</li>
                  </ul>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setShowOnlyPublished(false);
                    }}
                    className="mt-4 text-[#4CAF50] hover:text-[#43A047] font-medium"
                  >
                    Показать всех психологов
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ul className="space-y-3 sm:space-y-4">
              {searchPsychologists.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-[#F5F5F7] p-4 hover:bg-gray-50 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-xl"
                >
                  <div className="space-y-1 sm:space-y-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <span className="font-medium text-gray-900 text-sm sm:text-base">
                        <HighlightText text={p.fullName} highlight={searchQuery} />
                      </span>
                      {!p.isPublished && (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 whitespace-nowrap">
                          Черновик
                        </span>
                      )}
                      {p.city && (
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 whitespace-nowrap">
                          {p.city}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 sm:text-sm">
                      {p.price && (
                        <span className="font-medium text-[#4CAF50]">
                          {p.price} ₽
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/managers/psychologists/${p.id}/edit`} // Менеджерский путь
                      className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-900 hover:bg-white hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors text-center sm:flex-none sm:px-3 sm:py-1.5 sm:text-sm whitespace-nowrap"
                    >
                      Редактировать
                    </Link>
                    <Link
                      href={`/psy-list/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-900 hover:bg-white hover:border-[#4CAF50] hover:text-[#4CAF50] transition-colors text-center sm:flex-none sm:px-3 sm:py-1.5 sm:text-sm whitespace-nowrap"
                    >
                      Открыть
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}