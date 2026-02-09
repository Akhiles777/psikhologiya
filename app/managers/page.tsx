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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Панель менеджера
              </h1>
              <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {user?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user?.name}</span>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.push('/auth/login');
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex gap-4">
            {/* Динамически генерируем ссылки на основе прав */}
            {user?.permissions?.psychologists?.view && (
              <Link
                href="/managers/psychologists"
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              >
                Психологи
              </Link>
            )}
            
            {user?.permissions?.pages?.view && (
              <Link
                href="/managers/pages"
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              >
                Страницы
              </Link>
            )}
            
            {user?.permissions?.listdate?.view && (
              <Link
                href="/managers/listdate"
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              >
                Листдаты
              </Link>
            )}
            
            {/* Админ может управлять менеджерами */}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin/managers"
                className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
              >
                Управление менеджерами
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Добро пожаловать, {user?.name}!
          </h2>
          <p className="mt-2 text-gray-600">
            Вы вошли как {user?.role === 'ADMIN' ? 'администратор' : 'менеджер'} системы
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ваши доступные разделы:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableModules.map((module) => (
              <div key={module} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 capitalize">
                  {module === 'psychologists' && 'Психологи'}
                  {module === 'pages' && 'Страницы'}
                  {module === 'listdate' && 'Листдаты'}
                </h4>
                <p className="mt-1 text-sm text-gray-600">
                  {user.permissions[module]?.edit ? 'Просмотр и редактирование' : 'Только просмотр'}
                </p>
              </div>
            ))}
            
            {availableModules.length === 0 && (
              <div className="col-span-full text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Нет доступных разделов</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Обратитесь к администратору для настройки прав доступа.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}