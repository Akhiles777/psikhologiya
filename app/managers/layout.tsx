import Link from "next/link";
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ManagersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигация менеджера */}
      <nav className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-[1900px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-[#4CAF50]">
                  Менеджерская панель
                </h1>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <Link
                    href="/managers"
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Главная
                  </Link>
                  <Link
                    href="/managers/psychologists"
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Психологи
                  </Link>
                  <Link
                    href="/managers/pages"
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Страницы
                  </Link>
          
                </div>
              </div>
            </div>
            <div>
              <Link
                href="/"
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                На сайт
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        <div className="mx-auto max-w-[1900px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
