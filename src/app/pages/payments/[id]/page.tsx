'use client'

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

interface PaymentData {
  id_payment: number;
  offer_id: number;
  datetime: string;
  summary: number;
  remain: number;
}

interface OfferData {
  id_offer: number;
  owner_id: number;
  guest_id: number | null;
  creditsum: number;
  interestrate: number;
  state: number;
  type: string;
}

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [remainingAmount, setRemainingAmount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const offerId = localStorage.getItem('offerId');
        
        if (!offerId) {
          throw new Error('ID предложения не найден в localStorage');
        }

        // Получаем данные предложения
        const offerResponse = await fetch(`http://localhost:3001/offers/${offerId}`);
        if (!offerResponse.ok) throw new Error('Ошибка при загрузке предложения');
        const offerData = await offerResponse.json();
        
        // Преобразуем числовые поля
        const processedOffer = {
          ...offerData,
          creditsum: Number(offerData.creditsum),
          interestrate: Number(offerData.interestrate),
          state: Number(offerData.state)
        };
        setOffer(processedOffer);

        // Получаем платежи ТОЛЬКО для этого предложения
        const paymentsResponse = await fetch(`http://localhost:3001/payments?offer_id=${offerId}`);
        if (!paymentsResponse.ok) throw new Error('Ошибка при загрузке платежей');
        const allPayments: PaymentData[] = await paymentsResponse.json();
        const filteredPayments = allPayments.filter(payment => payment.offer_id === Number(offerId)).map(payment => ({
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

  const createNotification = async (userId: number, text: string) => {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      await fetch('http://localhost:3001/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          text: text,
          flag: false,
          datetime: currentDate
        }),
      });
    } catch (err) {
      console.error('Ошибка при создании уведомления:', err);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const offerId = localStorage.getItem('offerId');
      if (!offerId) throw new Error('ID предложения не найден');
      
      const amount = parseFloat(paymentAmount);
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
      setPaymentAmount('');
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
      if (offer) {
        try {
          const userId = localStorage.getItem('userId');
          
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

          // Уведомление гостю (если userId существует)
          if (userId) {
            await fetch('http://localhost:3001/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: parseInt(userId),
                text: `${paymentText}`,
                flag: false,
                datetime: currentDate
              }),
            });
          }
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

  if (loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 57px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (!offer) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 57px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p>Не удалось загрузить данные о предложении</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 57px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      gap: '20px'
    }}>
      {/* Информация о сделке */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        padding: '20px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#f9fafb'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Информация о сделке</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Тип сделки:</p>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>{offer.type}</p>
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Сумма кредита:</p>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>{offer.creditsum.toFixed(2)} ₽</p>
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Процентная ставка:</p>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>{offer.interestrate.toFixed(2)}%</p>
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Статус:</p>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>
              {offer.state === 1 ? 'Активна' : offer.state === 2 ? 'Завершена' : 'Неизвестно'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Остаток:</p>
            <p style={{ fontSize: '16px', fontWeight: '500' }}>{remainingAmount.toFixed(2)} ₽</p>
          </div>
        </div>
      </div>

      {/* Форма для внесения платежа */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        padding: '20px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#f9fafb'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Внести платеж</h2>
        {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}
        {success && <p style={{ color: 'green', marginBottom: '16px' }}>{success}</p>}
        
        <form onSubmit={handlePaymentSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="amount" style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#6b7280' }}>
              Сумма платежа (₽)
            </label>
            <input
              type="number"
              id="amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '16px'
              }}
              placeholder="Введите сумму"
              step="0.01"
              min="0.01"
              max={remainingAmount}
              disabled={remainingAmount <= 0}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: remainingAmount > 0 ? '#3b82f6' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: remainingAmount > 0 ? 'pointer' : 'not-allowed'
            }}
            disabled={remainingAmount <= 0 || loading}
          >
            {remainingAmount > 0 ? 'Внести платеж' : 'Кредит погашен'}
          </button>
        </form>
      </div>

      {/* История платежей */}
      {payments.length > 0 && (
        <div style={{
          width: '100%',
          maxWidth: '600px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>История платежей</h3>
          <div style={{
            overflowX: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '6px'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f9fafb',
                  textAlign: 'left'
                }}>
                  <th style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>Дата</th>
                  <th style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>Сумма</th>
                  <th style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>Остаток</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id_payment} style={{
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{payment.datetime}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{payment.summary.toFixed(2)} ₽</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{payment.remain.toFixed(2)} ₽</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;