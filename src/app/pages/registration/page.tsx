'use client'

import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import styles from './styles.module.css';

interface RegistrationFormData {
  login: string;
  password: string;
  confirmPassword: string;
  firstname: string;
  lastname: string;
  birthdate: string;
  phonenumber: string;
  inn: string;
  passportserie: string;
  passportnumber: string;
  income: string;
  country: string;
}

const RegistrationForm: React.FC = () => {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    clearErrors,
    setValue,
    trigger
  } = useForm<RegistrationFormData>({
    defaultValues: {
      login: '',
      password: '',
      confirmPassword: '',
      firstname: '',
      lastname: '',
      birthdate: '',
      phonenumber: '',
      inn: '',
      passportserie: '',
      passportnumber: '',
      income: '',
      country: ''
    }
  });

  // Мемоизированные функции для масок ввода
  const formatPassportSerie = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 4);
    return numbers;
  }, []);

  const formatPassportNumber = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 6);
    return numbers;
  }, []);

  const formatINN = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 12);
    return numbers;
  }, []);

  const formatPhone = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, '');
    let cleanNumbers = numbers;
    if (numbers.startsWith('7') || numbers.startsWith('8')) {
      cleanNumbers = '7' + numbers.slice(1);
    }
    cleanNumbers = cleanNumbers.slice(0, 11);
    
    if (cleanNumbers.length === 0) return '+7 ';
    
    const match = cleanNumbers.match(/^7?(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    if (!match) return '+7 ';
    
    let formatted = '+7';
    if (match[1]) formatted += ` (${match[1]}`;
    if (match[2]) formatted += `) ${match[2]}`;
    if (match[3]) formatted += `-${match[3]}`;
    if (match[4]) formatted += `-${match[4]}`;
    
    return formatted;
  }, []);

  // Обработчики изменения полей с масками
  const handlePassportSerieChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPassportSerie(e.target.value);
    setValue('passportserie', formattedValue);
    trigger('passportserie');
  }, [setValue, trigger, formatPassportSerie]);

  const handlePassportNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPassportNumber(e.target.value);
    setValue('passportnumber', formattedValue);
    trigger('passportnumber');
  }, [setValue, trigger, formatPassportNumber]);

  const handleINNChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatINN(e.target.value);
    setValue('inn', formattedValue);
    trigger('inn');
  }, [setValue, trigger, formatINN]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhone(e.target.value);
    setValue('phonenumber', formattedValue);
    trigger('phonenumber');
  }, [setValue, trigger, formatPhone]);

  const onSubmit = useCallback(async (data: RegistrationFormData) => {
    clearErrors();
    
    try {
      // Подготовка данных для отправки
      const { confirmPassword, ...userData } = data;

      // Используем AbortController для контроля времени выполнения запроса
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // Отправка данных на сервер
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Ошибка регистрации');
      }
      
      // Сохранение в localStorage
      localStorage.setItem('userId', responseData.id_user);
      
      // Если регистрация успешна
      alert("Аккаунт создан!");
      router.push('/pages/lk/');
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('root', {
            type: 'manual',
            message: 'Превышено время ожидания ответа от сервера'
          });
        } else {
          setError('root', {
            type: 'manual',
            message: err.message
          });
        }
      } else {
        setError('root', {
          type: 'manual',
          message: 'Ошибка регистрации'
        });
      }
    }
  }, [clearErrors, router, setError]);

  const handleLoginClick = useCallback(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Регистрация</h2>

        {errors.root && (
          <div className={styles.error}>
            {errors.root.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          {/* Логин и пароль */}
          <div className={styles.formGroup}>
            <label htmlFor="login" className={styles.label}>Логин*</label>
            <input
              type="text"
              id="login"
              className={`${styles.input} ${errors.login ? styles.inputError : ''}`}
              placeholder="Введите логин"
              {...register('login', {
                required: 'Поле логин обязательно для заполнения',
                minLength: {
                  value: 3,
                  message: 'Логин должен содержать минимум 3 символа'
                },
                maxLength: {
                  value: 50,
                  message: 'Логин не должен превышать 50 символов'
                }
              })}
            />
            {errors.login && (
              <span className={styles.fieldError}>{errors.login.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Пароль*</label>
            <input
              type="password"
              id="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Введите пароль"
              {...register('password', {
                required: 'Поле пароль обязательно для заполнения',
                minLength: {
                  value: 6,
                  message: 'Пароль должен содержать минимум 6 символов'
                },
                maxLength: {
                  value: 50,
                  message: 'Пароль не должен превышать 50 символов'
                }
              })}
            />
            {errors.password && (
              <span className={styles.fieldError}>{errors.password.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Подтвердите пароль*</label>
            <input
              type="password"
              id="confirmPassword"
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              placeholder="Повторите пароль"
              {...register('confirmPassword', {
                required: 'Подтверждение пароля обязательно',
                validate: value => value === watch('password') || 'Пароли не совпадают'
              })}
            />
            {errors.confirmPassword && (
              <span className={styles.fieldError}>{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Личные данные */}
          <div className={styles.formGroup}>
            <label htmlFor="firstname" className={styles.label}>Имя*</label>
            <input
              type="text"
              id="firstname"
              className={`${styles.input} ${errors.firstname ? styles.inputError : ''}`}
              placeholder="Введите имя"
              {...register('firstname', {
                required: 'Поле имя обязательно для заполнения',
                maxLength: {
                  value: 50,
                  message: 'Имя не должно превышать 50 символов'
                }
              })}
            />
            {errors.firstname && (
              <span className={styles.fieldError}>{errors.firstname.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastname" className={styles.label}>Фамилия*</label>
            <input
              type="text"
              id="lastname"
              className={`${styles.input} ${errors.lastname ? styles.inputError : ''}`}
              placeholder="Введите фамилию"
              {...register('lastname', {
                required: 'Поле фамилия обязательно для заполнения',
                maxLength: {
                  value: 50,
                  message: 'Фамилия не должна превышать 50 символов'
                }
              })}
            />
            {errors.lastname && (
              <span className={styles.fieldError}>{errors.lastname.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="birthdate" className={styles.label}>Дата рождения*</label>
            <input
              type="date"
              id="birthdate"
              className={`${styles.input} ${errors.birthdate ? styles.inputError : ''}`}
              {...register('birthdate', {
                required: 'Поле дата рождения обязательно для заполнения',
                validate: value => {
                  const birthDate = new Date(value);
                  const today = new Date();
                  const age = today.getFullYear() - birthDate.getFullYear();
                  return age >= 18 || 'Вы должны быть старше 18 лет';
                }
              })}
            />
            {errors.birthdate && (
              <span className={styles.fieldError}>{errors.birthdate.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phonenumber" className={styles.label}>Телефон*</label>
            <input
              type="tel"
              id="phonenumber"
              className={`${styles.input} ${errors.phonenumber ? styles.inputError : ''}`}
              placeholder="+7 (999) 999-99-99"
              {...register('phonenumber', {
                required: 'Поле телефон обязательно для заполнения',
                pattern: {
                  value: /^[\+]?[0-9\s\-\(\)]+$/,
                  message: 'Введите корректный номер телефона'
                },
                maxLength: {
                  value: 50,
                  message: 'Телефон не должен превышать 50 символов'
                }
              })}
              onChange={handlePhoneChange}
            />
            {errors.phonenumber && (
              <span className={styles.fieldError}>{errors.phonenumber.message}</span>
            )}
          </div>

          {/* Документы */}
          <div className={styles.formGroup}>
            <label htmlFor="inn" className={styles.label}>ИНН*</label>
            <input
              type="text"
              id="inn"
              className={`${styles.input} ${errors.inn ? styles.inputError : ''}`}
              placeholder="123456789012"
              {...register('inn', {
                required: 'Поле ИНН обязательно для заполнения',
                pattern: {
                  value: /^\d+$/,
                  message: 'ИНН должен содержать только цифры'
                },
                maxLength: {
                  value: 50,
                  message: 'ИНН не должен превышать 50 символов'
                }
              })}
              onChange={handleINNChange}
              maxLength={12}
            />
            {errors.inn && (
              <span className={styles.fieldError}>{errors.inn.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="passportserie" className={styles.label}>Серия паспорта*</label>
            <input
              type="text"
              id="passportserie"
              className={`${styles.input} ${errors.passportserie ? styles.inputError : ''}`}
              placeholder="1234"
              {...register('passportserie', {
                required: 'Поле серия паспорта обязательно для заполнения',
                min: {
                  value: 1000,
                  message: 'Серия паспорта должна быть 4-значным числом'
                },
                max: {
                  value: 9999,
                  message: 'Серия паспорта должна быть 4-значным числом'
                }
              })}
              onChange={handlePassportSerieChange}
              maxLength={4}
            />
            {errors.passportserie && (
              <span className={styles.fieldError}>{errors.passportserie.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="passportnumber" className={styles.label}>Номер паспорта*</label>
            <input
              type="text"
              id="passportnumber"
              className={`${styles.input} ${errors.passportnumber ? styles.inputError : ''}`}
              placeholder="123456"
              {...register('passportnumber', {
                required: 'Поле номер паспорта обязательно для заполнения',
                min: {
                  value: 100000,
                  message: 'Номер паспорта должен быть 6-значным числом'
                },
                max: {
                  value: 999999,
                  message: 'Номер паспорта должен быть 6-значным числом'
                }
              })}
              onChange={handlePassportNumberChange}
              maxLength={6}
            />
            {errors.passportnumber && (
              <span className={styles.fieldError}>{errors.passportnumber.message}</span>
            )}
          </div>

          {/* Финансы и страна */}
          <div className={styles.formGroup}>
            <label htmlFor="income" className={styles.label}>Доход</label>
            <input
              type="number"
              id="income"
              className={`${styles.input} ${errors.income ? styles.inputError : ''}`}
              placeholder="Введите доход"
              step="0.01"
              {...register('income', {
                min: {
                  value: 0,
                  message: 'Доход не может быть отрицательным'
                }
              })}
            />
            {errors.income && (
              <span className={styles.fieldError}>{errors.income.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="country" className={styles.label}>Страна*</label>
            <select
              id="country"
              className={`${styles.select} ${errors.country ? styles.selectError : ''}`}
              {...register('country', {
                required: 'Поле страна обязательно для заполнения',
                validate: value => value !== '' || 'Выберите страну'
              })}
            >
              <option value="">Выберите страну</option>
              <option value="Россия">Россия</option>
              <option value="Казахстан">Казахстан</option>
              <option value="Беларусь">Беларусь</option>
              <option value="Узбекистан">Узбекистан</option>
              <option value="other">Другая</option>
            </select>
            {errors.country && (
              <span className={styles.fieldError}>{errors.country.message}</span>
            )}
          </div>

          <div className={styles.formGroupFull}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>

        <div className={styles.footer}>
          <span className={styles.footerText}>
            Уже есть аккаунт?{' '}
          </span>
          <button
            onClick={handleLoginClick}
            className={styles.loginButton}
            type="button"
          >
            Войти
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;