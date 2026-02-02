'use client';

import { useState, useEffect } from 'react';

export interface EducationItem {
  year?: string;
  type?: string;
  organization?: string;
  title?: string;
  isDiploma?: boolean;
}

interface Props {
  initialData?: EducationItem[];
}

export function EducationFormEdit({ initialData = [] }: Props) {
  // Используем initialData как начальное состояние
  const [education, setEducation] = useState<EducationItem[]>(
    initialData.length > 0 ? initialData : [{ year: '', type: '', organization: '', title: '', isDiploma: false }]
  );

  // Добавляем скрытое поле для количества элементов
  const [educationCount, setEducationCount] = useState(education.length);

  // Синхронизируем счетчик при изменении массива
  useEffect(() => {
    setEducationCount(education.length);
  }, [education]);

  const addEducation = () => {
    setEducation([...education, { year: '', type: '', organization: '', title: '', isDiploma: false }]);
  };

  const removeEducation = (index: number) => {
    if (education.length > 1) {
      const newEducation = [...education];
      newEducation.splice(index, 1);
      setEducation(newEducation);
    }
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: any) => {
    const newEducation = [...education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: field === 'isDiploma' ? Boolean(value) : value,
    };
    setEducation(newEducation);
  };

  // Проверяем данные
  console.log('🎓 EducationFormEdit initialData:', initialData);
  console.log('🎓 EducationFormEdit education state:', education);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Образование и квалификация</h2>
      
      {/* Скрытое поле для количества элементов - ОЧЕНЬ ВАЖНО! */}
      <input 
        type="hidden" 
        name="education_count" 
        value={educationCount} 
      />
      
      {education.map((item, index) => (
        <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-700">Образование #{index + 1}</h3>
            {education.length > 1 && (
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Удалить
              </button>
            )}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Год
              </label>
              <input
                type="text"
                name={`education[${index}][year]`}
                value={item.year || ''}
                onChange={(e) => updateEducation(index, 'year', e.target.value)}
                placeholder="2023"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип
              </label>
              <select
                name={`education[${index}][type]`}
                value={item.type || ''}
                onChange={(e) => updateEducation(index, 'type', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
              >
                <option value="">Выберите тип</option>
                <option value="диплом">Диплом</option>
                <option value="сертификат">Сертификат</option>
                <option value="удостоверение">Удостоверение</option>
                <option value="курс">Курс</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Организация
            </label>
            <input
              type="text"
              name={`education[${index}][organization]`}
              value={item.organization || ''}
              onChange={(e) => updateEducation(index, 'organization', e.target.value)}
              placeholder="Название университета, института, организации..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название программы / специальности
            </label>
            <input
              type="text"
              name={`education[${index}][title]`}
              value={item.title || ''}
              onChange={(e) => updateEducation(index, 'title', e.target.value)}
              placeholder="Психология, Клиническая психология..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-[#5858E2] focus:ring-2 focus:ring-[#5858E2]/20"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name={`education[${index}][isDiploma]`}
              id={`isDiploma-${index}`}
              checked={item.isDiploma || false}
              onChange={(e) => updateEducation(index, 'isDiploma', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#5858E2] focus:ring-[#5858E2]"
            />
            <label htmlFor={`isDiploma-${index}`} className="text-sm text-gray-700">
              Основной диплом психолога
            </label>
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={addEducation}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-colors"
      >
        + Добавить еще образование
      </button>
      
      <p className="text-sm text-gray-500">
        Добавьте все дипломы, сертификаты и курсы психолога. Отметьте основной диплом.
      </p>
    </div>
  );
}