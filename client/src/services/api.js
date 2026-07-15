import axios from 'axios';
import { store } from '../redux/store';
import { updateTokens, logout } from '../redux/slices/authSlice';

const API = axios.create({
  baseURL: 'https://crm-9i8x.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle expired tokens and auto refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = store.getState().auth.refreshToken;
      
      if (refreshToken) {
        try {
          const res = await axios.post('https://crm-9i8x.onrender.com/api/auth/refresh', {
            refreshToken,
          });
          
          if (res.data.success) {
            // Update Redux and LocalStorage
            store.dispatch(updateTokens({
              accessToken: res.data.accessToken,
              refreshToken: res.data.refreshToken,
            }));
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
            return API(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, log out the user
          store.dispatch(logout());
          return Promise.reject(refreshError);
        }
      } else {
        store.dispatch(logout());
      }
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

export default API;
