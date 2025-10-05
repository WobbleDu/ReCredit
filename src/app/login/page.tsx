'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

interface LoginFormProps {
  onLoginSuccess?: (user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!login || !password) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка авторизации');
      }
      localStorage.setItem('userId', data.user_id);
      router.push('/pages');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    router.push('/pages/registration');
  };

  return (
    <div className={styles.mainDiv}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>Вход в систему</h2>
        {error && (<div className={styles.divError}>{error}</div>)}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="email" className={styles.loginFormLabel}>Логин</label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className={styles.loginFormInput}
              placeholder="Введите ваш логин" />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" className={styles.loginFormLabel}>
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.loginFormInput}
              placeholder="Введите ваш пароль" />
          </div>

          <div className={styles.divForRememberMe}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={styles.loginFormInputFlag} />
              <label htmlFor="remember-me" className={styles.loginFormLabelFlag}>
                Запомнить меня
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={styles.loginSubmit}
            style={{
              opacity: loading ? 0.5 : 1,
              pointerEvents: loading ? 'none' : 'auto'
            }}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className={styles.divForRegisterButton}>
          <span className={styles.divForRegisterButtonSpan}>
            Ещё нет аккаунта?
          </span>
          <button
            onClick={handleRegisterClick}
            className={styles.noAccount}>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;