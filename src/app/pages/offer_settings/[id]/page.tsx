'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div style={{ color: 'red', textAlign: 'center', padding: '40px' }}>{error}</div>
        <button 
          onClick={handleBackToProfile}
          style={{
            display: 'block',
            margin: '20px auto',
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Вернуться в профиль
        </button>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Предложение не найдено</div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="headerContent">
          <h1 className="title">Редактирование предложения</h1>
          <button 
            onClick={handleBackToProfile}
            className="navButton"
          >
            Назад к профилю
          </button>
        </div>
      </header>

      <section className="formSection">
        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label htmlFor="type">Тип предложения</label>
            <input
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="creditsum">Сумма кредита (₽)</label>
            <input
              type="number"
              id="creditsum"
              name="creditsum"
              value={formData.creditsum}
              onChange={handleChange}
              min="1000"
              step="1000"
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="interestrate">Процентная ставка (%)</label>
            <input
              type="number"
              id="interestrate"
              name="interestrate"
              value={formData.interestrate}
              onChange={handleChange}
              min="1"
              max="100"
              step="0.1"
              required
            />
          </div>

          <div className="formActions">
            <button type="submit" className="saveButton">
              Сохранить изменения
            </button>
            <button 
              type="button" 
              className="deleteButton"
              onClick={handleDelete}
            >
              Удалить предложение
            </button>
          </div>
        </form>
      </section>

      <style jsx>{`
        .container {
          font-family: 'Segoe UI', Roboto, sans-serif;
          color: #333;
          line-height: 1.6;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          background-color: #3498db;
          color: white;
          padding: 20px 0;
          margin-bottom: 30px;
          border-radius: 8px;
        }
        
        .headerContent {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .title {
          margin: 0;
          font-size: 24px;
        }
        
        .navButton {
          padding: 8px 16px;
          background-color: transparent;
          border: 1px solid white;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .navButton:hover {
          background-color: rgba(255,255,255,0.1);
        }
        
        .formSection {
          background-color: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          max-width: 600px;
          margin: 0 auto;
        }
        
        .formGroup {
          margin-bottom: 20px;
        }
        
        .formGroup label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #4b5563;
        }
        
        .formGroup input,
        .formGroup select {
          width: 100%;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .formGroup input:focus,
        .formGroup select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        
        .formActions {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
        }
        
        .saveButton {
          padding: 12px 24px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .saveButton:hover {
          background-color: #2980b9;
        }
        
        .deleteButton {
          padding: 12px 24px;
          background-color: #e74c3c;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .deleteButton:hover {
          background-color: #c0392b;
        }
      `}</style>
    </div>
  );
};

export default OfferSettingsPage;