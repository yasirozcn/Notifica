/* eslint-disable no-unused-vars */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Slider from '../components/Slider';

function Home() {
  const navigate = useNavigate();
  const images = [
    'https://via.placeholder.com/800x400?text=Slide+1',
    'https://via.placeholder.com/800x400?text=Slide+2',
    'https://via.placeholder.com/800x400?text=Slide+3',
  ];

  return (
    <div>
      <div className='flex flex-col mt-14'>
        <h1 className='text-3xl font-bold text-center mb-3'>Welcome to Notifica</h1>
        <p className='text-center mt-3'>Haven&apos;t you found the visa or train ticket you&apos;ve been waiting for? Let us track it for you.</p>
        <button className='bg-[#9ebf3f] text-white px-4 py-2 rounded-[48px] mt-7 w-1/6 mx-auto'
        onClick={() => navigate('/sign-in')}
        >
          Get Started</button>
      </div>
      <div className='mt-14'>
      <Slider images={images} speed={1.5} />
      </div>
    </div>
  )
}

export default Home