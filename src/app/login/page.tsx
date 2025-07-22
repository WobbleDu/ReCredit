'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './style.css';
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
    <div className='MainDiv'>
      <div className='FormContainer'>
        <h2>Вход в систему</h2>
        {error && (<div className='DivError'>{error}</div>)}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" className='LoginForm-label'>Логин</label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className='LoginForm-input'
              placeholder="Ваш логин" />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" className='LoginForm-label'>
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='LoginForm-input'
              placeholder="••••••••" />
          </div>

          <div className='DivForRememberMe'>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className='LoginForm-input-flag' />
              <label htmlFor="remember-me" className='LoginForm-label-flag'>
                Запомнить меня
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className='LoginSubmit'
            style={{
              opacity: loading ? 0.5 : 1,
              pointerEvents: loading ? 'none' : 'auto'
            }}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className='DivForRegisterButton'>
          <span className='DivForRegisterButtonSpan'>
            Ещё нет аккаунта?
          </span>
          <button
            onClick={handleRegisterClick}
            className='NoAccount'>
            Зарегистрироваться
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
