import Link from "next/link";
import { notFound } from "next/navigation";
import { getPsychologistById, updatePsychologist } from "@/lib/actions/admin-psychologists";
import { DeletePsychologistButton } from "@/components/admin/DeletePsychologistButton";

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
  const educationStr = Array.isArray(p.education)
    ? JSON.stringify(p.education, null, 2)
    : "[]";

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h1 className="font-display text-2xl font-bold text-foreground">
        Редактировать: {p.fullName}
      </h1>
      <p className="mt-2 text-sm text-neutral-dark">
        ID: {p.id}
      </p>

      <form action={updatePsychologist.bind(null, id)} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground">ФИО *</label>
          <input
            type="text"
            name="fullName"
            required
            defaultValue={p.fullName}
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Slug *</label>
          <input
            type="text"
            name="slug"
            required
            defaultValue={p.slug}
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">Пол</label>
            <select
              name="gender"
              defaultValue={p.gender}
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
              defaultValue={p.birthDate.toISOString().slice(0, 10)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Город</label>
          <input
            type="text"
            name="city"
            defaultValue={p.city}
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Формат работы</label>
          <select
            name="workFormat"
            defaultValue={p.workFormat}
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
              defaultValue={p.firstDiplomaDate?.toISOString().slice(0, 10) ?? ""}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Дата последней сертификации</label>
            <input
              type="date"
              name="lastCertificationDate"
              defaultValue={p.lastCertificationDate?.toISOString().slice(0, 10) ?? ""}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Парадигмы (по одной на строку)</label>
          <textarea
            name="mainParadigm"
            rows={3}
            defaultValue={mainParadigmStr}
            className="mt-1 w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Уровень сертификации</label>
          <select
            name="certificationLevel"
            defaultValue={p.certificationLevel}
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
            defaultValue={p.shortBio}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">О себе подробно</label>
          <textarea
            name="longBio"
            rows={6}
            defaultValue={p.longBio}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Стоимость (₽)</label>
          <input
            type="number"
            name="price"
            min={0}
            defaultValue={p.price}
            className="mt-1 w-full max-w-xs rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Контакты</label>
          <textarea
            name="contactInfo"
            rows={3}
            defaultValue={p.contactInfo}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">URL фото (по одному на строку)</label>
          <textarea
            name="images"
            rows={3}
            defaultValue={imagesStr}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground">Образование (JSON)</label>
          <textarea
            name="education"
            rows={6}
            defaultValue={educationStr}
            className="mt-1 w-full font-mono text-sm rounded-lg border border-neutral-300 px-3 py-2 text-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isPublished"
            id="isPublished"
            defaultChecked={p.isPublished}
          />
          <label htmlFor="isPublished" className="text-sm font-medium text-foreground">
            Показывать на сайте
          </label>
        </div>
        <div className="flex flex-wrap gap-4">
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
          <DeletePsychologistButton id={id} />
        </div>
      </form>
    </div>
  );
}
