"use client";

import { useState } from 'react';
import Auth from './components/Auth';
import PasswordManager from './components/PasswordManager';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <main>
      {isAuthenticated ? (
        <PasswordManager />
      ) : (
        <Auth onAuthSuccess={handleAuthSuccess} />
      )}
    </main>
  );
}