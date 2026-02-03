// app/(admin)/admin/psychologists/ListWrapper.tsx
import { getPsychologistsList } from "@/lib/actions/admin-psychologists";
import PsychologistsListPage from "./PsychologistsListPage";

export default async function PsychologistsListWrapper({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const list = await getPsychologistsList();

  return (
    <PsychologistsListPage
      initialList={list}
      searchParams={params}
    />
  );
}