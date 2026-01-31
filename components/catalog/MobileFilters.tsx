// app/components/catalog/MobileFilters.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Filter, X } from "lucide-react";
import { CatalogSidebar } from "./CatalogSidebar";

type Props = {
  initialParams: Record<string, string | string[] | undefined>;
};

export function MobileFilters({ initialParams }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Закрытие модалки при успешном submit формы
  const handleFormSubmit = () => {
    // Даем небольшую задержку для применения фильтров перед закрытием
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  return (
    <>
      {/* ТОЛЬКО кнопка на мобилках */}
      <div className="sm:hidden mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-[#5858E2] to-lime-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
        >
          <Filter className="w-5 h-5" />
          <span>Фильтры и сортировка</span>
        </button>
      </div>

      {/* Модальное окно */}
      {isOpen && (
        <>
          {/* Затемнение фона */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Панель фильтров */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-[60] flex flex-col shadow-2xl">
            {/* Хедер панели */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-[#5858E2]" />
                <h2 className="text-lg font-bold text-gray-900">Фильтры</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Контент фильтров */}
            <div className="flex-1 overflow-y-auto p-4">
              <CatalogSidebar initialParams={initialParams} onFormSubmit={handleFormSubmit} />
            </div>

            {/* Футер */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-gradient-to-r from-[#5858E2] to-lime-500 text-white font-medium rounded-xl"
              >
                Закрыть
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}