import { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../hooks/useAuth';
import { getUserFromToken } from '../utils/auth';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authenticatedFetch } = useAuth();

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(API_ENDPOINTS.USERS.ME);

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else {
        console.error(`/users/me failed with status ${response.status}`);
        // Fallback: try to get user info from token
        const tokenUser = getUserFromToken();
        if (tokenUser && tokenUser.userId) {
          setCurrentUser({
            id: tokenUser.userId,
            username: tokenUser.username,
            user_id: tokenUser.userId,
            is_admin: false // Default to false for token fallback
          });
        }
      }
    } catch (err) {
      // Se for erro de autenticação, o hook já redirecionou
      if (err.message !== 'Authentication failed') {
        console.error('Error fetching current user:', err);
        // Fallback: try to get user info from token
        const tokenUser = getUserFromToken();
        if (tokenUser && tokenUser.userId) {
          setCurrentUser({
            id: tokenUser.userId,
            username: tokenUser.username,
            user_id: tokenUser.userId,
            is_admin: false // Default to false for token fallback
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = () => {
    fetchCurrentUser();
  };

  const clearUser = () => {
    setCurrentUser(null);
    setLoading(false);
  };

  const isAdmin = () => {
    return currentUser?.is_admin === true;
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const value = {
    currentUser,
    loading,
    isAdmin,
    refreshUser,
    fetchCurrentUser,
    clearUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
