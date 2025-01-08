/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from 'react';

const StationsSelect = ({
  stations,
  selectedStations,
  setSelectedStations,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedStations((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 max-w-2xl justify-center items-center p-6 bg-white rounded-xl shadow-md">
      <div className="flex flex-col w-full md:w-1/2">
        <label className="text-sm font-medium text-gray-600 mb-1">
          Departure Station
        </label>
        <select
          name="binisIstasyonAdi"
          value={selectedStations.binisIstasyonAdi}
          onChange={handleChange}
          className="
            w-full px-4 py-2
            border-2 border-gray-200 rounded-lg
            focus:border-[#9ebf3f] focus:ring-[#9ebf3f]
            text-gray-700
            bg-white
            transition-colors duration-200
            appearance-none
            cursor-pointer
            hover:border-[#9ebf3f]
          "
        >
          <option value="">Select Station</option>
          {Object.keys(stations).map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col w-full md:w-1/2">
        <label className="text-sm font-medium text-gray-600 mb-1">
          Arrival Station
        </label>
        <select
          name="inisIstasyonAdi"
          value={selectedStations.inisIstasyonAdi}
          onChange={handleChange}
          className="
            w-full px-4 py-2
            border-2 border-gray-200 rounded-lg
            focus:border-[#9ebf3f] focus:ring-[#9ebf3f]
            text-gray-700
            bg-white
            transition-colors duration-200
            appearance-none
            cursor-pointer
            hover:border-[#9ebf3f]
          "
        >
          <option value="">Select Station</option>
          {Object.keys(stations).map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default StationsSelect;
