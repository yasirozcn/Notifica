/* eslint-disable no-unused-vars */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react'; // Clerk Auth hook'u
import Slider from '../components/Slider';

function Home() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const images = [
    'https://via.placeholder.com/800x400?text=Slide+1',
    'https://via.placeholder.com/800x400?text=Slide+2',
    'https://via.placeholder.com/800x400?text=Slide+3',
  ];

  const handleNavigation = () => {
    if (isSignedIn) {
      navigate('/alarm'); // Giriş yapılmışsa alarm sayfasına yönlendir
    } else {
      navigate('/sign-in'); // Giriş yapılmamışsa sign-in sayfasına yönlendir
    }
  };

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
          onClick={handleNavigation}
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
      <div className="mt-7 flex items-center justify-center">
        <div className="relative w-full h-80">
          <div className="absolute left-2/4 transform translate-x-[-50%] w-3/4 max-w-1/2 h-full bg-[#B7A876] rounded-2xl rotate-[0.5deg]"></div>
          <div className="absolute left-2/4 transform translate-x-[-50%] w-3/4 max-w-1/2 h-full bg-[#C8B9A2] rounded-2xl rotate-[-0.5deg]"></div>
          <div className="absolute left-2/4 top-0 transform translate-x-[-50%] w-3/4 max-w-1/2 h-full flex flex-row items-center justify-evenly">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-start text-[#1E2203]">
                Set Alarm for Tickets or Visa Applications
              </h1>
              <p className="text-center mt-3 text-[#1E2203]">
                Notifica is a web application that allows users to track visa
                appointments and train tickets.
              </p>
            </div>
            <div>
              <button
                className="bg-[#658352] text-white px-4 py-2 rounded-[48px]"
                onClick={handleNavigation}
              >
                Search Trip
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-20 p-20">
        <div className="flex flex-col gap-8 h-full ml-16">
          <div className="flex-1 h-full relative">
            <div className="h-full w-[2px] bg-black absolute left-[-3rem]"></div>
            <div>
              <h2 className="text-3xl font-bold text-[#1E2203]">Feature #1</h2>
              <p className="text-[#1E2203] mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Suspendisse varius enim in eros elementum tristique. Duis
                cursus, mi quis viverra ornare, eros dolor interdum nulla, ut
                commodo diam libero vitae erat.
              </p>
            </div>
          </div>
          <div className="flex-1 h-full relative">
            <div>
              <h2 className="text-3xl font-bold text-[#1E2203]">
                Set Alarm for Visa Applications
              </h2>
              <p className="text-[#1E2203] mt-4">
                Set alarms for visa application deadlines to never miss an
                important date.
              </p>
            </div>
          </div>
          <div className="flex-1 h-full relative">
            <div>
              <h2 className="text-3xl font-bold text-[#1E2203]">Feature #3</h2>
              <p className="text-[#1E2203] mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Suspendisse varius enim in eros elementum tristique. Duis
                cursus, mi quis viverra ornare, eros dolor interdum nulla, ut
                commodo diam libero vitae erat.
              </p>
            </div>
          </div>
        </div>
        <div className="h-full max-h-80">
          <img
            className="rounded-[16px] h-full w-full object-cover aspect-[4/3] max-h-80"
            src="https://via.placeholder.com/800x400?text=Slide+1"
            alt="slide1"
          />
        </div>
      </div>
      <div className="mt-7 flex items-center justify-center">
        <div>
          <h2 className="text-black text-l text-center pb-4">
            Choose the perfect plan for you
          </h2>
          <h1 className="text-black text-2xl text-center pb-4 font-bold">
            Pricing plan
          </h1>
          <h2 className="text-black text-l text-center pb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </h2>
        </div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default Home;
