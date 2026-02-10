'use client';

import { useState, useEffect, useRef } from 'react';
import { getDataListItems, updateDataList } from '@/lib/actions/manager-references';
import { Plus, Trash2, Save, Edit, GripVertical, X, Check } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

export default function ReferencesPage() {
  const [activeTab, setActiveTab] = useState<'work-formats' | 'paradigms' | 'certification-levels'>('work-formats');
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

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
    setEditingIndex(null);
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
    if (confirm('Удалить этот элемент?')) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
      if (editingIndex === index) {
        setEditingIndex(null);
      }
    }
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index]);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const saveEdit = () => {
    if (!editValue.trim()) {
      setError('Введите значение');
      return;
    }

    // Проверяем дубликаты (кроме текущего редактируемого)
    const duplicateIndex = items.findIndex((item, idx) => 
      item === editValue.trim() && idx !== editingIndex
    );
    
    if (duplicateIndex !== -1) {
      setError('Это значение уже существует');
      return;
    }

    const newItems = [...items];
    if (editingIndex !== null) {
      newItems[editingIndex] = editValue.trim();
      setItems(newItems);
      setEditingIndex(null);
      setEditValue('');
      setError(null);
    }
  };

  // Drag and Drop функции
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedItem(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-[#4CAF50]', 'bg-[#4CAF50]/5');
    
    if (draggedItem === null) return;
    
    const newItems = [...items];
    const [draggedElement] = newItems.splice(draggedItem, 1);
    newItems.splice(targetIndex, 0, draggedElement);
    
    setItems(newItems);
    setDraggedItem(null);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.currentTarget.classList.add('border-[#4CAF50]', 'bg-[#4CAF50]/5');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-[#4CAF50]', 'bg-[#4CAF50]/5');
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
        await loadData();
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
    <AuthGuard requiredPermission='listdate.view'>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-gray-900">
              Управление списками данных
            </h1>
            <p className="mt-2 text-gray-600">
              Редактирование допустимых значений для форм. Перетаскивайте элементы для изменения порядка.
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
                      ? 'border-[#4CAF50] text-[#4CAF50]'
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
                Добавляйте, редактируйте, удаляйте и перетаскивайте элементы.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4CAF50]"></div>
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
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20"
                    />
                    <button
                      onClick={handleAdd}
                      disabled={!newItem.trim()}
                      className="rounded-lg bg-[#4CAF50] px-4 py-2 text-white font-medium hover:bg-[#43A047] disabled:opacity-50 disabled:cursor-not-allowed"
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
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all cursor-move ${
                            draggedItem === index ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {/* Иконка для перетаскивания */}
                            <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-5 h-5" />
                            </div>
                            
                            {/* Редактируемое поле или текст */}
                            {editingIndex === index ? (
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                  className="flex-1 border-b border-gray-300 px-1 focus:border-[#4CAF50] focus:outline-none"
                                  autoFocus
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={saveEdit}
                                    className="p-1 text-green-600 hover:text-green-800"
                                    title="Сохранить"
                                  >
                                    <Check className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="p-1 text-red-600 hover:text-red-800"
                                    title="Отмена"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="font-medium">{item}</span>
                                <span className="text-xs text-gray-400 ml-2">
                                  #{index + 1}
                                </span>
                              </>
                            )}
                          </div>
                          
                          {/* Кнопки действий (если не в режиме редактирования) */}
                          {editingIndex !== index && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => startEdit(index)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Редактировать"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemove(index)}
                                className="p-1 text-red-600 hover:text-red-800"
                                title="Удалить"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Информация о количестве */}
                <div className="mb-4 text-sm text-gray-500">
                  Всего элементов: {items.length}
                </div>

                {/* Инструкция по перетаскиванию */}
                <div className="mb-4 p-3 bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-lg text-sm text-[#4CAF50]">
                  💡 <strong>Совет:</strong> Перетаскивайте элементы за значок <GripVertical className="w-3 h-3 inline mx-1" /> 
                  чтобы изменить их порядок в списке
                </div>

                {/* Кнопка сохранения */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {saving ? 'Сохранение...' : ''}
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving || items.length === 0}
                    className="rounded-xl bg-[#4CAF50] px-6 py-3 font-medium text-white hover:bg-[#43A047] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            <p className="mt-1 text-[#4CAF50] font-medium">✓ Менеджерский доступ</p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}