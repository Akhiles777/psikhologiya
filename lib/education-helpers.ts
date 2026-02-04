// lib/education-helpers.ts

/**
 * Парсит данные об образовании из базы данных
 */
export function parseEducationFromDB(education: any): any[] {
  if (!education) return [];
  
  try {
    // Если education уже массив, возвращаем как есть
    if (Array.isArray(education)) {
      return education.map(item => {
        if (!item || typeof item !== 'object') return null;
        
        // Проверяем, какая структура используется
        const hasNewStructure = 'year' in item || 'type' in item || 'organization' in item || 'title' in item;
        const hasOldStructure = 'institution' in item || 'specialty' in item || 'degree' in item;
        
        if (hasNewStructure) {
          // Новая структура: year, type, organization, title, isDiploma
          return {
            year: String(item.year || ''),
            type: String(item.type || ''),
            organization: String(item.organization || ''),
            title: String(item.title || ''),
            isDiploma: Boolean(item.isDiploma)
          };
        } else if (hasOldStructure) {
          // Старая структура: institution, specialty, year, degree
          return {
            institution: String(item.institution || ''),
            specialty: String(item.specialty || ''),
            year: String(item.year || ''),
            degree: String(item.degree || '')
          };
        }
        
        // Если структура неизвестна, создаем объект с новой структурой
        return {
          year: '',
          type: '',
          organization: '',
          title: '',
          isDiploma: false
        };
      }).filter(Boolean);
    }
    
    // Если это JSON строка, парсим
    if (typeof education === 'string') {
      const parsed = JSON.parse(education);
      return Array.isArray(parsed) ? parsed : [];
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing education:', error);
    return [];
  }
}

/**
 * Нормализует данные об образовании для отправки на сервер
 * Конвертирует в новую структуру: year, type, organization, title, isDiploma
 */
export function normalizeEducationForServer(education: any[]): any[] {
  if (!Array.isArray(education)) return [];
  
  return education.map(item => {
    if (!item || typeof item !== 'object') return null;
    
    // Проверяем, какая структура используется
    const hasNewStructure = 'year' in item || 'type' in item || 'organization' in item || 'title' in item;
    const hasOldStructure = 'institution' in item || 'specialty' in item || 'degree' in item;
    
    if (hasNewStructure) {
      // Новая структура: year, type, organization, title, isDiploma
      return {
        year: String(item.year || ''),
        type: String(item.type || ''),
        organization: String(item.organization || ''),
        title: String(item.title || ''),
        isDiploma: Boolean(item.isDiploma)
      };
    } else if (hasOldStructure) {
      // Старая структура: institution, specialty, year, degree
      // Конвертируем в новую структуру
      return {
        year: String(item.year || ''),
        type: item.degree ? 'диплом' : 'сертификат',
        organization: String(item.institution || ''),
        title: String(item.specialty || ''),
        isDiploma: Boolean(item.degree)
      };
    }
    
    // Если структура неизвестна, возвращаем пустой объект с новой структурой
    return {
      year: '',
      type: '',
      organization: '',
      title: '',
      isDiploma: false
    };
  }).filter(Boolean);
}

/**
 * Проверяет, есть ли данные об образовании
 */
export function hasEducationData(education: any[]): boolean {
  if (!Array.isArray(education) || education.length === 0) return false;
  
  return education.some(item => {
    if (!item || typeof item !== 'object') return false;
    
    // Проверяем по новой структуре
    if (item.year || item.type || item.organization || item.title) {
      return true;
    }
    
    // Проверяем по старой структуре
    if (item.institution || item.specialty || item.year || item.degree) {
      return true;
    }
    
    return false;
  });
}

/**
 * Форматирует образование для отображения на сайте
 */
export function formatEducationForDisplay(education: any[]): string[] {
  if (!Array.isArray(education) || education.length === 0) {
    return ['Образование не указано'];
  }
  
  return education.map(item => {
    if (!item || typeof item !== 'object') return '';
    
    const parts = [];
    
    if (item.year) parts.push(`(${item.year})`);
    if (item.type) parts.push(item.type);
    if (item.organization) parts.push(item.organization);
    if (item.title) parts.push(`"${item.title}"`);
    
    // Альтернативно, для старой структуры
    if (item.institution) parts.push(item.institution);
    if (item.specialty) parts.push(`- ${item.specialty}`);
    if (item.degree) parts.push(`(${item.degree})`);
    
    const result = parts.join(' ');
    return result || 'Не указано';
  }).filter(item => item && item.trim() !== '');
}