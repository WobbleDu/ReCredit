import React, { useState } from 'react';

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

const AccountPage: React.FC = () => {
  // Mock user data - in a real app, this would come from props or state management
  const [user, setUser] = useState<UserData>({
    ID_User: 1,
    Login: 'johndoe',
    FirstName: 'John',
    LastName: 'Doe',
    BirthDate: '1990-01-15',
    PhoneNumber: '+1234567890',
    INN: '123456789012',
    PassportSerie: 1234,
    PassportNumber: 567890,
    Income: 50000.00,
    Country: 'United States'
  });

  const navigateTo = (page: string) => {
    // In a real app without react-router, you might use window.location
    console.log(`Navigating to ${page}`);
    // window.location.href = `/${page}`;
  };

  return (
    <div className="account-page">
      <header className="account-header">
        <h1>My Account</h1>
        <nav className="account-nav">
          <button onClick={() => navigateTo('profile')}>Profile</button>
          <button onClick={() => navigateTo('main_offers')}>Login</button>
          <button onClick={() => navigateTo('notifications')}>Notifications</button>
          <button onClick={() => navigateTo('create_offers')}>Add Listing</button>
        </nav>
      </header>

      <div className="account-content">
        <section className="user-info">
          <h2>Personal Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">First Name:</span>
              <span className="info-value">{user.FirstName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Name:</span>
              <span className="info-value">{user.LastName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Birth Date:</span>
              <span className="info-value">{user.BirthDate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone Number:</span>
              <span className="info-value">{user.PhoneNumber}</span>
            </div>
            <div className="info-item">
              <span className="info-label">INN:</span>
              <span className="info-value">{user.INN}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Passport:</span>
              <span className="info-value">{user.PassportSerie} {user.PassportNumber}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Income:</span>
              <span className="info-value">${user.Income.toFixed(2)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Country:</span>
              <span className="info-value">{user.Country}</span>
            </div>
          </div>
        </section>

        <section className="account-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-button" onClick={() => navigateTo('profile')}>
              Edit Profile
            </button>
            <button className="action-button" onClick={() => navigateTo('create_offers')}>
              Create New Listing
            </button>
            <button className="action-button" onClick={() => navigateTo('notifications')}>
              View Notifications
            </button>
          </div>
        </section>
      </div>

      <style jsx>{`
        .account-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        .account-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 1px solid #eee;
          padding-bottom: 20px;
        }
        
        .account-nav button {
          margin-left: 10px;
          padding: 8px 16px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .account-nav button:hover {
          background-color: #e0e0e0;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 20px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        
        .info-label {
          font-weight: bold;
          margin-right: 10px;
        }
        
        .account-actions {
          margin-top: 40px;
        }
        
        .action-buttons {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }
        
        .action-button {
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .action-button:hover {
          background-color: #45a049;
        }
      `}</style>
    </div>
  );
};

export default AccountPage;