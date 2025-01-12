/* eslint-disable no-unused-vars */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function FlightResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { flightInfo } = location.state || {};

  console.log('Flight Info:', flightInfo.flightInfo.flights); // API yanıtını kontrol etmek için

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

  return (
    <div className="min-h-screen bg-[#fbf9ef] py-12 px-4 sm:px-6 lg:px-8">
      {flightInfo && (
        <div className="mt-8">
          <div className=" flex flex-row items-center justify-between ">
            <h2 className="text-xl font-bold mb-4 text-[#9ebf3f]">
              Bulunan Uçuşlar ({flightInfo?.flightInfo?.totalFlights})
            </h2>
            <button
              onClick={() => navigate('/flight')}
              className="mb-4 px-4 py-2 bg-[#9ebf3f] text-white rounded-lg hover:bg-[#8ba835] transition-colors"
            >
              Aramaya Geri Dön
            </button>
          </div>
          <div className="space-y-4">
            {flightInfo?.flightInfo?.flights?.map((flight, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {flight?.airlineIcon && (
                      <img
                        src={flight?.airlineIcon}
                        alt={flight?.airline}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        {flight?.airline}
                      </div>
                      <div className="text-lg font-medium text-black">
                        {flight?.route}
                      </div>
                      {flight?.timeInfo && (
                        <div className="text-sm text-gray-500 mt-1">
                          {flight?.timeInfo}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-[#9ebf3f]">
                    {flight?.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightResults;
