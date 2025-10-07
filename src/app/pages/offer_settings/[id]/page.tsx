// page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './styles.module.css';

interface Offer {
  id_offer: number;
  type: string;
  creditsum: number;
  interestrate: number;
  state: number;
  datestart: string | null;
  dateend: string | null;
  owner_id: number | null;
  guest_id: number | null;
}

const OfferSettingsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    creditsum: 0,
    interestrate: 0,
    type: ''
  });
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        setLoading(true);
        const userIdFromStorage = localStorage.getItem('userId');
        if (!userIdFromStorage) {
          throw new Error('Пользователь не авторизован');
        }
        const userIdNumber = Number(userIdFromStorage);
        setUserId(userIdNumber);

        const offerId = localStorage.getItem('offerId');
        const response = await fetch(`http://localhost:3001/offers/${id}`);
        if (!response.ok) {
          throw new Error('Не удалось загрузить предложение');
        }

        const offerData = await response.json();
        
        // Проверяем, является ли пользователь владельцем предложения
        if (userIdNumber !== offerData.owner_id) {
          throw new Error('Вы не являетесь владельцем этого предложения');
        }

        setOffer(offerData);
        setFormData({
          creditsum: offerData.creditsum,
          interestrate: offerData.interestrate,
          type: offerData.type
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'creditsum' || name === 'interestrate' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!offer || !userId) return;

      const updateData = {
        id_offer: offer.id_offer,
        owner_id: offer.owner_id,
        guest_id: offer.guest_id,
        type: formData.type,
        creditsum: formData.creditsum,
        interestrate: formData.interestrate,
        state: offer.state,
        datestart: offer.datestart,
        dateend: offer.dateend
      };

      const response = await fetch(`http://localhost:3001/offers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить предложение');
      }

      const result = await response.json();
      if (result.success) {
        alert('Предложение успешно обновлено');
        router.push(`/pages/profile/${userId}`);
      } else {
        throw new Error('Ошибка при обновлении предложения');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при обновлении');
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    if (confirm('Вы уверены, что хотите удалить это предложение?')) {
      try {
        const response = await fetch(`http://localhost:3001/offers/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Не удалось удалить предложение');
        }

        alert('Предложение успешно удалено');
        router.push(`/pages/profile/${userId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при удалении');
      }
    }
  };

  const handleBackToProfile = () => {
    if (userId) {
      router.push(`/pages/profile/${userId}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Загрузка данных предложения...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button 
            onClick={handleBackToProfile}
            className={styles.backButton}
          >
            Вернуться в профиль
          </button>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Предложение не найдено</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Шапка */}
        <header className={styles.header}>
          <h1 className={styles.title}>Редактирование предложения</h1>
          <div className={styles.headerControls}>
            <button 
              onClick={handleBackToProfile}
              className={styles.navButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Назад к профилю
            </button>
          </div>
        </header>

        {/* Основное содержимое */}
        <section className={styles.formSection}>
          <div className={styles.sectionContainer}>
            <h3 className={styles.sectionTitle}>Основные параметры</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="type" className={styles.formLabel}>
                  Тип предложения
                </label>
                <input
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="creditsum" className={styles.formLabel}>
                  Сумма кредита (₽)
                </label>
                <input
                  type="number"
                  id="creditsum"
                  name="creditsum"
                  value={formData.creditsum}
                  onChange={handleChange}
                  className={styles.formInput}
                  min="1000"
                  step="1000"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="interestrate" className={styles.formLabel}>
                  Процентная ставка (%)
                </label>
                <input
                  type="number"
                  id="interestrate"
                  name="interestrate"
                  value={formData.interestrate}
                  onChange={handleChange}
                  className={styles.formInput}
                  min="1"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>
                  Сохранить изменения
                </button>
                <button 
                  type="button" 
                  className={styles.deleteButton}
                  onClick={handleDelete}
                >
                  Удалить предложение
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OfferSettingsPage;