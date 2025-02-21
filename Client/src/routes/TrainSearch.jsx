/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StationsSelect from '../components/StationSelect';
import HourChoices from '../components/HourChoices';
import stationsJson from '../stations.json';
import '../App.css';
import { api } from '../utils/axios';
import { API_BASE_URL } from '../config/api';

const TrainSearch = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState({});
  const [selectedStations, setSelectedStations] = useState({
    binisIstasyonAdi: '',
    inisIstasyonAdi: '',
  });
  const [date, setDate] = useState('');
  const [journeys, setJourneys] = useState(null);
  const [business, setBusiness] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  const toggleHandler = () => {
    setBusiness((prevState) => !prevState);
  };

  useEffect(() => {
    setStations(stationsJson);
  }, []);

  function formatDateToTCDDFormat(dateString) {
    try {
      console.log('Input dateString:', dateString);

      if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
        return dateString;
      }

      const date = new Date(dateString);
      console.log('Parsed date:', date);

      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date input: ${dateString}`);
      }

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      const formattedDate = `${day}.${month}.${year}`;
      console.log('Formatted date:', formattedDate);

      return formattedDate;
    } catch (error) {
      console.error('Date formatting error:', error);
      throw new Error(`Tarih formatı geçersiz: ${dateString}`);
    }
  }

  const fetchJourneys = async () => {
    if (
      !selectedStations.binisIstasyonAdi ||
      !selectedStations.inisIstasyonAdi ||
      !date
    ) {
      alert('Lütfen tüm bilgileri doldurun!');
      return;
    }

    setLoading(true);

    try {
      const formattedDate = formatDateToTCDDFormat(date);
      console.log('Sending request with:', {
        from: selectedStations.binisIstasyonAdi,
        to: selectedStations.inisIstasyonAdi,
        date: formattedDate,
      });

      const response = await api.get(`${API_BASE_URL}/scrape-tickets`, {
        params: {
          from: selectedStations.binisIstasyonAdi,
          to: selectedStations.inisIstasyonAdi,
          date: formattedDate,
        },
      });

      if (response.data) {
        console.log('API Response:', response.data);
        navigate('/train-results', { state: { journeys: response.data } });
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        request: error.request,
        config: error.config,
      });

      let errorMessage = 'Seferler alınırken bir hata oluştu: ';
      if (error.response) {
        errorMessage += error.response.data.error || error.message;
      } else if (error.request) {
        errorMessage +=
          'Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.';
      } else {
        errorMessage += error.message;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen items-center">
      <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto p-12">
        <h1 className="text-3xl font-bold text-center text-[#1E2203] mb-8">
          Train Ticket Search
        </h1>

        <StationsSelect
          stations={stations}
          selectedStations={selectedStations}
          setSelectedStations={setSelectedStations}
        />

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Journey Date
          </label>
          <input
            type="date"
            onChange={(e) => setDate(e.target.value)}
            className="
              w-full px-4 py-2
              border-2 border-gray-200 rounded-lg
              focus:border-[#9ebf3f] focus:ring-[#9ebf3f]
              text-gray-700
              transition-colors duration-200
              hover:border-[#9ebf3f]
            "
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="toggle-container" onClick={toggleHandler}>
          <div className={`toggle-switch ${business ? 'active' : ''}`}>
            <div className="toggle-knob"></div>
          </div>
          <span className="toggle-label">
            {business ? 'Business Class: ON' : 'Business Class: OFF'}
          </span>
        </div>

        <button
          onClick={fetchJourneys}
          disabled={loading}
          className={`
            w-full py-3 px-6
            bg-[#9ebf3f] hover:bg-[#8ba835]
            text-white font-semibold
            rounded-lg
            transition-colors duration-200
            shadow-md hover:shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {loading ? 'Searching...' : 'Search Tickets'}
        </button>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg font-semibold text-blue-600">
                Searching for tickets...
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading && journeys && <HourChoices journeys={journeys} />}
    </div>
  );
};

export default TrainSearch;
