/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import NavBar from '../components/NavBar';

export default function AppContent() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate('/alarm');
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="pt-[64px]">
        <Outlet />
      </div>
    </div>
  );
}
