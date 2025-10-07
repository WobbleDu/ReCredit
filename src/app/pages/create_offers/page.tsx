'use client'

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import styles from './styles.module.css';

interface OfferFormData {
  type: string;
  creditsum: string;
  interestrate: string;
}

const CreateOfferPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<OfferFormData>({
    type: '',
    creditsum: '',
    interestrate: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Валидация данных
    if (!formData.type || !formData.creditsum || !formData.interestrate) {
      setError('Пожалуйста, заполните все обязательные поля');
      setLoading(false);
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('Пользователь не авторизован');
      }

      const offerData = {
        owner_id: parseInt(userId),
        type: formData.type,
        creditsum: parseFloat(formData.creditsum),
        interestrate: parseFloat(formData.interestrate),
        state: 0
      };

      const response = await fetch('http://localhost:3001/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при создании предложения');
      }

      // После успешного создания - переход в профиль
      router.push('/pages/profile/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.title}>
          Создать новое предложение
        </h2>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="type" className={styles.label}>Тип предложения*</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className={styles.input}
            >
              <option value="">Выберите тип</option>
              <option value="Кредит">Кредит</option>
              <option value="Инвестиция">Инвестиция</option>
              <option value="Займ">Займ</option>
              <option value="Депозит">Депозит</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="creditsum" className={styles.label}>Сумма*</label>
            <input
              type="number"
              id="creditsum"
              name="creditsum"
              value={formData.creditsum}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="100000"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="interestrate" className={styles.label}>Процентная ставка*</label>
            <input
              type="number"
              id="interestrate"
              name="interestrate"
              value={formData.interestrate}
              onChange={handleChange}
              required
              min="0"
              max="100"
              step="0.1"
              placeholder="10.5"
              className={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
            style={{
              opacity: loading ? 0.7 : 1,
              pointerEvents: loading ? 'none' : 'auto'
            }}
          >
            {loading ? 'Создание...' : 'Создать предложение'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateOfferPage;