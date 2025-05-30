'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const RegistrationForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
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
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Проверка паролей
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    // Проверка всех полей
    if (!formData.login || !formData.password || !formData.confirmPassword ||
        !formData.firstname || !formData.lastname || !formData.birthdate ||
        !formData.phonenumber || !formData.inn || !formData.passportserie ||
        !formData.passportnumber || !formData.income || !formData.country) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }

    try {
      // Подготовка данных для отправки (убираем confirmPassword)
      const { confirmPassword, ...userData } = formData;

      // Отправка данных на сервер
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка регистрации');
      }

      // Если регистрация успешна
      router.push('/pages/lk/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };
  const handleLoginClick = () => {
    router.push('http://localhost:3000');
  };
  
    return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        padding: '24px',
        overflowY: 'auto',
        maxHeight: '90vh'
      }}>
        <h2 style={{
          marginBottom: '24px',
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: '600',
          color: '#111827'
        }}>
          Регистрация
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Логин и пароль */}
          <div>
            <label htmlFor="login" style={labelStyle}>Логин*</label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              maxLength={50}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="password" style={labelStyle}>Пароль*</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              maxLength={50}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" style={labelStyle}>Подтвердите пароль*</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              maxLength={50}
              style={inputStyle}
            />
          </div>

          {/* Личные данные */}
          <div>
            <label htmlFor="firstname" style={labelStyle}>Имя*</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              required
              maxLength={50}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="lastname" style={labelStyle}>Фамилия*</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
              maxLength={50}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="birthdate" style={labelStyle}>Дата рождения*</label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="phonenumber" style={labelStyle}>Телефон*</label>
            <input
              type="tel"
              id="phonenumber"
              name="phonenumber"
              value={formData.phonenumber}
              onChange={handleChange}
              required
              maxLength={50}
              style={inputStyle}
            />
          </div>

          {/* Документы */}
          <div>
            <label htmlFor="inn" style={labelStyle}>ИНН*</label>
            <input
              type="text"
              id="inn"
              name="inn"
              value={formData.inn}
              onChange={handleChange}
              required
              maxLength={50}
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="passportserie" style={labelStyle}>Серия паспорта*</label>
            <input
              type="number"
              id="passportserie"
              name="passportserie"
              value={formData.passportserie}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="passportnumber" style={labelStyle}>Номер паспорта*</label>
            <input
              type="number"
              id="passportnumber"
              name="passportnumber"
              value={formData.passportnumber}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* Финансы и страна */}
          <div>
            <label htmlFor="income" style={labelStyle}>Доход</label>
            <input
              type="number"
              id="income"
              name="income"
              value={formData.income}
              onChange={handleChange}
              step="0.01"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="country" style={labelStyle}>Страна*</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Выберите страну</option>
              <option value="RU">Россия</option>
              <option value="KZ">Казахстан</option>
              <option value="BY">Беларусь</option>
              <option value="UZ">Узбекистан</option>
              <option value="other">Другая</option>
            </select>
          </div>

          <div style={{ gridColumn: 'span 2', marginTop: '16px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4f46e5',
                color: 'white',
                fontWeight: '500',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1,
                pointerEvents: loading ? 'none' : 'auto'
              }}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Уже есть аккаунт?{' '}
            <button
              onClick={handleLoginClick}
              style={{
                fontSize: '0.875rem',
                color: '#4f46e5',
                fontWeight: '500',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Войти
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
  
  // Стили для повторного использования
  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  };
  
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  };
  
  export default RegistrationForm;