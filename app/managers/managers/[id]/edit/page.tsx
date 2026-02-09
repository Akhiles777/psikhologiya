'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  permissions: {
    psychologists?: { view: boolean; edit: boolean };
    pages?: { view: boolean; edit: boolean };
    listdate?: { view: boolean; edit: boolean };
  };
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  permissions: {
    psychologists: { view: boolean; edit: boolean };
    pages: { view: boolean; edit: boolean };
    listdate: { view: boolean; edit: boolean };
  };
}

export default function EditManagerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [manager, setManager] = useState<Manager | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: 'MANAGER',
    isActive: true,
    permissions: {
      psychologists: { view: true, edit: true },
      pages: { view: true, edit: true },
      listdate: { view: true, edit: true },
    }
  });

  // Разворачиваем params
  useEffect(() => {
    params.then((p) => {
      setId(p.id);
    });
  }, [params]);

  // Загружаем данные менеджера
  useEffect(() => {
    async function loadManager() {
      if (!id) return;

      try {
        const response = await fetch(`/api/managers/managers/${id}`); // Менеджерский API
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Менеджер не найден');
        }

        setManager(data);
        setFormData({
          name: data.name,
          email: data.email,
          password: '', // Пароль не загружаем из соображений безопасности
          role: data.role,
          isActive: data.isActive,
          permissions: data.permissions || {
            psychologists: { view: true, edit: true },
            pages: { view: true, edit: true },
            listdate: { view: true, edit: true },
          }
        });
      } catch (error: any) {
        setError(error.message || 'Ошибка загрузки данных');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadManager();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      // Подготавливаем данные для отправки
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
        permissions: formData.permissions,
      };

      // Добавляем пароль только если он указан
      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/managers/managers/${id}`, { // Менеджерский API
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обновлении менеджера');
      }

      // Успешно обновлено - редирект на список менеджеров
      router.push('/managers/managers'); // Менеджерский путь
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'Произошла ошибка');
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePermissionChange = (module: string, permission: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module as keyof typeof prev.permissions],
          [permission]: value
        }
      }
    }));
  };

  const handleGeneratePassword = () => {
    // Генерируем случайный пароль из 8 символов
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let newPassword = '';
    for (let i = 0; i < 8; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: newPassword }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50] mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка данных менеджера...</p>
        </div>
      </div>
    );
  }

  if (error && !manager) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-3xl py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Ошибка</h3>
                <p className="mt-2 text-red-700">{error}</p>
                <div className="mt-4">
                  <Link
                    href="/managers/managers" // Менеджерский путь
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700"
                  >
                    Вернуться к списку
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center">
            <Link
              href="/managers/managers" // Менеджерский путь
              className="text-gray-500 hover:text-gray-700 mr-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Редактировать менеджера</h1>
              <p className="mt-2 text-gray-600">Обновите информацию о менеджере: {manager?.name}</p>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Основная информация */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Основная информация</h2>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Имя менеджера *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Роль *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  >
                    <option value="MANAGER">Менеджер</option>
                    <option value="ADMIN">Администратор</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50]"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Активный аккаунт
                  </label>
                </div>
              </div>
            </div>

            {/* Смена пароля */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Смена пароля</h2>
              <p className="text-sm text-gray-600 mb-4">
                Оставьте поле пустым, если не хотите менять пароль. 
                Новый пароль будет автоматически зашифрован.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Новый пароль
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                      placeholder="Оставьте пустым для сохранения старого пароля"
                    />
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Сгенерировать
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <span className="font-medium">Новый пароль:</span>{' '}
                        <span className="font-mono">{formData.password}</span>
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Сообщите этот пароль менеджеру. После сохранения он будет зашифрован.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Права доступа */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Права доступа</h2>
              <p className="text-sm text-gray-600 mb-4">Укажите, какие разделы будет видеть менеджер</p>
              
              <div className="space-y-4">
                {(['psychologists', 'pages', 'listdate'] as const).map((module) => (
                  <div key={module} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {module === 'psychologists' && 'Психологи'}
                        {module === 'pages' && 'Страницы'}
                        {module === 'listdate' && 'Листдаты'}
                      </h3>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${module}-view`}
                          checked={formData.permissions[module]?.view || false}
                          onChange={(e) => handlePermissionChange(module, 'view', e.target.checked)}
                          className="h-4 w-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50]"
                        />
                        <label htmlFor={`${module}-view`} className="ml-2 text-sm text-gray-700">
                          Просмотр
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${module}-edit`}
                        checked={formData.permissions[module]?.edit || false}
                        onChange={(e) => handlePermissionChange(module, 'edit', e.target.checked)}
                        className="h-4 w-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50]"
                      />
                      <label htmlFor={`${module}-edit`} className="ml-2 text-sm text-gray-700">
                        Редактирование
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Вы уверены, что хотите деактивировать этого менеджера? Он не сможет войти в систему.')) {
                    try {
                      const response = await fetch(`/api/managers/managers/${id}`, { // Менеджерский API
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isActive: false }),
                      });

                      if (response.ok) {
                        router.push('/managers/managers'); // Менеджерский путь
                        router.refresh();
                      } else {
                        const data = await response.json();
                        alert(data.error || 'Ошибка деактивации');
                      }
                    } catch (error) {
                      alert('Ошибка при деактивации менеджера');
                    }
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Деактивировать
              </button>
              
              <div className="flex space-x-4">
                <Link
                  href="/managers/managers" // Менеджерский путь
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50]"
                >
                  Отмена
                </Link>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#4CAF50] border border-transparent rounded-md text-sm font-medium text-white hover:bg-[#43A047] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить изменения'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}