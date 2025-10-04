'use client'

import { NotificationBell } from '../components/notificationBell';
import { useRouterActions } from '../hooks/useRouterActions';
import { Offer, UserData, Notification } from '../types';

import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

const IndexPage: React.FC = () => {
  const { openProfile, openCabinet, push} = useRouterActions();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [userData, setUserData] = useState<UserData>();
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'interestrate' | 'creditsum'>('interestrate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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

  const showOffer = (id: number) => {
    localStorage.setItem('offerId', id.toString());
    push(`/pages/conclusion_of_offers`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Шапка */}
        <header className={styles.header}>
          <h1 className={styles.userName}>
            {userData?.firstname}
          </h1>

          <div className={styles.headerControls}>
            <NotificationBell
              userId={userData?.id_user}
              maxDisplayed={5}
            />

            <button
              onClick={() => openProfile(userData?.id_user)}
              className={styles.profileButton}
            >
              <div className={styles.userAvatar}>
                U
              </div>
              Профиль
            </button>

            <button
              onClick={()=>openCabinet()}
              className={styles.cabinetButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="white" />
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
                setShowAllOffers(prev => !prev);
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