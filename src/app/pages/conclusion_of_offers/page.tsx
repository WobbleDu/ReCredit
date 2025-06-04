'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

interface OfferData {
  id_offer: number;
  owner_id: number;
  guest_id: number | null;
  type: string;
  creditsum: number;
  interestrate: number;
  state: number;
  datestart: string;
  dateend: string;
}

interface UserData {
  id_user: number;
  login: string;
  firstname: string;
  lastname: string;
  phonenumber: string;
  inn: string;
  income: number;
}

const DealPage: React.FC = () => {
  const router = useRouter();
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [owner, setOwner] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const id_offer = localStorage.getItem('offerId');
        
        if (!id_offer) {
          throw new Error('ID предложения не найден в localStorage');
        }

        // Получаем данные предложения
        const offerResponse = await fetch(`http://localhost:3001/offers/${id_offer}`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        const offerText = await offerResponse.text();
        if (!offerResponse.ok) {
          throw new Error(offerText.startsWith('<!') ? 'Сервер вернул HTML вместо JSON' : offerText);
        }

        const offerData: OfferData = JSON.parse(offerText);
        setOffer(offerData);

        // Получаем данные владельца
        const ownerResponse = await fetch(`http://localhost:3001/users/${offerData.owner_id}`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        const ownerText = await ownerResponse.text();
        if (!ownerResponse.ok) {
          throw new Error(ownerText.startsWith('<!') ? 'Сервер вернул HTML вместо JSON' : ownerText);
        }

        const ownerData: UserData = JSON.parse(ownerText);
        setOwner(ownerData);

      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

const handleDealSubmit = async () => {
  try {
    setLoading(true);
    setError('');
    setSuccess('');

    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('Пользователь не авторизован');
    }

    if (!offer) {
      throw new Error('Данные предложения не загружены');
    }

    // Проверка, что пользователь не владелец предложения
    if (parseInt(userId) === offer.owner_id) {
      throw new Error('Вы не можете принять собственное предложение');
    }

    const currentDate = new Date().toISOString().split('T')[0];

    // Обновляем предложение
    const offerResponse = await fetch(`http://localhost:3001/offers/${offer.id_offer}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id_offer: offer.id_offer,
        owner_id: offer.owner_id,
        guest_id: parseInt(userId),
        type: offer.type,
        creditsum: offer.creditsum,
        interestrate: offer.interestrate,
        state: 1,
        datestart: currentDate,
        dateend: offer.dateend
      }),
    });

    // Подробная обработка ошибок обновления предложения
    if (!offerResponse.ok) {
      const errorText = await offerResponse.text();
      console.error('Ошибка обновления предложения:', errorText);
      throw new Error(`Не удалось обновить предложение: ${errorText}`);
    }

    const updatedOffer = await offerResponse.json();
    
    // Создаем уведомления
    try {
      const notificationText = `Предложение по ${offer.type} на сумму ${offer.creditsum}₽ принято`;
      
      // Уведомление владельцу
      await fetch('http://localhost:3001/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: offer.owner_id,
          text: notificationText,
          flag: false,
          datetime: currentDate
        }),
      });

      // Уведомление гостю
      await fetch('http://localhost:3001/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          text: `Вы приняли ${notificationText.toLowerCase()}`,
          flag: false,
          datetime: currentDate
        }),
      });
    } catch (notificationError) {
      console.error('Ошибка создания уведомлений:', notificationError);
      // Продолжаем выполнение, даже если уведомления не создались
    }

    setSuccess('Сделка успешно заключена!');
    setOffer(updatedOffer);
    router.push('/pages');
  } catch (err) {
    console.error('Ошибка при заключении сделки:', err);
    setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 57px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 57px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'red' }}>{error}</div>
      </div>
    );
  }

  if (!offer || !owner) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 57px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Данные не найдены</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 57px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
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
          Детали сделки
        </h2>

        {success && (
          <div style={{
            backgroundColor: '#dcfce7',
            color: '#166534',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {success}
          </div>
        )}

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

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Информация о предложении</h3>
          <div style={infoGrid}>
            <div style={infoItem}>
              <span style={infoLabel}>Тип:</span>
              <span style={infoValue}>{offer.type}</span>
            </div>
            <div style={infoItem}>
              <span style={infoLabel}>Сумма:</span>
              <span style={infoValue}>{offer.creditsum} ₽</span>
            </div>
            <div style={infoItem}>
              <span style={infoLabel}>Процентная ставка:</span>
              <span style={infoValue}>{offer.interestrate}%</span>
            </div>
            <div style={infoItem}>
              <span style={infoLabel}>Статус:</span>
              <span style={infoValue}>
                {offer.state === 0 ? 'На рассмотрении' : offer.state === 1 ? 'В работе' : 'Завершено'}
              </span>
            </div>
            <div style={infoItem}>
              <span style={infoLabel}>Дата начала:</span>
              <span style={infoValue}>{offer.datestart || 'Не указана'}</span>
            </div>
            <div style={infoItem}>
              <span style={infoLabel}>Дата окончания:</span>
              <span style={infoValue}>{offer.dateend}</span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Информация о владельце</h3>
          <div style={infoGrid}>
            <div style={infoItem}>
              <span style={infoLabel}>Имя:</span>
              <span style={infoValue}>{owner.firstname} {owner.lastname}</span>
            </div>
            <div style={infoItem}>
              <span style={infoLabel}>Телефон:</span>
              <span style={infoValue}>{owner.phonenumber}</span>
            </div>
            <div style={infoItem}>
              <span style={infoLabel}>ИНН:</span>
              <span style={infoValue}>{owner.inn}</span>
            </div>
            <div style={infoItem}>
              <span style={infoLabel}>Доход:</span>
              <span style={infoValue}>{owner.income} ₽</span>
            </div>
          </div>
        </div>

        {offer.state === 0 && (
          <button
            onClick={handleDealSubmit}
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
            {loading ? 'Обработка...' : 'Заключить сделку'}
          </button>
        )}

        {offer.state === 1 && (
          <div style={{
            padding: '12px',
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            borderRadius: '6px',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            Сделка уже заключена
          </div>
        )}
      </div>
    </div>
  );
};

// Стили для информации
const infoGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: '16px'
};

const infoItem = {
  display: 'flex',
  flexDirection: 'column' as const,
  padding: '12px',
  backgroundColor: '#f9fafb',
  borderRadius: '6px'
};

const infoLabel = {
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '4px'
};

const infoValue = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#111827'
};

export default DealPage;