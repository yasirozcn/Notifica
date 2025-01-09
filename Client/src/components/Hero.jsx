/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';

const Hero = ({ handleNavigation }) => {
  return (
    <div className="flex flex-col mt-14 px-4 md:px-8">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-3 text-[#1E2203]">
        Welcome to Notifica
      </h1>
      <p className="text-sm md:text-base text-center mt-3 text-[#1E2203] max-w-2xl mx-auto">
        Haven&apos;t you found the visa appointment or train ticket you&apos;ve
        been waiting for? Let us track it for you.
      </p>
      <button
        className="bg-[#9ebf3f] text-white px-4 py-2 rounded-[48px] mt-7 w-full sm:w-2/3 md:w-1/3 lg:w-1/6 mx-auto hover:bg-[#8ba835] transition-colors duration-200"
        onClick={handleNavigation}
      >
        Get Started
      </button>
    </div>
  );
};

export default Hero;
