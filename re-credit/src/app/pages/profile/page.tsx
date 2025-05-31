'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  ID_User: number;
  login: string;
  firstname: string;
  lastname: string;
  birthdate: string;
  phonenumber: string;
  inn: string;
  PassportSerie: number;
  PassportNumber: number;
  Income: number;
  Country: string;
  DTI: number;
}

interface Offer {
  ID_Offer: number;
  Type: string;
  CreditSum: number;
  InterestRate: number;
  State: number;
  DateStart: string;
  DateEnd: string;
  Owner_ID?: number;
  Guest_ID?: number;
}

interface LendOffer extends Offer {
  funded?: number;
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'borrow' | 'lend'>('borrow');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [borrowOffers, setBorrowOffers] = useState<Offer[]>([]);
  const [lendOffers, setLendOffers] = useState<LendOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleOfferClick = (offerId: number) => {
    router.push(`/offers/${offerId}`);
  };

  const formatBirthDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const getStatus = (state: number) => {
    switch(state) {
      case 0: return 'На рассмотрении';
      case 1: return 'Активен';
      case 2: return 'Завершен';
      default: return 'Неизвестен';
    }
  };

  const calculateTerm = (start: string, end: string): string => {
    if (!start || !end) return 'Не указан';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 
      + (endDate.getMonth() - startDate.getMonth());
    
    return `${months} месяцев`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = 1;
        
        // Загрузка данных пользователя
        const userResponse = await fetch(`http://localhost:3001/users/${userId}`);
        if (!userResponse.ok) {
          throw new Error('Не удалось загрузить данные пользователя');
        }
        const userData = await userResponse.json();
        setUserData(userData);

        // Загрузка предложений пользователя
        const offersResponse = await fetch(`http://localhost:3001/offers/${userId}`);
        if (!offersResponse.ok) {
          throw new Error('Не удалось загрузить предложения пользователя');
        }
        const allOffers = await offersResponse.json();

        // Проверяем, что allOffers - массив, если нет - преобразуем или используем пустой массив
        const offersArray = Array.isArray(allOffers) ? allOffers : [];

        // Разделяем предложения на займы и инвестиции
        const borrows = offersArray.filter((offer: Offer) => offer.Owner_ID == userId);
        const lends = offersArray.filter((offer: Offer) => offer.Guest_ID == userId);

        setBorrowOffers(borrows);
        setLendOffers(lends);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ color: 'red', textAlign: 'center', padding: '40px' }}>{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '40px' }}>Пользователь не найден</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Профиль пользователя</h1>
          <nav style={styles.nav}>
            <button 
              onClick={() => router.push('/account')}
              style={styles.navButton}
            >
              Личный кабинет
            </button>
            <button 
              onClick={() => router.push('/')}
              style={styles.navButton}
            >
              На главную
            </button>
          </nav>
        </div>
      </header>

      <section style={styles.profileSection}>
        <div style={styles.avatarPlaceholder}>
          {userData?.firstname?.charAt(0)}{userData?.lastname?.charAt(0)}
        </div>
        <div style={styles.profileInfo}>
          <h2 style={styles.userName}>
            {userData?.firstname || 'Имя'} {userData?.lastname || 'Фамилия'}
          </h2>
          <div style={styles.userDetails}>
            <p><strong>Телефон:</strong> {userData?.phonenumber || 'не указан'}</p>
            <p><strong>Дата рождения:</strong> {userData?.birthdate ? formatBirthDate(userData.birthdate) : 'не указана'}</p>
            <p><strong>Страна:</strong> {userData?.Country || 'не указана'}</p>
            <p><strong>Доход:</strong> {(userData?.Income ?? 0).toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>
      </section>

      <section style={styles.tabsSection}>
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'borrow' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('borrow')}
          >
            Ищет деньги ({borrowOffers.length})
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'lend' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('lend')}
          >
            Может дать деньги ({lendOffers.length})
          </button>
        </div>

        <div style={styles.offersList}>
          {activeTab === 'borrow' ? (
            borrowOffers.length > 0 ? (
              borrowOffers.map((offer) => (
                <div key={offer.ID_Offer} style={styles.offerCard}>
                  <div style={styles.offerHeader}>
                    <h3 style={styles.offerTitle}>{offer.Type || 'Тип не указан'}</h3>
                    <span style={{
                      ...styles.statusBadge,
                      ...(offer.State === 1 ? styles.activeBadge : 
                           offer.State === 2 ? styles.completedBadge : styles.pendingBadge)
                    }}>
                      {getStatus(offer.State)}
                    </span>
                  </div>
                  <div style={styles.offerDetails}>
                    <p><strong>Сумма:</strong> {(offer.CreditSum ?? 0).toLocaleString('ru-RU')} ₽</p>
                    <p><strong>Ставка:</strong> {offer.InterestRate || '0'}%</p>
                    <p><strong>Срок:</strong> {calculateTerm(offer.DateStart, offer.DateEnd)}</p>
                    <p><strong>Дата начала:</strong> {offer.DateStart ? formatBirthDate(offer.DateStart) : 'не указана'}</p>
                  </div>
                  <button 
                    style={styles.detailsButton}
                    onClick={() => handleOfferClick(offer.ID_Offer)}
                  >
                    Подробнее
                  </button>
                </div>
              ))
            ) : (
              <p style={styles.noOffers}>Нет активных запросов на займ</p>
            )
          ) : (
            lendOffers.length > 0 ? (
              lendOffers.map((offer) => (
                <div key={offer.ID_Offer} style={styles.offerCard}>
                  <div style={styles.offerHeader}>
                    <h3 style={styles.offerTitle}>{offer.Type}</h3>
                    <span style={{
                      ...styles.statusBadge,
                      ...(offer.State === 1 ? styles.activeBadge : 
                           offer.State === 2 ? styles.completedBadge : styles.pendingBadge)
                    }}>
                      {getStatus(offer.State)}
                    </span>
                  </div>
                  <div style={styles.offerDetails}>
                    <p><strong>Сумма:</strong> {(offer.CreditSum ?? 0).toLocaleString('ru-RU')} ₽</p>
                    <p><strong>Ставка:</strong> {offer.InterestRate || '0'}%</p>
                    <p><strong>Срок:</strong> {calculateTerm(offer.DateStart, offer.DateEnd)}</p>
                    <p><strong>Дата начала:</strong> {offer.DateStart ? formatBirthDate(offer.DateStart) : 'не указана'}</p>
                    <p><strong>Инвестировано:</strong> {(offer.funded ?? 0).toLocaleString('ru-RU')} ₽</p>
                  </div>
                  <button 
                    style={styles.detailsButton}
                    onClick={() => handleOfferClick(offer.ID_Offer)}
                  >
                    Подробнее
                  </button>
                </div>
              ))
            ) : (
              <p style={styles.noOffers}>Нет активных предложений инвестиций</p>
            )
          )}
        </div>
      </section>
    </div>
  );
};

// Стили компонента (остаются без изменений)
const styles = {
  container: {
    fontFamily: '"Segoe UI", Roboto, sans-serif',
    color: '#333',
    lineHeight: 1.6,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  },
  header: {
    backgroundColor: '#4f46e5',
    color: 'white',
    padding: '20px 0',
    marginBottom: '30px',
    borderRadius: '8px'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 20px'
  },
  title: {
    margin: 0,
    fontSize: '24px'
  },
  nav: {
    display: 'flex',
    gap: '10px'
  },
  navButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    border: '1px solid white',
    color: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.1)'
    }
  } as React.CSSProperties,
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  avatarPlaceholder: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    color: '#9ca3af',
    fontWeight: 'bold'
  } as React.CSSProperties,
  profileInfo: {
    flex: 1
  },
  userName: {
    margin: '0 0 10px 0',
    fontSize: '28px',
    color: '#111827'
  },
  userDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
    p: {
      margin: '5px 0'
    },
    strong: {
      color: '#4b5563'
    }
  } as React.CSSProperties,
  tabsSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    overflow: 'hidden'
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb' // можно оставить сокращённую запись, так как нет конфликтов
  },
  
  tabButton: {
    flex: 1,
    padding: '15px',
    backgroundColor: 'transparent',
    // Заменяем border: 'none' на явное указание всех границ
    borderTop: 'none',
    borderRight: 'none',
    borderLeft: 'none',
    borderBottom: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
    color: '#6b7280',
    transition: 'all 0.3s'
  } as React.CSSProperties,
  
  activeTab: {
    color: '#4f46e5',
    // Явно указываем только нижнюю границу
    borderBottom: '2px solid #4f46e5',
    // Остальные границы остаются без изменений
    borderTop: 'none',
    borderRight: 'none',
    borderLeft: 'none'
  } as React.CSSProperties,
  offersList: {
    padding: '20px'
  },
  offerCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
    transition: 'all 0.3s',
    ':hover': {
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }
  } as React.CSSProperties,
  offerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  offerTitle: {
    margin: 0,
    fontSize: '18px',
    color: '#111827'
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500
  } as React.CSSProperties,
  activeBadge: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  } as React.CSSProperties,
  pendingBadge: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c'
  } as React.CSSProperties,
  completedBadge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af'
  } as React.CSSProperties,
  offerDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
    marginBottom: '15px',
    p: {
      margin: '5px 0',
      strong: {
        color: '#4b5563'
      }
    }
  } as React.CSSProperties,
  detailsButton: {
    width: '100%',
    padding: '10px 0',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#2980b9'
    }
  } as React.CSSProperties,
  noOffers: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px 0'
  } as React.CSSProperties
};

export default ProfilePage;