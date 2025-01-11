/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { API_BASE_URL } from '../config/api';

function VisaAlarm() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [formData, setFormData] = useState({
    sourceCountry: 'Turkiye',
    cities: ['Ankara', 'Istanbul', 'Izmir'],
    missionCountry: '',
    visaType: '',
    email: '',
  });

  const missionCountries = [
    'Netherlands',
    'France',
    'Germany',
    'Italy',
    'Spain',
  ];

  const visaTypes = [
    'Tourism',
    'Business',
    'Student',
    'Family Visit',
    'Work Permit',
  ];

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSignedIn) {
      navigate('/sign-in');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/create-alarm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      setResult(response.data);
      console.log('API Response:', response.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9ef] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1E2203]">
            Vize Randevu Takip Sistemi
          </h1>
          <p className="mt-2 text-gray-600">
            Schengen vizesi randevularını takip edin, boş kontenjan olduğunda
            haberdar olun.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-lg shadow"
        >
          {/* Şehir Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şehir
            </label>
            <select
              value={formData.cities[0]}
              onChange={(e) =>
                setFormData({ ...formData, cities: [e.target.value] })
              }
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#9ebf3f] focus:ring-[#9ebf3f]"
            >
              {formData.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Ülke Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vize Başvurusu Yapılacak Ülke
            </label>
            <select
              value={formData.missionCountry}
              onChange={(e) =>
                setFormData({ ...formData, missionCountry: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#9ebf3f] focus:ring-[#9ebf3f]"
            >
              <option value="">Ülke Seçin</option>
              {missionCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Vize Tipi Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vize Tipi
            </label>
            <select
              value={formData.visaType}
              onChange={(e) =>
                setFormData({ ...formData, visaType: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#9ebf3f] focus:ring-[#9ebf3f]"
            >
              <option value="">Vize Tipi Seçin</option>
              {visaTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#9ebf3f] text-white py-2 px-4 rounded-lg hover:bg-[#8ba835] transition-colors duration-200"
          >
            Randevu Kontrol Et
          </button>
        </form>

        {loading && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9ebf3f] mx-auto"></div>
            <p className="mt-2 text-gray-600">Randevular kontrol ediliyor...</p>
          </div>
        )}

        {result && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              result.success ? 'bg-green-50' : 'bg-red-50'
            }`}
          >
            <h3 className="font-bold text-lg mb-2">
              {result.success ? 'Randevu Durumu' : 'Hata'}
            </h3>
            <p className={result.success ? 'text-green-700' : 'text-red-700'}>
              {result.message || result.error}
            </p>
            {result.availableSlots && result.availableSlots.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Müsait Randevular:</p>
                <ul className="list-disc list-inside">
                  {result.availableSlots.map((slot, index) => (
                    <li key={index}>
                      {slot.date}: {slot.slots.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VisaAlarm;
