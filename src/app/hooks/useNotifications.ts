// hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { type Notification } from '../types';

interface UseNotificationsProps {
  userId: number;
  apiBaseUrl?: string;
}

export const useNotifications = ({ userId, apiBaseUrl = 'http://localhost:3001' }: UseNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return; 
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiBaseUrl}/user/${userId}/notifications`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить уведомления');
      }
      
      const notificationsData = await response.json();
      
      const sortedNotifications = notificationsData.sort((a: Notification, b: Notification) => {
        if (a.flag !== b.flag) {
          return a.flag ? 1 : -1;
        }
        return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
      });
      
      setNotifications(sortedNotifications);
      setUnreadCount(notificationsData.filter((n: Notification) => !n.flag).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      console.error('Ошибка при загрузке уведомлений:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, apiBaseUrl]);

  const updateNotificationOnServer = async (notificationId: number, isRead: boolean) => {
    try {
      const response = await fetch(`${apiBaseUrl}/notifications/${notificationId}`, {
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
      throw error;
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
      throw error;
    }
  };

  const refreshNotifications = () => {
    loadNotifications();
  };

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
};