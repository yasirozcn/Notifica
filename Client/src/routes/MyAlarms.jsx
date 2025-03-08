/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../utils/axios';
import { API_BASE_URL } from '../config/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyAlarms = () => {
  const { user, isSignedIn } = useUser();
  const [alarms, setAlarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('train'); // 'train' veya 'flight'

  useEffect(() => {
    if (isSignedIn) {
      fetchAlarms();
    }
  }, [isSignedIn]);

  const formatFlightPrice = (price) => {
    if (!price) return 'Belirtilmemiş';
    // String'e çevir ve sadece sayıları al
    const numericPrice = price.toString().replace(/[^\d]/g, '');
    // 100'e bölerek virgülden sonra 2 basamak elde et
    const formattedPrice = (parseFloat(numericPrice) / 100).toFixed(2);
    // Türkçe para formatına çevir
    return (
      new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(formattedPrice) + ' TL'
    );
  };

  const fetchAlarms = async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/user-alarms/${user.id}`);

      // Alarm verilerini kontrol et ve formatlı
      const formattedAlarms = response.data.alarms.map((alarm) => ({
        ...alarm,
        date: alarm.date ? alarm.date.trim() : 'Tarih bilgisi yok',
        selectedTime: alarm.selectedTime
          ? alarm.selectedTime.trim()
          : alarm.time
            ? alarm.time.trim()
            : 'Saat bilgisi yok',
        createdAt: new Date(alarm.createdAt).toLocaleString('tr-TR'),
        // Fiyatları formatla
        currentPrice:
          alarm.type === 'flight'
            ? formatFlightPrice(alarm.currentPrice)
            : alarm.currentPrice
              ? new Intl.NumberFormat('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(alarm.currentPrice) + ' TL'
              : 'Belirtilmemiş',
        initialPrice:
          alarm.type === 'flight'
            ? formatFlightPrice(alarm.initialPrice)
            : alarm.initialPrice
              ? new Intl.NumberFormat('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(alarm.initialPrice) + ' TL'
              : 'Belirtilmemiş',
      }));

      setAlarms(formattedAlarms);
    } catch (error) {
      console.error('Alarmlar getirilirken hata:', error);
      toast.error(
        error.response?.data?.error || 'Alarmlar yüklenirken bir hata oluştu',
        {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      setError(
        error.response?.data?.error || 'Alarmlar yüklenirken bir hata oluştu'
      );
    } finally {
      setLoading(false);
    }
  };

  // Filtrelenmiş alarmları al
  const filteredAlarms = alarms.filter((alarm) => alarm.type === selectedType);

  const handleDeleteAlarm = async (alarmId) => {
    toast.warn(
      <div>
        <p className="mb-2">Bu alarmı silmek istediğinizden emin misiniz?</p>
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm"
            onClick={() => toast.dismiss()}
          >
            İptal
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
            onClick={async () => {
              toast.dismiss();
              try {
                const response = await api.delete(
                  `${API_BASE_URL}/alarms/${alarmId}`,
                  {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    timeout: 10000,
                  }
                );

                if (response.data.success) {
                  setAlarms(alarms.filter((alarm) => alarm.id !== alarmId));
                  toast.success('Alarm başarıyla silindi', {
                    position: 'top-right',
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                  });
                }
              } catch (error) {
                console.error('Alarm silinirken hata:', error);

                let errorMessage = 'Alarm silinirken bir hata oluştu: ';
                if (error.response) {
                  errorMessage += error.response.data.error || error.message;
                } else if (error.code === 'ERR_NETWORK') {
                  errorMessage +=
                    'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
                } else {
                  errorMessage += error.message;
                }

                toast.error(errorMessage, {
                  position: 'top-right',
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
              }
            }}
          >
            Sil
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        closeButton: false,
      }
    );
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-[#1E2203]">Alarmlarım</h1>
          <div className="flex justify-center items-center w-full md:w-auto bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setSelectedType('train')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-md transition-all duration-200 ${
                selectedType === 'train'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tren Biletleri
            </button>
            <button
              onClick={() => setSelectedType('flight')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-md transition-all duration-200 ${
                selectedType === 'flight'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Uçak Biletleri
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Alarmlar yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Hata</h1>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        ) : filteredAlarms.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">
              {selectedType === 'train' ? 'Tren' : 'Uçak'} bileti alarmınız
              bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlarms.map((alarm) => (
              <div
                key={alarm.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          alarm.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      ></span>
                      <span className="font-semibold text-xl">
                        {alarm.from} → {alarm.to}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <strong>Tarih:</strong> {alarm.date}
                      </p>
                      <p className="text-gray-700">
                        <strong>Kalkış Saati:</strong> {alarm.selectedTime}
                      </p>
                      {alarm.type === 'train' && alarm.trainInfo && (
                        <>
                          <p className="text-gray-700">
                            <strong>Varış Saati:</strong>{' '}
                            {alarm.trainInfo.arrivalTime || 'Belirtilmemiş'}
                          </p>
                          <p className="text-gray-700">
                            <strong>Minimum Fiyat:</strong>{' '}
                            {alarm.trainInfo.minPrice
                              ? new Intl.NumberFormat('tr-TR', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(alarm.trainInfo.minPrice) + ' TL'
                              : 'Belirtilmemiş'}
                          </p>
                        </>
                      )}
                      {alarm.type === 'flight' && (
                        <>
                          <p className="text-gray-700">
                            <strong>Havayolu:</strong> {alarm.airline}
                          </p>
                          <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <p className="text-gray-700">
                              <strong>Başlangıç Fiyatı:</strong>{' '}
                              {alarm.initialPrice}
                            </p>
                            <p className="text-gray-700">
                              <strong>Güncel Fiyat:</strong>{' '}
                              {alarm.currentPrice}
                            </p>
                          </div>
                        </>
                      )}
                      <p className="text-sm text-gray-500 mt-3">
                        <strong>Oluşturulma:</strong> {alarm.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        alarm.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {alarm.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                    <button
                      onClick={() => handleDeleteAlarm(alarm.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50"
                      title="Alarmı Sil"
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
