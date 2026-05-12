import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://turf-booking-management-system-wf3g.onrender.com/api').replace(/\/$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Enhanced error handling
const getErrorMessage = (error) => {
  // Server error with message
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Network errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please check your connection.';
    }
    return 'Network error. Please check your internet connection.';
  }

  // HTTP status codes
  switch (error.response?.status) {
    case 400:
      return error.response.data?.message || 'Invalid request. Please check your input.';
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return error.response.data?.message || 'This resource already exists.';
    case 422:
      return 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Server is currently unavailable. Please try again later.';
    default:
      return error.response.data?.message || 'Something went wrong. Please try again.';
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Enhance error object with user-friendly message
    error.userMessage = getErrorMessage(error);

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
        url: error.config?.url,
      });
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
};

// Turf APIs
export const turfAPI = {
  getAllTurfs: () => apiClient.get('/turfs'),
  getTurfById: (id) => apiClient.get(`/turfs/${id}`),
  getNearbyTurfs: (latitude, longitude, maxDistance = 10) =>
    apiClient.get('/turfs/nearby', {
      params: { latitude, longitude, maxDistance },
    }),
  getNearbyTurfsWithAvailability: (latitude, longitude, date, maxDistance = 10, page = 1, limit = 20) =>
    apiClient.get('/turfs/nearby-with-availability', {
      params: { latitude, longitude, date, maxDistance, page, limit },
    }),
  createTurf: (data) => apiClient.post('/turfs/add', data),
  updateTurf: (id, data) => apiClient.put(`/turfs/${id}`, data),
  deleteTurf: (id) => apiClient.delete(`/turfs/${id}`),
};

// Booking APIs
export const bookingAPI = {
  createBooking: (data) => apiClient.post('/bookings/create', data),
  getUserBookings: () => apiClient.get('/bookings/my'),
  getBookingById: (id) => apiClient.get(`/bookings/${id}`),
  cancelBooking: (id) => apiClient.put(`/bookings/cancel/${id}`),
  getTurfAvailability: (turfId, date) =>
    apiClient.get(`/bookings/turf/${turfId}`, {
      params: date ? { date } : undefined,
    }),
};

// Admin APIs
export const adminAPI = {
  // Stats
  getStats: () => apiClient.get('/admin/stats'),

  // Users
  getAllUsers: (page = 1, limit = 10, role = '', search = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    return apiClient.get(`/admin/users?${params.toString()}`);
  },
  updateUserRole: (userId, role) =>
    apiClient.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),

  // Bookings
  getAllBookings: (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (filters.status) params.append('status', filters.status);
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    return apiClient.get(`/admin/bookings?${params.toString()}`);
  },
  updateBookingStatus: (bookingId, bookingStatus, paymentStatus) =>
    apiClient.put(`/admin/bookings/${bookingId}/status`, {
      bookingStatus,
      paymentStatus,
    }),

  // Turfs
  getAllTurfs: (page = 1, limit = 10, isActive = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (isActive) params.append('isActive', isActive);
    return apiClient.get(`/admin/turfs?${params.toString()}`);
  },
};

export default apiClient;
