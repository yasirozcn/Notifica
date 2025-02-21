/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../utils/axios';
import { API_BASE_URL } from '../config/api';

const MyAlarms = () => {
  const { user, isSignedIn } = useUser();
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isSignedIn) {
      fetchAlarms();
    }
  }, [isSignedIn]);

  const fetchAlarms = async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/user-alarms/${user.id}`);
      setAlarms(response.data.alarms);
    } catch (error) {
      console.error('Alarmlar getirilirken hata:', error);
      setError('Alarmlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlarm = async (alarmId) => {
    if (window.confirm('Bu alarmı silmek istediğinizden emin misiniz?')) {
      try {
        const response = await api.delete(`${API_BASE_URL}/alarms/${alarmId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 saniye timeout
        });

        if (response.data.success) {
          setAlarms(alarms.filter((alarm) => alarm.id !== alarmId));
          alert('Alarm başarıyla silindi');
        }
      } catch (error) {
        console.error('Alarm silinirken hata:', error);

        let errorMessage = 'Alarm silinirken bir hata oluştu: ';
        if (error.response) {
          // Sunucudan hata yanıtı geldi
          errorMessage += error.response.data.error || error.message;
        } else if (error.code === 'ERR_NETWORK') {
          // Ağ hatası
          errorMessage +=
            'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
        } else {
          // Diğer hatalar
          errorMessage += error.message;
        }

        alert(errorMessage);
      }
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#fbf9ef] py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600">Erişim Reddedildi</h1>
          <p className="mt-2 text-gray-600">
            Alarmlarınızı görüntülemek için giriş yapmalısınız.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbf9ef] py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Alarmlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fbf9ef] py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600">Hata</h1>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9ef] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#1E2203] mb-8">Alarmlarım</h1>

        {alarms.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              Henüz kurulmuş bir alarmınız bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alarms.map((alarm) => (
              <div
                key={alarm.id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`w-3 h-3 rounded-full ${alarm.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                      ></span>
                      <span className="font-semibold text-lg">
                        {alarm.from} → {alarm.to}
                      </span>
                    </div>
                    <p className="text-gray-600">Tarih: {alarm.date}</p>
                    <p className="text-gray-600">Saat: {alarm.selectedTime}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Oluşturulma:{' '}
                      {new Date(alarm.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${alarm.isActive ? 'text-green-600' : 'text-gray-500'}`}
                    >
                      {alarm.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                    <button
                      onClick={() => handleDeleteAlarm(alarm.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAlarms;
