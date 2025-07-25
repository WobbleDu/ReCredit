'use client'

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

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
      router.push('/pages/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 57px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        <h2 style={{
          marginBottom: '24px',
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: '600',
          color: '#111827'
        }}>
          Создать новое предложение
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

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="type" style={labelStyle}>Тип предложения*</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Выберите тип</option>
              <option value="Кредит">Кредит</option>
              <option value="Инвестиция">Инвестиция</option>
              <option value="Займ">Займ</option>
              <option value="Депозит">Депозит</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="creditsum" style={labelStyle}>Сумма*</label>
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
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="interestrate" style={labelStyle}>Процентная ставка*</label>
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
              style={inputStyle}
            />
          </div>

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
            {loading ? 'Создание...' : 'Создать предложение'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Стили для формы
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

export default CreateOfferPage;