/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import NavBar from '../components/NavBar';

export default function AppContent() {
  const { isSignedIn } = useUser(); // Kullanıcı oturum durumu
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate('/alarm'); // Kullanıcı giriş yapmışsa yönlendir
    }
  }, [isSignedIn, navigate]);

  return (
    <>
      <header className="header">
        <NavBar />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
