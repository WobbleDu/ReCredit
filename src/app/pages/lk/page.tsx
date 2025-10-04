'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

import { NotificationBell } from '../../components/notificationBell';

import { useRouterActions } from '../../hooks/useRouterActions'; /*ИСПОЛЬЗОВАТЬ*/

interface User {
  id_user: number;
  firstname: string;
  lastname: string;
  birthdate: string;
  phonenumber: string;
  inn: string;
  passportserie: string;
  passportnumber: string;
  income: number;
  country: string;
  dti: number;
}

interface Notification {
  id_notifications: number;
  user_id: number;
  text: string;
  flag: boolean;
  datetime: string;
}

const AccountPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

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

        const userData: User = await response.json();
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
  const navigateToChangeUser = () => router.push(`/pages/changeUser`);

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
        {/* Шапка с уведомлениями */}
        <header className={styles.header}>``
          <h2 className={styles.title}>
            Мой аккаунт
          </h2>
          
          <div className={styles.headerControls}>
            <NotificationBell
              userId={user?.id_user}
              maxDisplayed={5}
            />
            
            <button 
              onClick={navigateToProfile}
              className={styles.profileButton}
            >
              <div className={styles.userAvatar}>
                {user.firstname?.[0]?.toUpperCase() || 'U'}
              </div>
              Профиль
            </button>
            
            <button 
              onClick={navigateToMain}
              className={styles.cabinetButton}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="white"/>
              </svg>
              Главная
            </button>
          </div>
        </header>

        {/* Основное содержимое */}
        <div className={styles.contentGrid}>
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
            <div className={styles.actionButtons}>
              <button
                onClick={navigateToChangeUser}
                className={styles.changeButton}
              >
                Изменить данные
              </button>
              <button
                onClick={handleDeleteAccount}
                className={styles.deleteButton}
              >
                Удалить аккаунт
              </button>
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default AccountPage;