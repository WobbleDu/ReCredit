'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

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
  const [unreadCount, setUnreadCount] = useState(0);

  // Загрузка данных
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const response = await fetch(`http://localhost:3001/user/${userId}/notifications`);
        if (!response.ok) {
          throw new Error('Не удалось загрузить уведомления');
        }
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.flag).length);
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
    router.push('/pages/profile');
  };

  const openCabinet = () => {
    router.push('/pages/lk');
  };

  const goBack = () => {
    router.back();
  };

  return (
  <div style={{backgroundColor: '#f9f9f9'}}>
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: 1200,
      margin: '0 auto',
      padding: 20,
      color: '#333',
      backgroundColor: '#f9f9f9',
      minHeight: '100vh'
    }}>
      {/* Шапка */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingBottom: 20,
        borderBottom: '1px solid #e1e1e1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <button 
            onClick={goBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 4
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z" fill="#2c3e50"/>
            </svg>
          </button>
          <h1 style={{ 
            color: '#2c3e50',
            margin: 0,
            fontSize: 28,
            fontWeight: 600
          }}>
            Уведомления
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          {/* Кнопка профиля */}
          <button 
            onClick={openProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: '#ecf0f1',
              padding: '8px 15px',
              borderRadius: 20,
              cursor: 'pointer',
              border: 'none',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#3498db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              U
            </div>
            Профиль
          </button>
          
          {/* Кнопка личного кабинета */}
          <button 
            onClick={openCabinet}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: '#2c3e50',
              color: 'white',
              padding: '8px 15px',
              borderRadius: 20,
              cursor: 'pointer',
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background-color 0.2s',
              ':hover': {
                backgroundColor: '#1a252f'
              }
            } as React.CSSProperties}
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
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}>
          <h2 style={{ 
            margin: 0,
            color: '#2c3e50',
            fontSize: 20
          }}>
            Все уведомления ({notifications.length})
          </h2>
          
          <button 
            onClick={markAllAsRead}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'background-color 0.2s',
              ':hover': {
                backgroundColor: '#2980b9'
              }
            } as React.CSSProperties}
          >
            Прочитать все
          </button>
        </div>
        
        {/* Список уведомлений */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          {notifications.length === 0 ? (
            <div style={{ 
              padding: 40,
              textAlign: 'center',
              color: '#7f8c8d'
            }}>
              Нет уведомлений
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id_notifications}
                onClick={() => markAsRead(notification.id_notifications)}
                style={{
                  padding: '15px 20px',
                  borderBottom: '1px solid #e1e1e1',
                  cursor: 'pointer',
                  backgroundColor: notification.flag ? 'white' : '#f8f9fa',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: notification.flag ? '#f5f5f5' : '#f1f3f5'
                  }
                } as React.CSSProperties}
              >
                <div>
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
                
                {!notification.flag && (
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: '#e74c3c'
                  }} />
                )}
              </div>
            ))
          )}
        </div>
      </main>
      
      {/* Подвал */}
      <footer style={{
        marginTop: 50,
        paddingTop: 20,
        borderTop: '1px solid #e1e1e1',
        color: '#7f8c8d',
        fontSize: 14,
        textAlign: 'center'
      }}>
        © {new Date().getFullYear()} Брокерская платформа. Все права защищены.
      </footer>
    </div>
</div>
  );
};

export default NotificationsPage;