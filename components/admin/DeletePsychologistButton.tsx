"use client";

import { deletePsychologist } from "@/lib/actions/admin-psychologists";
import { useRouter } from "next/navigation";

export function DeletePsychologistButton({ id }: { id: string }) {
  const router = useRouter();
  
  async function handleDelete() {
    if (!confirm("Удалить этого психолога? Это нельзя отменить.")) {
      return;
    }
    
    try {
      // Создаем фиктивный FormData для вызова Server Action
      const formData = new FormData();
      await deletePsychologist(id, formData);
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