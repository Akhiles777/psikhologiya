import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileGallery } from "@/components/catalog/ProfileGallery";
import { Button } from "@/components/ui";
import { Badge } from "@/components/ui";
import { prisma } from "@/lib/db";
import { buildMetadata, canonicalUrl, personJsonLd } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

function isDbError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("DATABASE_URL") ||
    msg.includes("PrismaClientInitializationError") ||
    msg.includes("does not exist") ||
    msg.includes("Unknown column")
  );
}

type EducationItem = {
  year?: string | number;
  type?: string;
  organization?: string;
  title?: string;
  isDiploma?: boolean;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  if (!prisma) return buildMetadata({ title: "Психолог", path: `/psy-list/${slug}` });
  try {
    const p = await prisma.psychologist.findUnique({
      where: { slug },
      select: { fullName: true, shortBio: true },
    });
    if (!p) return buildMetadata({ title: "Психолог", path: `/psy-list/${slug}` });
    return buildMetadata({
      title: p.fullName,
      description: p.shortBio.slice(0, 160),
      path: `/psy-list/${slug}`,
    });
  } catch (err) {
    if (isDbError(err)) return buildMetadata({ title: "Психолог", path: `/psy-list/${slug}` });
    throw err;
  }
}

export default async function PsychologistProfilePage({ params }: PageProps) {
  const { slug } = await params;
  if (!prisma) notFound();
  let psychologist: Awaited<ReturnType<typeof prisma.psychologist.findUnique>>;
  try {
    psychologist = await prisma.psychologist.findUnique({
      where: { slug },
    });
  } catch (err) {
    if (isDbError(err)) notFound();
    throw err;
  }
  if (!psychologist) notFound();

  const pageUrl = canonicalUrl(`/psy-list/${slug}`);
  const firstImage = psychologist.images[0];
  const imageUrl =
    firstImage && firstImage !== ""
      ? firstImage.startsWith("http")
        ? firstImage
        : `${canonicalUrl("").replace(/\/$/, "")}${firstImage.startsWith("/") ? "" : "/"}${firstImage}`
      : undefined;
  const personSchema = personJsonLd({
    name: psychologist.fullName,
    description: psychologist.shortBio,
    url: pageUrl,
    image: imageUrl,
  });

  const education = (psychologist.education as EducationItem[] | null) ?? [];
  const mainParadigm = (psychologist.mainParadigm ?? []) as string[];

  return (
   <>
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: personSchema }}
  />
  <div className="min-h-screen bg-white">
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* Кнопка назад */}
      <Link
        href="/psy-list"
        className="mb-3 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#5858E2]"
      >
        <span>←</span>
        <span>Назад в каталог</span>
      </Link>

      {/* Блок неопубликовано */}
      {!psychologist.isPublished && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
          <p className="text-sm font-medium">Анкета не опубликована</p>
          <p className="text-xs text-amber-700">
            Включите «Отображать на сайте» в админке
          </p>
        </div>
      )}

      {/* Основная карточка */}
      <article className="overflow-hidden rounded-lg border-2 border-lime-500 bg-white">
        <div className="p-4 sm:p-5 md:p-6">
          {/* Верхний блок */}
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
            {/* Галерея */}
            <div className="sm:w-2/5">
              <ProfileGallery
                images={psychologist.images ?? []}
                fullName={psychologist.fullName}
              />
            </div>

            {/* Информация */}
            <div className="sm:w-3/5">
              <div className="mb-2 pb-2 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  {psychologist.fullName}
                </h1>
              </div>

              <div className="space-y-1 mb-3">
                {psychologist.city && (
                  <p className="text-sm text-gray-700">
                    {psychologist.city}
                  </p>
                )}
                {psychologist.workFormat && (
                  <p className="text-sm text-gray-600">
                    {psychologist.workFormat}
                  </p>
                )}
              </div>

              {/* Бейджи */}
              <div className="mb-3 flex flex-wrap gap-1">
                <Badge variant="level" level={psychologist.certificationLevel as 1 | 2 | 3} />
                {mainParadigm.map((p) => (
                  <Badge key={p} variant="primary">
                    {p}
                  </Badge>
                ))}
              </div>

              {/* Цена и дата */}
              <div className="space-y-1">
                <p className="text-lg font-bold text-[#5858E2]">
                  {psychologist.price} ₽
                  <span className="ml-1 text-sm font-normal text-gray-500">
                    / сессия
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  На сайте с {new Date(psychologist.createdAt).toLocaleDateString("ru-RU", {
                    year: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* О себе */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              О себе
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                {psychologist.shortBio}
              </p>
              {psychologist.longBio && (
                <div
                  className="text-sm text-gray-700 [&_a]:text-[#5858E2] [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: psychologist.longBio }}
                />
              )}
            </div>
          </div>

          {/* Образование */}
          {education.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">
                Образование
              </h2>
              <div className="space-y-2">
                {[...education]
                  .sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0))
                  .map((item, i) => (
                    <div
                      key={i}
                      className="rounded border border-gray-200 bg-gray-50 p-2"
                    >
                      <div className="flex gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[#5858E2]/10">
                          {item.type === "диплом" ? "🎓" :
                           item.type === "сертификат" ? "📜" :
                           item.type === "удостоверение" ? "📄" : "📚"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                            <div className="flex items-center gap-1">
                              {item.year && (
                                <span className="font-medium text-gray-900">
                                  {item.year}
                                </span>
                              )}
                              {item.type && (
                                <span className="text-xs text-[#5858E2] capitalize sm:text-sm">
                                  {item.type}
                                </span>
                              )}
                            </div>
                            {item.isDiploma && (
                              <span className="text-xs text-green-700 font-medium">
                                Диплом
                              </span>
                            )}
                          </div>
                          {item.organization && (
                            <h4 className="mt-0.5 font-medium text-gray-900 text-sm">
                              {item.organization}
                            </h4>
                          )}
                          {item.title && (
                            <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                              {item.title}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Контакты */}
          {psychologist.contactInfo && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">
                Контакты
              </h2>
              <div
                className="text-sm text-gray-700 [&_a]:text-[#5858E2] [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: psychologist.contactInfo }}
              />
            </div>
          )}

          {/* Нижние кнопки */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/psy-list">
                <Button variant="outline" size="sm">
                  ← В каталог
                </Button>
              </Link>
              <div className="flex gap-3">
                <Link href="/certification-levels">
                  <span className="text-xs text-gray-600 hover:text-[#5858E2] sm:text-sm">
                    Уровни сертификации
                  </span>
                </Link>
                <Link href="/complaint">
                  <span className="text-xs text-gray-600 hover:text-[#5858E2] sm:text-sm">
                    Пожаловаться
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</>
  );
}