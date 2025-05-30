'use client'

import React, { useState, useEffect } from 'react';

interface Notification {
  id: number;
  message: string;
  read: boolean;
  timestamp: Date;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Загрузка данных
  useEffect(() => {
    // Моковые уведомления
    const mockNotifications: Notification[] = [
      { id: 1, message: 'Ваша заявка на кредит одобрена', read: false, timestamp: new Date(Date.now() - 3600000) },
      { id: 2, message: 'Новое предложение соответствует вашим критериям', read: false, timestamp: new Date(Date.now() - 86400000) },
      { id: 3, message: 'Ваш депозит был успешно зачислен', read: true, timestamp: new Date(Date.now() - 172800000) },
      { id: 4, message: 'Изменение условий по вашему кредиту', read: false, timestamp: new Date(Date.now() - 259200000) },
      { id: 5, message: 'Проверьте новые инвестиционные предложения', read: true, timestamp: new Date(Date.now() - 345600000) },
      { id: 6, message: 'Ваш профиль успешно верифицирован', read: true, timestamp: new Date(Date.now() - 432000000) },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id: number) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const openProfile = () => {
    alert('Переход в профиль пользователя');
  };

  const openCabinet = () => {
    alert('Переход в личный кабинет');
  };

  const goBack = () => {
    alert('Возврат на предыдущую страницу');
  };

  return (
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
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                style={{
                  padding: '15px 20px',
                  borderBottom: '1px solid #e1e1e1',
                  cursor: 'pointer',
                  backgroundColor: notification.read ? 'white' : '#f8f9fa',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: notification.read ? '#f5f5f5' : '#f1f3f5'
                  }
                } as React.CSSProperties}
              >
                <div>
                  <div style={{ 
                    fontWeight: notification.read ? 'normal' : 'bold',
                    marginBottom: 5,
                    color: '#2c3e50'
                  }}>
                    {notification.message}
                  </div>
                  <div style={{ 
                    fontSize: 12,
                    color: '#7f8c8d'
                  }}>
                    {formatDate(notification.timestamp)}
                  </div>
                </div>
                
                {!notification.read && (
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
  );
};

export default NotificationsPage;