import { getPsychologists } from "@/app/actions/catalog";
import { CatalogWithModal } from "@/components/catalog/CatalogWithModal";
import { buildMetadata } from "@/lib/seo";
import { CATALOG_PAGE_SIZE } from "@/constants/catalog";
import { searchParamsToFilters, searchParamsToPagination } from "@/app/catalog/params";
import { MobileFilters } from "@/components/catalog/MobileFilters";
import { CatalogSidebar } from "@/components/catalog/CatalogSidebar";
import { Filter } from "lucide-react";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Каталог психологов — Давай вместе",
  description: "Найдите проверенного психолога по специализации, цене и опыту.",
  path: "/psy-list",
});

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PsyListPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = searchParamsToFilters(params);
  const pagination = searchParamsToPagination(params);

  const { items, nextCursor, hasMore } = await getPsychologists(filters, {
    ...pagination,
    limit: CATALOG_PAGE_SIZE,
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Современный хедер с геометрией */}
      <div className="relative overflow-hidden">
        {/* Геометрические элементы */}
        <div className="absolute top-0 left-0 h-64 w-64 -translate-x-32 -translate-y-32 rotate-12 bg-gradient-to-br from-[#5858E2]/5 to-lime-500/5 rounded-3xl"></div>
        <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-32 translate-y-32 -rotate-12 bg-gradient-to-tl from-[#5858E2]/5 to-lime-500/5 rounded-3xl"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="text-center">
            {/* Акцентный элемент */}
            <div className="inline-flex items-center mb-8">
              <div className="h-px w-8 bg-lime-500"></div>
              <div className="mx-4 text-sm font-medium text-[#5858E2] uppercase tracking-wider">Каталог</div>
              <div className="h-px w-8 bg-[#5858E2]"></div>
            </div>
            
            {/* Заголовок с акцентом */}
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Найдите <span className="text-[#5858E2]">психолога</span>
              <div className="mt-4 h-1 w-24 mx-auto bg-gradient-to-r from-[#5858E2] to-lime-500"></div>
            </h1>
            
            <p className="mt-8 max-w-2xl mx-auto text-lg text-gray-700">
              Подбор специалистов по направлениям терапии, стоимости и опыту работы
            </p>
            
            {/* Быстрая статистика */}
            <div className="mt-10 grid grid-cols-2 gap-6 max-w-md mx-auto sm:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-lime-600">{items.length}+</div>
                <div className="text-xs text-gray-600 mt-1">специалистов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#5858E2]">3</div>
                <div className="text-xs text-gray-600 mt-1">уровня</div>
              </div>
              <div className="col-span-2 sm:col-span-1 text-center">
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-xs text-gray-600 mt-1">направлений</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент с современным дизайном */}
      <div className="relative">
        {/* Акцентная линия */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-32 bg-gradient-to-r from-lime-500 to-[#5858E2]"></div>
        
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
     

          {/* Фильтры и результаты */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Результаты поиска</div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-gray-900">{items.length}</div>
                  <div className="h-4 w-px bg-gray-300"></div>
                  <div className="text-sm text-gray-600">психологов найдено</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-lime-500 animate-pulse"></div>
                  <span className="text-xs text-gray-600">Активный профиль</span>
                </div>
                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                {/* Показываем "Фильтры • Сортировка" ТОЛЬКО на мобильных */}
                <div className="text-xs text-[#5858E2] font-medium flex items-center gap-1 sm:hidden">
                  <Filter className="w-3 h-3" />
                  Фильтры • Сортировка
                </div>
              </div>
            </div>
          </div>

          {/* Контейнер каталога */}
          <div className="relative">
            {/* Мобильные фильтры - ТОЛЬКО кнопка */}
            <MobileFilters initialParams={params} />
            
            <div className="flex gap-6">
              {/* Десктопная версия фильтров - СКРЫТА НА МОБИЛЬНЫХ */}
              <div className="hidden sm:block w-64 shrink-0">
                <div id="list" className="sticky top-6">
                  <CatalogSidebar initialParams={params} />
                </div>
              </div>
            
              
              {/* Основной контент */}
              <div className="flex-1">
                {/* Геометрический фон */}
                <div className="absolute inset-0 -z-10">
                  <div className="absolute top-0 left-0 h-32 w-32 border-2 border-gray-100 rounded-2xl opacity-30"></div>
                  <div  className="absolute bottom-0 right-0 h-32 w-32 border-2 border-gray-100 rounded-2xl opacity-30"></div>
                </div>
                
                {/* Основной контент */}
                <div  className="relative bg-white rounded-2xl border border-gray-200/50">
                  <div className="p-4 sm:p-6">
                    <CatalogWithModal
                      items={items}
                      nextCursor={nextCursor}
                      hasMore={hasMore ?? false}
                      searchParams={params}
                    />
                  </div>
                  
                  {/* Акцентные уголки */}
                  <div className="absolute top-0 left-0 h-6 w-6 border-t-2 border-l-2 border-lime-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 h-6 w-6 border-t-2 border-r-2 border-[#5858E2] rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-[#5858E2] rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-lime-500 rounded-br-lg"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Информационный блок */}
          <div className="mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#5858E2]/10 text-[#5858E2] mb-4">
                  ✓
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Проверенные специалисты</h3>
                <p className="text-sm text-gray-600">
                  Все психологи прошли верификацию документов и имеют подтвержденную квалификацию
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-lime-500/10 text-lime-600 mb-4">
                  ⭐
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Уровни сертификации</h3>
                <p className="text-sm text-gray-600">
                  Прозрачная система оценки опыта и квалификации каждого специалиста
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900/10 text-gray-900 mb-4">
                  💬
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Первая консультация</h3>
                <p className="text-sm text-gray-600">
                  У большинства специалистов доступна ознакомительная сессия для знакомства
                </p>
              </div>
            </div>
          </div>

          {/* CTA блок */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-6 max-w-2xl mx-auto">
              <div>
                <div className="text-sm font-medium text-[#5858E2] mb-2">Нужна помощь с выбором?</div>
                <h3 className="text-2xl font-bold text-gray-900">Мы поможем найти подходящего специалиста</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="/contacts" 
                  className="px-8 py-3 bg-[#5858E2] text-white font-medium rounded-lg hover:bg-[#4848d0] transition-colors"
                >
                  Получить консультацию
                </a>
                <a 
                  href="/certification-levels" 
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 transition-colors"
                >
                  О сертификации
                </a>
              </div>
              
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
