/* eslint-disable no-unused-vars */
import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import IndexPage from '../routes/Index';


function NavBar() {
  return (
    <nav className='flex justify-between bg-[#1e2203] text-white p-4 items-center w-full'>
      <div className=''>NOTİFİCA</div>
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