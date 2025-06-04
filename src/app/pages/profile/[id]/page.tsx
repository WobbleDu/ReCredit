'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div style={{ color: 'red', textAlign: 'center', padding: '40px' }}>{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Пользователь не найден</div>
      </div>
    );
  }

  return (
    <div className="container" style={{height: '100%'}}>
      <header className="header">
        <div className="headerContent">
          <h1 className="title">Профиль пользователя</h1>
          <nav className="nav">
            <div style={{ position: 'relative', marginRight: '10px' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  padding: 8,
                  borderRadius: 50,
                  backgroundColor: showNotifications ? '#e1e1e1' : 'transparent'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="white"/>
                </svg>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 50,
                  width: 300,
                  backgroundColor: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  borderRadius: 8,
                  zIndex: 100,
                  maxHeight: 400,
                  overflowY: 'auto'
                }}>
                  <div style={{ 
                    padding: 15, 
                    borderBottom: '1px solid #e1e1e1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h3 style={{ margin: 0, fontSize: 16, color: '#2c3e50' }}>Уведомления</h3>
                    <button 
                      onClick={markAllAsRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#3498db',
                        cursor: 'pointer',
                        fontSize: 14
                      }}
                    >
                      Прочитать все
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 15, textAlign: 'center', color: '#7f8c8d' }}>
                      Нет новых уведомлений
                    </div>
                  ) : (
                    <>
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id_notifications}
                          onClick={() => markAsRead(notification.id_notifications)}
                          style={{
                            padding: 15,
                            borderBottom: '1px solid #e1e1e1',
                            cursor: 'pointer',
                            backgroundColor: notification.flag ? 'white' : '#f8f9fa'
                          }}
                        >
                          <div style={{ 
                            fontWeight: notification.flag ? 'normal' : 'bold',
                            marginBottom: 5,
                            color: '#2c3e50'
                          }}>
                            {notification.text}
                          </div>
                          <div style={{ 
                            fontSize: 12,
                            color: '#7f8c8d'
                          }}>
                            {formatDate(notification.datetime)}
                          </div>
                        </div>
                      ))}
                      <div 
                        onClick={openAllNotifications}
                        style={{
                          padding: 15,
                          textAlign: 'center',
                          color: '#3498db',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          borderTop: '1px solid #e1e1e1'
                        }}
                      >
                        Показать все уведомления
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <button 
              onClick={() => router.push('/pages/lk')}
              className="navButton"
            >
              Личный кабинет
            </button>
            <button 
              onClick={() => router.push('/pages')}
              className="navButton"
            >
              На главную
            </button>
          </nav>
        </div>
      </header>

      <section className="profileSection">
        <div className="avatarPlaceholder">
          {userData.firstname?.charAt(0)}{userData.lastname?.charAt(0)}S
        </div>
        <div className="profileInfo">
          <h2 className="userName">
            {userData.firstname || 'Имя'} {userData.lastname || 'Фамилия'}
          </h2>
          <div className="userDetails">
            <p><strong>Телефон:</strong> {userData.phonenumber || 'не указан'}</p>
            <p><strong>Дата рождения:</strong> {userData.birthdate ? formatBirthDate(userData.birthdate) : 'не указана'}</p>
            <p><strong>Страна:</strong> {userData.country || 'не указана'}</p>
            <p><strong>Доход:</strong> {userData.income?.toLocaleString('ru-RU') || '0'} ₽</p>
            <p><strong>Кредитный рейтинг:</strong> {(userData.dti * 1).toFixed(2)}</p>
          </div>
        </div>
      </section>

      <section className="tabsSection">
        <div className="tabs">
          <button
            className={`tabButton ${activeTab === 'borrow' ? 'activeTab' : ''}`}
            onClick={() => setActiveTab('borrow')}
          >
            Мои займы ({borrowOffers.length})
          </button>
          <button
            className={`tabButton ${activeTab === 'lend' ? 'activeTab' : ''}`}
            onClick={() => setActiveTab('lend')}
          >
            Мои инвестиции ({lendOffers.length})
          </button>
        </div>

        <div className="offersList">
          {activeTab === 'borrow' ? (
            borrowOffers.length > 0 ? (
              borrowOffers.map((offer) => (
                <div key={offer.id_offer} className="offerCard">
                  <div className="offerHeader">
                    <h3 className="offerTitle">{offer.type || 'Тип не указан'}</h3>
                    <span className={`statusBadge ${
                      offer.state === 1 ? 'activeBadge' : 
                      offer.state === 2 ? 'completedBadge' : 'pendingBadge'
                    }`}>
                      {getStatus(offer.state)}
                    </span>
                  </div>
                  <div className="offerDetails">
                    <p><strong>Сумма:</strong> {(offer.creditsum ?? 0).toLocaleString('ru-RU')} ₽</p>
                    <p><strong>Ставка:</strong> {offer.interestrate || '0'}%</p>
                    <p><strong>Срок:</strong> {calculateTerm(offer.datestart, offer.dateend)}</p>
                    <p><strong>Дата начала:</strong> {offer.datestart ? formatBirthDate(offer.datestart) : 'не указана'}</p>
                    <p><strong>Инвестор:</strong> {offer.owner_firstname ? `${offer.owner_firstname} ${offer.owner_lastname}` : 'не указан'}</p>
                  </div>
                  <button 
                    className="detailsButton"
                    onClick={() => handleOfferClick(offer)}
                      >
                      Подробнее
                      </button>
                </div>
              ))
            ) : (
              <p className="noOffers">Нет активных займов</p>
            )
          ) : (
            lendOffers.length > 0 ? (
              lendOffers.map((offer) => (
                <div key={offer.id_offer} className="offerCard">
                  <div className="offerHeader">
                    <h3 className="offerTitle">{offer.type}</h3>
                    <span className={`statusBadge ${
                      offer.state === 1 ? 'activeBadge' : 
                      offer.state === 2 ? 'completedBadge' : 'pendingBadge'
                    }`}>
                      {getStatus(offer.state)}
                    </span>
                  </div>
                  <div className="offerDetails">
                    <p><strong>Сумма:</strong> {(offer.creditsum ?? 0).toLocaleString('ru-RU')} ₽</p>
                    <p><strong>Ставка:</strong> {offer.interestrate || '0'}%</p>
                    <p><strong>Срок:</strong> {calculateTerm(offer.datestart, offer.dateend)}</p>
                    <p><strong>Дата начала:</strong> {offer.datestart ? formatBirthDate(offer.datestart) : 'не указана'}</p>
                    <p><strong>Заемщик:</strong> {offer.guest_id ? `ID: ${offer.guest_id}` : 'не указан'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="detailsButton"
                      onClick={() => handleOfferClick(offer)}
                    >
                      Подробнее
                    </button>
                      <button 
                      className="settingsButton"
                      onClick={() => handleSettingsClick(offer.id_offer)}>
                        Настройки
                      </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="noOffers">Нет активных инвестиций</p>
            )
          )}
        </div>
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
        
        .nav {
          display: flex;
          gap: 10px;
          align-items: center;
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
        
        .profileSection {
          display: flex;
          align-items: center;
          gap: 30px;
          margin-bottom: 40px;
          padding: 20px;
          background-color: #f9fafb;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .avatarPlaceholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background-color: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          color: #9ca3af;
          font-weight: bold;
        }
        
        .profileInfo {
          flex: 1;
        }
        
        .userName {
          margin: 0 0 10px 0;
          font-size: 28px;
          color: #111827;
        }
        
        .userDetails {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        
        .userDetails p {
          margin: 5px 0;
        }
        
        .userDetails strong {
          color: #4b5563;
        }
        
        .tabsSection {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .tabButton {
          flex: 1;
          padding: 15px;
          background-color: transparent;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.3s;
        }
        
        .activeTab {
          color: #3498db;
          border-bottom: 2px solid #3498db;
        }
        
        .offersList {
          padding: 20px;
        }
        
        .offerCard {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 15px;
          transition: all 0.3s;
        }
        
        .offerCard:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .offerHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .offerTitle {
          margin: 0;
          font-size: 18px;
          color: #111827;
        }
        
        .statusBadge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .activeBadge {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .pendingBadge {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .completedBadge {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .offerDetails {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .offerDetails p {
          margin: 5px 0;
        }
        
        .offerDetails strong {
          color: #4b5563;
        }
        
        .detailsButton {
          width: 100%;
          padding: 10px 0;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .detailsButton:hover {
          background-color: #2980b9;
        }

        .settingsButton {
          width: 100%;
          padding: 10px 0;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .settingsButton:hover {
          background-color: #5a6268;
        }
        
        .noOffers {
          text-align: center;
          color: #6b7280;
          padding: 40px 0;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;