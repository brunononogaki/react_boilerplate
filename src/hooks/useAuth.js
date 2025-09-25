import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useAuth = () => {
  const navigate = useNavigate();

  const handleAuthError = useCallback((response) => {
    if (response.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      
      // Redirecionar para login
      navigate('/login', { 
        replace: true,
        state: { message: 'Your session has expired. Please log in again.' }
      });
      
      return true; // Indica que foi um erro de autenticação
    }
    return false; // Não foi erro de autenticação
  }, [navigate]);

  const authenticatedFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      navigate('/login', { replace: true });
      throw new Error('No token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Se receber 401, trata automaticamente
    if (handleAuthError(response)) {
      throw new Error('Authentication failed');
    }

    return response;
  }, [navigate, handleAuthError]);

  return {
    handleAuthError,
    authenticatedFetch
  };
};
