'use client'

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
interface UserData {
  id_user: number;
  Login: string;
  firstname: string;
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
  id_offer: number;
  type: string;
  creditsum: number;
  interestrate: number;
  owner_firstname: string; //было ownerfirst_name
  owner_lastname: string; //было ownerlast_name
}

interface Notification {
  id_notifications: number;
  user_id: number;
  text: string;
  flag: boolean;
  datetime: string;
}

const IndexPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [userData, setUserData] = useState<UserData | null>();
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'interestrate' | 'creditsum'>('interestrate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAllOffers, setShowAllOffers] = useState(false); // Новое состояние для отображения всех предложений

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem('userId');

        // Получаем пользователя
         const responseUserData = await fetch(`http://localhost:3001/users/${userId}`);
         console.log(responseUserData);
        const userData = await responseUserData.json();
        console.log(userData);
         setUserData(userData);


        // Загрузка предложений с сервера
        const response = await fetch('http://localhost:3001/offers');
        if (!response.ok) {
          throw new Error('Не удалось загрузить предложения');
        }
        const offerdata = await response.json();
        console.log(offerdata);
        setOffers(offerdata);
        setFilteredOffers(offerdata);

           // Загрузка уведомлений
    const responseNotifications = await fetch(`http://localhost:3001/user/${userId}/notifications`);
    if (!responseNotifications.ok) {
      throw new Error('Не удалось загрузить уведомления');
    }
    const notificationsData = await responseNotifications.json();
    setNotifications(notificationsData);
    setUnreadCount(notificationsData.filter((n: { flag: any; }) => !n.flag).length);
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
  
  // Фильтрация по поисковому запросу (только для рекомендуемых)
  if (!showAllOffers && searchTerm) {
    result = result.filter(offer => 
      offer.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${offer.owner_firstname} ${offer.owner_lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Сортировка (применяется всегда)
  result.sort((a, b) => {
    if (sortBy === 'creditsum' || sortBy === 'interestrate') {
      return sortOrder === 'asc' 
        ? a[sortBy] - b[sortBy] 
        : b[sortBy] - a[sortBy];
    }
    return 0;
  });
  
  setFilteredOffers(result);
}, [searchTerm, sortBy, sortOrder, offers, showAllOffers]);

const updateNotificationOnServer = async (notificationId: number, isRead: boolean) => {
  try {
    const response = await fetch(`http://localhost:3001/notifications/${notificationId}`, {
      method: 'PUT', // или 'PUT' в зависимости от вашего API
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
  //alert(id);
    try {
    // Обновляем на сервере
    await updateNotificationOnServer(id, true);
    
    // Обновляем локальное состояние
    setNotifications(notifications.map(n => 
      n.id_notifications === id ? { ...n, flag: true } : n
    ));
    setUnreadCount(prev => prev - 1);
  } catch (error) {
    console.error('Ошибка при пометке уведомления как прочитанного:', error);
  }
};

const markAllAsRead = async () => {
  try {
    // Получаем ID всех непрочитанных уведомлений
    const unreadIds = notifications
      .filter(n => !n.flag)
      .map(n => n.id_notifications);
    
    // Обновляем все на сервере
    await Promise.all(
      unreadIds.map(id => updateNotificationOnServer(id, true))
    );
    
    // Обновляем локальное состояние
    setNotifications(notifications.map(n => ({ ...n, flag: true })));
    setUnreadCount(0);
  } catch (error) {
    console.error('Ошибка при пометке всех уведомлений как прочитанных:', error);
  }
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
    router.push(`/pages/profile/${userData?.id_user}`);
  };

  const openCabinet = () => {
    router.push('/pages/lk')
  };

  const openAllNotifications = () => {
    router.push('/pages/notifications')
  };

  const toggleAllOffers = () => {
    setShowAllOffers(!showAllOffers);
  };

  const showOffer = (id:number) =>{
  localStorage.setItem('offerId', id.toString());
  
  router.push('/pages/conclusion_of_offers');
  };
  return (
  <div style = {{backgroundColor: '#f9f9f9'}}>
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: '90%',
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
          {userData?.firstname}
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
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id_notifications}
                        onClick={() => markAsRead(notification.id_notifications)}
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
          maxWidth: '100%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
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
            marginBottom: 20,
            justifyContent: 'space-between'
          }}>
            <div style={{ width: '550px' }}>
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

            <div style={{ display: 'flex', gap: 15 }}>

              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'interestrate' | 'creditsum')}
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
                  <option value="interestrate">По процентной ставке</option>
                  <option value="creditsum">По сумме</option>
                </select>
              </div>
              
              <div>
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
            
          </div>
        </section>

        {/* Кнопка переключения между разделами */}
        <div style={{ marginBottom: 20 }}>
          <button 
            onClick={() => {
				setShowAllOffers(!showAllOffers);
				setSearchTerm(''); // Сбрасываем поиск при переключении
		    }}
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
            {filteredOffers.map((offer, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
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
                      {offer.owner_firstname || 'Неизвестный владелец'}
                    </div>
                  </div>
                </div>
                
                <button
                onClick={() => showOffer(offer.id_offer)}
                 style={{
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
    </div>
</div>
  );
};

export default IndexPage;