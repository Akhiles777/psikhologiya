'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermission: string; // Например: 'psychologists.view', 'pages.edit', 'managers.view'
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requiredPermission, 
  redirectTo = '/managers' 
}: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      try {
        // 1. Проверяем авторизацию
        const authResponse = await fetch('/api/auth/check');
        const authData = await authResponse.json();

        if (!authResponse.ok || !authData.user) {
          router.push('/auth/login');
          return;
        }

        // 2. Проверяем что пользователь менеджер или админ
        if (!['ADMIN', 'MANAGER'].includes(authData.user.role)) {
          router.push('/auth/login?error=Доступ+только+для+менеджеров');
          return;
        }

        const user = authData.user;

        // 3. Разбиваем пермишен на модуль и действие
        const [module, action] = requiredPermission.split('.');

        // 4. Для страницы менеджеров - проверяем роль
        if (module === 'managers' && user.role !== 'ADMIN') {
          router.push('/managers?error=Только+администратор+может+управлять+менеджерами');
          return;
        }

        // 5. Проверяем права доступа к конкретному модулю
        if (user.permissions?.[module]?.[action]) {
          setHasAccess(true);
        } else {
          router.push(`/managers?error=Нет+доступа+к+разделу`);
        }

      } catch (error) {
        console.error('Error checking permission:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    }

    checkPermission();
  }, [requiredPermission, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null; // Реддирект уже произошел
  }

  return <>{children}</>;
}