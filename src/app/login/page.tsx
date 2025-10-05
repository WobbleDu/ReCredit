'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import styles from './styles.module.css';

interface LoginFormData {
  login: string;
  password: string;
  rememberMe: boolean;
}

const LoginForm: React.FC = () => {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<LoginFormData>({
    defaultValues: {
      login: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    clearErrors();
    
    try {
      const response = await fetch('http://localhost:3001/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          login: data.login, 
          password: data.password 
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Ошибка авторизации');
      }
      
      localStorage.setItem('userId', responseData.user_id);
      
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userLogin', data.login);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userLogin');
      }
      
      router.push('/pages');
    } catch (err) {
      setError('root', {
        type: 'manual',
        message: err instanceof Error ? err.message : 'Ошибка авторизации'
      });
    }
  };

  const handleRegisterClick = () => {
    router.push('/pages/registration');
  };

  return (
    <div className={styles.mainDiv}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Вход в систему</h2>
        
        {errors.root && (
          <div className={styles.divError}>{errors.root.message}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="login" className={styles.loginFormLabel}>
              Логин
            </label>
            <input
              id="login"
              type="text"
              className={`${styles.loginFormInput} ${
                errors.login ? styles.loginFormInputError : ''
              }`}
              placeholder="Введите ваш логин"
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
            <label htmlFor="password" className={styles.loginFormLabel}>
              Пароль
            </label>
            <input
              id="password"
              type="password"
              className={`${styles.loginFormInput} ${
                errors.password ? styles.loginFormInputError : ''
              }`}
              placeholder="Введите ваш пароль"
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

          <div className={styles.divForRememberMe}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                id="remember-me"
                type="checkbox"
                className={styles.loginFormInputFlag}
                {...register('rememberMe')}
              />
              <label htmlFor="remember-me" className={styles.loginFormLabelFlag}>
                Запомнить меня
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.loginSubmit}
          >
            {isSubmitting ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className={styles.divForRegisterButton}>
          <span className={styles.divForRegisterButtonSpan}>
            Ещё нет аккаунта?
          </span>
          <button
            onClick={handleRegisterClick}
            className={styles.noAccount}
            type="button"
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;