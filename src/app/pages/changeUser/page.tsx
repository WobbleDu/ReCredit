'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styles from './styles.module.css';

interface User {
  id_user: string;
  firstname: string;
  lastname: string;
  birthdate: Date;
  phonenumber: string;
  inn: string;
  passportserie: string;
  passportnumber: string;
  income: number;
  country: string;
  dti: number;
}

const ChangeUserPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    trigger
  } = useForm<User>();

  // Функции для масок
  const formatPassportSerie = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 4);
    return numbers;
  };

  const formatPassportNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 6);
    return numbers;
  };

  const formatINN = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 12);
    return numbers;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(1);
    if (!numbers) return '+7 ';
    
    const match = numbers.match(/^(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    if (!match) return '+7 ';
    
    return '+7 ' + 
      (match[1] ? `(${match[1]}` : '') + 
      (match[2] ? `) ${match[2]}` : '') + 
      (match[3] ? `-${match[3]}` : '') + 
      (match[4] ? `-${match[4]}` : '');
  };

  // Обработчики изменения полей с масками
  const handlePassportSerieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPassportSerie(e.target.value);
    setValue('passportserie', formattedValue);
    trigger('passportserie');
  };

  const handlePassportNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPassportNumber(e.target.value);
    setValue('passportnumber', formattedValue);
    trigger('passportnumber');
  };

  const handleINNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatINN(e.target.value);
    setValue('inn', formattedValue);
    trigger('inn');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhone(e.target.value);
    setValue('phonenumber', formattedValue);
    trigger('phonenumber');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          throw new Error('Пользователь не авторизован');
        }

        const response = await fetch(`http://localhost:3001/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных пользователя');
        }

        const userData = await response.json();
        const formattedUser = {
          ...userData,
          birthdate: new Date(userData.birthdate)
        };
        
        setUser(formattedUser);
        
        // Устанавливаем значения формы после получения данных
        Object.keys(formattedUser).forEach(key => {
          if (key === 'birthdate') {
            setValue(key as keyof User, formattedUser[key].toISOString().split('T')[0] as any);
          } else {
            setValue(key as keyof User, formattedUser[key]);
          }
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [setValue]);

  const onSubmit = async (data: User) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('Пользователь не авторизован');
      }

      // Очищаем телефон от форматирования перед отправкой
      const cleanedData = {
        ...data,
        phonenumber: data.phonenumber.replace(/\D/g, ''),
        birthdate: new Date(data.birthdate).toISOString().split('T')[0]
      };

      const response = await fetch(`http://localhost:3001/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Не удалось обновить данные: ${errorText}`);
      }

      setSuccess('Данные успешно обновлены!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Загрузка данных пользователя...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Данные пользователя не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Изменение личных данных
          </h2>
        </div>

        {success && (
          <div className={styles.successMessage}>
            {success}
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGrid}>
            <div>
              <h3 className={styles.sectionTitle}>
                Личная информация
              </h3>
              <div className={styles.sectionContainer}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Имя
                  </label>
                  <input
                    type="text"
                    {...register('firstname', { required: 'Имя обязательно' })}
                    className={`${styles.input} ${errors.firstname ? styles.inputError : ''}`}
                  />
                  {errors.firstname && (
                    <p className={styles.errorText}>{errors.firstname.message}</p>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Фамилия
                  </label>
                  <input
                    type="text"
                    {...register('lastname', { required: 'Фамилия обязательна' })}
                    className={`${styles.input} ${errors.lastname ? styles.inputError : ''}`}
                  />
                  {errors.lastname && (
                    <p className={styles.errorText}>{errors.lastname.message}</p>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Дата рождения
                  </label>
                  <input
                    type="date"
                    {...register('birthdate', { required: 'Дата рождения обязательна' })}
                    className={`${styles.input} ${errors.birthdate ? styles.inputError : ''}`}
                  />
                  {errors.birthdate && (
                    <p className={styles.errorText}>{errors.birthdate.message}</p>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Телефон
                  </label>
                  <input
                    type="tel"
                    {...register('phonenumber', { 
                      required: 'Телефон обязателен',
                      validate: value => value.replace(/\D/g, '').length === 11 || 'Номер телефона должен содержать 11 цифр'
                    })}
                    onChange={handlePhoneChange}
                    className={`${styles.input} ${errors.phonenumber ? styles.inputError : ''}`}
                    placeholder="+7 (999) 999-99-99"
                  />
                  {errors.phonenumber && (
                    <p className={styles.errorText}>{errors.phonenumber.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className={styles.sectionTitle}>
                Документы и финансы
              </h3>
              <div className={styles.sectionContainer}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    ИНН
                  </label>
                  <input
                    type="text"
                    {...register('inn', { 
                      required: 'ИНН обязателен',
                      minLength: { value: 12, message: 'ИНН должен содержать 12 цифр' },
                      maxLength: { value: 12, message: 'ИНН должен содержать 12 цифр' },
                      pattern: {
                        value: /^\d{12}$/,
                        message: 'ИНН должен содержать только цифры'
                      }
                    })}
                    onChange={handleINNChange}
                    className={`${styles.input} ${errors.inn ? styles.inputError : ''}`}
                    placeholder="123456789012"
                    maxLength={12}
                  />
                  {errors.inn && (
                    <p className={styles.errorText}>{errors.inn.message}</p>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Серия паспорта
                  </label>
                  <input
                    type="text"
                    {...register('passportserie', { 
                      required: 'Серия паспорта обязательна',
                      minLength: { value: 4, message: 'Серия паспорта должна содержать 4 цифры' },
                      maxLength: { value: 4, message: 'Серия паспорта должна содержать 4 цифры' },
                      pattern: {
                        value: /^\d{4}$/,
                        message: 'Серия паспорта должна содержать только цифры'
                      }
                    })}
                    onChange={handlePassportSerieChange}
                    className={`${styles.input} ${errors.passportserie ? styles.inputError : ''}`}
                    placeholder="1234"
                    maxLength={4}
                  />
                  {errors.passportserie && (
                    <p className={styles.errorText}>{errors.passportserie.message}</p>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Номер паспорта
                  </label>
                  <input
                    type="text"
                    {...register('passportnumber', { 
                      required: 'Номер паспорта обязателен',
                      minLength: { value: 6, message: 'Номер паспорта должен содержать 6 цифр' },
                      maxLength: { value: 6, message: 'Номер паспорта должен содержать 6 цифр' },
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'Номер паспорта должен содержать только цифры'
                      }
                    })}
                    onChange={handlePassportNumberChange}
                    className={`${styles.input} ${errors.passportnumber ? styles.inputError : ''}`}
                    placeholder="123456"
                    maxLength={6}
                  />
                  {errors.passportnumber && (
                    <p className={styles.errorText}>{errors.passportnumber.message}</p>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Доход (руб.)
                  </label>
                  <input
                    type="number"
                    {...register('income', { 
                      required: 'Доход обязателен',
                      min: { value: 0, message: 'Доход не может быть отрицательным' }
                    })}
                    className={`${styles.input} ${errors.income ? styles.inputError : ''}`}
                  />
                  {errors.income && (
                    <p className={styles.errorText}>{errors.income.message}</p>
                  )}
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    Страна
                  </label>
                  <input
                    type="text"
                    {...register('country', { required: 'Страна обязательна' })}
                    className={`${styles.input} ${errors.country ? styles.inputError : ''}`}
                  />
                  {errors.country && (
                    <p className={styles.errorText}>{errors.country.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => router.back()}
              className={styles.cancelButton}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeUserPage;