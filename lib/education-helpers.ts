export interface EducationItem {
  year: string;
  type: string;
  organization: string;
  title: string;
  isDiploma: boolean;
}


export function parseEducationFromDB(data: any): EducationItem[] {
  if (!data) return [{ year: "", type: "", organization: "", title: "", isDiploma: false }];
  
  try {
    if (Array.isArray(data)) {
      const items = data.map(item => {
        // Если item уже объект
        if (item && typeof item === 'object') {
          return {
            year: String(item.year || ""),
            type: String(item.type || ""),
            organization: String(item.organization || ""),
            title: String(item.title || ""),
            isDiploma: Boolean(item.isDiploma)
          };
        }
        // Если item - JSON строка
        if (typeof item === 'string') {
          try {
            const parsed = JSON.parse(item);
            return {
              year: String(parsed.year || ""),
              type: String(parsed.type || ""),
              organization: String(parsed.organization || ""),
              title: String(parsed.title || ""),
              isDiploma: Boolean(parsed.isDiploma)
            };
          } catch {
            return { year: "", type: "", organization: "", title: "", isDiploma: false };
          }
        }
        return { year: "", type: "", organization: "", title: "", isDiploma: false };
      }).filter(item => item.year || item.type || item.organization || item.title);
      
      return items.length > 0 ? items : [{ year: "", type: "", organization: "", title: "", isDiploma: false }];
    }
  } catch (error) {
    console.error("Error parsing education data from DB:", error);
  }
  
  return [{ year: "", type: "", organization: "", title: "", isDiploma: false }];
}