/* eslint-disable no-unused-vars */
import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";


function NavBar() {
  return (
    <nav className='flex justify-between bg-gray-800 text-white p-4 items-center w-full'>
      <div className=''>NOTİFİCA</div>
      <div>
      <SignedIn>
        <UserButton/>
      </SignedIn>
      <SignedOut>
        <SignInButton/>
      </SignedOut>
      </div>
    </nav>
     )
}

export default NavBar