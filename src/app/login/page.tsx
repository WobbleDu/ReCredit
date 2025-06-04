'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
 onLoginSuccess?: (user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!login || !password) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка авторизации');
      }
        localStorage.setItem('userId', data.user_id);
        router.push('/pages');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    router.push('/pages/registration');
  };
 
   return (
     <div style={{
       minHeight: '100vh',
       display: 'flex',
       alignItems: 'center',
       justifyContent: 'center',
       backgroundColor: '#f3f4f6',
       padding: '1rem'
     }}>
       <div style={{
         maxWidth: '28rem',
         width: '100%',
         backgroundColor: 'white',
         borderRadius: '0.5rem',
         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
         padding: '2rem'
       }}>
         <h2 style={{
           marginBottom: '1.5rem',
           textAlign: 'center',
           fontSize: '1.5rem',
           fontWeight: 'bold',
           color: '#111827'
         }}>
           Вход в систему
         </h2>
         
         {error && (
           <div style={{
             backgroundColor: '#fef2f2',
             color: '#b91c1c',
             padding: '0.75rem',
             borderRadius: '0.375rem',
             marginBottom: '1rem'
           }}>
             {error}
           </div>
         )}
         
         <form onSubmit={handleSubmit}>
           <div style={{ marginBottom: '1rem' }}>
             <label htmlFor="email" style={{
               display: 'block',
               marginBottom: '0.5rem',
               fontSize: '0.875rem',
               fontWeight: '500',
               color: '#374151'
             }}>
               Логин
            </label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
              placeholder="Ваш логин"
            />
          </div>
           
           <div style={{ marginBottom: '1rem' }}>
             <label htmlFor="password" style={{
               display: 'block',
               marginBottom: '0.5rem',
               fontSize: '0.875rem',
               fontWeight: '500',
               color: '#374151'
             }}>
               Пароль
             </label>
             <input
               id="password"
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               style={{
                 width: '100%',
                 padding: '0.5rem 0.75rem',
                 border: '1px solid #d1d5db',
                 borderRadius: '0.375rem',
                 outline: 'none',
                 boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
               }}
               placeholder="••••••••"
             />
           </div>
           
           <div style={{
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'space-between',
             marginBottom: '1.5rem'
           }}>
             <div style={{ display: 'flex', alignItems: 'center' }}>
               <input
                 id="remember-me"
                 type="checkbox"
                 checked={rememberMe}
                 onChange={(e) => setRememberMe(e.target.checked)}
                 style={{
                   marginRight: '0.5rem',
                   width: '1rem',
                   height: '1rem',
                   borderColor: '#d1d5db'
                 }}
               />
               <label htmlFor="remember-me" style={{
                 fontSize: '0.875rem',
                 color: '#374151'
               }}>
                 Запомнить меня
               </label>
             </div>
             
             <button
               type="button"
               onClick={() => alert('Функция восстановления пароля')}
               style={{
                 fontSize: '0.875rem',
                 color: '#4f46e5',
                 fontWeight: '500',
                 background: 'none',
                 border: 'none',
                 cursor: 'pointer'
               }}
             >
               Забыли пароль?
             </button>
           </div>
           
           <button
             type="submit"
             disabled={loading}
             style={{
               width: '100%',
               padding: '0.5rem',
               backgroundColor: '#4f46e5',
               color: 'white',
               fontWeight: '500',
               borderRadius: '0.375rem',
               border: 'none',
               cursor: 'pointer',
               opacity: loading ? 0.5 : 1,
               pointerEvents: loading ? 'none' : 'auto'
             }}
           >
             {loading ? 'Вход...' : 'Войти'}
           </button>
         </form>
         
         <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
           <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
             Ещё нет аккаунта?{' '}
           </span>
           <button
             onClick={handleRegisterClick}
             style={{
               fontSize: '0.875rem',
               color: '#4f46e5',
               fontWeight: '500',
               background: 'none',
               border: 'none',
               cursor: 'pointer'
             }}
           >
             Зарегистрироваться
           </button>
         </div>
       </div>
     </div>
   );
 };
 
 export default LoginForm;
