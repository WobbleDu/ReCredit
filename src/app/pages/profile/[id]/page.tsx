'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouterActions } from '../../../hooks/useRouterActions';
import { useCalculations } from '../../../hooks/useCalculations';
import styles from './styles.module.css';
import { NotificationBell } from '@src/app/components/notificationBell';
import { Offer, UserData, Notification } from '../../../types';

interface LendOffer extends Offer {
  funded?: number;
  term?: string;
}

const ProfilePage: React.FC = () => {
  const { push, openCabinet, openHome } = useRouterActions();
  const { calculateTerm, sortNotifications } = useCalculations();
  
  const [activeTab, setActiveTab] = useState<'borrow' | 'lend'>('borrow');
  const [userData, setUserData] = useState<UserData>();
  const [borrowOffers, setBorrowOffers] = useState<Offer[]>([]);
  const [lendOffers, setLendOffers] = useState<LendOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setNotifications] = useState<Notification[]>([]);
  const [, setUnreadCount] = useState(0);

  // Мемоизированные функции
  const handleOfferClick = useCallback((offer: Offer) => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      alert('Пользователь не авторизован');
      return;
    }

    if (offer.guest_id && Number(userId) === offer.guest_id) {
      localStorage.setItem('offerId', offer.id_offer.toString());
      localStorage.setItem('userId', userId);
      push(`/pages/payments/${offer.id_offer}`);
    } else {
      alert('Эта сделка уже была заключена другим пользователем');
    }
  }, [push]);

  const handleSettingsClick = useCallback((offerId: number) => {
    const offer = lendOffers.find(o => o.id_offer === offerId);
    if (offer?.state !== 0) {
      alert('Настройки доступны только для неактивных предложений');
      return;
    }
    push(`/pages/offer_settings/${offerId}`);
  }, [lendOffers, push]);

  // Мемоизированные утилиты
  const formatBirthDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Неверная дата';
      return date.toLocaleDateString('ru-RU');
    } catch {
      return 'Неверная дата';
    }
  }, []);

  const getStatus = useCallback((state: number) => {
    switch(state) {
      case 0: return 'Не активен';
      case 1: return 'Активен';
      case 2: return 'Завершен';
      default: return 'Неизвестен';
    }
  }, []);

  // Параллельная загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error('Пользователь не авторизован');

        // Параллельная загрузка всех данных
        const [userResponse, offersResponse, notificationsResponse] = await Promise.all([
          fetch(`http://localhost:3001/users/${userId}`),
          fetch('http://localhost:3001/offers'),
          fetch(`http://localhost:3001/user/${userId}/notifications`)
        ]);

        // Обработка результатов
        if (!userResponse.ok) {
          throw new Error(`Ошибка пользователя: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        setUserData(userData);

        // Обработка предложений
        if (offersResponse.ok) {
          const contentLength = offersResponse.headers.get('Content-Length');
          if (contentLength !== '0') {
            const allOffers = await offersResponse.json();
            const numericUserId = parseInt(userId, 10);

            // Фильтрация в основном потоке (легкая операция)
            const borrows = allOffers.filter((offer: Offer) => 
              offer.guest_id != null && Number(offer.guest_id) === numericUserId
            );

            const lends = allOffers.filter((offer: Offer) => 
              offer.owner_id != null && Number(offer.owner_id) === numericUserId
            );

            // Параллельное вычисление сроков для всех оферов с использованием хука
            const borrowsWithTerms = await Promise.all(
              borrows.map(async (offer: Offer) => ({
                ...offer,
                term: await calculateTerm(offer.datestart, offer.dateend)
              }))
            );

            const lendsWithTerms = await Promise.all(
              lends.map(async (offer: Offer) => ({
                ...offer,
                term: await calculateTerm(offer.datestart, offer.dateend)
              }))
            );

            setBorrowOffers(borrowsWithTerms);
            setLendOffers(lendsWithTerms);
          }
        }

        // Обработка уведомлений с использованием хука
        if (notificationsResponse.ok) {
          const notiResponseLen = notificationsResponse.headers.get('Content-Length');
          if (notiResponseLen !== '0') {
            const notificationsData = await notificationsResponse.json();
            
            // Используем хук для сортировки уведомлений
            const { sorted, unreadCount } = await sortNotifications(notificationsData);
            setNotifications(sorted);
            setUnreadCount(unreadCount);
          }
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [calculateTerm, sortNotifications]);

  // Мемоизированные данные для рендеринга
  const memoizedBorrowOffers = useMemo(() => borrowOffers, [borrowOffers]);
  const memoizedLendOffers = useMemo(() => lendOffers, [lendOffers]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>Пользователь не найден</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Шапка */}
        <header className={styles.header}>
          <h1 className={styles.title}>Профиль пользователя : {userData.lastname} {userData.firstname}
          </h1>    
          <div className={styles.headerControls}>
            <NotificationBell
              userId={userData.id_user}
              maxDisplayed={5}
            />
            
            <button 
              onClick={openHome}
              className={styles.navButton}
            >
              Главная
            </button>
            <button 
              onClick={openCabinet}
              className={styles.cabinetButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="white"/>
              </svg>
              Личный кабинет
            </button>
          </div>
        </header>

        {/* Информация о пользователе */}
        <section className={styles.profileSection}>
          <div className={styles.profileInfo}>
            <div className={styles.avatarPlaceholder}>
              {userData.firstname?.[0]?.toUpperCase() || 'U'}{userData.lastname?.[0]?.toUpperCase() || ''}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userDetailItem}>
                <span className={styles.userDetailLabel}>Телефон:</span>
                <span className={styles.userDetailValue}>{userData.phonenumber || 'не указан'}</span>
              </div>
              <div className={styles.userDetailItem}>
                <span className={styles.userDetailLabel}>Дата рождения:</span>
                <span className={styles.userDetailValue}>{userData.birthdate ? formatBirthDate(userData.birthdate) : 'не указана'}</span>
              </div>
              <div className={styles.userDetailItem}>
                <span className={styles.userDetailLabel}>Страна:</span>
                <span className={styles.userDetailValue}>{userData.country || 'не указана'}</span>
              </div>
              <div className={styles.userDetailItem}>
                <span className={styles.userDetailLabel}>Доход:</span>
                <span className={styles.userDetailValue}>{userData.income?.toLocaleString('ru-RU') || '0'} ₽</span>
              </div>
              <div className={styles.userDetailItem}>
                <span className={styles.userDetailLabel}>Кредитный рейтинг:</span>
                <span className={styles.userDetailValue}>{(userData.dti * 1).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Табы с предложениями */}
        <section className={styles.tabsSection}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabButton} ${activeTab === 'borrow' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('borrow')}
            >
              Мои займы ({memoizedBorrowOffers.length})
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'lend' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('lend')}
            >
              Мои инвестиции ({memoizedLendOffers.length})
            </button>
          </div>

          <div className={styles.offersList}>
            {activeTab === 'borrow' ? (
              memoizedBorrowOffers.length > 0 ? (
                memoizedBorrowOffers.map((offer) => (
                  <div key={offer.id_offer} className={styles.offerCard}>
                    <div className={styles.offerHeader}>
                      <h3 className={styles.offerTitle}>{offer.type || 'Тип не указан'}</h3>
                      <span className={`${styles.statusBadge} ${
                        offer.state === 1 ? styles.activeBadge : 
                        offer.state === 2 ? styles.completedBadge : styles.pendingBadge
                      }`}>
                        {getStatus(offer.state)}
                      </span>
                    </div>
                    <div className={styles.offerDetails}>
                      <p><strong>Сумма:</strong> {(offer.creditsum ?? 0).toLocaleString('ru-RU')} ₽</p>
                      <p><strong>Ставка:</strong> {offer.interestrate || '0'}%</p>
                      <p><strong>Срок:</strong> {(offer as LendOffer).term || 'Не указан'}</p>
                      <p><strong>Дата начала:</strong> {offer.datestart ? formatBirthDate(offer.datestart) : 'не указана'}</p>
                      <p><strong>Инвестор:</strong> {offer.owner_firstname ? `${offer.owner_firstname} ${offer.owner_lastname}` : 'не указан'}</p>
                    </div>
                    <button 
                      className={styles.fullWidthButton}
                      onClick={() => handleOfferClick(offer)}
                    >
                      Подробнее
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.noOffers}>Нет активных займов</p>
              )
            ) : (
              memoizedLendOffers.length > 0 ? (
                memoizedLendOffers.map((offer) => (
                  <div key={offer.id_offer} className={styles.offerCard}>
                    <div className={styles.offerHeader}>
                      <h3 className={styles.offerTitle}>{offer.type}</h3>
                      <span className={`${styles.statusBadge} ${
                        offer.state === 1 ? styles.activeBadge : 
                        offer.state === 2 ? styles.completedBadge : styles.pendingBadge
                      }`}>
                        {getStatus(offer.state)}
                      </span>
                    </div>
                    <div className={styles.offerDetails}>
                      <p><strong>Сумма:</strong> {(offer.creditsum ?? 0).toLocaleString('ru-RU')} ₽</p>
                      <p><strong>Ставка:</strong> {offer.interestrate || '0'}%</p>
                      <p><strong>Срок:</strong> {offer.term || 'Не указан'}</p>
                      <p><strong>Дата начала:</strong> {offer.datestart ? formatBirthDate(offer.datestart) : 'не указана'}</p>
                      <p><strong>Заемщик:</strong> {offer.guest_id ? `ID: ${offer.guest_id}` : 'не указан'}</p>
                    </div>
                    <div className={styles.buttonGroup}>
                      <button 
                        className={`${styles.equalWidthButton} ${styles.detailsButtonEqual}`}
                        onClick={() => handleOfferClick(offer)}
                      >
                        Подробнее
                      </button>
                      <button 
                        className={`${styles.equalWidthButton} ${styles.settingsButtonEqual}`}
                        onClick={() => handleSettingsClick(offer.id_offer)}
                      >
                        Настройки
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.noOffers}>Нет активных инвестиций</p>
              )
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;