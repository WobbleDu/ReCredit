'use client'

import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  firstname: string;
  lastname: string;
  birthdate: string;
  phonenumber: string;
  inn: string;
  passportserie: string;
  passportnumber: string;
  income: number;
  country: string;
}

const AccountPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Получаем данные пользователя
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. Получаем userId из localStorage
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          throw new Error('Пользователь не авторизован');
        }

        // 2. Запрашиваем данные пользователя с сервера
        const response = await fetch(`http://localhost:3001/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных пользователя');
        }

        const userData: User = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const navigateTo = (page: string) => {
    console.log(`Переход на страницу ${page}`);
    // В реальном приложении: window.location.href = `/${page}`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <p>Загрузка данных пользователя...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'red'
      }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <p>Данные пользователя не найдены</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '64rem',
        width: '100%',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        marginTop: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Остальной код остается таким же, но используем user из состояния */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '0.25rem'
          }}>
            Имя
          </p>
          <p style={{
            fontSize: '1rem',
            color: '#111827',
            fontWeight: '500'
          }}>
            {user.firstname}
          </p>
        </div>
        
        {/* Остальные поля аналогично */}
      </div>
    </div>
  );
};

export default AccountPage;