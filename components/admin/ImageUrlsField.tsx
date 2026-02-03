// components/admin/ImageUrlsField.tsx
"use client";

import { useState, useCallback } from "react";

interface Props {
  name?: string;
  defaultValue?: string;
  maxUrls?: number;
}

export function ImageUrlsField({ name = "images", defaultValue = "", maxUrls = 5 }: Props) {
  const initialUrls = defaultValue ? defaultValue.split("\n").filter(Boolean) : [];
  const [urls, setUrls] = useState<string[]>(initialUrls.slice(0, maxUrls));
  const [isUploading, setIsUploading] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState("");

  // ==================== ОСНОВНЫЕ ФУНКЦИИ ====================

  // Основная функция загрузки файла
  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      
      if (data.url) {
        setUrls(prev => [...prev, data.url]);
      } else {
        alert(data.error || "Ошибка загрузки");
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      alert("Ошибка загрузки файла");
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Загрузка через input
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || urls.length >= maxUrls) return;
    e.target.value = "";
    await uploadFile(file);
  }, [urls.length, maxUrls, uploadFile]);

  // Drag and Drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (urls.length >= maxUrls) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadFile(file);
    } else {
      alert("Пожалуйста, перетащите изображение");
    }
  }, [urls.length, maxUrls, uploadFile]);

  // Удаление изображения
  const removeImage = useCallback(async (index: number) => {
    const urlToRemove = urls[index];
    
    // Удаляем файл с сервера (если это локальный файл)
    if (urlToRemove.includes('/api/uploads/')) {
      try {
        const filename = urlToRemove.split('/').pop();
        if (filename) {
          await fetch(`/api/uploads/${filename}`, { method: "DELETE" });
        }
      } catch (error) {
        console.error("Ошибка удаления файла:", error);
      }
    }
    
    setUrls(prev => prev.filter((_, i) => i !== index));
  }, [urls]);

  // Добавление по URL
  const addByUrl = useCallback(() => {
    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl || urls.length >= maxUrls) return;
    
    if (!isValidImageUrl(trimmedUrl)) {
      alert("Пожалуйста, введите корректный URL изображения (JPG, PNG, GIF, WebP)");
      return;
    }
    
    setUrls(prev => [...prev, trimmedUrl]);
    setNewUrl("");
  }, [newUrl, urls.length, maxUrls]);

  // ==================== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ====================

  // Перемещение изображения (Drag & Drop для порядка)
  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newUrls = [...urls];
    const [movedImage] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, movedImage);
    setUrls(newUrls);
  }, [urls]);

  // Сделать изображение основным
  const setAsMain = useCallback((index: number) => {
    if (index === 0) return;
    
    const newUrls = [...urls];
    const [selectedImage] = newUrls.splice(index, 1);
    newUrls.unshift(selectedImage);
    setUrls(newUrls);
  }, [urls]);

  // Начать редактирование URL
  const startEditing = useCallback((index: number) => {
    setEditingIndex(index);
    setEditUrl(urls[index]);
  }, [urls]);

  // Сохранить отредактированный URL
  const saveEdit = useCallback(() => {
    if (editingIndex === null || !isValidImageUrl(editUrl)) {
      alert("Пожалуйста, введите корректный URL изображения");
      return;
    }
    
    setUrls(prev => prev.map((url, i) => i === editingIndex ? editUrl : url));
    setEditingIndex(null);
    setEditUrl("");
  }, [editingIndex, editUrl]);

  // Отмена редактирования
  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditUrl("");
  }, []);

  // Валидация URL изображения
  const isValidImageUrl = useCallback((url: string): boolean => {
    const trimmed = url.trim();
    if (!trimmed) return false;
    
    // Разрешаем локальные файлы
    if (trimmed.startsWith('/api/uploads/')) return true;
    
    // Проверяем внешние URL
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
    return trimmed.match(/^https?:\/\/.+/) !== null && imageExtensions.test(trimmed);
  }, []);

  // ==================== ВЕРСТКА ====================

  return (
    <div className="space-y-6">
      {/* Скрытое поле для формы */}
      <input type="hidden" name={name} value={urls.join("\n")} />
      
      {/* Заголовок и информация */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Изображения психолога</h3>
            <p className="text-sm text-gray-600 mt-1">
              {urls.length > 0 ? (
                <>
                  <span className="font-medium">{urls.length} из {maxUrls}</span> изображений загружено
                  <span className="mx-2">•</span>
                  <span className="text-[#5858E2]">Первое изображение — основное</span>
                </>
              ) : (
                "Добавьте фотографии психолога"
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              urls.length >= maxUrls 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {urls.length >= maxUrls ? 'Лимит достигнут' : `${maxUrls - urls.length} свободно`}
            </div>
          </div>
        </div>
      </div>

      {/* Блок загрузки */}
      <div className="space-y-4">
        {/* Drag & Drop зона */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragOver 
              ? 'border-[#5858E2] bg-[#5858E2]/5 scale-[1.01]' 
              : 'border-gray-300 hover:border-gray-400'
          } ${urls.length >= maxUrls ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => urls.length < maxUrls && document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileUpload}
            disabled={isUploading || urls.length >= maxUrls}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="text-gray-400">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            {urls.length >= maxUrls ? (
              <div>
                <p className="text-amber-600 font-medium text-lg">Достигнут максимальный лимит</p>
                <p className="text-gray-500 mt-1">Удалите одно из изображений, чтобы добавить новое</p>
              </div>
            ) : isUploading ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-[#5858E2] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-700 font-medium">Загрузка изображения...</p>
                </div>
                <p className="text-sm text-gray-500">Пожалуйста, подождите</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-700 font-medium text-lg">
                  Нажмите или перетащите изображение сюда
                </p>
                <p className="text-gray-500">
                  Поддерживаются JPG, PNG, WebP, GIF • Максимум 10MB
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-600">
                  <span className="bg-gray-100 px-2 py-1 rounded">JPEG</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">PNG</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">WebP</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">GIF</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Добавление по URL */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Или добавьте по ссылке
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addByUrl()}
                placeholder="https://example.com/photo.jpg или /api/uploads/filename.jpg"
                disabled={urls.length >= maxUrls}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5858E2]/20 focus:border-[#5858E2] outline-none disabled:opacity-50"
              />
            </div>
            <button
              type="button"
              onClick={addByUrl}
              disabled={!newUrl.trim() || urls.length >= maxUrls}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap"
            >
              Добавить ссылку
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Поддерживаются прямые ссылки на изображения и локальные файлы
          </p>
        </div>
      </div>

      {/* Галерея изображений */}
      {urls.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Галерея изображений</h4>
            <div className="text-sm text-gray-600">
              Перетаскивайте для изменения порядка
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {urls.map((url, index) => (
              <div 
                key={index}
                className={`relative group bg-white rounded-xl border-2 transition-all duration-200 ${
                  index === 0 
                    ? 'border-[#5858E2] shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  moveImage(fromIndex, index);
                }}
              >
                {/* Номер и метка основного */}
                <div className="absolute top-3 left-3 z-10">
                  <div className={`flex items-center gap-1.5 ${
                    index === 0 ? 'bg-[#5858E2]' : 'bg-gray-800/80'
                  } text-white px-2.5 py-1 rounded-full text-xs font-medium`}>
                    {index === 0 ? (
                      <>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>Основное</span>
                      </>
                    ) : (
                      <span>#{index + 1}</span>
                    )}
                  </div>
                </div>

                {/* Превью изображения */}
                <div className="aspect-square overflow-hidden rounded-t-xl bg-gray-100">
                  <img
                    src={url}
                    alt={`Изображение психолога ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" font-family="Arial" font-size="10" fill="%239ca3af" text-anchor="middle" dy=".3em">Ошибка загрузки</text></svg>';
                    }}
                  />
                  
                  {/* Overlay с кнопками при наведении */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => setAsMain(index)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                        title="Сделать основным"
                      >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => startEditing(index)}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                      title="Редактировать URL"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Удалить"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Информация под изображением */}
                <div className="p-3 space-y-2">
                  {editingIndex === index ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#5858E2] focus:border-[#5858E2] outline-none"
                        placeholder="Введите новый URL"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="flex-1 px-3 py-1.5 bg-[#5858E2] text-white text-sm rounded-lg hover:bg-[#4848d0] transition-colors"
                        >
                          Сохранить
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-600 truncate font-medium" title={url}>
                        {url.split('/').pop() || `Изображение ${index + 1}`}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          url.startsWith('/api/uploads/') ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-xs text-gray-500">
                          {url.startsWith('/api/uploads/') ? 'Локальный файл' : 'Внешняя ссылка'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {/* Слот для нового изображения */}
            {urls.length < maxUrls && (
              <div 
                className="aspect-square border-3 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <p className="font-medium">Добавить фото</p>
                <p className="text-sm mt-1">Свободный слот</p>
              </div>
            )}
          </div>

          {/* Информационная панель */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="space-y-2">
                <p className="font-medium text-blue-800">Рекомендации по изображениям</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <span className="font-medium">Основное фото</span> — будет отображаться в каталоге и карточках</li>
                  <li>• <span className="font-medium">Оптимальный размер</span> — 1200×800 пикселей, JPG или WebP</li>
                  <li>• <span className="font-medium">Качество</span> — четкое, хорошее освещение, профессиональный вид</li>
                  <li>• <span className="font-medium">Перетаскивайте</span> изображения для изменения порядка</li>
                  <li>• <span className="font-medium">Локальные файлы</span> загружаются на сервер, внешние ссылки остаются как есть</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Состояние без изображений */}
      {urls.length === 0 && (
        <div className="text-center py-12 border-3 border-dashed border-gray-200 rounded-2xl bg-gray-50">
          <div className="max-w-md mx-auto space-y-4">
            <svg className="w-20 h-20 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-xl font-medium text-gray-600">Нет загруженных изображений</p>
              <p className="text-gray-500 mt-2">
                Добавьте фотографии психолога для привлекательной анкеты
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={() => document.getElementById('file-input')?.click()}
                className="px-6 py-3 bg-[#5858E2] text-white rounded-lg hover:bg-[#4848d0] transition-colors font-medium"
              >
                Добавить первое изображение
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}