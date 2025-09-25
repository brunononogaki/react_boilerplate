// Utility functions for authentication

/**
 * Decode JWT token without verification (client-side only)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export function decodeToken(token) {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Get user information from stored token
 * @returns {object|null} - User info or null if not authenticated
 */
export function getUserFromToken() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('No access_token found in localStorage');
      return null;
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      console.log('Failed to decode token');
      return null;
    }

    // Debug: log the decoded token to see what fields are available
    console.log('Decoded token:', decoded);

    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('Token is expired');
      localStorage.removeItem('access_token');
      return null;
    }

    // Try different possible field names for username
    const username = decoded.username ||
                    decoded.sub ||
                    decoded.user_id ||
                    decoded.email ||
                    decoded.preferred_username ||
                    'User';

    console.log('Extracted username:', username);

    return {
      userId: decoded.sub || decoded.user_id || decoded.username || username,
      username: username,
      email: decoded.email || null,
      firstName: decoded.first_name || decoded.given_name || null,
      lastName: decoded.last_name || decoded.family_name || null,
      exp: decoded.exp,
      iat: decoded.iat,
    };
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if authenticated, false otherwise
 */
export function isAuthenticated() {
  const user = getUserFromToken();
  return user !== null;
}
