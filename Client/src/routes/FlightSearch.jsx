/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import airportsData from '../../airports.json';
import { API_BASE_URL } from '../config/api';

function FlightSearch() {
  const navigate = useNavigate();
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');
  const [searchDeparture, setSearchDeparture] = useState('');
  const [searchArrival, setSearchArrival] = useState('');
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);
  const [showArrivalDropdown, setShowArrivalDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validAirports = useMemo(() => {
    return Object.entries(airportsData)
      .filter(
        ([_, airport]) =>
          airport &&
          airport.iata &&
          airport.iata !== '' &&
          airport.name &&
          airport.city
      )
      .map(([icao, airport]) => ({
        icao,
        iata: airport.iata,
        name: airport.name,
        city: airport.city,
        country: airport.country,
      }));
  }, []);

  const filteredDepartureAirports = useMemo(() => {
    if (!searchDeparture) return [];
    const searchTerm = searchDeparture.toLowerCase();
    return validAirports
      .filter(
        (airport) =>
          airport?.name?.toLowerCase().includes(searchTerm) ||
          airport?.city?.toLowerCase().includes(searchTerm) ||
          airport?.iata?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10);
  }, [searchDeparture, validAirports]);

  const filteredArrivalAirports = useMemo(() => {
    if (!searchArrival) return [];
    const searchTerm = searchArrival.toLowerCase();
    return validAirports
      .filter(
        (airport) =>
          airport?.name?.toLowerCase().includes(searchTerm) ||
          airport?.city?.toLowerCase().includes(searchTerm) ||
          airport?.iata?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10);
  }, [searchArrival, validAirports]);

  const handleSearch = async () => {
    const departureAirport = validAirports.find(
      (airport) => airport.iata === departure
    );
    const arrivalAirport = validAirports.find(
      (airport) => airport.iata === arrival
    );

    if (!departureAirport || !arrivalAirport || !date) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    const formattedDate = new Date(date).toISOString().split('T')[0];

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/search-flights?departure=${departureAirport.iata}&arrival=${arrivalAirport.iata}&date=${formattedDate}`
      );

      if (!response.ok) {
        throw new Error('Sefer arama başarısız');
      }

      const data = await response.json();

      // API yanıtını doğrudan kullan
      navigate('/flight-results', {
        state: {
          flightInfo: data,
        },
      });
    } catch (error) {
      console.error('Hata:', error);
      setError('Sefer arama sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.airport-dropdown')) {
        setShowDepartureDropdown(false);
        setShowArrivalDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-screen items-center">
      <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto p-12">
        <h1 className="text-3xl font-bold text-center text-[#1E2203] mb-8">
          Flight Ticket Search
        </h1>

        {/* Departure Input ve Dropdown */}
        <div className="w-full relative">
          <label className="block text-base font-medium text-gray-700 mb-2">
            Departure City
          </label>
          <input
            type="text"
            value={searchDeparture}
            onChange={(e) => {
              setSearchDeparture(e.target.value);
              setShowDepartureDropdown(true);
            }}
            onFocus={() => setShowDepartureDropdown(true)}
            placeholder="Enter departure city"
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-[#9ebf3f] focus:ring-[#9ebf3f] text-gray-300
             transition-colors duration-200 hover:border-[#9ebf3f]"
          />
          {showDepartureDropdown && filteredDepartureAirports.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto airport-dropdown">
              {filteredDepartureAirports.map((airport) => (
                <div
                  key={airport.iata}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setDeparture(airport.iata);
                    setSearchDeparture(`${airport.city} (${airport.iata})`);
                    setShowDepartureDropdown(false);
                  }}
                >
                  <div className="font-medium">{airport.city}</div>
                  <div className="text-sm text-gray-600">
                    {airport.name} ({airport.iata})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Arrival Input ve Dropdown */}
        <div className="w-full relative">
          <label className="block text-base font-medium text-gray-700 mb-2">
            Arrival City
          </label>
          <input
            type="text"
            value={searchArrival}
            onChange={(e) => {
              setSearchArrival(e.target.value);
              setShowArrivalDropdown(true);
            }}
            onFocus={() => setShowArrivalDropdown(true)}
            placeholder="Enter arrival city"
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-[#9ebf3f] focus:ring-[#9ebf3f] text-gray-300 transition-colors duration-200 hover:border-[#9ebf3f]"
          />
          {showArrivalDropdown && filteredArrivalAirports.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto airport-dropdown">
              {filteredArrivalAirports.map((airport) => (
                <div
                  key={airport.iata}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setArrival(airport.iata);
                    setSearchArrival(`${airport.city} (${airport.iata})`);
                    setShowArrivalDropdown(false);
                  }}
                >
                  <div className="font-medium">{airport.city}</div>
                  <div className="text-sm text-gray-600">
                    {airport.name} ({airport.iata})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date Input */}
        <div className="w-full">
          <label className="block text-base font-medium text-gray-700 mb-2">
            Journey Date
          </label>
          <input
            type="date"
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg focus:border-[#9ebf3f] focus:ring-[#9ebf3f] text-gray-300 transition-colors duration-200 hover:border-[#9ebf3f]"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full py-3 px-6 bg-[#9ebf3f] hover:bg-[#8ba835] text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {loading ? 'Searching...' : 'Search Flights'}
        </button>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg font-semibold text-blue-600">
                Searching for flights...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightSearch;
