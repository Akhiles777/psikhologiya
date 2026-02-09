'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ManagersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();

        if (!response.ok || !data.user) {
          router.push('/auth/login');
          return;
        }

        if (!['ADMIN', 'MANAGER'].includes(data.user.role)) {
          router.push('/auth/login?error=Доступ+только+для+менеджеров');
          return;
        }

        setUser(data.user);
        setIsLoading(false);
      } catch (error) {
        router.push('/auth/login');
      }
    }

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const availableModules = Object.entries(user?.permissions || {})
    .filter(([_, perm]: [string, any]) => perm?.view)
    .map(([module]) => module);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 gap-3">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                <a href='/managers' className="hover:text-blue-700 transition-colors">Панель менеджера</a>
              </h1>
              <span className="ml-3 sm:ml-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {user?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'}
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-sm text-gray-700 truncate">{user?.name}</span>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.push('/auth/login');
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1.5 hover:bg-red-50 rounded transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 py-3">
            {user?.permissions?.psychologists?.view && (
              <Link
                href="/managers/psychologists"
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Психологи
              </Link>
            )}
            
            {user?.permissions?.pages?.view && (
              <Link
                href="/managers/pages"
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Страницы
              </Link>
            )}
            
            {user?.permissions?.listdate?.view && (
              <Link
                href="/managers/ListDate"
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Список Данных
              </Link>
            )}
            
            {user?.role === 'ADMIN' && (
              <Link
                href="/managers/managers"
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Управление менеджерами
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Добро пожаловать, {user?.name}!
          </h2>
          <p className="mt-2 text-gray-600">
            Вы вошли как {user?.role === 'ADMIN' ? 'администратор' : 'менеджер'} системы
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Ваши доступные разделы:</h3>
          
          {availableModules.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {availableModules.map((module) => (
                <div key={module} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-xl">
                        {module === 'psychologists' && '👨‍⚕️'}
                        {module === 'pages' && '📄'}
                        {module === 'listdate' && '📋'}
                        {module === 'managers' && '👥'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {module === 'psychologists' && 'Психологи'}
                        {module === 'pages' && 'Страницы'}
                        {module === 'listdate' && 'Листдаты'}
                      </h4>
                      <p className="mt-1.5 text-sm text-gray-600">
                        {user.permissions[module]?.edit ? 'Просмотр и редактирование' : 'Только просмотр'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Нет доступных разделов</h3>
              <p className="mt-1 text-gray-500 max-w-md mx-auto">
                Обратитесь к администратору для настройки прав доступа.
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm font-medium text-gray-500 mb-1">Роль</div>
            <div className="text-xl font-semibold text-gray-900">
              {user?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm font-medium text-gray-500 mb-1">Доступные разделы</div>
            <div className="text-xl font-semibold text-gray-900">{availableModules.length}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm font-medium text-gray-500 mb-1">Редактирование</div>
            <div className="text-xl font-semibold text-gray-900">
              {availableModules.filter(m => user.permissions[m]?.edit).length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm font-medium text-gray-500 mb-1">Статус</div>
            <div className="text-xl font-semibold text-green-600">Активен</div>
          </div>
        </div>
      </main>
    </div>
  );
}