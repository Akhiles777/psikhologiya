// components/admin/EducationFormEdit.tsx
"use client";

import { useState, useEffect } from "react";
import type { EducationItem } from "@/lib/education-helpers";

type Props = {
  initialData: EducationItem[];
};

export function EducationFormEdit({ initialData }: Props) {

  const [educations, setEducations] = useState<EducationItem[]>(initialData);

  // Синхронизируем с initialData
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setEducations(initialData);
    }
  }, [initialData]);

  const addEducation = () => {
    setEducations([
      ...educations,
      { year: "", type: "", organization: "", title: "", isDiploma: false }
    ]);
  };

  const removeEducation = (index: number) => {
    if (educations.length <= 1) {
      setEducations([{ year: "", type: "", organization: "", title: "", isDiploma: false }]);
    } else {
      const newEducations = [...educations];
      newEducations.splice(index, 1);
      setEducations(newEducations);
    }
  };

console.log(educations)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Образование и сертификации
        </label>
        <span className="text-xs text-gray-500">
          {educations.filter(e => e.year && e.type && e.organization && e.title).length} заполненных
        </span>
      </div>
      
      <div className="space-y-4">
        {educations.map((edu, index) => (
          <div key={index} className="relative p-4 border border-gray-300 rounded-lg bg-gray-50">
            {/* Кнопка удаления */}
            {educations.length > 1 && (
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600"
                title="Удалить запись"
              >
                ✕
              </button>
            )}

            {/* ПОЛЯ ФОРМЫ С ДЕЙСТВИТЕЛЬНЫМИ ДАННЫМИ ИЗ БД */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Год */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Год получения документа
                </label>
                <input
                  type="text"
                  name={`education[${index}][year]`}
                  defaultValue={edu.year}
                  placeholder="2023"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5858E2] focus:ring-1 focus:ring-[#5858E2]"
                />
              </div>

              {/* Тип документа */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Тип образования
                </label>
                <select
                  name={`education[${index}][type]`}
                  defaultValue={edu.type}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5858E2] focus:ring-1 focus:ring-[#5858E2]"
                >
                  <option value="">Выберите тип...</option>
                  <option value="диплом">Диплом</option>
                  <option value="сертификат">Сертификат</option>
                  <option value="удостоверение">Удостоверение</option>
            
                </select>
              </div>

              {/* Организация */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Название организации, выдавшей документ
                </label>
                <input
                  type="text"
                  name={`education[${index}][organization]`}
                  defaultValue={edu.organization}
                  placeholder="МГУ им. М.В. Ломоносова"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5858E2] focus:ring-1 focus:ring-[#5858E2]"
                />
              </div>

              {/* Название документа */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Название документа
                </label>
                <input
                  type="text"
                  name={`education[${index}][title]`}
                  defaultValue={edu.title}
                  placeholder="Психология, клиническая психология..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#5858E2] focus:ring-1 focus:ring-[#5858E2]"
                />
              </div>
            </div>

            {/* Чекбокс диплома */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name={`education[${index}][isDiploma]`}
                  defaultChecked={edu.isDiploma}
                  className="h-4 w-4 text-[#5858E2] rounded focus:ring-[#5858E2]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Это диплом
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка добавления */}
      <button
        type="button"
        onClick={addEducation}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#5858E2] hover:text-[#4848d0] border border-[#5858E2] rounded-lg hover:bg-[#5858E2]/5 transition-colors"
      >
        Добавить еще образование
      </button>

      {/* Скрытое поле с количеством записей */}
      <input
        type="hidden"
        name="education_count"
        value={educations.length}
      />
    </div>
  );
}