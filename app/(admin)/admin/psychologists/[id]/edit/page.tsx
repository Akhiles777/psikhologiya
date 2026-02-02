import Link from "next/link";
import { notFound } from "next/navigation";
import { getPsychologistById, updatePsychologist } from "@/lib/actions/admin-psychologists";
import { DeletePsychologistButton } from "@/components/admin/DeletePsychologistButton";
import { ImageUrlsField } from "@/components/admin/ImageUrlsField";
import { EducationFormEdit } from '@/components/admin/EducationFormEdit';
import { parseEducationFromDB } from "@/lib/education-helpers";

type PageProps = { params: Promise<{ id: string }> };

/**
 * Форма редактирования психолога.
 */
export default async function EditPsychologistPage({ params }: PageProps) {
  const { id } = await params;
  const p = await getPsychologistById(id);
  if (!p) notFound();

  const mainParadigmStr = (p.mainParadigm ?? []).join("\n");
  const imagesStr = (p.images ?? []).join("\n");
  

   const educationData = parseEducationFromDB(p.education);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
            Редактировать: {p.fullName}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            ID: {p.id} | Создано: {new Date(p.createdAt).toLocaleDateString('ru-RU')}
          </p>

          <form action={updatePsychologist.bind(null, id)} className="mt-8 space-y-8">
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
                    defaultValue={p.fullName}
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
                      defaultValue={p.slug}
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
                    defaultValue={p.gender}
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
                    defaultValue={p.birthDate.toISOString().slice(0, 10)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
                <input
                  type="text"
                  name="city"
                  defaultValue={p.city}
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
                  defaultValue={p.workFormat}
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
                    defaultValue={p.firstDiplomaDate?.toISOString().slice(0, 10) ?? ""}
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
                    defaultValue={p.lastCertificationDate?.toISOString().slice(0, 10) ?? ""}
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
                  defaultValue={p.certificationLevel}
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
                  defaultValue={p.shortBio}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {p.shortBio?.length || 0}/400 символов
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  О себе подробно
                </label>
                <textarea
                  name="longBio"
                  rows={6}
                  defaultValue={p.longBio}
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
                    defaultValue={p.price}
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
                    defaultValue={p.contactInfo}
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
                <div className="mt-1">
                  <ImageUrlsField name="images" defaultValue={imagesStr} maxUrls={5} />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Первое фото в списке будет основным. Поддерживаются ссылки на изображения.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Образование и сертификации
              </label>
              {/* ПЕРЕДАЕМ ПРАВИЛЬНЫЕ ДАННЫЕ ИЗ БД */}
              <EducationFormEdit initialData={educationData} />
            </div>

            {/* Публикация */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                name="isPublished"
                id="isPublished"
                defaultChecked={p.isPublished}
                className="h-5 w-5 rounded border-gray-300 text-[#5858E2] focus:ring-[#5858E2]"
              />
              <div>
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                  Показывать на сайте
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Если не отмечено, психолог будет скрыт от посетителей сайта
                </p>
              </div>
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
                <DeletePsychologistButton id={id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}