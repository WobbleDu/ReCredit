'use client'

import React, { useState } from 'react';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'borrow' | 'lend'>('borrow');
  const [userData] = useState({
    name: 'Иван',
    lastName: 'Иванов',
    phone: '+7 (900) 123-45-67',
    birthDate: '15.05.1990',
    country: 'Россия',
    rating: 4.7,
  });

  const [offers] = useState({
    borrow: [
      {
        id: 1,
        amount: 500000,
        rate: 12.5,
        term: '12 месяцев',
        purpose: 'Потребительские нужды',
        date: '10.01.2023',
        status: 'Активен'
      },
      {
        id: 2,
        amount: 1200000,
        rate: 9.9,
        term: '36 месяцев',
        purpose: 'Ремонт квартиры',
        date: '15.03.2023',
        status: 'На рассмотрении'
      }
    ],
    lend: [
      {
        id: 1,
        amount: 1000000,
        rate: 8.5,
        term: '24 месяца',
        date: '05.02.2023',
        status: 'Активен',
        funded: 650000
      }
    ]
  });

  return (
    <div style={styles.container}>
      {/* Шапка профиля */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Профиль пользователя</h1>
          <nav style={styles.nav}>
            <button 
              onClick={() => window.location.href = '/account.tsx'}
              style={styles.navButton}
            >
              Личный кабинет
            </button>
            <button 
              onClick={() => window.location.href = '/main_offers.tsx'}
              style={styles.navButton}
            >
              Войти
            </button>
            <button 
              onClick={() => window.location.href = '/notifications.tsx'}
              style={styles.navButton}
            >
              Уведомления
            </button>
          </nav>
        </div>
      </header>

      {/* Основная информация о пользователе */}
      <section style={styles.profileSection}>
        <div style={styles.avatarPlaceholder}></div>
        <div style={styles.profileInfo}>
          <h2 style={styles.userName}>{userData.name} {userData.lastName}</h2>
          <div style={styles.userDetails}>
            <p><strong>Телефон:</strong> {userData.phone}</p>
            <p><strong>Дата рождения:</strong> {userData.birthDate}</p>
            <p><strong>Страна:</strong> {userData.country}</p>
            <p><strong>Рейтинг:</strong> {userData.rating} ★</p>
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
            Ищет деньги ({offers.borrow.length})
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'lend' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('lend')}
          >
            Может дать деньги ({offers.lend.length})
          </button>
        </div>

        {/* Список предложений */}
        <div style={styles.offersList}>
          {activeTab === 'borrow' ? (
            offers.borrow.length > 0 ? (
              offers.borrow.map(offer => (
                <div key={offer.id} style={styles.offerCard}>
                  <div style={styles.offerHeader}>
                    <h3 style={styles.offerTitle}>{offer.purpose}</h3>
                    <span style={{
                      ...styles.statusBadge,
                      ...(offer.status === 'Активен' ? styles.activeBadge : styles.pendingBadge)
                    }}>
                      {offer.status}
                    </span>
                  </div>
                  <div style={styles.offerDetails}>
                    <p><strong>Сумма:</strong> {offer.amount.toLocaleString()} ₽</p>
                    <p><strong>Ставка:</strong> {offer.rate}%</p>
                    <p><strong>Срок:</strong> {offer.term}</p>
                    <p><strong>Дата размещения:</strong> {offer.date}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.noOffers}>Нет активных запросов на займ</p>
            )
          ) : (
            offers.lend.length > 0 ? (
              offers.lend.map(offer => (
                <div key={offer.id} style={styles.offerCard}>
                  <div style={styles.offerHeader}>
                    <h3 style={styles.offerTitle}>Предложение инвестора</h3>
                    <span style={{
                      ...styles.statusBadge,
                      ...styles.activeBadge
                    }}>
                      {offer.status}
                    </span>
                  </div>
                  <div style={styles.offerDetails}>
                    <p><strong>Доступная сумма:</strong> {offer.amount.toLocaleString()} ₽</p>
                    <p><strong>Уже инвестировано:</strong> {offer.funded.toLocaleString()} ₽</p>
                    <p><strong>Ставка:</strong> {offer.rate}%</p>
                    <p><strong>Срок:</strong> {offer.term}</p>
                    <p><strong>Дата размещения:</strong> {offer.date}</p>
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

// Стили компонента
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
  },
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
    color: '#9ca3af'
  },
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
  },
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
  },
  activeTab: {
    color: '#4f46e5',
    borderBottom: '2px solid #4f46e5'
  },
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
  },
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
  },
  activeBadge: {
    backgroundColor: '#d1fae5',
    color: '#065f46'
  },
  pendingBadge: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c'
  },
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
  },
  noOffers: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '40px 0'
  }
};

export default ProfilePage;