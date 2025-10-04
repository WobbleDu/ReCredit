'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

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
      <div className={styles.loadingContainer}>
        <div>Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div>{error}</div>
      </div>
    );
  }

  if (!offer || !owner) {
    return (
      <div className={styles.loadingContainer}>
        <div>Данные не найдены</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <h2 className={styles.title}>
          Детали сделки
        </h2>

        {success && (
          <div className={styles.successMessage}>
            {success}
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Информация о предложении</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Тип:</span>
              <span className={styles.infoValue}>{offer.type}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Сумма:</span>
              <span className={styles.infoValue}>{offer.creditsum} ₽</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Процентная ставка:</span>
              <span className={styles.infoValue}>{offer.interestrate}%</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Статус:</span>
              <span className={styles.infoValue}>
                {offer.state === 0 ? 'На рассмотрении' : offer.state === 1 ? 'В работе' : 'Завершено'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Дата начала:</span>
              <span className={styles.infoValue}>{offer.datestart || 'Не указана'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Дата окончания:</span>
              <span className={styles.infoValue}>{offer.dateend}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Информация о владельце</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Имя:</span>
              <span className={styles.infoValue}>{owner.firstname} {owner.lastname}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Телефон:</span>
              <span className={styles.infoValue}>{owner.phonenumber}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>ИНН:</span>
              <span className={styles.infoValue}>{owner.inn}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Доход:</span>
              <span className={styles.infoValue}>{owner.income} ₽</span>
            </div>
          </div>
        </div>

        {offer.state === 0 && (
          <button
            onClick={handleDealSubmit}
            disabled={loading}
            className={styles.submitButton}
            style={{
              opacity: loading ? 0.7 : 1,
              pointerEvents: loading ? 'none' : 'auto'
            }}
          >
            {loading ? 'Обработка...' : 'Заключить сделку'}
          </button>
        )}

        {offer.state === 1 && (
          <div className={styles.statusMessage}>
            Сделка уже заключена
          </div>
        )}
      </div>
    </div>
  );
};

export default DealPage;