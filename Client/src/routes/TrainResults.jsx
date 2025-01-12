/* eslint-disable no-unused-vars */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HourChoices from '../components/HourChoices';

function TrainResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { journeys } = location.state || {};

  if (!journeys) {
    return (
      <div className="min-h-screen bg-[#fbf9ef] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600">Hata</h1>
          <p className="mt-2 text-gray-600">Sefer bilgisi bulunamadı.</p>
          <button
            onClick={() => navigate('/train-search')}
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
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#1E2203]">Tren Seferleri</h1>
          <button
            onClick={() => navigate('/alarm')}
            className="px-4 py-2 bg-[#9ebf3f] text-white rounded-lg hover:bg-[#8ba835] transition-colors"
          >
            Yeni Arama
          </button>
        </div>
        <HourChoices journeys={journeys} />
      </div>
    </div>
  );
}

export default TrainResults;
