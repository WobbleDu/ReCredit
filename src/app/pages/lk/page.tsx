'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

interface User {
  id_user: string;
  firstname: string;
  lastname: string;
  birthdate: string;
  phonenumber: string;
  inn: string;
  passportserie: string;
  passportnumber: string;
  income: number;
  country: string;
  dti: number
}

const AccountPage: React.FC = () => {
  const router = useRouter();
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

   // Функции навигации
  const navigateToProfile = () => router.push(`/pages/profile/${user?.id_user}`);
  const navigateToMain = () => router.push('/pages');
  const navigateToNotifications = () => router.push('/pages/notifications');
  const navigateToCreateOffers = () => router.push('/pages/create_offers');

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
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
        height: '100%',
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
        height: '100%'
      }}>
        <p>Данные пользователя не найдены</p>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '64rem',
        width: '100%',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: 'rgb(47 47 47 / 10%) 0px 1px 15px',
        padding: '2rem',
        marginTop: '2rem',
        marginBottom: '2rem',
        height: '100%'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#111827'
          }}>
            Мой аккаунт
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => navigateToProfile()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Профиль
            </button>
            <button
              onClick={() => navigateToMain()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Главное меню
            </button>
            <button
              onClick={() => navigateToNotifications()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Уведомления
            </button>
            <button
              onClick={() => navigateToCreateOffers()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                border: '1px solid #2563eb',
                borderRadius: '0.375rem',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Добавить объявление
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Личная информация
            </h3>
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              padding: '1.5rem'
            }}>
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
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  Фамилия
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: '#111827',
                  fontWeight: '500'
                }}>
                  {user.lastname}
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  Дата рождения
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: '#111827',
                  fontWeight: '500'
                }}>
                  {user.birthdate}
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  Телефон
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: '#111827',
                  fontWeight: '500'
                }}>
                  {user.phonenumber}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Документы и финансы
            </h3>
            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              padding: '1.5rem'
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  ИНН
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: '#111827',
                  fontWeight: '500'
                }}>
                  {user.inn}
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  Паспорт
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: '#111827',
                  fontWeight: '500'
                }}>
                  {user.passportserie} {user.passportnumber}
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  Доход
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: '#111827',
                  fontWeight: '500'
                }}>
                  {user.income.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '0.25rem'
                }}>
                  Страна
                </p>
                <p style={{
                  fontSize: '1rem',
                  color: '#111827',
                  fontWeight: '500'
                }}>
                  {user.country}
                </p>
              </div>
              {user.dti && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem'
                  }}>
                    DTI (Debt-to-Income)
                  </p>
                  <p style={{
                    fontSize: '1rem',
                    color: '#111827',
                    fontWeight: '500'
                  }}>
                    {(user.dti * 1).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;