/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';

const HourChoices = ({ journeys }) => {
  const [selectedTrains, setSelectedTrains] = useState([]);

  console.log('Raw API Response:', journeys);

  if (!journeys?.apiResponse) {
    return <div>Veri yükleniyor...</div>;
  }

  const trainData = journeys.apiResponse;

  const handleTrainSelect = (trainId) => {
    setSelectedTrains((prev) => {
      if (prev.includes(trainId)) {
        return prev.filter((id) => id !== trainId);
      } else {
        return [...prev, trainId];
      }
    });
  };

  const handleCreateAlarm = () => {
    console.log('Seçili seferler:', selectedTrains);
  };

  const calculateTotalAvailability = (train) => {
    return train.trains[0].cars.reduce((total, car) => {
      return total + (car.availabilities[0]?.availability || 0);
    }, 0);
  };

  return (
    <div className="hour-choices flex flex-col gap-4">
      <div className="grid gap-2">
        {trainData.trainLegs[0].trainAvailabilities.map((train, index) => {
          const trainId = train.trains[0].id;
          const totalAvailability = calculateTotalAvailability(train);

          return (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg"
            >
              <input
                type="checkbox"
                id={`train-${trainId}`}
                checked={selectedTrains.includes(trainId)}
                onChange={() => handleTrainSelect(trainId)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor={`train-${trainId}`}
                className="flex flex-1 justify-between items-center text-black cursor-pointer"
              >
                <div>
                  <span className="font-semibold">Tren ID: {trainId}</span>
                  <span className="ml-4 text-gray-600">
                    Kalkış: {train.departureTime}
                  </span>
                  <span className="ml-4 text-gray-600">
                    Varış: {train.arrivalTime}
                  </span>
                  <span className="ml-4 text-blue-600 font-semibold">
                    Boş Koltuk: {totalAvailability}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-bold">
                    Min Price : {train.minPrice} TL
                  </span>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {selectedTrains.length > 0 && (
        <button
          onClick={handleCreateAlarm}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          {selectedTrains.length} Sefer İçin Alarm Kur
        </button>
      )}
    </div>
  );
};

export default HourChoices;
