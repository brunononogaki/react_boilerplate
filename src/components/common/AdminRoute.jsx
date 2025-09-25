import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { getUserFromToken } from '../../utils/auth';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null); // null = loading, true/false = result
  const [loading, setLoading] = useState(true);
  const { authenticatedFetch } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // First check if user is logged in
        const tokenUser = getUserFromToken();
        if (!tokenUser) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Get current user data from API to check admin status
        const response = await authenticatedFetch(API_ENDPOINTS.USERS.ME);

        if (response.ok) {
          const userData = await response.json();

          // Use is_admin field if it exists, otherwise fallback logic
          let isUserAdmin = userData.is_admin === true;

          // Fallback: if is_admin field doesn't exist yet (before migration)
          if (userData.is_admin === undefined) {
            // Assume admin if username contains 'admin' or is first user
            isUserAdmin = userData.username?.toLowerCase().includes('admin') || userData.id === 1;
          }

          setIsAdmin(isUserAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [authenticatedFetch]);

  // Show loading while checking admin status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Redirect to home if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render children if admin
  return children;
}
