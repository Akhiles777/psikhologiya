'use client';

import { useState, useEffect } from 'react';
import { getDataListItems, updateDataList } from '@/lib/actions/admin-references';
import { Plus, Trash2, Save } from 'lucide-react';

export default function ReferencesPage() {
  const [activeTab, setActiveTab] = useState<'work-formats' | 'paradigms' | 'certification-levels'>('work-formats');
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabNames = {
    'work-formats': 'Форматы работы',
    'paradigms': 'Парадигмы', 
    'certification-levels': 'Уровни сертификации',
  };

  // Загружаем данные при смене вкладки
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDataListItems(activeTab);
      console.log(`📊 Загружены данные для ${activeTab}:`, data);
      setItems(data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Ошибка загрузки данных');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!newItem.trim()) {
      setError('Введите значение');
      return;
    }
    
    // Проверяем дубликаты
    if (items.includes(newItem.trim())) {
      setError('Это значение уже существует');
      return;
    }
    
    setItems([...items, newItem.trim()]);
    setNewItem('');
    setError(null);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleSave = async () => {
    if (items.length === 0) {
      setError('Добавьте хотя бы один элемент');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const result = await updateDataList(activeTab, items);
      if (result.success) {
        alert('✅ Сохранено успешно!');
        await loadData(); // Перезагружаем для проверки
      } else {
        setError(result.error || 'Ошибка сохранения');
      }
    } catch (error) {
      console.error('Error saving:', error);
      setError('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">
            Управление списками данных
          </h1>
          <p className="mt-2 text-gray-600">
            Редактирование допустимых значений для форм
          </p>
        </div>

        {/* Вкладки */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-200">
            {(Object.keys(tabNames) as Array<keyof typeof tabNames>).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-[#5858E2] text-[#5858E2]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tabNames[tab]}
              </button>
            ))}
          </div>
        </div>

        {/* Контент вкладки */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {tabNames[activeTab]}
            </h2>
            <p className="text-gray-600 text-sm">
              Добавляйте, удаляйте и редактируйте элементы. Изменения применяются сразу.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5858E2]"></div>
            </div>
          ) : (
            <>
              {/* Форма добавления */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => {
                      setNewItem(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder={
                      activeTab === 'certification-levels' 
                        ? 'Например: 4 (мастер-класс)' 
                        : 'Введите новый элемент'
                    }
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                  />
                  <button
                    onClick={handleAdd}
                    disabled={!newItem.trim()}
                    className="rounded-lg bg-[#5858E2] px-4 py-2 text-white font-medium hover:bg-[#4848d0] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Список элементов */}
              <div className="mb-6">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Нет элементов. Добавьте первый.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <span className="font-medium">{item}</span>
                        <button
                          onClick={() => handleRemove(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Удалить"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Информация о количестве */}
              <div className="mb-4 text-sm text-gray-500">
                Всего элементов: {items.length}
              </div>

              {/* Кнопка сохранения */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {saving ? 'Сохранение...' : ''}
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || items.length === 0}
                  className="rounded-xl bg-[#5858E2] px-6 py-3 font-medium text-white hover:bg-[#4848d0] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Сохранить изменения
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Информация */}
        <div className="mt-4 text-sm text-gray-500">
          <p>
            После сохранения новые значения будут доступны в формах создания и редактирования психологов.
          </p>
          <p className="mt-1">
            Текущий справочник: <strong>{tabNames[activeTab]}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}