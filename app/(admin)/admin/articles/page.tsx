"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Article {
  id: string;
  title: string;
  slug: string;
  shortText: string | null;
  content: string;
  tags: string[];
  catalogSlug: string | null;
  publishedAt: string | null;
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  } | null;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allAuthors, setAllAuthors] = useState<any[]>([]);
  const [allCatalogs, setAllCatalogs] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [catalogFilter, setCatalogFilter] = useState("");

  // Загружаем все данные
  useEffect(() => {
    Promise.all([
      fetch("/api/articles/tags").then(res => res.json()),
      fetch("/api/psychologists").then(res => res.json()),
      fetch("/api/articles").then(res => res.json())
    ])
      .then(([tagsData, authorsData, articlesData]) => {
        if (tagsData.success) setAllTags(tagsData.tags || []);
        if (authorsData.success) setAllAuthors(authorsData.psychologists || []);
        
        // Собираем уникальные каталоги из статей
        if (articlesData.success && articlesData.articles) {
          const catalogs = articlesData.articles
            .map((a: Article) => a.catalogSlug)
            .filter((c: string | null): c is string => c !== null && c !== "");
          const uniqueCatalogs = [...new Set(catalogs)];
          setAllCatalogs(uniqueCatalogs);
        }
      })
      .catch(console.error);
  }, []);

  // Загружаем статьи
  useEffect(() => {
    setLoading(true);
    fetch("/api/articles")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          let filtered = data.articles || [];
          
          if (search.trim()) {
            const q = search.trim().toLowerCase();
            filtered = filtered.filter((a: Article) =>
              a.title.toLowerCase().includes(q) ||
              (a.tags && a.tags.some((t: string) => t.toLowerCase().includes(q))) ||
              (a.author?.fullName && a.author.fullName.toLowerCase().includes(q))
            );
          }
          
          if (tagFilter) {
            filtered = filtered.filter((a: Article) => a.tags && a.tags.includes(tagFilter));
          }
          
          if (authorFilter) {
            filtered = filtered.filter((a: Article) => a.author?.id === authorFilter);
          }
          
          if (catalogFilter) {
            filtered = filtered.filter((a: Article) => a.catalogSlug === catalogFilter);
          }
          
          setArticles(filtered);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, tagFilter, authorFilter, catalogFilter]);

  const isPublished = (article: Article) => {
    return article.publishedAt !== null;
  };

  // Группировка статей по каталогам
  const groupedByCatalog = articles.reduce((groups, article) => {
    const catalog = article.catalogSlug || "Без каталога";
    if (!groups[catalog]) {
      groups[catalog] = [];
    }
    groups[catalog].push(article);
    return groups;
  }, {} as Record<string, Article[]>);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#5858E2] font-display">Статьи (библиотека)</h1>
        <Link href="/admin/articles/new">
          <Button size="md" variant="primary">Добавить статью</Button>
        </Link>
      </div>
      
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-neutral-300 bg-white px-4 py-2 text-base shadow-sm focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20 outline-none transition"
          placeholder="Поиск по названию, автору, тэгу..."
        />
        
        <select
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-base bg-white min-w-[150px]"
        >
          <option value="">Все тэги</option>
          {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
        </select>
        
        <select
          value={authorFilter}
          onChange={e => setAuthorFilter(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-base bg-white min-w-[180px]"
        >
          <option value="">Все авторы</option>
          {allAuthors.map((a: any) => <option key={a.id} value={a.id}>{a.fullName}</option>)}
        </select>
        
        <select
          value={catalogFilter}
          onChange={e => setCatalogFilter(e.target.value)}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-base bg-white min-w-[150px]"
        >
          <option value="">Все каталоги</option>
          {allCatalogs.map(catalog => (
            <option key={catalog} value={catalog}>{catalog}</option>
          ))}
        </select>
        
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => { 
            setSearch(""); 
            setTagFilter(""); 
            setAuthorFilter(""); 
            setCatalogFilter(""); 
          }}
        >
          Сбросить фильтры
        </Button>
      </div>

      {/* Статистика */}
      <div className="mb-4 text-sm text-neutral-500">
        Найдено статей: {articles.length}
        {catalogFilter && ` в каталоге "${catalogFilter}"`}
        {tagFilter && ` с тэгом "${tagFilter}"`}
        {authorFilter && ` автора ${allAuthors.find(a => a.id === authorFilter)?.fullName}`}
      </div>
      
      {/* Если выбран конкретный каталог - показываем список */}
      {catalogFilter ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#5858E2] border-b pb-2">
            Каталог: {catalogFilter}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      ) : (
        // Иначе группируем по каталогам
        <div className="space-y-8">
          {Object.entries(groupedByCatalog).map(([catalog, catalogArticles]) => (
            <div key={catalog}>
              <h2 className="text-xl font-semibold text-[#5858E2] border-b pb-2 mb-4">
                {catalog === "Без каталога" ? (
                  <span className="text-neutral-400">Без каталога</span>
                ) : (
                  <>Каталог: {catalog} <span className="text-sm font-normal text-neutral-500 ml-2">({catalogArticles.length})</span></>
                )}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {catalogArticles.map(article => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Выносим карточку статьи в отдельный компонент для чистоты кода
function ArticleCard({ article }: { article: Article }) {
  const isPublished = article.publishedAt !== null;
  
  return (
    <Card className="group hover:shadow-glass-strong transition-shadow">
      <CardHeader className="flex items-center gap-2 justify-between">
        <span className="font-semibold text-lg text-[#5858E2] line-clamp-1">{article.title}</span>
        {isPublished ? (
          <Badge variant="primary">Опубликовано</Badge>
        ) : (
          <Badge variant="neutral">Черновик</Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm text-neutral-700 line-clamp-2">
          {article.shortText || "Нет краткого описания"}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {article.tags && article.tags.length > 0 ? (
            article.tags.map((tag: string) => (
              <Badge key={tag} variant="accent">{tag}</Badge>
            ))
          ) : (
            <Badge variant="neutral">Без тэгов</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          {article.author?.avatarUrl && (
            <img 
              src={article.author.avatarUrl} 
              alt="" 
              className="h-7 w-7 rounded-full object-cover border border-neutral-200" 
            />
          )}
          <span className="text-sm text-neutral-700 font-medium">
            {article.author?.fullName || <span className="text-neutral-400">Без автора</span>}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>Каталог:</span>
          <span className="font-semibold">
            {article.catalogSlug || <span className="text-neutral-400">—</span>}
          </span>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Link href={`/admin/articles/${article.id}/edit`}>
            <Button size="sm" variant="outline">Редактировать</Button>
          </Link>
          <Link href={`/lib/articles/${article.slug}`} target="_blank">
            <Button size="sm" variant="ghost">Просмотр</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}