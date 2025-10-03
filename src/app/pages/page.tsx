'use client'

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface UserData {
  id_user: number;
  Login: string;
  firstname: string;
  LastName: string;
  BirthDate: string;
  PhoneNumber: string;
  INN: string;
  PassportSerie: number;
  PassportNumber: number;
  Income: number;
  Country: string;
}

interface Offer {
  id_offer: number;
  type: string;
  creditsum: number;
  interestrate: number;
  owner_firstname: string;
  owner_lastname: string;
  state?: number;
}

interface Notification {
  id_notifications: number;
  user_id: number;
  text: string;
  flag: boolean;
  datetime: string;
}

const IndexPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'interestrate' | 'creditsum'>('interestrate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllOffers, setShowAllOffers] = useState(true);

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        // Получаем пользователя
        const responseUserData = await fetch(`http://localhost:3001/users/${userId}`);
        const userData = await responseUserData.json();
        setUserData(userData);

        // Загрузка уведомлений
        const responseNotifications = await fetch(`http://localhost:3001/user/${userId}/notifications`);
        if (!responseNotifications.ok) {
          throw new Error('Не удалось загрузить уведомления');
        }
        
        const notificationsData = await responseNotifications.json();
        // Сортируем уведомления: сначала непрочитанные, потом прочитанные
        const sortedNotifications = notificationsData.sort((a: Notification, b: Notification) => {
          // Сначала сравниваем по статусу прочтения (непрочитанные first)
          if (a.flag !== b.flag) {
            return a.flag ? 1 : -1;
          }
          // Если статус одинаковый, сортируем по дате (новые first)
          return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
        });
        
        setNotifications(sortedNotifications);
        setUnreadCount(notificationsData.filter((n: { flag: any; }) => !n.flag).length);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
      }
    };
    
    fetchData();
  }, []);

  // Загрузка предложений в зависимости от выбранного режима
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        let response;
        if (showAllOffers) {
          // Загрузка всех предложений с state=0
          response = await fetch(`http://localhost:3001/offers/active/${userId}`);
        } else {
          // Загрузка рекомендованных предложений
          response = await fetch(`http://localhost:3001/offers/recommended/${userId}`);
        }

        if (!response.ok) {
          throw new Error('Не удалось загрузить предложения');
        }
        const offerData = await response.json();
        console.log("Offer data:", offerData);
        setOffers(offerData);
        setFilteredOffers(offerData);
      } catch (err) {
        console.error('Ошибка загрузки предложений:', err);
      }
    };

    fetchOffers();
  }, [showAllOffers]);

  // Фильтрация и сортировка предложений
  useEffect(() => {
    let result = [...offers];
    
    // Фильтрация по поисковому запросу
    if (searchTerm) {
      result = result.filter(offer => 
        offer.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${offer.owner_firstname} ${offer.owner_lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Сортировка
    result.sort((a, b) => {
      if (sortBy === 'creditsum' || sortBy === 'interestrate') {
        return sortOrder === 'asc' 
          ? a[sortBy] - b[sortBy] 
          : b[sortBy] - a[sortBy];
      }
      return 0;
    });
    
    setFilteredOffers(result);
  }, [searchTerm, sortBy, sortOrder, offers]);

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
      // Обновляем на сервере
      await updateNotificationOnServer(id, true);
      
      // Обновляем локальное состояние с сохранением порядка
      const updatedNotifications = notifications.map(n => 
        n.id_notifications === id ? { ...n, flag: true } : n
      );
      
      // Сортируем после обновления
      const sortedNotifications = updatedNotifications.sort((a, b) => {
        if (a.flag !== b.flag) {
          return a.flag ? 1 : -1;
        }
        return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
      });
      
      setNotifications(sortedNotifications);
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Ошибка при пометке уведомления как прочитанного:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Получаем ID всех непрочитанных уведомлений
      const unreadIds = notifications
        .filter(n => !n.flag)
        .map(n => n.id_notifications);
      
      // Обновляем все на сервере
      await Promise.all(
        unreadIds.map(id => updateNotificationOnServer(id, true))
      );
      
      // Обновляем локальное состояние
      const updatedNotifications = notifications.map(n => ({ ...n, flag: true }));
      
      // Сортируем после обновления (по дате)
      const sortedNotifications = updatedNotifications.sort((a, b) => 
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      );
      
      setNotifications(sortedNotifications);
      setUnreadCount(0);
    } catch (error) {
      console.error('Ошибка при пометке всех уведомлений как прочитанных:', error);
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

  const openProfile = () => {
    router.push(`/pages/profile/${userData?.id_user}`);
  };

  const openCabinet = () => {
    router.push('/pages/lk');
  };

  const openAllNotifications = () => {
    router.push('/pages/notifications');
  };

  const showOffer = (id:number) =>{
    localStorage.setItem('offerId', id.toString());
    router.push(`/pages/conclusion_of_offers`);
  };

  // Получаем только первые 5 уведомлений для отображения
  const displayedNotifications = notifications.slice(0, 5);

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Шапка */}
        <header className={styles.header}>
          <h1 className={styles.userName}>
            {userData?.firstname}
          </h1>
          
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
                      {notifications.length > 5 && (
                        <div 
                          onClick={openAllNotifications}
                          className={styles.showAllNotifications}
                        >
                          Показать все уведомления ({notifications.length})
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            
            <button 
              onClick={openProfile}
              className={styles.profileButton}
            >
              <div className={styles.userAvatar}>
                U
              </div>
              Профиль
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

        {/* Основное содержимое */}
        <main>
          {/* Поиск и фильтрация */}
          <section className={styles.searchSection}>
            <h2 className={styles.sectionTitle}>
              Найти предложения
            </h2>
            
            <div className={styles.searchControls}>
              <div className={styles.searchInputContainer}>
                <input
                  type="text"
                  placeholder="Поиск по названию..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.filterControls}>
                <div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'interestrate' | 'creditsum')}
                    className={styles.filterSelect}
                  >
                    <option value="interestrate">По процентной ставке</option>
                    <option value="creditsum">По сумме</option>
                  </select>
                </div>
                
                <div>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className={styles.filterSelect}
                  >
                    <option value="asc">По возрастанию</option>
                    <option value="desc">По убыванию</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Кнопка переключения между разделами */}
          <div className={styles.toggleSection}>
            <button 
              onClick={() => {
                setShowAllOffers(prev=>!prev);
                setSearchTerm(''); // Сбрасываем поиск при переключении
              }}
              className={styles.toggleButton}
            >
              {showAllOffers ? 'Показать рекомендуемые' : 'Показать все предложения'}
            </button>
          </div>
          
          {/* Рекомендуемые предложения или Все предложения */}
          <section>
            <h2 className={styles.sectionTitle}>
              {showAllOffers ? 'Все предложения' : 'Рекомендуемые предложения'}
            </h2>
            
            <div className={styles.offersGrid}>
              {filteredOffers.map((offer, index) => (
                <div key={index} className={styles.offerCard}>
                  <h3 className={styles.offerTitle}>
                    {offer.type}
                  </h3>
                  
                  <div className={styles.offerDetails}>
                    <div>
                      <div className={styles.offerLabel}>
                        Сумма
                      </div>
                      <div className={styles.offerValue}>
                        {offer.creditsum} ₽
                      </div>
                    </div>
                    
                    <div>
                      <div className={styles.offerLabel}>
                        Ставка
                      </div>
                      <div className={styles.offerRate}>
                        {offer.interestrate}%
                      </div>
                    </div>
                    
                    <div>
                      <div className={styles.offerLabel}>
                        Владелец
                      </div>
                      <div className={styles.offerValue}>
                        {offer.owner_firstname || 'Неизвестный владелец'}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => showOffer(offer.id_offer)}
                    className={styles.detailsButton}
                  >
                    Подробнее
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default IndexPage;