"use client";

import { deletePage } from "@/lib/actions/admin-pages";

export function DeletePageButton({ id }: { id: string }) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!confirm("Удалить эту страницу?")) {
      e.preventDefault();
    }
  }

  return (
    <form action={deletePage.bind(null, id)} onSubmit={handleSubmit} className="inline">
      <button
        type="submit"
        className="rounded-xl border border-red-200 bg-red-50 px-6 py-2 font-medium text-red-700 hover:bg-red-100"
      >
        Удалить
      </button>
    </form>
  );
}
