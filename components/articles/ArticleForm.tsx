"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function FormInput({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input {...props} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20" />
    </div>
  );
}

function FormTextarea({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <textarea {...props} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20" />
    </div>
  );
}

function FormSelect({ label, children, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select {...props} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20">
        {children}
      </select>
    </div>
  );
}

interface ArticleFormProps {
  initialData?: any;
  onSubmit?: (data: any) => Promise<void> | void;
  onSubmitSuccess?: () => void;
  loading?: boolean;
}

export default function ArticleForm({ 
  initialData = {}, 
  onSubmit, 
  onSubmitSuccess, 
  loading: externalLoading 
}: ArticleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [shortText, setShortText] = useState(initialData.shortText || "");
  const [content, setContent] = useState(initialData.content || "");
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [authorId, setAuthorId] = useState(initialData.authorId || "");
  const [catalogSlug, setCatalogSlug] = useState(initialData.catalogSlug || "");
  const [isPublished, setIsPublished] = useState(!!initialData.publishedAt || !!initialData.isPublished);
  const [psychologists, setPsychologists] = useState<any[]>([]);
  const [authorSearch, setAuthorSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Загружаем тэги через API
  useEffect(() => {
    fetch("/api/articles/tags")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAllTags(data.tags || []);
        }
      })
      .catch(err => console.error("Error loading tags:", err));

    fetch("/api/psychologists")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPsychologists(data.psychologists || []);
        }
      })
      .catch(err => console.error("Error loading psychologists:", err));
  }, []);

  const filteredAuthors = authorSearch
    ? psychologists.filter((p: any) => p.fullName?.toLowerCase().includes(authorSearch.toLowerCase()))
    : psychologists;

  function validate() {
    if (!title.trim()) return "Заполните заголовок";
    if (!slug.trim() || /\s/.test(slug)) return "Slug обязателен и не должен содержать пробелов";
    if (!shortText.trim()) return "Заполните короткий текст";
    if (!content.trim()) return "Заполните длинный текст";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    const err = validate();
    if (err) return setError(err);
    
    setSubmitting(true);
    
    try {
      const formData = { 
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        shortText: shortText.trim(),
        content: content.trim(),
        tags: tags.filter(t => t.trim() !== ""),
        authorId: authorId || null,
        catalogSlug: catalogSlug?.trim() || null,
        isPublished: Boolean(isPublished)
      };

      console.log("🚀 Submitting article data:", formData);

      // Если есть onSubmit (режим редактирования)
      if (onSubmit) {
        await onSubmit(formData);
        setSuccess("Сохранено!");
        if (onSubmitSuccess) {
          setTimeout(() => {
            onSubmitSuccess();
          }, 1000);
        }
      } 
      // Режим создания
      else {
        console.log("📡 Sending POST request to /api/articles");
        
        const response = await fetch("/api/articles", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData)
        });

        console.log("📥 Response status:", response.status);
        
        // Получаем текст ответа
        const responseText = await response.text();
        console.log("📥 Response text:", responseText);

        // Проверяем, что ответ не пустой
        if (!responseText) {
          throw new Error("Сервер вернул пустой ответ");
        }

        // Парсим JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("❌ Failed to parse JSON:", responseText);
          throw new Error(`Сервер вернул невалидный JSON. Первые 100 символов: ${responseText.substring(0, 100)}`);
        }
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || `Ошибка сервера: ${response.status}`);
        }

        console.log("✅ Article created successfully:", data.article);
        setSuccess("Статья успешно сохранена!");
        
        // Вызываем колбэк успеха или делаем редирект
        if (onSubmitSuccess) {
          onSubmitSuccess();
        } else {
          setTimeout(() => {
            router.push("/admin/articles");
            router.refresh();
          }, 1500);
        }
      }
    } catch (e: any) {
      console.error("❌ Form submission error:", e);
      setError(e?.message || "Ошибка сохранения");
    } finally {
      setSubmitting(false);
    }
  }

  const isSubmitting = submitting || externalLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-[#5858E2] mb-6">Данные статьи</h2>
        
        {error && (
          <div className="mb-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-800">
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 rounded-xl border-2 border-green-300 bg-green-50 p-4 text-green-800">
            <p className="font-medium">{success}</p>
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-2">
          <FormInput 
            label="Заголовок *" 
            value={title} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} 
            required 
            disabled={isSubmitting}
          />
          <FormInput 
            label="URL (slug) *" 
            value={slug} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value.replace(/\s/g, "").toLowerCase())} 
            required 
            placeholder="my-article"
            disabled={isSubmitting}
          />
        </div>

        <FormTextarea 
          label="Короткий текст *" 
          value={shortText} 
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setShortText(e.target.value)} 
          rows={2} 
          maxLength={200} 
          required 
          disabled={isSubmitting}
        />

        <FormTextarea 
          label="Длинный текст *" 
          value={content} 
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)} 
          rows={8} 
          required 
          disabled={isSubmitting}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Тэги (через запятую)</label>
          <input
            value={tags.join(", ")}
            onChange={e => {
              const val = e.target.value;
              setTags(val.split(",").map(t => t.trim()).filter(Boolean));
            }}
            list="all-tags"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
            placeholder="тег1, тег2, тег3"
            disabled={isSubmitting}
          />
          <datalist id="all-tags">
            {allTags.map(tag => <option key={tag} value={tag} />)}
          </datalist>
          <div className="text-xs text-gray-500 mt-1">
            Существующие тэги: {allTags.length > 0 ? allTags.join(", ") : "нет"}
          </div>
        </div>

        <FormInput 
          label="Каталог" 
          value={catalogSlug} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCatalogSlug(e.target.value)} 
          placeholder="например, 26/сен"
          disabled={isSubmitting}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Автор (поиск по ФИО)</label>
          <input
            value={authorSearch}
            onChange={e => setAuthorSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
            placeholder="Начните вводить фамилию..."
            disabled={isSubmitting}
          />
          <FormSelect 
            value={authorId} 
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAuthorId(e.target.value)} 
            label="Выберите автора"
            disabled={isSubmitting}
          >
            <option value="">Без автора</option>
            {filteredAuthors.map((p: any) => (
              <option key={p.id} value={p.id}>{p.fullName}</option>
            ))}
          </FormSelect>
          {filteredAuthors.length === 0 && authorSearch && (
            <p className="text-sm text-amber-600 mt-1">Психологи не найдены</p>
          )}
        </div>

        <div className="flex items-center gap-3 mt-2">
          <input 
            type="checkbox" 
            checked={isPublished} 
            onChange={e => setIsPublished(e.target.checked)} 
            id="isPublished" 
            className="h-4 w-4 rounded border-gray-300 text-[#5858E2] focus:ring-[#5858E2]"
            disabled={isSubmitting}
          />
          <label htmlFor="isPublished" className="font-medium text-gray-700">Опубликовать</label>
        </div>

        <div className="flex justify-end pt-6">
          <button 
            type="submit" 
            className="rounded-xl bg-[#5858E2] px-8 py-3 font-medium text-white hover:bg-[#4848d0] shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>
    </form>
  );
}