"use client";

import Link from "next/link";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { EducationFormEdit } from '@/components/admin/EducationFormEdit';
import { parseEducationFromDB } from "@/lib/education-helpers";
import { updatePsychologist, getPsychologistById } from "@/lib/actions/admin-psychologists";
import { DeletePsychologistButton } from "@/components/admin/DeletePsychologistButton";

/**
 * Форма редактирования психолога
 */
export default function EditPsychologistPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const errorCode = searchParams.get("error") || "";
  
  const errorMessage = errorCode === "duplicate_slug"
    ? "Психолог с таким slug уже есть. Укажите другой адрес страницы."
    : errorCode === "invalid_file_type"
    ? "Недопустимый тип файла. Разрешены: JPEG, PNG, WebP, GIF"
    : errorCode === "file_too_large"
    ? "Файл слишком большой. Максимальный размер: 5MB"
    : null;

  // Состояния
  const [psychologist, setPsychologist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Загружаем данные психолога
  useEffect(() => {
    const loadPsychologist = async () => {
      if (!id) {
        console.error("ID не найден");
        router.push("/admin/psychologists");
        return;
      }

      try {
        setLoading(true);
        const data = await getPsychologistById(id);
        
        if (!data) {
          router.push("/admin/psychologists?error=not_found");
          return;
        }
        
        setPsychologist(data);
        setUrls(data.images || []);
      } catch (error) {
        console.error("Ошибка загрузки психолога:", error);
        router.push("/admin/psychologists?error=load_failed");
      } finally {
        setLoading(false);
      }
    };

    loadPsychologist();
  }, [id, router]);

  // Обработка выбора файлов
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalFiles = urls.length + selectedFiles.length;
      
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
    
    if (!psychologist || !id) return;
    
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
    
    console.log("📤 Отправка формы редактирования...");
    console.log("📎 Файлов:", files.length);
    console.log("🔗 URL:", externalUrls.length);
    console.log("ID психолога:", id);
    
    try {
      await updatePsychologist(id, formData);
    } catch (error) {
      console.error("Ошибка при обновлении:", error);
      
    }
  };

  // Очистка временных URL при размонтировании
  useEffect(() => {
    return () => {
      urls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [urls]);

  // Показываем загрузку
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5858E2]"></div>
            </div>
            <h1 className="mt-4 text-center font-display text-xl font-bold text-gray-900">
              Загружаем данные психолога...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  // Если психолог не найден
  if (!psychologist) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Психолог не найден
            </h1>
            <div className="mt-6">
              <Link
                href="/admin/psychologists"
                className="rounded-xl bg-[#5858E2] px-6 py-3 font-medium text-white hover:bg-[#4848d0]"
              >
                Вернуться к списку
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const educationData = parseEducationFromDB(psychologist.education ?? []);
  const mainParadigmStr = (psychologist.mainParadigm ?? []).join("\n");

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
            Редактировать: {psychologist.fullName}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            ID: {psychologist.id} | Создано: {new Date(psychologist.createdAt).toLocaleDateString('ru-RU')}
          </p>

          {errorMessage && (
            <div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-800">
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* Основная информация */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Основная информация</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ФИО *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    defaultValue={psychologist.fullName}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL адрес страницы *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">/psy-list/</span>
                    <input
                      type="text"
                      name="slug"
                      required
                      defaultValue={psychologist.slug}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Пол</label>
                  <select
                    name="gender"
                    defaultValue={psychologist.gender}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                  >
                    <option value="М">Мужской</option>
                    <option value="Ж">Женский</option>
                    <option value="Не указан">Не указан</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата рождения
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    defaultValue={psychologist.birthDate?.toISOString().slice(0, 10)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
                <input
                  type="text"
                  name="city"
                  defaultValue={psychologist.city || ""}
                  placeholder="Москва, Санкт-Петербург..."
                  className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                />
              </div>
            </div>

            {/* Профессиональная информация */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Профессиональная информация</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Формат работы</label>
                <select
                  name="workFormat"
                  defaultValue={psychologist.workFormat}
                  className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                >
                  <option value="Онлайн и оффлайн">Онлайн и оффлайн</option>
                  <option value="Только онлайн">Только онлайн</option>
                  <option value="Только оффлайн">Только оффлайн</option>
                  <option value="Переписка">Переписка</option>
                </select>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата первого диплома
                  </label>
                  <input
                    type="date"
                    name="firstDiplomaDate"
                    defaultValue={psychologist.firstDiplomaDate?.toISOString().slice(0, 10) || ""}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата последней сертификации
                  </label>
                  <input
                    type="date"
                    name="lastCertificationDate"
                    defaultValue={psychologist.lastCertificationDate?.toISOString().slice(0, 10) || ""}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Парадигмы (по одной на строку)
                </label>
                <textarea
                  name="mainParadigm"
                  rows={3}
                  defaultValue={mainParadigmStr}
                  placeholder="КПТ&#10;Гештальт&#10;Психоанализ"
                  className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Уровень сертификации
                </label>
                <select
                  name="certificationLevel"
                  defaultValue={psychologist.certificationLevel}
                  className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                >
                  <option value={1}>1 уровень (базовый)</option>
                  <option value={2}>2 уровень (продвинутый)</option>
                  <option value={3}>3 уровень (эксперт)</option>
                </select>
              </div>
            </div>

            {/* О себе */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">О психологе</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  О себе кратко (до 400 символов)
                </label>
                <textarea
                  name="shortBio"
                  maxLength={400}
                  rows={3}
                  defaultValue={psychologist.shortBio || ""}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  О себе подробно
                </label>
                <textarea
                  name="longBio"
                  rows={6}
                  defaultValue={psychologist.longBio || ""}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                />
              </div>
            </div>

            {/* Контакты и цена */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Контакты и стоимость</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Стоимость сеанса (₽)
                  </label>
                  <input
                    type="number"
                    name="price"
                    min={0}
                    defaultValue={psychologist.price}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Контакты
                  </label>
                  <textarea
                    name="contactInfo"
                    rows={3}
                    defaultValue={psychologist.contactInfo || ""}
                    placeholder="Телефон, Email, Telegram..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                  />
                </div>
              </div>
            </div>

            {/* Фотографии */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Фотографии</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фото психолога (основное + до 4 дополнительных)
                </label>
                
                {/* Загрузка файлов */}
                <div className="mb-4">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                    className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20 file:mr-4 file:rounded-lg file:border-0 file:bg-[#5858E2] file:px-4 file:py-2 file:text-white hover:file:bg-[#4848d0]"
                  />
                  <p className="mt-1 text-xs text-gray-500">
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
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                    />
                    <button
                      type="button"
                      onClick={addUrl}
                      disabled={!newUrl.trim() || urls.length >= 5}
                      className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                    >
                      Добавить URL
                    </button>
                  </div>
                </div>
                
                {/* Список выбранных изображений */}
                {urls.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Выбранные изображения ({urls.length}/5):
                    </p>
                    <div className="space-y-2">
                      {urls.map((url, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded border border-gray-300 overflow-hidden bg-white">
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
                              <p className="text-sm font-medium text-gray-900">
                                {files[index]?.name || url.split('/').pop() || `Изображение ${index + 1}`}
                              </p>
                              <p className="text-xs text-gray-500">
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
            </div>

            <div>
              <EducationFormEdit initialData={educationData} />
            </div>

            {/* Публикация */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                defaultChecked={psychologist.isPublished}
                className="h-4 w-4 rounded border-gray-300 text-[#5858E2] focus:ring-[#5858E2]"
              />
              <label htmlFor="isPublished" className="ml-2 text-sm font-medium text-gray-700">
                Показывать на сайте
              </label>
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="rounded-xl bg-[#5858E2] px-8 py-3 font-medium text-white hover:bg-[#4848d0] shadow-md hover:shadow-lg transition-all"
              >
                Сохранить изменения
              </button>
              <Link
                href="/admin/psychologists"
                className="rounded-xl border border-gray-300 px-8 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Отмена
              </Link>
            </div>
          </form>

          {/* Удаление */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="text-lg font-semibold text-red-800">Опасная зона</h3>
              <p className="mt-1 text-sm text-red-700">
                Удаление анкеты психолога необратимо. Все данные будут безвозвратно удалены.
              </p>
              <div className="mt-3">
                <DeletePsychologistButton id={psychologist.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}