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
    console.log(selectedStations);
  };

  return (
    <div className="flex flex-row gap-4 max-w-2xl max-h-24 justify-center items-center">
      <label>
        Binis Istasyonu:
        <select
          name="binisIstasyonAdi"
          value={selectedStations.binisIstasyonAdi}
          onChange={handleChange}
          className="border-2 border-gray-500"
        >
          <option value="">Select</option>
          {Object.keys(stations).map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
      </label>
      <label>
        Inis Istasyonu:
        <select
          name="inisIstasyonAdi"
          value={selectedStations.inisIstasyonAdi}
          onChange={handleChange}
          className="border-2 border-gray-500"
        >
          <option value="">Select</option>
          {Object.keys(stations).map((station) => (
            <option key={station} value={station}>
              {station}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default StationsSelect;
