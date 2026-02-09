'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Manager {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: {
    psychologists: { view: boolean; edit: boolean; delete: boolean };
    pages: { view: boolean; edit: boolean; delete: boolean };
    listdate: { view: boolean; edit: boolean; delete: boolean };
    managers: { view: boolean; edit: boolean; delete: boolean };
  };
}

export default function ManagersDashboardPage() {
  const [currentManager, setCurrentManager] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();



  useEffect(() => {
    // Проверяем, что пользователь - менеджер
    const checkManagerAuth = async () => {
      try {
        const res = await fetch('/api/admin/managers/me');
      
      } catch (err) {
        console.error('Ошибка проверки авторизации:', err);
    
      }
    };

    checkManagerAuth();
  }, [router]);


  useEffect(() => {
    fetchCurrentManager();
  }, []);

  const fetchCurrentManager = async () => {
    try {
      const res = await fetch('/api/admin/managers/me');
      
      if (res.status === 401) {
        router.push('/managers');
        return;
      }
      
      if (!res.ok) {
        throw new Error('Ошибка загрузки данных');
      }
      
      const data = await res.json();
      
      if (data.success && data.data) {
        setCurrentManager(data.data);
      }
    } catch (err) {
      console.error('Ошибка:', err);
      router.push('/managers');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/managers/logout', { method: 'POST' });
      router.push('/managers/login');
    } catch (err) {
      console.error('Ошибка выхода:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!currentManager) {
    return null;
  }

  const hasAccessTo = (section: keyof Manager['permissions'], action: string) => {
    return currentManager.permissions[section]?.[action as keyof Manager['permissions'][keyof Manager['permissions']]] || false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>
              <p className="text-gray-600 text-sm mt-1">
                Добро пожаловать, {currentManager.name} ({currentManager.role})
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Доступные разделы</h2>
          <p className="text-gray-600">Выберите раздел для работы:</p>
        </div>

        {/* Карточки разделов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Психологи */}
          {hasAccessTo('psychologists', 'view') && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Психологи</h3>
              <p className="text-gray-600 text-sm mb-4">Управление списком психологов</p>
              <div className="flex gap-2 mb-4">
                {hasAccessTo('psychologists', 'view') && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Просмотр</span>
                )}
                {hasAccessTo('psychologists', 'edit') && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Редактирование</span>
                )}
                {hasAccessTo('psychologists', 'delete') && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Удаление</span>
                )}
              </div>
              <Link
                href="/managers/psychologists"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Перейти →
              </Link>
            </div>
          )}

          {/* Страницы */}
          {hasAccessTo('pages', 'view') && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Страницы</h3>
              <p className="text-gray-600 text-sm mb-4">Управление страницами сайта</p>
              <div className="flex gap-2 mb-4">
                {hasAccessTo('pages', 'view') && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Просмотр</span>
                )}
                {hasAccessTo('pages', 'edit') && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Редактирование</span>
                )}
                {hasAccessTo('pages', 'delete') && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Удаление</span>
                )}
              </div>
              <Link
                href="/managers/pages"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Перейти →
              </Link>
            </div>
          )}

          {/* Расписание */}
          {hasAccessTo('listdate', 'view') && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Списки данных</h3>
              <p className="text-gray-600 text-sm mb-4">Управление списками данных</p>
              <div className="flex gap-2 mb-4">
                {hasAccessTo('listdate', 'view') && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Просмотр</span>
                )}
                {hasAccessTo('listdate', 'edit') && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Редактирование</span>
                )}
                {hasAccessTo('listdate', 'delete') && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Удаление</span>
                )}
              </div>
              <Link
                href="/managers/ListDate"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Перейти →
              </Link>
            </div>
          )}
        </div>

        {/* Управление менеджерами - ТОЛЬКО для админа! */}
        {currentManager.role === 'admin' && hasAccessTo('managers', 'view') && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-start mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Управление менеджерами</h3>
              <p className="text-gray-600 text-sm mb-4">Только для администраторов системы</p>
              <Link
                href="/admin/managers"
                className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
              >
                Управление доступом →
              </Link>
            </div>
          </div>
        )}

        {/* Статистика */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ваши права доступа</h3>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {['psychologists', 'pages', 'listdate'].filter(section => 
                    hasAccessTo(section as keyof Manager['permissions'], 'view')
                  ).length}/3
                </div>
                <p className="text-gray-600 text-sm mt-1">Разделов доступно</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {['psychologists', 'pages', 'listdate'].reduce((count, section) => 
                    count + (hasAccessTo(section as keyof Manager['permissions'], 'edit') ? 1 : 0), 0
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1">Можно редактировать</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {['psychologists', 'pages', 'listdate'].reduce((count, section) => 
                    count + (hasAccessTo(section as keyof Manager['permissions'], 'delete') ? 1 : 0), 0
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1">Можно удалять</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {currentManager.role === 'admin' ? 'Администратор' : 'Менеджер'}
                </div>
                <p className="text-gray-600 text-sm mt-1">Ваша роль</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}