'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface Notification {
  id_notifications: number;
  user_id: number;
  text: string;
  flag: boolean;
  datetime: string;
}

const NotificationsPage: React.FC = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Загрузка данных
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          router.push('http://localhost:3000/login')
        };

        const response = await fetch(`http://localhost:3001/user/${userId}/notifications`);
        if (!response.ok) {
          throw new Error('Не удалось загрузить уведомления');
        }
        
        // Проверка на пустое тело ответа
        const contentLength = response.headers.get('Content-Length');
        if (contentLength === '0') {
          setNotifications([]);
        } else {
          const data = await response.json();
          // Сортируем уведомления: сначала непрочитанные, потом прочитанные
          const sortedNotifications = data.sort((a: Notification, b: Notification) => {
            // Сначала сравниваем по статусу прочтения (непрочитанные first)
            if (a.flag !== b.flag) {
              return a.flag ? 1 : -1;
            }
            // Если статус одинаковый, сортируем по дате (новые first)
            return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
          });
          setNotifications(sortedNotifications);
        }
      } catch (err) {
        console.error('Ошибка загрузки уведомлений:', err);
      }
    };

    fetchNotifications();
  }, []);

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
      
      // Обновляем локальное состояние
      const updatedNotifications = notifications.map(n => ({ ...n, flag: true }));
      
      // Сортируем после обновления (по дате)
      const sortedNotifications = updatedNotifications.sort((a, b) => 
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      );
      
      setNotifications(sortedNotifications);
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
    router.push(`/pages/profile/${localStorage.getItem('userId')}`);
  };

  const openCabinet = () => {
    router.push('/pages/lk');
  };

  const goBack = () => {
    router.back();
  };

  // Подсчет непрочитанных уведомлений
  const unreadCount = notifications.filter(n => !n.flag).length;

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Шапка */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button 
              onClick={goBack}
              className={styles.backButton}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z" fill="#2c3e50"/>
              </svg>
            </button>
            <h1 className={styles.pageTitle}>
              Уведомления
            </h1>
          </div>
          
          <div className={styles.headerControls}>
            {/* Кнопка профиля */}
            <button 
              onClick={openProfile}
              className={styles.profileButton}
            >
              <div className={styles.userAvatar}>
                U
              </div>
              Профиль
            </button>
            
            {/* Кнопка личного кабинета */}
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
          {/* Заголовок и кнопка "Прочитать все" */}
          <div className={styles.pageHeader}>
            <h2 className={styles.sectionTitle}>
              Все уведомления ({notifications.length})
              {unreadCount > 0 && (
                <span style={{color: '#e74c3c', fontSize: '14px', marginLeft: '10px'}}>
                  Непрочитанные: {unreadCount}
                </span>
              )}
            </h2>
            
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className={styles.markAllButton}
              >
                Прочитать все
              </button>
            )}
          </div>
          
          {/* Список уведомлений */}
          <div className={styles.notificationsList}>
            {notifications.length === 0 ? (
              <div className={styles.noNotifications}>
                Нет уведомлений
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id_notifications}
                  onClick={() => markAsRead(notification.id_notifications)}
                  className={`${styles.notificationItem} ${notification.flag ? '' : styles.unreadNotification}`}
                >
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationText}>
                      {notification.text}
                    </div>
                    <div className={styles.notificationDate}>
                      {formatDate(notification.datetime)}
                    </div>
                  </div>
                  
                  {!notification.flag && (
                    <div className={styles.unreadIndicator} />
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;