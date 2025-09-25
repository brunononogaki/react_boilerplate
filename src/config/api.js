// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
    REFRESH: `${API_BASE_URL}/api/v1/auth/refresh_token`,
  },
  USERS: {
    LIST: `${API_BASE_URL}/api/v1/users`,
    CREATE: `${API_BASE_URL}/api/v1/users`,
    DELETE: (id) => `${API_BASE_URL}/api/v1/users/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/api/v1/users/${id}`,
    ME: `${API_BASE_URL}/api/v1/users/me`,
  }  
};

export default API_BASE_URL;
