'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface UserData {
  ID_User: number;
  Login: string;
  FirstName: string;
  LastName: string;
  BirthDate: string;
  PhoneNumber: string;
  INN: string;
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
}

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'borrow' | 'lend'>('borrow');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [borrowOffers, setBorrowOffers] = useState<Offer[]>([]);
  const [lendOffers, setLendOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Получаем userId из URL или localStorage
  const router = useRouter();
  const userId = localStorage.getItem('userId');

  // Загрузка данных пользователя и его предложений
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загрузка данных пользователя
        const userResponse = await fetch(`http://localhost:3001/users/${userId}`);
        if (!userResponse.ok) {
          throw new Error('Не удалось загрузить данные пользователя');
        }
        const userData = await userResponse.json();
        setUserData(userData);

        // Загрузка предложений пользователя
        const offersResponse = await fetch(`http://localhost:3001/users/${userId}/offers`);
        if (!offersResponse.ok) {
          throw new Error('Не удалось загрузить предложения пользователя');
        }
        const allOffers = await offersResponse.json();

        // Разделяем предложения на займы (где пользователь owner) и инвестиции (где пользователь guest)
        const borrows = allOffers.filter((offer: any) => offer.Owner_ID == userId);
        const lends = allOffers.filter((offer: any) => offer.Guest_ID == userId);

        setBorrowOffers(borrows);
        setLendOffers(lends);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

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

  // Форматирование даты рождения
  const formatBirthDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div style={styles.container}>
      {/* Шапка профиля */}
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

      {/* Основная информация о пользователе */}
      <section style={styles.profileSection}>
        <div style={styles.avatarPlaceholder}>
          {userData.FirstName.charAt(0)}{userData.LastName.charAt(0)}
        </div>
        <div style={styles.profileInfo}>
          <h2 style={styles.userName}>{userData.FirstName} {userData.LastName}</h2>
          <div style={styles.userDetails}>
            <p><strong>Телефон:</strong> {userData.PhoneNumber}</p>
            <p><strong>Дата рождения:</strong> {formatBirthDate(userData.BirthDate)}</p>
            <p><strong>Страна:</strong> {userData.Country}</p>
            <p><strong>Доход:</strong> {userData.Income.toLocaleString()} ₽</p>
          </div>
        </div>
      </section>

      {/* Табы с предложениями */}
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

        {/* Список предложений */}
        <div style={styles.offersList}>
          {activeTab === 'borrow' ? (
            borrowOffers.length > 0 ? (
              borrowOffers.map(offer => (
                <div key={offer.ID_Offer} style={styles.offerCard}>
                  <div style={styles.offerHeader}>
                    <h3 style={styles.offerTitle}>{offer.Type}</h3>
                    <span style={{
                      ...styles.statusBadge,
                      ...(offer.State === 1 ? styles.activeBadge : 
                           offer.State === 2 ? styles.completedBadge : styles.pendingBadge)
                    }}>
                      {offer.State === 0 ? 'Не начат' : 
                       offer.State === 1 ? 'В работе' : 'Завершен'}
                    </span>
                  </div>
                  <div style={styles.offerDetails}>
                    <p><strong>Сумма:</strong> {offer.CreditSum.toLocaleString()} ₽</p>
                    <p><strong>Ставка:</strong> {offer.InterestRate}%</p>
                    <p><strong>Дата начала:</strong> {offer.DateStart ? formatBirthDate(offer.DateStart) : 'Не указана'}</p>
                    <p><strong>Дата окончания:</strong> {offer.DateEnd ? formatBirthDate(offer.DateEnd) : 'Не указана'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.noOffers}>Нет активных запросов на займ</p>
            )
          ) : (
            lendOffers.length > 0 ? (
              lendOffers.map(offer => (
                <div key={offer.ID_Offer} style={styles.offerCard}>
                  <div style={styles.offerHeader}>
                    <h3 style={styles.offerTitle}>{offer.Type}</h3>
                    <span style={{
                      ...styles.statusBadge,
                      ...(offer.State === 1 ? styles.activeBadge : 
                           offer.State === 2 ? styles.completedBadge : styles.pendingBadge)
                    }}>
                      {offer.State === 0 ? 'Не начат' : 
                       offer.State === 1 ? 'В работе' : 'Завершен'}
                    </span>
                  </div>
                  <div style={styles.offerDetails}>
                    <p><strong>Сумма:</strong> {offer.CreditSum.toLocaleString()} ₽</p>
                    <p><strong>Ставка:</strong> {offer.InterestRate}%</p>
                    <p><strong>Дата начала:</strong> {offer.DateStart ? formatBirthDate(offer.DateStart) : 'Не указана'}</p>
                    <p><strong>Дата окончания:</strong> {offer.DateEnd ? formatBirthDate(offer.DateEnd) : 'Не указана'}</p>
                  </div>
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

// Стили компонента (остаются такими же, как в оригинале)
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
    borderBottom: '1px solid #e5e7eb'
  },
  tabButton: {
    flex: 1,
    padding: '15px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 500,
    color: '#6b7280',
    transition: 'all 0.3s'
  } as React.CSSProperties,
  activeTab: {
    color: '#4f46e5',
    borderBottom: '2px solid #4f46e5'
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
    p: {
      margin: '5px 0',
      strong: {
        color: '#4b5563'
      }
    }
  } as React.CSSProperties,
  noOffers: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px 0'
  }
};

export default ProfilePage;