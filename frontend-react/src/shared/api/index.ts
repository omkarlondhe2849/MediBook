import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 401 interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const register = (userData: any) =>
  api.post('/auth/register', userData);

export const forgotPassword = (email: string) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (token: string, password: string) =>
  api.post('/auth/reset-password', { token, password });

export const updateUser = (userId: number, userData: any) =>
  api.put(`/auth/users/${userId}`, userData);

// Services
export const getAllServices = () =>
  api.get('/services');

export const getServiceById = (id: number) =>
  api.get(`/services/${id}`);

export const getServiceDetails = (id: number) =>
  api.get(`/services/${id}/details`);

export const searchServices = (params: any) =>
  api.get('/services/search', { params });

export const createService = (serviceData: any) =>
  api.post('/services', serviceData);

export const updateService = (id: number, serviceData: any) =>
  api.put(`/services/${id}`, serviceData);

export const deleteService = (id: number) =>
  api.delete(`/services/${id}`);

export const getProviderStats = (providerId: number) =>
  api.get(`/services/provider/${providerId}/stats`);

export const getPlatformStats = () =>
  api.get('/services/platform-stats');

// Doctors
export const getAllDoctors = () =>
  api.get('/doctors');

export const getDoctorById = (id: number) =>
  api.get(`/doctors/${id}`);

export const getDoctorDetails = (id: number) =>
  api.get(`/doctors/${id}/details`);

export const searchDoctors = (params: any) =>
  api.get('/doctors/search', { params });

export const createDoctorProfile = (doctorData: any) =>
  api.post('/doctors', doctorData);

export const updateDoctorProfile = (id: number, doctorData: any) =>
  api.put(`/doctors/${id}`, doctorData);

export const deleteDoctorProfile = (id: number) =>
  api.delete(`/doctors/${id}`);

// Appointments
export const getAllAppointments = () =>
  api.get('/appointments');

export const getAppointmentsByUser = (userId: number) =>
  api.get(`/appointments/user/${userId}`);

export const getAppointmentsByProvider = (providerId: number) =>
  api.get(`/appointments/provider/${providerId}`);

export const getAppointmentsWithCustomerDetails = (providerId: number) =>
  api.get(`/appointments/provider/${providerId}/with-customers`);

export const createAppointment = (appointmentData: any) =>
  api.post('/appointments', appointmentData);

export const createAppointmentWithPayment = (appointmentData: any) =>
  api.post('/appointments/create-with-payment', appointmentData);

export const confirmPayment = (paymentData: any) =>
  api.post('/appointments/confirm-payment', paymentData);

export const completeAppointmentWithOtp = (otpData: any) =>
  api.post('/appointments/complete-with-otp', otpData);

export const updateAppointmentStatus = (bookingId: number, status: string) =>
  api.put(`/appointments/${bookingId}`, { status });

// Reviews
export const getAllReviews = () =>
  api.get('/reviews');

export const getReviewsByService = (serviceId: number) =>
  api.get(`/reviews/service/${serviceId}`);

export const createReview = (reviewData: any) =>
  api.post('/reviews', reviewData);

// Transactions
export const getAllTransactions = () =>
  api.get('/transactions');

export const getTransactionById = (id: number) =>
  api.get(`/transactions/${id}`);

export const getTransactionByBookingId = (bookingId: number) =>
  api.get(`/transactions/booking/${bookingId}`);

export const getTransactionsByUser = (userId: number) =>
  api.get(`/transactions/user/${userId}`);

export const getTransactionsByProvider = (providerId: number) =>
  api.get(`/transactions/provider/${providerId}`);

export default api;
