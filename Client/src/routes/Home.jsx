/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div className="flex flex-col mt-14">
        <h1 className="text-3xl font-bold text-center mb-3 text-[#1E2203]">
          Welcome to Notifica
        </h1>
        <p className="text-center mt-3 text-[#1E2203]">
          Haven&apos;t you found the visa appointment or train ticket
          you&apos;ve been waiting for? Let us track it for you.
        </p>
        <button
          className="bg-[#9ebf3f] text-white px-4 py-2 rounded-[48px] mt-7 w-1/6 mx-auto"
          onClick={() => navigate('/sign-in')}
        >
          Get Started
        </button>
      </div>
      <div className="mt-14 flex flex-col gap-10">
        <Slider images={images} speed={1.5} />
        <Slider images={images} speed={-1.5} />
      </div>
      <div className="mt-7 grid grid-cols-2 gap-20 p-20">
        <div className="h-full max-h-80">
          <img
            className="rounded-[16px] h-full w-full object-cover aspect-[4/3] max-h-80"
            src="https://via.placeholder.com/800x400?text=Slide+1"
            alt="slide1"
          />
        </div>
        <div className=" flex flex-col gap-8 h-full max-h-80 ml-16">
          <div className="flex-1 h-full relative">
            <div className="h-full w-[2px] bg-black absolute left-[-3rem]"></div>
            <div className="">
              <h2 className="text-3xl font-bold text-[#1E2203]">
                Train Tickets Alarm
              </h2>
              <p className="text-[#1E2203] absolute bottom-0">
                Set alarm for train tickets.
              </p>
            </div>
          </div>
          <div className="flex-1 h-full relative">
            <h2 className="text-3xl font-bold text-[#1E2203]">
              Train Tickets Selection
            </h2>
            <p className="text-[#1E2203] absolute bottom-0">
              Select stations, date and class for tickets alarm.
            </p>
          </div>
          <div className="flex-1 h-full relative">
            <h2 className="text-3xl font-bold text-[#1E2203]">
              Visa Application Alarm
            </h2>
            <p className="text-[#1E2203] absolute bottom-0">
              Set alarm for visa applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
