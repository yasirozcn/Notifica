import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// api instance'ını oluştur
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Default export yerine named export kullanıyoruz
export { api as default };
