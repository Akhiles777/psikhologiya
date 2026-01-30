"use client";

import { deletePage } from "@/lib/actions/admin-pages";
import { useRouter } from "next/navigation";

export function DeletePageButton({ id }: { id: string }) {
  const router = useRouter();
  
  async function handleDelete() {
    if (!confirm("Удалить эту страницу?")) {
      return;
    }
    
    try {
      // Создаем фиктивный FormData если нужно
      const formData = new FormData();
      // В зависимости от сигнатуры функции:
      await deletePage(id); // или deletePage(id, formData)
      router.refresh();
    } catch (error) {
      console.error("Ошибка удаления:", error);
      
    }
  }

  return (
    <button
      onClick={handleDelete}
      type="button"
      className="rounded-xl border border-red-200 bg-red-50 px-6 py-2 font-medium text-red-700 hover:bg-red-100"
    >
      Удалить
    </button>
  );
}