/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import airportsData from '../../airports.json';
import { API_BASE_URL } from '../config/api';

function FlightSearch() {
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [date, setDate] = useState('');
  const [searchDeparture, setSearchDeparture] = useState('');
  const [searchArrival, setSearchArrival] = useState('');
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);
  const [showArrivalDropdown, setShowArrivalDropdown] = useState(false);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flightInfo, setFlightInfo] = useState(null);

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

    // Tarihi yyyy-mm-dd formatına çevir
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
      setFlightInfo(data.flightInfo);
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
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#9ebf3f] focus:ring-[#9ebf3f]"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-[#9ebf3f] text-white py-2 px-4 rounded-lg hover:bg-[#8ba835] transition-colors duration-200"
          >
            Uçuş Ara
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9ebf3f] mx-auto"></div>
          <p className="mt-2 text-gray-600">Uçuşlar aranıyor...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {flightInfo && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Bulunan Uçuşlar ({flightInfo.totalFlights})
          </h2>
          <div className="space-y-4">
            {flightInfo.flights.map((flight, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {flight.airlineIcon && (
                      <img
                        src={flight.airlineIcon}
                        alt={flight.airline}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                    <div>
                      <div className="text-sm text-gray-600 mb-1">
                        {flight.airline}
                      </div>
                      <div className="text-lg font-medium text-black">
                        {flight.route}
                      </div>
                      {flight.timeInfo && (
                        <div className="text-sm text-gray-500 mt-1">
                          {flight.timeInfo}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-[#9ebf3f]">
                    {flight.price}
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

export default FlightSearch;
