// components/NotificationBell.tsx
import { useState } from 'react';
import { useNotifications} from '../hooks/useNotifications';
import { type Notification } from '../types';
import styles from '../pages/styles.module.css'; // Ваши стили
import { useRouterActions } from '../hooks/useRouterActions';

interface NotificationBellProps {
  userId: number | undefined;
  maxDisplayed?: number;
  apiBaseUrl?: string;
  onNotificationClick?: (notification: any) => void;
  onShowAllClick?: () => void;
  formatDate?: (dateString: string) => string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  maxDisplayed = 5,
  apiBaseUrl,
  onNotificationClick,
  onShowAllClick,
  formatDate = (dateString) => new Date(dateString).toLocaleDateString('ru-RU'),
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const {openNotifications} = useRouterActions();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ 
    userId: userId || 0,
    apiBaseUrl 
  });

  const displayedNotifications = notifications.slice(0, maxDisplayed);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.flag) {
      await markAsRead(notification.id_notifications);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleShowAllClick = () => {
    setShowNotifications(false);
    if (onShowAllClick) {
      onShowAllClick();
    }
  };

  // Если userId не определен, показываем неактивную кнопку
  if (!userId) {
    return (
      <div className={styles.notificationWrapper}>
        <button 
          className={styles.notificationButton}
          disabled
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="#ccc"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
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
                onClick={handleMarkAllAsRead}
                className={styles.markAllReadButton}
                disabled={loading}
              >
                {loading ? '...' : 'Прочитать все'}
              </button>
            )}
          </div>
          
          {error && (
            <div className={styles.notificationError}>
              Ошибка загрузки
            </div>
          )}
          
          {loading && notifications.length === 0 ? (
            <div className={styles.noNotifications}>
              Загрузка...
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className={styles.noNotifications}>
              Нет новых уведомлений
            </div>
          ) : (
            <>
              {displayedNotifications.map((notification) => (
                <div 
                  key={notification.id_notifications}
                  onClick={() => handleNotificationClick(notification)}
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
              {notifications.length > maxDisplayed && (
                <div 
                  onClick={()=>openNotifications()}
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
  );
};