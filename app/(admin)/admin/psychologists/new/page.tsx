"use client";

import { EducationForm } from "@/components/admin/EducationForm";
import Link from "next/link";
import { createPsychologist } from "@/lib/actions/admin-psychologists";
import { PARADIGM_OPTIONS } from "@/lib/paradigm-options";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Форма добавления психолога
 */
export default function NewPsychologistPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error") || "";
  
  const errorMessage = errorCode === "duplicate_slug"
    ? "Психолог с таким slug уже есть. Укажите другой адрес страницы."
    : errorCode === "invalid_file_type"
    ? "Недопустимый тип файла. Разрешены: JPEG, PNG, WebP, GIF"
    : errorCode === "file_too_large"
    ? "Файл слишком большой. Максимальный размер: 5MB"
    : null;

  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Обработка выбора файлов
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalFiles = files.length + selectedFiles.length;
      
      if (totalFiles > 5) {
        alert("Можно загрузить максимум 5 файлов");
        return;
      }
      
      setFiles(prev => [...prev, ...selectedFiles]);
      
      // Создаем временные URL для предпросмотра
      const tempUrls = selectedFiles.map(file => URL.createObjectURL(file));
      setUrls(prev => [...prev, ...tempUrls]);
    }
  };

  // Удалить файл/URL
  const removeItem = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUrls(prev => {
      const newUrls = [...prev];
      // Освобождаем временный URL
      if (newUrls[index].startsWith('blob:')) {
        URL.revokeObjectURL(newUrls[index]);
      }
      return newUrls.filter((_, i) => i !== index);
    });
  };

  // Добавить URL
  const addUrl = () => {
    const trimmed = newUrl.trim();
    if (!trimmed || urls.length >= 5) return;
    
    // Проверяем валидность URL
    const isValid = /^(https?:\/\/|\/)/.test(trimmed) || 
                   /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(trimmed);
    
    if (!isValid) {
      alert("Пожалуйста, введите корректный URL изображения");
      return;
    }
    
    setUrls(prev => [...prev, trimmed]);
    setNewUrl("");
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(formRef.current!);
    
    // Добавляем файлы в FormData
    files.forEach(file => {
      formData.append("images", file);
    });
    
    // Добавляем URL (те, которые не из файлов)
    const externalUrls = urls.filter(url => !url.startsWith('blob:'));
    if (externalUrls.length > 0) {
      formData.append("imageUrls", externalUrls.join("\n"));
    }
    
    console.log("📤 Отправка формы...");
    console.log("📎 Файлов:", files.length);
    console.log("🔗 URL:", externalUrls.length);
    
    try {
      await createPsychologist(formData);
    } 
     catch{
      console.log('Успешно')
     }
    }
  // Очистка временных URL при размонтировании
  useEffect(() => {
    return () => {
      urls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  return (
    <div className="rounded-2xl border-2 border-[#5858E2]/20 bg-white p-8 shadow-lg">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Добавить психолога
      </h1>
      <p className="mt-2 text-sm text-neutral-dark">
        Заполните поля. Slug можно оставить пустым — подставится из ФИО.
      </p>

      {errorMessage && (
        <div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-800">
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground">ФИО *</label>
          <input
            type="text"
            name="fullName"
            required
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground">URL адрес страницы</label>
          <input
            type="text"
            name="slug"
            placeholder="Оставьте пустым — подставится из ФИО (ivanov-ivan)"
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
          <p className="mt-1 text-xs text-neutral-dark">Страница будет: /psy-list/[slug]</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">Пол</label>
            <select
              name="gender"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
            >
              <option value="М">М</option>
              <option value="Ж">Ж</option>
              <option value="Не указан">Не указан</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground">Дата рождения</label>
            <input
              type="date"
              name="birthDate"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground">Город</label>
          <input
            type="text"
            name="city"
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground">Формат работы</label>
          <select
            name="workFormat"
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          >
            <option value="Онлайн и оффлайн">Онлайн и оффлайн</option>
            <option value="Только онлайн">Только онлайн</option>
            <option value="Только оффлайн">Только оффлайн</option>
            <option value="Переписка">Переписка</option>
          </select>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">Дата первого диплома</label>
            <input
              type="date"
              name="firstDiplomaDate"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground">Дата последней сертификации</label>
            <input
              type="date"
              name="lastCertificationDate"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground">Парадигмы (по одной на строку)</label>
          <textarea
            name="mainParadigm"
            rows={3}
            placeholder="КПТ&#10;Гештальт-терапия"
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
          <p className="mt-1 text-xs text-neutral-dark">
            Варианты: {PARADIGM_OPTIONS.slice(0, 5).map((o) => o.label).join(", ")}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground">Уровень сертификации (1–3)</label>
          <select
            name="certificationLevel"
            className="mt-1 w-full max-w-xs rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground">О себе кратко (до 400 символов)</label>
          <textarea
            name="shortBio"
            maxLength={400}
            rows={3}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground">О себе подробно (HTML можно)</label>
          <textarea
            name="longBio"
            rows={6}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground">Стоимость консультации (₽)</label>
          <input
            type="number"
            name="price"
            min={0}
            defaultValue={0}
            className="mt-1 w-full max-w-xs rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-foreground">Контакты (HTML можно)</label>
          <textarea
            name="contactInfo"
            rows={3}
            placeholder="Телеграм: @nick"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>

        {/* СЕКЦИЯ ИЗОБРАЖЕНИЙ */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Фотографии (основное + до 4 дополнительных)
          </label>
          
          {/* Загрузка файлов */}
          <div className="mb-4">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-[#5858E2] file:px-4 file:py-2 file:text-white hover:file:bg-[#4848d0]"
            />
            <p className="mt-1 text-xs text-neutral-dark">
              Можно выбрать несколько файлов. Максимум 5 файлов.
            </p>
          </div>
          
          {/* Добавление по URL */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                placeholder="https://example.com/photo.jpg или /uploads/filename.jpg"
                className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
              />
              <button
                type="button"
                onClick={addUrl}
                disabled={!newUrl.trim() || urls.length >= 5}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                Добавить URL
              </button>
            </div>
          </div>
          
          {/* Список выбранных изображений */}
          {urls.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-foreground mb-2">
                Выбранные изображения ({urls.length}/5):
              </p>
              <div className="space-y-2">
                {urls.map((url, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded border border-neutral-300 overflow-hidden bg-white">
                        <img 
                          src={url} 
                          alt={`Изображение ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" font-family="Arial" font-size="8" fill="%239ca3af" text-anchor="middle" dy=".3em">IMG</text></svg>';
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {files[index]?.name || url.split('/').pop() || `Изображение ${index + 1}`}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {url.startsWith('blob:') ? 'Локальный файл' : 'Внешняя ссылка'}
                          {index === 0 && ' • Основное'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                      title="Удалить"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Информация */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Важно:</span> Файлы будут загружены на сервер. 
              Первое изображение в списке будет основным.
            </p>
          </div>
        </div>

        <div>
          <EducationForm />
        </div>

        {/* Поле публикации */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            defaultChecked
            className="h-4 w-4 rounded border-neutral-300 text-[#5858E2] focus:ring-[#5858E2]"
          />
          <label htmlFor="isPublished" className="ml-2 text-sm font-medium text-foreground">
            Опубликовать сразу
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="rounded-xl bg-[#5858E2] px-6 py-2 font-medium text-white hover:bg-[#4848d0]"
          >
            Сохранить
          </button>
          <Link
            href="/admin/psychologists"
            className="rounded-xl border border-neutral-300 px-6 py-2 font-medium text-foreground hover:bg-[#F5F5F7]"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}