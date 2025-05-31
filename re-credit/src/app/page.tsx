    'use client'

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const Index: React.FC = () => {
  const router = useRouter();
  
  useEffect(() => {
    router.push('http://localhost:3000/login');
  }, [router]); // router добавлен в зависимости useEffect

  return null;
};

export default Index;