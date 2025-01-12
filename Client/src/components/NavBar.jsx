/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react';
import IndexPage from '../routes/Index';
import logo from '../assets/logos/notifica.png';
import { useNavigate, Link, useLocation } from 'react-router-dom';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fbf9ef] shadow-sm">
      <div className="flex justify-between py-4 px-4 md:px-10 items-center w-full">
        <div className="flex items-center gap-5">
          <img
            src={logo}
            alt="Logo"
            className="w-30 h-10 cursor-pointer"
            onClick={() => navigate('/')}
          />
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <SignedIn>
              <ul className="flex gap-6">
                <li
                  onClick={() => navigate('/alarm')}
                  className="cursor-pointer text-black font-bold"
                >
                  TCDD Bilet Notifica
                </li>
                <li
                  onClick={() => navigate('/flight')}
                  className="cursor-pointer text-black font-bold"
                >
                  Uçak Bileti Ara
                </li>
              </ul>
            </SignedIn>
            <SignedOut>
              <ul className="flex gap-6">
                <li
                  onClick={() => navigate('/sign-in')}
                  className="cursor-pointer"
                >
                  TCDD Bilet Notifica
                </li>
                <li className="opacity-50 cursor-not-allowed">
                  Vize Notifica (Coming Soon)
                </li>
              </ul>
            </SignedOut>
          </div>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:block">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <IndexPage />
          </SignedOut>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[#1E2203] p-2"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#fbf9ef] shadow-lg border-t border-gray-100">
          <div className="px-4 py-3">
            {/* Mobile Menu Header - Profile/Auth */}
            <div className="border-b border-gray-200 pb-3 mb-3">
              <SignedIn>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Hesabım</span>
                  <UserButton />
                </div>
              </SignedIn>
              <SignedOut>
                <div className="flex flex-col gap-2">
                  <button
                    className="w-full py-2 px-4 bg-[#9ebf3f] text-white rounded-[48px] hover:bg-[#8ba835] transition-colors duration-200"
                    onClick={() => {
                      navigate('/sign-in');
                      setIsMenuOpen(false);
                    }}
                  >
                    Giriş Yap
                  </button>
                  <button
                    className="w-full py-2 px-4 border-2 border-[#9ebf3f] text-[#9ebf3f] rounded-[48px] hover:bg-slate-100 transition-colors duration-200"
                    onClick={() => {
                      navigate('/sign-up');
                      setIsMenuOpen(false);
                    }}
                  >
                    Kayıt Ol
                  </button>
                </div>
              </SignedOut>
            </div>

            {/* Mobile Menu Items */}
            <div className="space-y-1">
              <SignedIn>
                <Link
                  to="/flight-search"
                  className={`w-full text-left px-3 py-2 text-[#1E2203] hover:bg-gray-100 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/flight-search'
                      ? 'text-[#9ebf3f] font-bold'
                      : ''
                  }`}
                >
                  Uçak Bileti
                </Link>
                <Link
                  to="/train-search"
                  className={`w-full text-left px-3 py-2 text-[#1E2203] hover:bg-gray-100 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/train-search'
                      ? 'text-[#9ebf3f] font-bold'
                      : ''
                  }`}
                >
                  Tren Bileti
                </Link>
              </SignedIn>
              <SignedOut>
                <Link
                  to="/sign-in"
                  className="w-full text-left px-3 py-2 text-[#1E2203] hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  TCDD Bilet Notifica
                </Link>
                <button
                  disabled
                  className="w-full text-left px-3 py-2 text-[#1E2203] opacity-50 cursor-not-allowed"
                >
                  Vize Notifica (Coming Soon)
                </button>
              </SignedOut>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default NavBar;
