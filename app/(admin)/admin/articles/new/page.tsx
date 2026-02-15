"use client";

import ArticleForm from "@/components/articles/ArticleForm";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { useState } from "react";

export default function AdminArticleNewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Функция вызывается из ArticleForm ПОСЛЕ успешного сохранения
  const handleSubmitSuccess = () => {
    // Перенаправляем на список статей
    router.push("/admin/articles");
    router.refresh(); // Опционально: обновляем данные на сервере
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <span className="font-semibold text-xl text-[#5858E2]">Добавить статью</span>
        </CardHeader>
        <CardContent>
          <ArticleForm 
            onSubmitSuccess={handleSubmitSuccess}
            loading={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}