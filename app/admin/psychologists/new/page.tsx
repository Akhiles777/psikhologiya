import Link from "next/link";
import { createPsychologist } from "@/lib/actions/admin-psychologists";
import { PARADIGM_OPTIONS } from "@/lib/paradigm-options";

/**
 * Форма добавления психолога.
 */
export default function NewPsychologistPage() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Добавить психолога
      </h1>
      <p className="mt-2 text-sm text-neutral-dark">
        Заполните поля. Slug — короткий адрес для страницы (латиница, дефисы). Образование — JSON-массив, см. подсказку ниже.
      </p>

      <form action={createPsychologist} className="mt-8 space-y-6">
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
          <label className="block text-sm font-medium text-foreground">Slug * (адрес страницы)</label>
          <input
            type="text"
            name="slug"
            required
            placeholder="ivanov-ivan"
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
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
            Варианты: {PARADIGM_OPTIONS.slice(0, 5).map((o) => o.label).join(", ")} и др.
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
        <div>
          <label className="block text-sm font-medium text-foreground">URL фото (по одному на строку)</label>
          <textarea
            name="images"
            rows={3}
            placeholder="https://example.com/photo.jpg"
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Образование (JSON)</label>
          <textarea
            name="education"
            rows={6}
            placeholder='[{"year": 2020, "type": "диплом", "organization": "ВУЗ", "title": "Психология", "isDiploma": true}]'
            className="mt-1 w-full font-mono text-sm rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
          <p className="mt-1 text-xs text-neutral-dark">
            Массив объектов: year, type, organization, title, isDiploma (true/false).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isPublished" id="isPublished" />
          <label htmlFor="isPublished" className="text-sm font-medium text-foreground">
            Показывать на сайте
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
