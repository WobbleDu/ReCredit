'use client'

import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
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
}

interface Offer {
  id: number;
  type: string;
  creditsum: number;
  interestrate: number;
  term?: number;
  ownerfirst_name?: string;
  ownerlast_name?: string;
}

interface Notification {
  id_notification: number;
  user_id: number;
  text: string;
  flag: boolean;
  datetime: string;
}

const IndexPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'interestrate' | 'term' | 'creditsum'>('interestrate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllOffers, setShowAllOffers] = useState(false); // Новое состояние для отображения всех предложений



  const userId = 3; // ID USER



  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        
        // Загрузка предложений с сервера
        const response = await fetch('http://localhost:3001/offers');
        if (!response.ok) {
          throw new Error('Не удалось загрузить предложения');
        }
        const offerdata = await response.json();
        setOffers(offerdata);
        setFilteredOffers(offerdata);

           // Загрузка уведомлений
    const responseNotifications = await fetch(`http://localhost:3001/user/${userId}/notifications`);
    if (!responseNotifications.ok) {
      throw new Error('Не удалось загрузить уведомления');
    }
    const notificationsData = await responseNotifications.json();
    setNotifications(notificationsData);
    setUnreadCount(notificationsData.filter(n => !n.read).length);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
      }
    };
    
    fetchData();
  }, []);

  // Фильтрация и сортировка предложений
  useEffect(() => {
    let result = [...offers];
    
    // Фильтрация по поисковому запросу
    if (searchTerm) {
      result = result.filter(offer => 
        offer.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Сортировка
    result.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });
    
    setFilteredOffers(result);
  }, [searchTerm, sortBy, sortOrder, offers]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.user_id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(unreadCount - 1);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatDate = (dateInput: string | Date) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  
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

  const openAllNotifications = () => {
    alert('Переход к списку всех уведомлений');
  };

  const toggleAllOffers = () => {
    setShowAllOffers(!showAllOffers);
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
        <h1 style={{ 
          color: '#2c3e50',
          margin: 0,
          fontSize: 28,
          fontWeight: 600
        }}>
          ИМЯ, ФАМИЛИЯ ПОЛЬЗОВАТЕЛЯ
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: 8,
                borderRadius: 50,
                backgroundColor: showNotifications ? '#e1e1e1' : 'transparent'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.37 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.64 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z" fill="#2c3e50"/>
              </svg>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 50,
                width: 300,
                backgroundColor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: 8,
                zIndex: 100,
                maxHeight: 400,
                overflowY: 'auto'
              }}>
                <div style={{ 
                  padding: 15, 
                  borderBottom: '1px solid #e1e1e1',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, fontSize: 16 }}>Уведомления</h3>
                  <button 
                    onClick={markAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3498db',
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Прочитать все
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: 15, textAlign: 'center', color: '#7f8c8d' }}>
                    Нет новых уведомлений
                  </div>
                ) : (
                  <>
                    {notifications.map((notification,index) => (
                      <div 
                        key={index}
                        onClick={() => markAsRead(notification.user_id)}
                        style={{
                          padding: 15,
                          borderBottom: '1px solid #e1e1e1',
                          cursor: 'pointer',
                          backgroundColor: notification.flag ? 'white' : '#f8f9fa'
                        }}
                      >
                        <div style={{ 
                          fontWeight: notification.flag ? 'normal' : 'bold',
                          marginBottom: 5
                        }}>
                          {notification.text}
                        </div>
                        <div style={{ 
                          fontSize: 12,
                          color: '#7f8c8d'
                        }}>
                          {formatDate(notification.datetime)}
                        </div>
                      </div>
                    ))}
                    <div 
                      onClick={openAllNotifications}
                      style={{
                        padding: 15,
                        textAlign: 'center',
                        color: '#3498db',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        borderTop: '1px solid #e1e1e1'
                      }}
                    >
                      Показать все уведомления
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
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
        {/* Поиск и фильтрация */}
        <section style={{
          backgroundColor: 'white',
          borderRadius: 10,
          padding: 20,
          marginBottom: 30,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ 
            marginTop: 0,
            marginBottom: 20,
            color: '#2c3e50',
            fontSize: 20
          }}>
            Найти предложения
          </h2>
          
          <div style={{
            display: 'flex',
            gap: 15,
            marginBottom: 20
          }}>
            <div style={{ flex: 3 }}>
              <input
                type="text"
                placeholder="Поиск по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #e1e1e1',
                  borderRadius: 8,
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ flex: 2 }}>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #e1e1e1',
                  borderRadius: 8,
                  fontSize: 16,
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="interestRate">По процентной ставке</option>
                <option value="term">По сроку</option>
                <option value="amount">По сумме</option>
              </select>
            </div>
            
            <div style={{ flex: 1 }}>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 15px',
                  border: '1px solid #e1e1e1',
                  borderRadius: 8,
                  fontSize: 16,
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="asc">По возрастанию</option>
                <option value="desc">По убыванию</option>
              </select>
            </div>
          </div>
        </section>

        {/* Кнопка переключения между разделами */}
        <div style={{ marginBottom: 20 }}>
          <button 
            onClick={toggleAllOffers}
            style={{
              backgroundColor: showAllOffers ? '#2c3e50' : '#3498db',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold',
              transition: 'background-color 0.2s',
              ':hover': {
                backgroundColor: showAllOffers ? '#1a252f' : '#2980b9'
              }
            } as React.CSSProperties}
          >
            {showAllOffers ? 'Показать рекомендуемые' : 'Показать все предложения'}
          </button>
        </div>
        
        {/* Рекомендуемые предложения или Все предложения */}
        <section>
          <h2 style={{ 
            marginTop: 0,
            marginBottom: 20,
            color: '#2c3e50',
            fontSize: 20
          }}>
            {showAllOffers ? 'Все предложения' : 'Рекомендуемые предложения'}
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 20
          }}>
            {(showAllOffers ? offers : filteredOffers).map((offer,index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                ':hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                }
              } as React.CSSProperties}>
                <h3 style={{ 
                  marginTop: 0,
                  marginBottom: 10,
                  color: '#2c3e50'
                }}>
                  {offer.type}
                </h3>
                
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 15
                }}>
                  <div>
                    <div style={{ 
                      color: '#7f8c8d',
                      fontSize: 14,
                      marginBottom: 3
                    }}>
                      Сумма
                    </div>
                    <div style={{ 
                      fontWeight: 'bold',
                      fontSize: 18
                    }}>
                      {offer.creditsum} ₽
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      color: '#7f8c8d',
                      fontSize: 14,
                      marginBottom: 3
                    }}>
                      Ставка
                    </div>
                    <div style={{ 
                      fontWeight: 'bold',
                      fontSize: 18,
                      color: '#27ae60'
                    }}>
                      {offer.interestrate}%
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ 
                      color: '#7f8c8d',
                      fontSize: 14,
                      marginBottom: 3
                    }}>
                      Владелец
                    </div>
                    <div style={{ 
                      fontWeight: 'bold',
                      fontSize: 18
                    }}>
                      {offer.ownerfirst_name || 'Неизвестный владелец'}
                    </div>
                  </div>
                </div>
                
                <button style={{
                  width: '100%',
                  marginTop: 15,
                  padding: '12px 0',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: '#2980b9'
                  }
                } as React.CSSProperties}>
                  Подробнее
                </button>
              </div>
            ))}
          </div>
        </section>
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

export default IndexPage;