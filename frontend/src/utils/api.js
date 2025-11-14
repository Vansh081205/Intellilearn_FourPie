import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('📥 API Response:', response.config.url, response.data);
    }
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          break;

        case 403:
          console.error('❌ Forbidden:', data.message || 'Access denied');
          break;

        case 404:
          console.error('❌ Not Found:', data.message || 'Resource not found');
          break;

        case 500:
          console.error('❌ Server Error:', data.message || 'Internal server error');
          break;

        default:
          console.error('❌ API Error:', data.message || 'Something went wrong');
      }
    } else if (error.request) {
      console.error('❌ Network Error: No response received');
    } else {
      console.error('❌ Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API Methods
export const documentAPI = {
  upload: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/documents'),
  getById: (id) => api.get(`/documents/${id}`),
  delete: (id) => api.delete(`/documents/${id}`),
};

export const quizAPI = {
  generate: (docId, userId) => api.post('/generate-quiz', { doc_id: docId, user_id: userId }),
  getById: (quizId) => api.get(`/quiz/${quizId}`),
  submitAnswer: (data) => api.post('/submit-answer', data),
  getPlaygroundQuiz: (quizId) => api.get(`/playground/${quizId}`),
};

export const userAPI = {
  getDashboard: (userId) => api.get(`/dashboard/${userId}`),
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, data) => api.put(`/users/${userId}`, data),
};

export const aiAPI = {
  getELI5: (docId) => api.post('/eli5', { doc_id: docId }),
  getSummary: (text, difficulty) => api.post('/summarize', { text, difficulty }),
  generateQuestions: (text, count) => api.post('/generate-questions', { text, count }),
};

// Student API
export const studentAPI = {
  generateStudentId: async (email) => {
    try {
      const response = await api.post('/student/generate-id', { email });
      return response;
    } catch (error) {
      console.error('❌ Failed to generate student ID:', error);
      throw error;
    }
  },
  getStudentProfile: (studentId) => api.get(`/student/${studentId}`),
  updateStudentProfile: (studentId, data) => api.put(`/student/${studentId}`, data),
};

// Teacher API
export const teacherAPI = {
  generateTeacherId: async (email) => {
    try {
      const response = await api.post('/teacher/generate-id', { email });
      return response;
    } catch (error) {
      console.error('❌ Failed to generate teacher ID:', error);
      throw error;
    }
  },
  getTeacherProfile: (teacherId) => api.get(`/teacher/${teacherId}`),
  updateTeacherProfile: (teacherId, data) => api.put(`/teacher/${teacherId}`, data),
};

export default api;