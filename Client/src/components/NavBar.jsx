/* eslint-disable no-unused-vars */
import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import IndexPage from '../routes/Index';
import logo from '../assets/logos/notifica.png';


function NavBar() {
  return (
    <nav className='flex justify-between bg-[#1e2203] text-white py-4 px-10 items-center w-full'>
      <div className=''>
        <img src={logo} alt="Logo" className='w-30 h-10'/>
      </div>
      <div>
      </div>
      <div>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <IndexPage />
        </SignedOut>
      </div>
    </nav>
     )
}

export default NavBar