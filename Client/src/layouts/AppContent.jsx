/* eslint-disable no-unused-vars */
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import NavBar from '../components/NavBar';

export default function AppContent() {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="pt-[64px]">
        <Outlet />
      </div>
    </div>
  );
}
