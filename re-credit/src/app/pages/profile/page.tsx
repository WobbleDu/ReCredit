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
  income: number;
  country: string;
  dti: number;
}

interface Offer {
  id_offer: number;
  type: string;
  creditsum: number;
  interestrate: number;
  state: number;
  datestart: string | null;
  dateend: string | null;
  owner_id: number | null;
  guest_id: number | null;
  owner_firstname: string | null;
  owner_lastname: string | null;
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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Неверная дата';
      return date.toLocaleDateString('ru-RU');
    } catch {
      return 'Неверная дата';
    }
  };

  const getStatus = (state: number) => {
    switch(state) {
      case 0: return 'На рассмотрении';
      case 1: return 'Активен';
      case 2: return 'Завершен';
      default: return 'Неизвестен';
    }
  };

  const calculateTerm = (start: string | null, end: string | null): string => {
    if (!start || !end) return 'Не указан';
    
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime())) return 'Неверная дата начала';
      if (isNaN(endDate.getTime())) return 'Неверная дата окончания';
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 
        + (endDate.getMonth() - startDate.getMonth());
      
      return `${months} месяцев`;
    } catch {
      return 'Ошибка расчета';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        if (!userId) throw new Error('Пользователь не авторизован');
        
        // Загрузка данных пользователя
        const userResponse = await fetch(`http://localhost:3001/users/${userId}`);
        if (!userResponse.ok) {
          throw new Error(`Ошибка пользователя: ${userResponse.status}`);
        }
        const userData = await userResponse.json();
        setUserData(userData);

        // Загрузка всех предложений
        const offersResponse = await fetch('http://localhost:3001/offers');
        if (!offersResponse.ok) {
          throw new Error(`Ошибка предложений: ${offersResponse.status}`);
        }
        const allOffers = await offersResponse.json();

        const numericUserId = parseInt(userId, 10);

        const borrows = allOffers.filter((offer: Offer) => 
          offer.guest_id != null && Number(offer.guest_id) === numericUserId
        );

        const lends = allOffers.filter((offer: Offer) => 
          offer.owner_id != null && Number(offer.owner_id) === numericUserId
        );

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
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div style={{ color: 'red', textAlign: 'center', padding: '40px' }}>{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Пользователь не найден</div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="headerContent">
          <h1 className="title">Профиль пользователя</h1>
          <nav className="nav">
            <button 
              onClick={() => router.push('/account')}
              className="navButton"
            >
              Личный кабинет
            </button>
            <button 
              onClick={() => router.push('/')}
              className="navButton"
            >
              На главную
            </button>
          </nav>
        </div>
      </header>

      <section className="profileSection">
        <div className="avatarPlaceholder">
          {userData.firstname?.charAt(0)}{userData.lastname?.charAt(0)}
        </div>
        <div className="profileInfo">
          <h2 className="userName">
            {userData.firstname || 'Имя'} {userData.lastname || 'Фамилия'}
          </h2>
          <div className="userDetails">
            <p><strong>Телефон:</strong> {userData.phonenumber || 'не указан'}</p>
            <p><strong>Дата рождения:</strong> {userData.birthdate ? formatBirthDate(userData.birthdate) : 'не указана'}</p>
            <p><strong>Страна:</strong> {userData.country || 'не указана'}</p>
            <p><strong>Доход:</strong> {userData.income?.toLocaleString('ru-RU') || '0'} ₽</p>
            <p><strong>Кредитный рейтинг:</strong> {userData.dti ?? 0}/100</p>
          </div>
        </div>
      </section>

      <section className="tabsSection">
        <div className="tabs">
          <button
            className={`tabButton ${activeTab === 'borrow' ? 'activeTab' : ''}`}
            onClick={() => setActiveTab('borrow')}
          >
            Мои займы ({borrowOffers.length})
          </button>
          <button
            className={`tabButton ${activeTab === 'lend' ? 'activeTab' : ''}`}
            onClick={() => setActiveTab('lend')}
          >
            Мои инвестиции ({lendOffers.length})
          </button>
        </div>

        <div className="offersList">
          {activeTab === 'borrow' ? (
            borrowOffers.length > 0 ? (
              borrowOffers.map((offer) => (
                <div key={offer.id_offer} className="offerCard">
                  <div className="offerHeader">
                    <h3 className="offerTitle">{offer.type || 'Тип не указан'}</h3>
                    <span className={`statusBadge ${
                      offer.state === 1 ? 'activeBadge' : 
                      offer.state === 2 ? 'completedBadge' : 'pendingBadge'
                    }`}>
                      {getStatus(offer.state)}
                    </span>
                  </div>
                  <div className="offerDetails">
                    <p><strong>Сумма:</strong> {(offer.creditsum ?? 0).toLocaleString('ru-RU')} ₽</p>
                    <p><strong>Ставка:</strong> {offer.interestrate || '0'}%</p>
                    <p><strong>Срок:</strong> {calculateTerm(offer.datestart, offer.dateend)}</p>
                    <p><strong>Дата начала:</strong> {offer.datestart ? formatBirthDate(offer.datestart) : 'не указана'}</p>
                    <p><strong>Инвестор:</strong> {offer.owner_firstname ? `${offer.owner_firstname} ${offer.owner_lastname}` : 'не указан'}</p>
                  </div>
                  <button 
                    className="detailsButton"
                    onClick={() => handleOfferClick(offer.id_offer)}
                  >
                    Подробнее
                  </button>
                </div>
              ))
            ) : (
              <p className="noOffers">Нет активных займов</p>
            )
          ) : (
            lendOffers.length > 0 ? (
              lendOffers.map((offer) => (
                <div key={offer.id_offer} className="offerCard">
                  <div className="offerHeader">
                    <h3 className="offerTitle">{offer.type}</h3>
                    <span className={`statusBadge ${
                      offer.state === 1 ? 'activeBadge' : 
                      offer.state === 2 ? 'completedBadge' : 'pendingBadge'
                    }`}>
                      {getStatus(offer.state)}
                    </span>
                  </div>
                  <div className="offerDetails">
                    <p><strong>Сумма:</strong> {(offer.creditsum ?? 0).toLocaleString('ru-RU')} ₽</p>
                    <p><strong>Ставка:</strong> {offer.interestrate || '0'}%</p>
                    <p><strong>Срок:</strong> {calculateTerm(offer.datestart, offer.dateend)}</p>
                    <p><strong>Дата начала:</strong> {offer.datestart ? formatBirthDate(offer.datestart) : 'не указана'}</p>
                    <p><strong>Заемщик:</strong> {offer.guest_id ? `ID: ${offer.guest_id}` : 'не указан'}</p>
                  </div>
                  <button 
                    className="detailsButton"
                    onClick={() => handleOfferClick(offer.id_offer)}
                  >
                    Подробнее
                  </button>
                </div>
              ))
            ) : (
              <p className="noOffers">Нет активных инвестиций</p>
            )
          )}
        </div>
      </section>

      <style jsx>{`
        .container {
          font-family: 'Segoe UI', Roboto, sans-serif;
          color: #333;
          line-height: 1.6;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          background-color: #4f46e5;
          color: white;
          padding: 20px 0;
          margin-bottom: 30px;
          border-radius: 8px;
        }
        
        .headerContent {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        .title {
          margin: 0;
          font-size: 24px;
        }
        
        .nav {
          display: flex;
          gap: 10px;
        }
        
        .navButton {
          padding: 8px 16px;
          background-color: transparent;
          border: 1px solid white;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .navButton:hover {
          background-color: rgba(255,255,255,0.1);
        }
        
        .profileSection {
          display: flex;
          align-items: center;
          gap: 30px;
          margin-bottom: 40px;
          padding: 20px;
          background-color: #f9fafb;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .avatarPlaceholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background-color: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          color: #9ca3af;
          font-weight: bold;
        }
        
        .profileInfo {
          flex: 1;
        }
        
        .userName {
          margin: 0 0 10px 0;
          font-size: 28px;
          color: #111827;
        }
        
        .userDetails {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        
        .userDetails p {
          margin: 5px 0;
        }
        
        .userDetails strong {
          color: #4b5563;
        }
        
        .tabsSection {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .tabButton {
          flex: 1;
          padding: 15px;
          background-color: transparent;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          color: #6b7280;
          transition: all 0.3s;
        }
        
        .activeTab {
          color: #4f46e5;
          border-bottom: 2px solid #4f46e5;
        }
        
        .offersList {
          padding: 20px;
        }
        
        .offerCard {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 15px;
          transition: all 0.3s;
        }
        
        .offerCard:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .offerHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .offerTitle {
          margin: 0;
          font-size: 18px;
          color: #111827;
        }
        
        .statusBadge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .activeBadge {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .pendingBadge {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .completedBadge {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .offerDetails {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .offerDetails p {
          margin: 5px 0;
        }
        
        .offerDetails strong {
          color: #4b5563;
        }
        
        .detailsButton {
          width: 100%;
          padding: 10px 0;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .detailsButton:hover {
          background-color: #2980b9;
        }
        
        .noOffers {
          text-align: center;
          color: #6b7280;
          padding: 40px 0;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;