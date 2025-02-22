/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { api } from '../utils/axios';
import { API_BASE_URL } from '../config/api';

const HourChoices = ({ journeys }) => {
  const [selectedTrains, setSelectedTrains] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();

  console.log('Raw API Response:', journeys);

  if (!journeys?.apiResponse) {
    return <div>Veri yükleniyor...</div>;
  }

  const trainData = journeys.apiResponse;

  console.log('Train Data:', trainData);
  const handleTrainSelect = (trainId) => {
    setSelectedTrains((prev) => {
      if (prev.includes(trainId)) {
        return prev.filter((id) => id !== trainId);
      } else {
        return [...prev, trainId];
      }
    });
  };

  const handleCreateAlarm = async () => {
    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }

    setIsLoading(true);
    try {
      const selectedTrainData = selectedTrains.map((trainId) => {
        const train = trainData.trainLegs[0].trainAvailabilities.find(
          (t) => t.trains[0].id === trainId
        );

        // Tarih ve saat bilgilerini kontrol et ve logla
        console.log('Train Data:', {
          from: trainData.from,
          to: trainData.to,
          date: trainData.date,
          departureTime: train.departureTime,
          trainId: trainId,
        });

        return {
          from: trainData.from || '',
          to: trainData.to || '',
          date: trainData.date || '',
          selectedTime: train.departureTime || '',
          email: user.primaryEmailAddress.emailAddress,
        };
      });

      // Seçili seferleri logla
      console.log('Selected Train Data:', selectedTrainData);

      for (const trainData of selectedTrainData) {
        const response = await api.post(`${API_BASE_URL}/create-alarm`, {
          userId: user.id,
          ...trainData,
        });

        if (response.data.success) {
          console.log('Alarm başarıyla oluşturuldu:', response.data.alarmId);
        }
      }

      alert('Seçili seferler için alarmlar başarıyla kuruldu!');
    } catch (error) {
      console.error('Alarm oluşturma hatası:', error);
      alert('Alarm oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
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
          console.log('Train:', train);
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
                disabled={isLoading}
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
          disabled={isLoading}
          className={`mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Alarm Kuruluyor...
            </div>
          ) : (
            `${selectedTrains.length} Sefer İçin Alarm Kur`
          )}
        </button>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg font-semibold text-blue-600">
                Alarmlar Kuruluyor...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HourChoices;
