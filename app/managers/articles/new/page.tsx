import { getPsychologistsList } from "@/lib/actions/admin-psychologists";
import ArticleFormManagers from "@/components/articles/ArticleFormManagers";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

export default async function AdminArticleNewPage() {
  // Загружаем психологов на сервере
  const psychologists = await getPsychologistsList();

  return (
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <span className="font-semibold text-xl text-[#5858E2]">Добавить статью</span>
          </CardHeader>
          <CardContent>
            <ArticleFormManagers
                psychologists={psychologists}
            />
          </CardContent>
        </Card>
      </div>
  );
}