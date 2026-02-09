import { notFound } from "next/navigation";
import { getPsychologistById } from "@/lib/actions/manager-psychologist";
import { getDataListItems } from "@/lib/actions/manager-references";
import EditPsychologistForm from "@/components/psychologist/EditPsychologistForm";

export default async function EditPsychologistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Разворачиваем params
  const { id } = await params;
  
  // Загружаем данные психолога на сервере
  const psychologist = await getPsychologistById(id);
  
  if (!psychologist) {
    notFound();
  }
  
  // Загружаем справочники на сервере
  const [workFormats, certificationLevels] = await Promise.all([
    getDataListItems('work-formats'),
    getDataListItems('certification-levels'),
  ]);

  return (
    <EditPsychologistForm
      psychologist={psychologist}
      psychologistId={id}
      initialWorkFormats={workFormats}
      initialCertificationLevels={certificationLevels}
    />
  );
}