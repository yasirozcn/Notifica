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
    <div className="min-h-screen bg-[#fbf9ef] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1E2203]">Uçak Bileti Ara</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          {/* Kalkış Havaalanı */}
          <div className="relative airport-dropdown">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kalkış Havaalanı
            </label>
            <input
              type="text"
              value={searchDeparture}
              onChange={(e) => {
                setSearchDeparture(e.target.value);
                setShowDepartureDropdown(true);
              }}
              onFocus={() => setShowDepartureDropdown(true)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#9ebf3f] focus:ring-[#9ebf3f]"
              placeholder="Havaalanı ara..."
            />
            {showDepartureDropdown && filteredDepartureAirports.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredDepartureAirports.map((airport) => (
                  <div
                    key={airport.icao}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setDeparture(airport.iata);
                      setSearchDeparture(`${airport.city} (${airport.iata})`);
                      setShowDepartureDropdown(false);
                    }}
                  >
                    <div className="font-medium">
                      {airport.city} ({airport.iata})
                    </div>
                    <div className="text-sm text-gray-600">{airport.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Varış Havaalanı */}
          <div className="relative airport-dropdown">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Varış Havaalanı
            </label>
            <input
              type="text"
              value={searchArrival}
              onChange={(e) => {
                setSearchArrival(e.target.value);
                setShowArrivalDropdown(true);
              }}
              onFocus={() => setShowArrivalDropdown(true)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#9ebf3f] focus:ring-[#9ebf3f]"
              placeholder="Havaalanı ara..."
            />
            {showArrivalDropdown && filteredArrivalAirports.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredArrivalAirports.map((airport) => (
                  <div
                    key={airport.icao}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setArrival(airport.iata);
                      setSearchArrival(`${airport.city} (${airport.iata})`);
                      setShowArrivalDropdown(false);
                    }}
                  >
                    <div className="font-medium">
                      {airport.city} ({airport.iata})
                    </div>
                    <div className="text-sm text-gray-600">{airport.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tarih Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gidiş Tarihi
            </label>
            <input
              type="date"
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#9ebf3f] focus:ring-[#9ebf3f]"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <button
            onClick={handleSearch}
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
            {loading ? 'Searching...' : 'Find Flights'}
          </button>

          {error && (
            <div className="text-red-600 text-center mt-4">{error}</div>
          )}
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg font-semibold text-blue-600">
                Uçuşlar aranıyor...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlightSearch;
