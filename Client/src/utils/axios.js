import axios from 'axios';

// api instance'ını oluştur
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// İsteğe bağlı interceptor'lar
api.interceptors.request.use(
  (config) => {
    // İstek gönderilmeden önce yapılacak işlemler
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Başarılı yanıtlar için
    return response;
  },
  (error) => {
    // Hata durumunda
    return Promise.reject(error);
  }
);

// Default export yerine named export kullanıyoruz
export { api as default };
