/* eslint-disable no-unused-vars */
import React from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react';
import IndexPage from '../routes/Index';
import logo from '../assets/logos/notifica.png';
import { useNavigate } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate(); // React Router yönlendirme

  return (
    <nav className="flex justify-between bg-[#fbf9ef] text-white py-4 px-10 items-center w-full">
      <div className="flex items-center gap-5">
        <img
          src={logo}
          alt="Logo"
          className="w-30 h-10 cursor-pointer"
          onClick={() => navigate('/')}
        />
        <SignedIn>
          <ul className="flex gap-6">
            <li onClick={() => navigate('/alarm')} className="cursor-pointer">
              TCDD Bilet Notifica
            </li>
            <li className="cursor-pointer">Vize Notifica (coming soon)</li>
          </ul>
        </SignedIn>
        <SignedOut>
          <ul className="flex gap-6">
            <li onClick={() => navigate('/sign-in')} className="cursor-pointer">
              TCDD Bilet Notifica
            </li>
            <li onClick={() => navigate('/sign-in')} className="cursor-pointer">
              Vize Notifica (coming soon)
            </li>
          </ul>
        </SignedOut>
      </div>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <IndexPage />
      </SignedOut>
    </nav>
  );
}

export default NavBar;
