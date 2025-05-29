'use client'
 
import React, { useState } from 'react';

interface UserData {
  ID_User: number;
  Login: string;
  FirstName: string;
  LastName: string;
  BirthDate: string;
  PhoneNumber: string;
  INN: string;
  PassportSerie: number;
  PassportNumber: number;
  Income: number;
  Country: string;
}

const AccountPage: React.FC = () => {
  const [user] = useState<UserData>({
    ID_User: 1,
    Login: 'ivanov',
    FirstName: 'Иван',
    LastName: 'Иванов',
    BirthDate: '1985-05-15',
    PhoneNumber: '+79161234567',
    INN: '123456789012',
    PassportSerie: 1234,
    PassportNumber: 567890,
    Income: 75000.00,
    Country: 'Россия'
  });

  const navigateTo = (page: string) => {
    console.log(`Переход на страницу ${page}`);
    // В реальном приложении: window.location.href = `/${page}`;
  };

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
              onClick={() => navigateTo('profile')}
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
              onClick={() => navigateTo('main_offers')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                color: '#374151',
                cursor: 'pointer'
              }}
            >
              Войти
            </button>
            <button
              onClick={() => navigateTo('notifications')}
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
              onClick={() => navigateTo('create_offers')}
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
                  {user.FirstName}
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
                  {user.LastName}
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
                  {user.BirthDate}
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
                  {user.PhoneNumber}
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
                  {user.INN}
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
                  {user.PassportSerie} {user.PassportNumber}
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
                  {user.Income.toLocaleString('ru-RU')} ₽
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
                  {user.Country}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;