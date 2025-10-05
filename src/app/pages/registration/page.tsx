'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

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
      alert("Аккаунт создан!");
      localStorage.setItem('userId', data.id_user);
      router.push('/pages/lk/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.title}>Регистрация</h2>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Логин и пароль */}
          <div className={styles.formGroup}>
            <label htmlFor="login" className={styles.label}>Логин*</label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              required
              maxLength={50}
              className={styles.input}
              placeholder="Введите логин"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Пароль*</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              maxLength={50}
              className={styles.input}
              placeholder="Введите пароль"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Подтвердите пароль*</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              maxLength={50}
              className={styles.input}
              placeholder="Повторите пароль"
            />
          </div>

          {/* Личные данные */}
          <div className={styles.formGroup}>
            <label htmlFor="firstname" className={styles.label}>Имя*</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              required
              maxLength={50}
              className={styles.input}
              placeholder="Введите имя"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastname" className={styles.label}>Фамилия*</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
              maxLength={50}
              className={styles.input}
              placeholder="Введите фамилию"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="birthdate" className={styles.label}>Дата рождения*</label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phonenumber" className={styles.label}>Телефон*</label>
            <input
              type="tel"
              id="phonenumber"
              name="phonenumber"
              value={formData.phonenumber}
              onChange={handleChange}
              required
              maxLength={50}
              className={styles.input}
              placeholder="Введите телефон"
            />
          </div>

          {/* Документы */}
          <div className={styles.formGroup}>
            <label htmlFor="inn" className={styles.label}>ИНН*</label>
            <input
              type="text"
              id="inn"
              name="inn"
              value={formData.inn}
              onChange={handleChange}
              required
              maxLength={50}
              className={styles.input}
              placeholder="Введите ИНН"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="passportserie" className={styles.label}>Серия паспорта*</label>
            <input
              type="number"
              id="passportserie"
              name="passportserie"
              value={formData.passportserie}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Серия"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="passportnumber" className={styles.label}>Номер паспорта*</label>
            <input
              type="number"
              id="passportnumber"
              name="passportnumber"
              value={formData.passportnumber}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Номер"
            />
          </div>

          {/* Финансы и страна */}
          <div className={styles.formGroup}>
            <label htmlFor="income" className={styles.label}>Доход</label>
            <input
              type="number"
              id="income"
              name="income"
              value={formData.income}
              onChange={handleChange}
              step="0.01"
              className={styles.input}
              placeholder="Введите доход"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="country" className={styles.label}>Страна*</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="">Выберите страну</option>
              <option value="Россия">Россия</option>
              <option value="Казахстан">Казахстан</option>
              <option value="Беларусь">Беларусь</option>
              <option value="Узбекистан">Узбекистан</option>
              <option value="other">Другая</option>
            </select>
          </div>

          <div className={styles.formGroupFull}>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
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
          >
            Войти
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;