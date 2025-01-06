/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { postRequest } from './api';
import StationsSelect from './components/StationSelect';
import HourChoices from './components/HourChoices';
import stationsJson from './stations.json';
import './App.css';
import NavBar from './components/NavBar';
import axios from 'axios';

const SEFER_URL = 'https://api-yebsp.tcddtasimacilik.gov.tr/sefer/seferSorgula';

const App = () => {
  const [stations, setStations] = useState({});
  const [selectedStations, setSelectedStations] = useState({
    binisIstasyonAdi: '',
    inisIstasyonAdi: '',
  });
  const [date, setDate] = useState('');
  const [journeys, setJourneys] = useState(null);
  const [selectedHours, setSelectedHours] = useState([]);
  const [business, setBusiness] = useState(false);

  const toggleHandler = () => {
    setBusiness((prevState) => !prevState);
  };
  // İstasyondan verilerini yükleme
  useEffect(() => {
    setStations(stationsJson);
  }, []);

  function formatDateToTCDDFormat(dateString) {
    try {
      console.log('Input dateString:', dateString); // Debug için gelen tarihi logla

      // Eğer tarih zaten DD.MM.YYYY formatındaysa direkt döndür
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
        return dateString;
      }

      // ISO string'den Date objesine çevir
      const date = new Date(dateString);
      console.log('Parsed date:', date); // Debug için parse edilmiş tarihi logla

      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date input: ${dateString}`);
      }

      // Tarihi DD.MM.YYYY formatına çevir
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      const formattedDate = `${day}.${month}.${year}`;
      console.log('Formatted date:', formattedDate); // Debug için formatlanmış tarihi logla

      return formattedDate;
    } catch (error) {
      console.error('Date formatting error:', error);
      throw new Error(`Tarih formatı geçersiz: ${dateString}`);
    }
  }

  // Sefer sorgulama
  async function fetchJourneys() {
    if (
      !selectedStations.binisIstasyonAdi ||
      !selectedStations.inisIstasyonAdi ||
      !date
    ) {
      alert('Lütfen tüm bilgileri doldurun!');
      return;
    }

    try {
      const formattedDate = formatDateToTCDDFormat(date);
      console.log('Sending request with:', {
        from: selectedStations.binisIstasyonAdi,
        to: selectedStations.inisIstasyonAdi,
        date: formattedDate,
      });

      const response = await axios.get('http://localhost:8080/scrape-tickets', {
        params: {
          from: selectedStations.binisIstasyonAdi,
          to: selectedStations.inisIstasyonAdi,
          date: formattedDate,
        },
      });

      console.log('API Response:', response.data);
      setJourneys(response.data);
    } catch (error) {
      console.error('Error fetching journeys:', error);
      setJourneys(null);
      alert(
        'Seferler alınırken bir hata oluştu: ' +
          (error.response?.data?.error || error.message)
      );
    }
  }

  return (
    <div className="flex flex-col h-screen items-center">
      <div>
        <StationsSelect
          stations={stations}
          selectedStations={selectedStations}
          setSelectedStations={setSelectedStations}
        />
        <input
          type="date"
          onChange={(e) => setDate(formatDateToTCDDFormat(e.target.value))}
        />
        <div className="toggle-container" onClick={toggleHandler}>
          <div className={`toggle-switch ${business ? 'active' : ''}`}>
            <div className="toggle-knob"></div>
          </div>
          <span className="toggle-label">
            {business
              ? 'Business Class Tickets: ON'
              : 'Business Class Tickets: OFF'}
          </span>
        </div>
        <button
          onClick={fetchJourneys}
          className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
        >
          Find Journeys
        </button>
        {journeys && <HourChoices journeys={journeys} />}
      </div>
    </div>
  );
};

export default App;
