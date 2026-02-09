// utils/manager.ts
import { Manager, ManagerFormData } from '@/types/manager';

// Функция для безопасного преобразования permissions из JSON
export function parsePermissions(permissions: any): Manager['permissions'] {
  if (!permissions) {
    return {
      psychologists: { view: true, edit: false, delete: false },
      pages: { view: true, edit: false, delete: false },
      listdate: { view: true, edit: false, delete: false },
      managers: { view: false, edit: false, delete: false },
    };
  }

  // Если permissions уже объект, проверяем его структуру
  if (typeof permissions === 'object') {
    return {
      psychologists: permissions.psychologists || { view: true, edit: false, delete: false },
      pages: permissions.pages || { view: true, edit: false, delete: false },
      listdate: permissions.listdate || { view: true, edit: false, delete: false },
      managers: permissions.managers || { view: false, edit: false, delete: false },
    };
  }

  // Если это строка, пытаемся распарсить
  if (typeof permissions === 'string') {
    try {
      const parsed = JSON.parse(permissions);
      return parsePermissions(parsed);
    } catch {
      return {
        psychologists: { view: true, edit: false, delete: false },
        pages: { view: true, edit: false, delete: false },
        listdate: { view: true, edit: false, delete: false },
        managers: { view: false, edit: false, delete: false },
      };
    }
  }

  // Возвращаем дефолтные значения
  return {
    psychologists: { view: true, edit: false, delete: false },
    pages: { view: true, edit: false, delete: false },
    listdate: { view: true, edit: false, delete: false },
    managers: { view: false, edit: false, delete: false },
  };
}

// Функция для подготовки данных менеджера для формы
export function prepareManagerForForm(manager: any): ManagerFormData {
  return {
    name: manager.name || '',
    email: manager.email || '',
    phone: manager.phone || '',
    login: manager.login || '',
    role: (manager.role === 'ADMIN' || manager.role === 'MANAGER' ? manager.role : 'MANAGER') as 'ADMIN' | 'MANAGER',
    password: '',
    confirmPassword: '',
    permissions: parsePermissions(manager.permissions),
    status: (manager.status === 'ACTIVE' || manager.status === 'INACTIVE' ? manager.status : 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
  };
}