/**
 * API utility functions for handling paginated requests
 */

/**
 * Fetch all items from a paginated API endpoint with new pagination structure
 * @param {string} baseEndpoint - The base API endpoint URL (without query params)
 * @param {Object} headers - Request headers (including authorization)
 * @param {Object} queryParams - Additional query parameters (like filters)
 * @param {number} pageSize - Number of items per page (default: 100)
 * @returns {Promise<Array>} - Array with all items
 */
export const fetchAllPaginated = async (baseEndpoint, headers, queryParams = {}, pageSize = 100) => {
  const allItems = [];
  let currentPage = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      // Build URL with pagination and additional parameters
      const url = new URL(baseEndpoint);

      // Add any additional query parameters first
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== null && queryParams[key] !== undefined) {
          url.searchParams.set(key, queryParams[key]);
        }
      });

      // Add pagination parameters
      url.searchParams.set('skip', (currentPage - 1) * pageSize);
      url.searchParams.set('limit', pageSize);

      const response = await fetch(url.toString(), { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add items to our collection
      allItems.push(...data.items);

      // Check if there are more pages using the new pagination structure
      hasMore = data.has_next;
      currentPage++;

      // Safety check to prevent infinite loops
      if (currentPage > 1000) {
        console.warn('Reached maximum pagination limit (1000 pages)');
        break;
      }

    } catch (error) {
      console.error('Error fetching paginated data:', error);
      throw error;
    }
  }

  return allItems;
};

/**
 * Fetch all devices from the API
 * @param {string} token - Authorization token
 * @param {boolean} monitoringFilter - Optional filter for monitoring status
 * @returns {Promise<Array>} - Array with all devices
 */
export const fetchAllDevices = async (token, monitoringFilter = null) => {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const endpoint = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/devices`;

  // Build query parameters
  const queryParams = {};
  if (monitoringFilter !== null) {
    queryParams.monitoring = monitoringFilter;
  }

  return await fetchAllPaginated(endpoint, headers, queryParams);
};

/**
 * Fetch all circuits from the API
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} - Array with all circuits
 */
export const fetchAllCircuits = async (token) => {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const endpoint = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/circuits`;

  return await fetchAllPaginated(endpoint, headers, {});
};

/**
 * Get total count from first page without fetching all items (for quick stats)
 * @param {string} baseEndpoint - The base API endpoint URL
 * @param {Object} headers - Request headers (including authorization)
 * @param {Object} queryParams - Additional query parameters (like filters)
 * @returns {Promise<number>} - Total count of items
 */
export const getTotalCount = async (baseEndpoint, headers, queryParams = {}) => {
  try {
    // Build URL with minimal pagination to get just the count
    const url = new URL(baseEndpoint);

    // Add any additional query parameters first
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== null && queryParams[key] !== undefined) {
        url.searchParams.set(key, queryParams[key]);
      }
    });

    // Add minimal pagination parameters
    url.searchParams.set('skip', 0);
    url.searchParams.set('limit', 1);

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.total_count || 0;

  } catch (error) {
    console.error('Error fetching total count:', error);
    return 0;
  }
};

/**
 * Get total count of devices
 * @param {string} token - Authorization token
 * @param {boolean} monitoringFilter - Optional filter for monitoring status
 * @returns {Promise<number>} - Total count of devices
 */
export const getDevicesCount = async (token, monitoringFilter = null) => {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const endpoint = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/devices`;

  // Build query parameters
  const queryParams = {};
  if (monitoringFilter !== null) {
    queryParams.monitoring = monitoringFilter;
  }

  return await getTotalCount(endpoint, headers, queryParams);
};

/**
 * Get total count of circuits
 * @param {string} token - Authorization token
 * @returns {Promise<number>} - Total count of circuits
 */
export const getCircuitsCount = async (token) => {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const endpoint = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/circuits`;

  return await getTotalCount(endpoint, headers, {});
};


/**
 * Fetch all users from the API
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} - Array with all users
 */
export const fetchAllUsers = async (token) => {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const endpoint = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/users`;

  return await fetchAllPaginated(endpoint, headers);
};


/**
 * Fetch all clients from the API
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} - Array with all clients
 */
export const fetchAllClients = async (token) => {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const endpoint = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/clients`;

  return await fetchAllPaginated(endpoint, headers);
};

/**
 * Fetch all services from the API
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} - Array with all services
 */
export const fetchAllServices = async (token) => {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const endpoint = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/services`;

  return await fetchAllPaginated(endpoint, headers);
};