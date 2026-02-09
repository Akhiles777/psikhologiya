'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from './LoginForm';

// Компонент с useSearchParams должен быть обернут в Suspense
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const redirect = searchParams.get('redirect') || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      setLoginError(decodeURIComponent(error));
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }

      // Проверяем роль пользователя
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.role === 'MANAGER') {
        router.push('/managers');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      setLoginError(error.message || 'Неверный email или пароль');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'ADMIN' | 'MANAGER') => {
    const DEFAULT_ADMIN = {
      email: process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL || 'Gasan123',
      password: process.env.NEXT_PUBLIC_DEFAULT_ADMIN_PASSWORD || '1111'
    };

    if (role === 'ADMIN') {
      setFormData({
        email: DEFAULT_ADMIN.email,
        password: DEFAULT_ADMIN.password,
      });
    } else {
      // Для менеджера - пример
      setFormData({
        email: 'manager@example.com',
        password: 'password123',
      });
    }
  };

  return (
    <LoginForm
      formData={formData}
      setFormData={setFormData}
      loginError={loginError}
      isLoading={isLoading}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      handleSubmit={handleSubmit}
      handleDemoLogin={handleDemoLogin}
    />
  );
}

// Основной компонент с Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка формы входа...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}