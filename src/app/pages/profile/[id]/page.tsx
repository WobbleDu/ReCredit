'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

interface UserData {
  ID_User: number;
  login: string;
  firstname: string;
  lastname: string;
  birthdate: string;
  phonenumber: string;
  inn: string;
  PassportSerie: number;
  PassportNumber: number;
  income: number;
  country: string;
  dti: number;
}

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
  owner_firstname: string | null;
  owner_lastname: string | null;
}

interface LendOffer extends Offer {
  funded?: number;
}

interface Notification {
  id_notifications: number;
  user_id: number;
  text: string;
  flag: boolean;
  datetime: string;
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'borrow' | 'lend'>('borrow');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [borrowOffers, setBorrowOffers] = useState<Offer[]>([]);
  const [lendOffers, setLendOffers] = useState<LendOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const router = useRouter();

  const handleOfferClick = (offer: Offer) => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      alert('Пользователь не авторизован');
      return;
    }

    if (offer.guest_id && Number(userId) === offer.guest_id) {
      localStorage.setItem('offerId', offer.id_offer.toString());
      router.push(`/pages/payments/${offer.id_offer}`);
    } else {
      alert('Эта сделка уже была заключена другим пользователем');
    }
  };

  const handleSettingsClick = (offerId: Number) => {
    const offer = lendOffers.find(o => o.id_offer === offerId);
    if (offer?.state !== 0) {
      alert('Настройки доступны только для неактивных предложений');
      return;
    }
    else {router.push(`/pages/offer_settings/${offerId}`)}
  };

  const formatBirthDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Неверная дата';
      return date.toLocaleDateString('ru-RU');
    } catch {
      return 'Неверная дата';
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatus = (state: number) => {
    switch(state) {
      case 0: return 'Не активен';
      case 1: return 'Активен';
      case 2: return 'Завершен';
      default: return 'Неизвестен';
    }
  };

  const calculateTerm = (start: string | null, end: string | null): string => {
    if (!start || !end) return 'Не указан';
    
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime())) return 'Неверная дата начала';
      if (isNaN(endDate.getTime())) return 'Неверная дата окончания';
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 
        + (endDate.getMonth() - startDate.getMonth());
      
      return `${months} месяцев`;
    } catch {
      return 'Ошибка расчета';
    }
  };

  const updateNotificationOnServer = async (notificationId: number, isRead: boolean) => {
    try {
      const response = await fetch(`http://localhost:3001/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flag: isRead }),
      });
      
      if (!response.ok) {
        throw new Error('Не удалось обновить уведомление');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при обновлении уведомления:', error);
      throw error;
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await updateNotificationOnServer(id, true);
      setNotifications(notifications.map(n => 
        n.id_notifications === id ? { ...n, flag: true } : n
      ));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Ошибка при пометке уведомления как прочитанного:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.flag)
        .map(n => n.id_notifications);
      
      await Promise.all(
        unreadIds.map(id => updateNotificationOnServer(id, true))
      );
      
      setNotifications(notifications.map(n => ({ ...n, flag: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Ошибка при пометке всех уведомлений как прочитанных:', error);
    }
  };

  const openAllNotifications = () => {
    router.push('/pages/notifications');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error('Пользователь не авторизован');
        
        // Загрузка данных пользователя
        const userResponse = await fetch(`http://localhost:3001/users/${userId}`);
        if (!userResponse.ok) {
          throw new Error(`Ошибка пользователя: ${userResponse.status}`);
        }
        const userData = await userResponse.json();
        setUserData(userData);

        // Загрузка всех предложений
        const offersResponse = await fetch('http://localhost:3001/offers');
        if (!offersResponse.ok) {
          throw new Error(`Ошибка предложений: ${offersResponse.status}`);
        }
        
        const contentLength = offersResponse.headers.get('Content-Length');
        if (contentLength === '0') { const allOffers = []; return}
        const allOffers = await offersResponse.json();
        const numericUserId = parseInt(userId, 10);

        const borrows = allOffers.filter((offer: Offer) => 
          offer.guest_id != null && Number(offer.guest_id) === numericUserId
        );

        const lends = allOffers.filter((offer: Offer) => 
          offer.owner_id != null && Number(offer.owner_id) === numericUserId
        );

        setBorrowOffers(borrows);
        setLendOffers(lends);

        // Загрузка уведомлений
        const responseNotifications = await fetch(`http://localhost:3001/user/${userId}/notifications`);
        if (!responseNotifications.ok) {
          throw new Error('Не удалось загрузить уведомления');
        }

        const notiResponseLen = responseNotifications.headers.get('Content-Length');
        if (notiResponseLen === '0') {setNotifications([]); return}
        const notificationsData = await responseNotifications.json();
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter((n: { flag: any; }) => !n.flag).length);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const displayedNotifications = notifications.slice(0, 5);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Шапка */}
        <header className={styles.header}>
          <h1 className={styles.title}>Профиль пользователя</h1>
          <h2 className={styles.userFullName}>
            {userData.lastname} {userData.firstname}
          </h2>
          <div className={styles.headerControls}>
            <div className={styles.notificationWrapper}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`${styles.notificationButton} ${showNotifications ? styles.notificationButtonActive : ''}`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="#2c3e50"/>
                </svg>
                {unreadCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className={styles.notificationDropdown}>
                  <div className={styles.notificationHeader}>
                    <h3>Уведомления</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className={styles.markAllReadButton}
                      >
                        Прочитать все
                      </button>
                    )}
                  </div>
                  {displayedNotifications.length === 0 ? (
                    <div className={styles.noNotifications}>
                      Нет новых уведомлений
                    </div>
                  ) : (
                    <>
                      {displayedNotifications.map((notification) => (
                        <div 
                          key={notification.id_notifications}
                          onClick={() => markAsRead(notification.id_notifications)}
                          className={`${styles.notificationItem} ${notification.flag ? '' : styles.unreadNotification}`}
                        >
                          <div className={styles.notificationText}>
                            {notification.text}
                          </div>
                          <div className={styles.notificationDate}>
                            {formatDate(notification.datetime)}
                          </div>
                        </div>
                      ))}
                      <div 
                        onClick={openAllNotifications}
                        className={styles.showAllNotifications}
                      >
                        Показать все уведомления
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => router.push('/pages')}
              className={styles.navButton}
            >
              Главная
            </button>
            <button 
              onClick={() => router.push('/pages/lk')}
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
              {userData.firstname?.charAt(0)}{userData.lastname?.charAt(0)}
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
      Мои займы ({borrowOffers.length})
    </button>
    <button
      className={`${styles.tabButton} ${activeTab === 'lend' ? styles.activeTab : ''}`}
      onClick={() => setActiveTab('lend')}
    >
      Мои инвестиции ({lendOffers.length})
    </button>
  </div>

  <div className={styles.offersList}>
    {activeTab === 'borrow' ? (
      borrowOffers.length > 0 ? (
        borrowOffers.map((offer) => (
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
              <p><strong>Срок:</strong> {calculateTerm(offer.datestart, offer.dateend)}</p>
              <p><strong>Дата начала:</strong> {offer.datestart ? formatBirthDate(offer.datestart) : 'не указана'}</p>
              <p><strong>Инвестор:</strong> {offer.owner_firstname ? `${offer.owner_firstname} ${offer.owner_lastname}` : 'не указан'}</p>
            </div>
            {/* Кнопка "Подробнее" на всю ширину для займов */}
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
      lendOffers.length > 0 ? (
        lendOffers.map((offer) => (
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
              <p><strong>Срок:</strong> {calculateTerm(offer.datestart, offer.dateend)}</p>
              <p><strong>Дата начала:</strong> {offer.datestart ? formatBirthDate(offer.datestart) : 'не указана'}</p>
              <p><strong>Заемщик:</strong> {offer.guest_id ? `ID: ${offer.guest_id}` : 'не указан'}</p>
            </div>
            <div className={styles.buttonGroup}>
              {/* Кнопки одинакового размера для инвестиций */}
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