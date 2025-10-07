'use client'

import React, { useCallback, useMemo, useEffect } from 'react'; // добавим useEffect
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
    clearErrors,
    setValue, // добавляем setValue для установки значений
    watch // добавляем watch для отслеживания значений
  } = useForm<LoginFormData>({
    defaultValues: useMemo(() => ({
      login: '',
      password: '',
      rememberMe: false
    }), [])
  });

  // Восстановление данных при загрузке компонента
  useEffect(() => {
    // Проверяем, была ли активирована опция "Запомнить меня" ранее
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const savedLogin = localStorage.getItem('userLogin');
    
    if (rememberMe && savedLogin) {
      setValue('rememberMe', true);
      setValue('login', savedLogin);
    }
  }, [setValue]);

  // Мемоизированная функция отправки формы
  const onSubmit = useCallback(async (data: LoginFormData) => {
    clearErrors();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('http://localhost:3001/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          login: data.login, 
          password: data.password 
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Ошибка авторизации');
      }
      
      // Сохраняем userId
      localStorage.setItem('userId', responseData.user_id);
      
      // Обрабатываем rememberMe
      if (data.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userLogin', data.login);
      } else {
        // Если пользователь снял галочку, очищаем сохраненные данные
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userLogin');
      }
      
      router.push('/pages');
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
          message: 'Ошибка авторизации'
        });
      }
    }
  }, [clearErrors, router, setError]);

  // Мемоизированная функция перехода к регистрации
  const handleRegisterClick = useCallback(() => {
    router.push('/pages/registration');
  }, [router]);

  // Мемоизированные пропсы для регистрации полей формы
  const loginRegisterProps = useMemo(() => 
    register('login', {
      required: 'Поле логин обязательно для заполнения',
      minLength: {
        value: 3,
        message: 'Логин должен содержать минимум 3 символа'
      },
      maxLength: {
        value: 50,
        message: 'Логин не должен превышать 50 символов'
      }
    }), [register]);

  const passwordRegisterProps = useMemo(() => 
    register('password', {
      required: 'Поле пароль обязательно для заполнения',
      minLength: {
        value: 6,
        message: 'Пароль должен содержать минимум 6 символов'
      },
      maxLength: {
        value: 50,
        message: 'Пароль не должен превышать 50 символов'
      }
    }), [register]);

  const rememberMeRegisterProps = useMemo(() => 
    register('rememberMe'), [register]);

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
              {...loginRegisterProps}
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
              {...passwordRegisterProps}
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
                {...rememberMeRegisterProps}
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