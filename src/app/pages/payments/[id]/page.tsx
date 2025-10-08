'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styles from './styles.module.css';
import { NotificationBell } from '@src/app/components/notificationBell';
import { UserData, Offer } from '@src/app/types';

interface PaymentData {
  id_payment: number;
  offer_id: number;
  datetime: string;
  summary: number;
  remain: number;
}

interface PaymentFormData {
  amount: string;
}

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch
  } = useForm<PaymentFormData>();

  const amountValue = watch('amount');

  // Загрузка данных предложения, платежей и уведомлений
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const offerId = localStorage.getItem('offerId');
        const currentUserId = localStorage.getItem('userId');
        setUserId(currentUserId);
        
        if (!offerId) {
          throw new Error('ID предложения не найден в localStorage');
        }

        // Получаем данные пользователя
        if (currentUserId) {
          const userResponse = await fetch(`http://localhost:3001/users/${currentUserId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserData(userData);
          }
        }

        // Получаем данные предложения
        const offerResponse = await fetch(`http://localhost:3001/offers/${offerId}`);
        if (!offerResponse.ok) throw new Error('Ошибка при загрузке предложения');
        const offerData = await offerResponse.json();
        
        const processedOffer = {
          ...offerData,
          creditsum: Number(offerData.creditsum),
          interestrate: Number(offerData.interestrate),
          state: Number(offerData.state)
        };
        setOffer(processedOffer);

        // Получаем платежи
        const paymentsResponse = await fetch(`http://localhost:3001/payments?offer_id=${offerId}`);
        if (!paymentsResponse.ok) throw new Error('Ошибка при загрузке платежей');
        const allPayments: PaymentData[] = await paymentsResponse.json();
        const filteredPayments = allPayments
          .filter(payment => payment.offer_id === Number(offerId))
          .map(payment => ({
            ...payment,
            summary: Number(payment.summary),
            remain: Number(payment.remain) 
          }));
        
        setPayments(filteredPayments);

        // Вычисляем остаток
        let remain = 0;
        if (filteredPayments.length > 0) {
          remain = Number(filteredPayments[filteredPayments.length - 1].remain) || 0;
        } else {
          remain = Number(processedOffer.creditsum) || 0;
        }
        setRemainingAmount(remain);

      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
        setRemainingAmount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const offerId = localStorage.getItem('offerId');
      const currentUserId = localStorage.getItem('userId');
      
      if (!offerId) throw new Error('ID предложения не найден');
      
      const amount = parseFloat(data.amount);
      if (isNaN(amount)) throw new Error('Некорректная сумма платежа');
      if (amount <= 0) throw new Error('Сумма платежа должна быть положительной');
      if (amount > remainingAmount) throw new Error('Сумма платежа превышает остаток');

      const newRemain = remainingAmount - amount;
      const currentDate = new Date().toISOString().split('T')[0];

      // Создаем новый платеж
      const response = await fetch('http://localhost:3001/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offer_id: parseInt(offerId),
          datetime: currentDate,
          summary: amount,
          remain: newRemain,
        }),
      });

      if (!response.ok) throw new Error('Ошибка при сохранении платежа');

      // Обновляем состояние
      setRemainingAmount(newRemain);
      setValue('amount', '');
      setSuccess(`Платеж на сумму ${amount.toFixed(2)} ₽ успешно внесен!`);

      // Обновляем список платежей
      const paymentsResponse = await fetch(`http://localhost:3001/payments?offer_id=${offerId}`);
      const paymentsData: PaymentData[] = await paymentsResponse.json();
      const updatedPayments = paymentsData
        .filter(p => p.offer_id === Number(offerId))
        .map(p => ({
          ...p,
          summary: Number(p.summary),
          remain: Number(p.remain)
        }));
      setPayments(updatedPayments);

      // Создаем уведомления
      if (offer && currentUserId) {
        try {
          const paymentText = `По ${offer.type} внесен платеж ${amount.toFixed(2)}₽. Остаток: ${newRemain.toFixed(2)}₽`;
          
          // Уведомление владельцу
          await fetch('http://localhost:3001/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: offer.owner_id,
              text: paymentText,
              flag: false,
              datetime: currentDate
            }),
          });

          // Уведомление текущему пользователю
          await fetch('http://localhost:3001/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: parseInt(currentUserId),
              text: paymentText,
              flag: false,
              datetime: currentDate
            }),
          });
        } catch (notificationError) {
          console.error('Ошибка создания уведомлений:', notificationError);
        }
      }

    } catch (err) {
      console.error('Ошибка при внесении платежа:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  // Функции навигации
  const navigateToProfile = () => router.push(`/pages/profile/${userId}`);
  const navigateToMain = () => router.push('/pages');
  const navigateToChangeUser = () => {
    setShowProfileMenu(false);
    router.push(`/pages/changeUser`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p>Не удалось загрузить данные о предложении</p>
        </div>
      </div>
    );
  }

  const isButtonDisabled = remainingAmount <= 0 || loading || !amountValue || parseFloat(amountValue) <= 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
      <div className={styles.headerContent}>
        <h2 className={styles.title}>
          Управление платежами
        </h2>
        
        <div className={styles.headerControls}>
          <NotificationBell userId={offer.owner_id}/>
          
          <button 
            onClick={navigateToMain}
            className={styles.cabinetButton}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="white"/>
            </svg>
            Главная
          </button>
          
          {/* Обычная кнопка профиля */}
          <button 
            onClick={navigateToProfile}
            className={styles.profileButton}
          >
            <div className={styles.userAvatar}>
              {userData?.firstname?.[0]?.toUpperCase() || 'U'}{userData?.lastname?.[0]?.toUpperCase() || ''}
            </div>
            Профиль
          </button>
        </div>
      </div>
    </header>

      {/* Основное содержимое в wrapper с белым фоном */}
      <div className={styles.wrapper}>
        <div className={styles.contentGrid}>
          {/* Информация о сделке */}
          <div>
            <h3 className={styles.sectionTitle}>
              Информация о сделке
            </h3>
            <div className={styles.sectionContainer}>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>
                  <strong>Тип сделки</strong>
                </p>
                <p className={styles.infoValue}>
                  {offer.type}
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>
                  <strong>Сумма кредита</strong>
                </p>
                <p className={styles.infoValue}>
                  {offer.creditsum.toFixed(2)} ₽
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>
                  <strong>Процентная ставка</strong>
                </p>
                <p className={styles.infoValue}>
                  {offer.interestrate.toFixed(2)}%
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>
                  <strong>Статус</strong>
                </p>
                <p className={styles.infoValue}>
                  {offer.state === 1 ? 'Активна' : offer.state === 2 ? 'Завершена' : 'Неизвестно'}
                </p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoLabel}>
                  <strong>Остаток долга</strong>
                </p>
                <p className={styles.infoValue}>
                  {remainingAmount.toFixed(2)} ₽
                </p>
              </div>
            </div>
          </div>

          {/* Форма для внесения платежа */}
          <div>
            <h3 className={styles.sectionTitle}>
              Внести платеж
            </h3>
            <div className={styles.sectionContainer}>
              {error && <p className={styles.errorMessage}>{error}</p>}
              {success && <p className={styles.successMessage}>{success}</p>}
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.formGroup}>
                  <label htmlFor="amount" className={styles.infoLabel}>
                    <strong>Сумма платежа (₽)</strong>
                  </label>
                  <input
                    type="number"
                    id="amount"
                    {...register('amount', {
                      required: 'Введите сумму платежа',
                      min: {
                        value: 0.01,
                        message: 'Сумма должна быть больше 0'
                      },
                      max: {
                        value: remainingAmount,
                        message: `Сумма не может превышать ${remainingAmount.toFixed(2)}`
                      },
                      validate: {
                        positive: value => parseFloat(value) > 0 || 'Сумма должна быть положительной'
                      }
                    })}
                    className={styles.formInput}
                    placeholder="Введите сумму"
                    step="0.01"
                    min="0.01"
                    max={remainingAmount}
                    disabled={remainingAmount <= 0}
                  />
                  {errors.amount && <p className={styles.errorMessage}>{errors.amount.message}</p>}
                </div>
                
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isButtonDisabled}
                >
                  {remainingAmount > 0 ? 'Внести платеж' : 'Кредит погашен'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* История платежей */}
        {payments.length > 0 && (
          <div className={styles.paymentHistory}>
            <h3 className={styles.sectionTitle}>
              История платежей
            </h3>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th className={styles.tableHeaderCell}><strong>Дата</strong></th>
                    <th className={styles.tableHeaderCell}><strong>Сумма платежа</strong></th>
                    <th className={styles.tableHeaderCell}><strong>Остаток долга</strong></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id_payment}>
                      <td className={styles.tableCell}>{payment.datetime}</td>
                      <td className={styles.tableCell}>{payment.summary.toFixed(2)} ₽</td>
                      <td className={styles.tableCell}>{payment.remain.toFixed(2)} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;