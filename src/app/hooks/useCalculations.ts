// hooks/useCalculations.ts
import { useCallback } from 'react';

export const useCalculations = () => {
  const createWorker = useCallback(() => {
    if (typeof window !== 'undefined' && window.Worker) {
      // Создаем простой Web Worker
      const workerCode = `
        self.onmessage = function(e) {
          const { type, start, end, notifications } = e.data;
          
          switch (type) {
            case 'calculateTerm':
              try {
                const startDate = new Date(start);
                const endDate = new Date(end);
                
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                  self.postMessage({ type: 'termResult', result: 'Ошибка расчета' });
                  return;
                }
                
                const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 
                  + (endDate.getMonth() - startDate.getMonth());
                
                self.postMessage({ type: 'termResult', result: months + ' месяцев' });
              } catch (error) {
                self.postMessage({ type: 'termResult', result: 'Ошибка расчета' });
              }
              break;
              
            case 'sortNotifications':
              try {
                const sorted = notifications.sort((a, b) => {
                  if (a.flag !== b.flag) {
                    return a.flag ? 1 : -1;
                  }
                  return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
                });
                
                const unreadCount = notifications.filter(n => !n.flag).length;
                
                self.postMessage({ 
                  type: 'notificationsSorted', 
                  sorted, 
                  unreadCount 
                });
              } catch (error) {
                self.postMessage({ 
                  type: 'notificationsSorted',
                  sorted: notifications, 
                  unreadCount: 0 
                });
              }
              break;

            default:
              break;
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      return new Worker(URL.createObjectURL(blob));
    }
    return null;
  }, []);

  const calculateTerm = useCallback((start: string | null, end: string | null): Promise<string> => {
    return new Promise((resolve) => {
      if (!start || !end) {
        resolve('Не указан');
        return;
      }

      const worker = createWorker();
      if (worker) {
        worker.postMessage({ type: 'calculateTerm', start, end });
        worker.onmessage = (e) => {
          if (e.data.type === 'termResult') {
            resolve(e.data.result);
            worker.terminate();
          }
        };
        worker.onerror = () => {
          resolve('Ошибка расчета');
          worker.terminate();
        };
      } else {
        // Fallback если Web Workers не поддерживаются
        try {
          const startDate = new Date(start);
          const endDate = new Date(end);
          if (isNaN(startDate.getTime())) {
            resolve('Неверная дата начала');
            return;
          }
          if (isNaN(endDate.getTime())) {
            resolve('Неверная дата окончания');
            return;
          }
          
          const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 
            + (endDate.getMonth() - startDate.getMonth());
          
          resolve(`${months} месяцев`);
        } catch {
          resolve('Ошибка расчета');
        }
      }
    });
  }, [createWorker]);

  const sortNotifications = useCallback((notifications: any[]): Promise<{sorted: any[], unreadCount: number}> => {
    return new Promise((resolve) => {
      const worker = createWorker();
      if (worker && notifications.length > 10) {
        worker.postMessage({ type: 'sortNotifications', notifications });
        worker.onmessage = (e) => {
          if (e.data.type === 'notificationsSorted') {
            resolve({ sorted: e.data.sorted, unreadCount: e.data.unreadCount });
            worker.terminate();
          }
        };
        worker.onerror = () => {
          // Fallback
          const sorted = notifications.sort((a: any, b: any) => {
            if (a.flag !== b.flag) return a.flag ? 1 : -1;
            return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
          });
          resolve({ 
            sorted, 
            unreadCount: notifications.filter((n: any) => !n.flag).length 
          });
          worker.terminate();
        };
      } else {
        // Fallback для небольших массивов или без worker
        const sorted = notifications.sort((a: any, b: any) => {
          if (a.flag !== b.flag) return a.flag ? 1 : -1;
          return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
        });
        resolve({ 
          sorted, 
          unreadCount: notifications.filter((n: any) => !n.flag).length 
        });
      }
    });
  }, [createWorker]);

  const calculateDTI = useCallback((income: number, debts: number): Promise<number> => {
    return new Promise((resolve) => {
      // Простая синхронная функция - не требует Web Worker
      resolve(debts / income || 0);
    });
  }, []);

  return {
    calculateTerm,
    sortNotifications,
    calculateDTI
  };
};