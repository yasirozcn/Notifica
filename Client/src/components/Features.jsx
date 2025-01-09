/* eslint-disable no-unused-vars */

import React from 'react';

const Features = () => {
  return (
    <>
      <div className="flex-1 h-full relative">
        <div className="hidden md:block h-full w-[2px] bg-black absolute left-[-3rem]"></div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E2203]">
            Train Tickets Alarm
          </h2>
          <p className="text-[#1E2203] mt-2 md:absolute md:bottom-0">
            Set alarm for train tickets.
          </p>
        </div>
      </div>
      <div className="flex-1 h-full relative">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1E2203]">
          Train Tickets Selection
        </h2>
        <p className="text-[#1E2203] mt-2 md:absolute md:bottom-0">
          Select stations, date and class for tickets alarm.
        </p>
      </div>
      <div className="flex-1 h-full relative">
        <h2 className="text-2xl md:text-3xl font-bold text-[#1E2203]">
          Visa Application Alarm
        </h2>
        <p className="text-[#1E2203] mt-2 md:absolute md:bottom-0">
          Set alarm for visa applications.
        </p>
      </div>
    </>
  );
};

export default Features;
