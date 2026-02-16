"use client";

import { useState, useEffect, useRef } from "react";
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

interface ArticleFormProps {
  initialData?: any;
  onSubmit?: (data: any) => Promise<void> | void;
  loading?: boolean;
  psychologists?: any[];
}

export default function ArticleForm({
                                      initialData = {},
                                      onSubmit,
                                      loading: externalLoading,
                                      psychologists = []
                                    }: ArticleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData.title || "");
  const [slug, setSlug] = useState(initialData.slug || "");
  const [shortText, setShortText] = useState(initialData.shortText || "");
  const [content, setContent] = useState(initialData.content || "");
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [authorId, setAuthorId] = useState(initialData.authorId || "");
  const [authorName, setAuthorName] = useState(initialData.author?.fullName || "");
  const [catalogSlug, setCatalogSlug] = useState(initialData.catalogSlug || "");
  const [isPublished, setIsPublished] = useState(!!initialData.publishedAt || !!initialData.isPublished);
  const [authorSearch, setAuthorSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [slugWarning, setSlugWarning] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
  }, []);

  // Закрываем дропдаун при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Устанавливаем имя автора при загрузке
  useEffect(() => {
    if (initialData.author?.fullName) {
      setAuthorName(initialData.author.fullName);
      setAuthorSearch(initialData.author.fullName);
    }
  }, [initialData.author]);

  // Фильтруем психологов по поиску
  const filteredAuthors = authorSearch
      ? psychologists.filter((p: any) =>
          p.fullName?.toLowerCase().includes(authorSearch.toLowerCase())
      )
      : psychologists;

  // Выбираем автора
  const selectAuthor = (author: any) => {
    setAuthorId(author.id);
    setAuthorName(author.fullName);
    setAuthorSearch(author.fullName);
    setShowDropdown(false);
  };

  // Очищаем автора
  const clearAuthor = () => {
    setAuthorId("");
    setAuthorName("");
    setAuthorSearch("");
    setShowDropdown(false);
  };

  // Проверка slug на допустимые символы
  const validateSlug = (value: string): string | null => {
    if (!value) return null;

    // Разрешаем только латиницу, цифры, дефисы и нижние подчеркивания
    const allowedPattern = /^[a-z0-9\-_]+$/;

    if (!allowedPattern.test(value)) {
      return "Slug может содержать только латинские буквы, цифры, дефисы (-) и нижние подчеркивания (_)";
    }

    return null;
  };

  // Обработчик изменения slug
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.replace(/\s/g, "").toLowerCase();
    setSlug(newSlug);

    // Проверяем на допустимые символы
    const warning = validateSlug(newSlug);
    setSlugWarning(warning);
  };

  function validate() {
    if (!title.trim()) return "Заполните заголовок";
    if (!slug.trim()) return "Заполните slug";

    // Проверяем slug перед отправкой
    const slugWarning = validateSlug(slug);
    if (slugWarning) return slugWarning;

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
        slug: slug.trim(), // Убираем toLowerCase() так как уже делаем в handleSlugChange
        shortText: shortText.trim(),
        content: content.trim(),
        tags: tags.filter(t => t.trim() !== ""),
        authorId: authorId || null,
        catalogSlug: catalogSlug?.trim() || null,
        isPublished: Boolean(isPublished)
      };

      console.log("🚀 Submitting article data:", formData);

      if (onSubmit) {
        await onSubmit(formData);
        setSuccess("Сохранено!");
        setTimeout(() => {
          router.push("/admin/articles");
          router.refresh();
        }, 1000);
      }
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

        const responseText = await response.text();
        console.log("📥 Response text:", responseText);

        if (!responseText) {
          throw new Error("Сервер вернул пустой ответ");
        }

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

        setTimeout(() => {
          router.push("/admin/articles");
          router.refresh();
        }, 1500);
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
            <div>
              <FormInput
                  label="URL (slug) *"
                  value={slug}
                  onChange={handleSlugChange}
                  required
                  placeholder="my-article"
                  disabled={isSubmitting}
              />
              {/* Предупреждение о недопустимых символах */}
              {slugWarning && (
                  <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                    <span>⚠️</span> {slugWarning}
                  </p>
              )}
              {/* Подсказка по формату */}
              <p className="text-xs text-gray-500 mt-1">
                Только латинские буквы, цифры, дефисы (-) и нижние подчеркивания (_)
              </p>
              {/* Предпросмотр URL */}
              {slug && !slugWarning && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ URL: /lib/articles/{slug}
                  </p>
              )}
            </div>
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

          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Автор <span className="text-xs text-gray-500">(начните вводить фамилию)</span>
            </label>

            {/* Поле поиска */}
            <input
                ref={inputRef}
                type="text"
                value={authorSearch}
                onChange={(e) => {
                  setAuthorSearch(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) {
                    setAuthorId("");
                    setAuthorName("");
                  }
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Иванов Иван Иванович"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
                disabled={isSubmitting}
                autoComplete="off"
            />

            {/* Кнопка очистки */}
            {authorId && (
                <button
                    type="button"
                    onClick={clearAuthor}
                    className="absolute right-3 top-[42px] text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
            )}

            {/* Выпадающий список с результатами */}
            {showDropdown && (authorSearch || filteredAuthors.length > 0) && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredAuthors.length > 0 ? (
                      filteredAuthors.map((author: any) => (
                          <div
                              key={author.id}
                              onClick={() => selectAuthor(author)}
                              className={`
                      px-4 py-3 cursor-pointer hover:bg-[#5858E2]/5 border-b border-gray-100 last:border-0
                      ${author.id === authorId ? 'bg-[#5858E2]/10' : ''}
                    `}
                          >
                            <div className="font-medium text-gray-900">{author.fullName}</div>
                            {author.shortBio && (
                                <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                  {author.shortBio}
                                </div>
                            )}
                          </div>
                      ))
                  ) : (
                      <div className="px-4 py-3 text-gray-500">
                        Ничего не найдено
                      </div>
                  )}
                </div>
            )}

            {/* Подсказка */}
            <p className="text-xs text-gray-500 mt-2">
              {psychologists.length} психологов доступно для выбора
            </p>
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