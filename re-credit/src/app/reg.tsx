'use client'
  
  import React, { useState } from 'react';
  
  const RegistrationForm: React.FC = () => {
    const [formData, setFormData] = useState({
      login: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      phoneNumber: '',
      inn: '',
      passportSerie: '',
      passportNumber: '',
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
  
      // Валидация
      if (formData.password !== formData.confirmPassword) {
        setError('Пароли не совпадают');
        setLoading(false);
        return;
      }
  
      try {
        // Имитация API запроса
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Сохраняем данные в localStorage (для демо)
        localStorage.setItem('userData', JSON.stringify(formData));
  
        // Перенаправляем на страницу предложений
        window.location.href = '/main_offers.tsx';
      } catch (err) {
        setError('Ошибка при регистрации');
      } finally {
        setLoading(false);
      }
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
              <label htmlFor="firstName" style={labelStyle}>Имя*</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                maxLength={50}
                style={inputStyle}
              />
            </div>
  
            <div>
              <label htmlFor="lastName" style={labelStyle}>Фамилия*</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                maxLength={50}
                style={inputStyle}
              />
            </div>
  
            <div>
              <label htmlFor="birthDate" style={labelStyle}>Дата рождения*</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
  
            <div>
              <label htmlFor="phoneNumber" style={labelStyle}>Телефон*</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
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
              <label htmlFor="passportSerie" style={labelStyle}>Серия паспорта*</label>
              <input
                type="number"
                id="passportSerie"
                name="passportSerie"
                value={formData.passportSerie}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
  
            <div>
              <label htmlFor="passportNumber" style={labelStyle}>Номер паспорта*</label>
              <input
                type="number"
                id="passportNumber"
                name="passportNumber"
                value={formData.passportNumber}
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
              <a 
                href="/auth.tsx" 
                style={{
                  color: '#4f46e5',
                  fontWeight: '500',
                  textDecoration: 'none'
                }}
              >
                Войти
              </a>
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