'use client'

import React, { useState, useEffect } from 'react';

interface LoginFormProps {
  onRegisterClick: () => void;
  onLoginSuccess: (user: any) => void; // Добавляем user в параметры
}

interface User {
  id: number;
  login: string;
  password: string;
  // другие поля пользователя, если есть
}

const LoginForm: React.FC<LoginFormProps> = ({ onRegisterClick, onLoginSuccess }) => {
  const [login, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Загружаем пользователей при монтировании компонента
  useEffect(() => {
    getUsers();
  }, []);

  function getUsers() {
    fetch('http://localhost:3001')
      .then(response => {
        if (!response.ok) throw new Error('Ошибка сервера');
        return response.json();
      })
      .then(data => {
        setUsers(data);
      })
      .catch(err => {
        console.error('Ошибка загрузки пользователей:', err);
        setError('Ошибка загрузки данных сервера');
      });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Валидация полей
    if (!login || !password) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }

    try {
      // Ищем пользователя в загруженных данных
      const user = users.find(u => u.login === login && u.password === password);
      
      if (user) {
        // Если нужно запомнить пользователя, сохраняем в localStorage
        if (rememberMe) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        // Передаем данные пользователя в onLoginSuccess
        onLoginSuccess(user);
      } else {
        throw new Error('Неверные учетные данные');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Логин:</label>
        <input 
          type="text" 
          value={login} 
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>
      <div>
        <label>Пароль:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>
      <div>
        <label>
          <input 
            type="checkbox" 
            checked={rememberMe} 
            onChange={(e) => setRememberMe(e.target.checked)} 
          />
          Запомнить меня
        </label>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Вход...' : 'Войти'}
      </button>
      <button type="button" onClick={onRegisterClick}>
        Регистрация
      </button>
    </form>
  );
};

export default LoginForm;