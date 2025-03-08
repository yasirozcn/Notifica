/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { api } from '../utils/axios';
import { API_BASE_URL } from '../config/api';
import { formatPrice } from '../utils/price-formatter';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function FlightResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { flightInfo } = location.state || {};
  const [selectedFlights, setSelectedFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isSignedIn } = useUser();

  console.log('Flight Info:', flightInfo?.flightInfo?.flights);

  if (!flightInfo) {
    return (
      <div className="min-h-screen bg-[#fbf9ef] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600">Hata</h1>
          <p className="mt-2 text-gray-600">Uçuş bilgisi bulunamadı.</p>
          <button
            onClick={() => navigate('/flight')}
            className="mt-4 px-4 py-2 bg-[#9ebf3f] text-white rounded-lg hover:bg-[#8ba835] transition-colors"
          >
            Aramaya Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const handleFlightSelect = (index) => {
    setSelectedFlights((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
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
      const selectedFlightData = selectedFlights.map((index) => {
        const flight = flightInfo.flightInfo.flights[index];
        console.log('İşlenen uçuş bilgisi:', flight);

        // Route'dan kalkış ve varış bilgilerini al
        const routeParts = flight.route.split(' → ').map((part) => {
          return part.trim();
        });
        console.log('routeParts', routeParts);
        const from = routeParts[0];
        const to = routeParts[routeParts.length - 1];
        console.log(from, to);

        // Fiyatı temizle ve sayıya çevir (örn: "2.818,99 TL" -> 2818.99)
        const priceStr = flight.price
          .replace(/[^\d,.-]/g, '') // Sadece sayılar, virgül, nokta ve tire kalır
          .replace(/\./g, '') // Binlik ayracı noktaları kaldır
          .replace(',', '.'); // Virgülü noktaya çevir
        const price = parseFloat(priceStr);

        console.log('İşlenen fiyat:', flight.price, ' -> ', price);

        // Zamanları ayır
        const [departureTime] = flight.timeInfo
          .split(' → ')
          .map((time) => time.trim());

        // Kontrol amaçlı log
        const alarmData = {
          userId: user.id,
          from,
          to,
          date: location.state.date,
          time: departureTime,
          airline: flight.airline,
          currentPrice: price,
          email: user.primaryEmailAddress.emailAddress,
        };

        console.log('Gönderilecek alarm verisi:', alarmData);

        // Veri kontrolü
        if (
          !alarmData.userId ||
          !alarmData.from ||
          !alarmData.to ||
          !alarmData.date ||
          !alarmData.time ||
          !alarmData.airline ||
          !alarmData.currentPrice ||
          !alarmData.email
        ) {
          throw new Error('Eksik veri: ' + JSON.stringify(alarmData));
        }

        return alarmData;
      });

      console.log('Tüm seçili uçuşlar:', selectedFlightData);

      for (const flightData of selectedFlightData) {
        try {
          console.log(
            'API isteği gönderiliyor:',
            `${API_BASE_URL}/create-flight-alarm`,
            flightData
          );

          const response = await api.post(
            `${API_BASE_URL}/create-flight-alarm`,
            flightData
          );
          console.log('API yanıtı:', response.data);

          if (response.data.success) {
            console.log('Alarm başarıyla oluşturuldu:', response.data.alarmId);
          } else {
            throw new Error('API başarısız yanıt döndü');
          }
        } catch (error) {
          console.error('Alarm oluşturma hatası detayları:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            data: flightData,
          });
          throw error;
        }
      }

      toast.success('Seçili uçuşlar için fiyat alarmları başarıyla kuruldu!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Alarm oluşturma hatası:', error);
      toast.error(`Alarm oluşturulurken bir hata oluştu: ${error.message}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9ef] py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#1E2203]">Uçuş Seferleri</h1>
          <button
            onClick={() => navigate('/flight')}
            className="px-4 py-2 bg-[#9ebf3f] text-white rounded-lg hover:bg-[#8ba835] transition-colors"
          >
            Yeni Arama
          </button>
        </div>

        <div className="grid gap-4">
          {flightInfo.flightInfo.flights.map((flight, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-4 bg-white rounded-lg shadow"
            >
              <input
                type="checkbox"
                id={`flight-${index}`}
                checked={selectedFlights.includes(index)}
                onChange={() => handleFlightSelect(index)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
              <label
                htmlFor={`flight-${index}`}
                className="flex flex-1 justify-between items-center cursor-pointer"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {flight.airlineIcon && (
                      <img
                        src={flight.airlineIcon}
                        alt={flight.airline}
                        className="h-8 w-auto"
                      />
                    )}
                    <span className="font-semibold text-lg">
                      {flight.airline}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    <span>{flight.route}</span>
                  </div>
                  <div className="text-gray-600">
                    <span>{flight.timeInfo}</span>
                  </div>
                  <div className="text-gray-600">
                    <span>Tarih: {location.state.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(flight.price)} TL
                  </span>
                </div>
              </label>
            </div>
          ))}
        </div>

        {selectedFlights.length > 0 && (
          <button
            onClick={handleCreateAlarm}
            disabled={isLoading}
            className={`mt-6 w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Alarm Kuruluyor...
              </div>
            ) : (
              `${selectedFlights.length} Uçuş İçin Fiyat Alarmı Kur`
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
    </div>
  );
}

export default FlightResults;
