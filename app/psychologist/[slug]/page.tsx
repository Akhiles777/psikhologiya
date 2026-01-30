import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

/**
 * Редирект со старого адреса /psychologist/[slug] на /psy-list/[slug].
 */
export default async function PsychologistRedirect({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/psy-list/${slug}`);
}
