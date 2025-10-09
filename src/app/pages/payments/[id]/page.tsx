'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { UserData, Notification } from '@src/app/types';
import { NotificationBell } from '@src/app/components/notificationBell';

const AccountPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Получаем данные пользователя и уведомления
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
          throw new Error('Пользователь не авторизован');
        }

        // Запрашиваем данные пользователя
        const response = await fetch(`http://localhost:3001/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных пользователя');
        }

        const userData: UserData = await response.json();
        setUser(userData);

        // Загружаем уведомления
        const responseNotifications = await fetch(`http://localhost:3001/user/${userId}/notifications`);
        if (responseNotifications.ok) {
          const notificationsData = await responseNotifications.json();
          const sortedNotifications = notificationsData.sort((a: Notification, b: Notification) => {
            if (a.flag !== b.flag) {
              return a.flag ? 1 : -1;
            }
            return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
          });
          
          setNotifications(sortedNotifications);
          setUnreadCount(notificationsData.filter((n: { flag: any; }) => !n.flag).length);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteAccount = async () => {
    if (!user) return;

    if (!confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/users/${user.id_user}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении аккаунта');
      }

      localStorage.removeItem('userId');
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка при удалении аккаунта');
    }
  };

  // Функции навигации
  const navigateToProfile = () => router.push(`/pages/profile/${user?.id_user}`);
  const navigateToMain = () => router.push('/pages');
  const navigateToNotifications = () => router.push('/pages/notifications');
  const navigateToCreateOffers = () => router.push('/pages/create_offers');
  const navigateToChangeUser = () => {
    setShowProfileMenu(false);
    router.push(`/pages/changeUser`);
  };

  // Функции для уведомлений
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
      
      const updatedNotifications = notifications.map(n => 
        n.id_notifications === id ? { ...n, flag: true } : n
      );
      
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
      const unreadIds = notifications
        .filter(n => !n.flag)
        .map(n => n.id_notifications);
      
      await Promise.all(
        unreadIds.map(id => updateNotificationOnServer(id, true))
      );
      
      const updatedNotifications = notifications.map(n => ({ ...n, flag: true }));
      
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

  const formatBirthDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Неверная дата';
      return date.toLocaleDateString('ru-RU');
    } catch {
      return 'Неверная дата';
    }
  };

  const displayedNotifications = notifications.slice(0, 5);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Загрузка данных пользователя...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Данные пользователя не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            Мой аккаунт
          </h2>
          
          <div className={styles.headerControls}>
            <NotificationBell userId={user.id_user}/>
            
            <button 
              onClick={navigateToMain}
              className={styles.cabinetButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="white"/>
              </svg>
              Главная
            </button>

            <button 
              onClick={navigateToCreateOffers}
              className={styles.createOfferButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="white"/>
              </svg>
              Добавить объявление
            </button>
            
            {/* Выпадающая кнопка профиля */}
            <div className={styles.profileDropdown}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={styles.profileButton}
              >
                <div className={styles.userAvatar}>
                  {user.firstname?.[0]?.toUpperCase() || 'U'}{user.lastname?.[0]?.toUpperCase() || ''}
                </div>
                Профиль
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${styles.dropdownArrow} ${showProfileMenu ? styles.dropdownArrowActive : ''}`}
                >
                  <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {showProfileMenu && (
                <div className={styles.profileDropdownMenu}>
                  <button 
                    onClick={navigateToProfile}
                    className={styles.dropdownMenuItem}
                  >
                    Просмотр профиля
                  </button>
                  <button 
                    onClick={navigateToChangeUser}
                    className={styles.dropdownMenuItem}
                  >
                    Изменить данные
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    className={styles.dropdownMenuItemDelete}
                  >
                    Удалить аккаунт
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Основное содержимое */}
        <div className={styles.contentGrid}>
          {/* Слева теперь Документы и финансы */}
          <div>
            <h3 className={styles.sectionTitle}>
              Документы и финансы
            </h3>
            <div className={styles.sectionContainer}>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>
                  ИНН
                </p>
                <p className={styles.infoValue}>
                  {user.inn}
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>
                  Паспорт
                </p>
                <p className={styles.infoValue}>
                  {user.passportserie} {user.passportnumber}
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>
                  Доход
                </p>
                <p className={styles.infoValue}>
                  {user.income.toLocaleString('ru-RU')} ₽
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>
                  Страна
                </p>
                <p className={styles.infoValue}>
                  {user.country}
                </p>
              </div>
              {user.dti && (
                <div className={styles.infoItem}>
                  <p className={styles.infoLabel}>
                    DTI (Debt-to-Income)
                  </p>
                  <p className={styles.infoValue}>
                    {(user.dti * 1).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Справа теперь Личная информация */}
          <div>
            <h3 className={styles.sectionTitle}>
              Личная информация
            </h3>
            <div className={styles.sectionContainer}>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>
                  Имя
                </p>
                <p className={styles.infoValue}>
                  {user.firstname}
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>
                  Фамилия
                </p>
                <p className={styles.infoValue}>
                  {user.lastname}
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>
                  Дата рождения
                </p>
                <p className={styles.infoValue}>
                  {formatBirthDate(user.birthdate)}
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>
                  Телефон
                </p>
                <p className={styles.infoValue}>
                  {user.phonenumber}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;