/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Hero from '../components/Hero';
import Slider from '../components/Slider';
import Features from '../components/Features';
import PricingPlans from '../components/PricingPlans';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import uçak from '../assets/images/uçak1.jpg';
import england from '../assets/images/england.jpg';
import plane from '../assets/images/plane.jpg';
import train1 from '../assets/images/train1.jpg';
import train2 from '../assets/images/train2.jpg';
import oldTrain from '../assets/images/old-train.jpg';

function Home() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [activePlan, setActivePlan] = useState('monthly');
  const images = [uçak, england, plane, train1, train2];

  const handleNavigation = () => {
    if (isSignedIn) {
      navigate('/alarm');
    } else {
      navigate('/sign-in');
    }
  };

  return (
    <div className="min-h-screen">
      <Hero handleNavigation={handleNavigation} />

      <div className="mt-14 flex flex-col gap-10 overflow-hidden">
        <Slider images={images} speed={1.0} />
        <Slider images={images} speed={-1.0} />
      </div>

      <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 p-4 md:p-20">
        <div className="h-full max-h-80 w-full">
          <img
            className="rounded-[16px] h-full w-full object-cover aspect-[4/3] max-h-80"
            src={oldTrain}
            alt="slide1"
          />
        </div>
        <div className="flex flex-col gap-8 h-full max-h-80 md:ml-16">
          <Features />
        </div>
      </div>

      <div className="mt-7 flex items-center justify-center">
        <div className="relative w-full h-80">
          <div className="absolute left-2/4 transform translate-x-[-50%] w-3/4 max-w-1/2 h-full bg-[#B7A876] rounded-2xl rotate-[0.5deg]"></div>
          <div className="absolute left-2/4 transform translate-x-[-50%] w-3/4 max-w-1/2 h-full bg-[#C8B9A2] rounded-2xl rotate-[-0.5deg]"></div>
          <div className="absolute left-2/4 top-0 transform translate-x-[-50%] w-3/4 max-w-1/2 h-full flex flex-col md:flex-row items-center justify-evenly p-4 md:p-0">
            <div className="flex flex-col text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-[#1E2203]">
                Set Alarm for Tickets or Visa Applications
              </h1>
              <p className="text-center mt-3 text-[#1E2203] max-w-md">
                Notifica is a web application that allows users to track visa
                appointments and train tickets.
              </p>
            </div>
            <div>
              <button
                className="bg-[#658352] text-white px-4 py-2 rounded-[48px] hover:bg-[#4e6340] transition-colors duration-200"
                onClick={handleNavigation}
              >
                Search Trip
              </button>
            </div>
          </div>
        </div>
      </div>

      <PricingPlans activePlan={activePlan} setActivePlan={setActivePlan} />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default Home;
