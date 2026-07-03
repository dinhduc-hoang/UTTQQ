const DEFAULT_API_BASE_URL = 'http://localhost:3000';
const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export const API_ENDPOINTS = {
  // ==================== AUTH ====================
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh`,
    PROFILE: `${API_BASE_URL}/api/auth/me`,
    AVATAR: `${API_BASE_URL}/api/auth/avatar`,
  },

  // ==================== SUBJECTS ====================
  SUBJECTS: {
    CREATE: `${API_BASE_URL}/api/subjects`,
  },

  // ==================== DOCUMENTS ====================
  DOCUMENTS: {
    UPLOAD: `${API_BASE_URL}/api/documents/upload`,
    LIST: `${API_BASE_URL}/api/documents`,
    DETAIL: (id) => `${API_BASE_URL}/api/documents/${id}`,
  },

  // ==================== EXAMS ====================
  EXAMS: {
    GENERATE: (documentId) => `${API_BASE_URL}/api/exams/generate/${documentId}`,
    LIST: (documentId) => `${API_BASE_URL}/api/exams?documentId=${documentId}`,
    DETAIL: (id) => `${API_BASE_URL}/api/exams/${id}`,
  },

  // ==================== SUMMARIES ====================
  SUMMARIES: {
    GENERATE: (documentId) => `${API_BASE_URL}/api/summaries/generate/${documentId}`,
    LIST: (documentId) => `${API_BASE_URL}/api/summaries?documentId=${documentId}`,
    DETAIL: (id) => `${API_BASE_URL}/api/summaries/${id}`,
  },

  // ==================== FLASHCARDS ====================
  FLASHCARD_SETS: {
    GENERATE: (documentId) => `${API_BASE_URL}/api/flashcard-sets/generate/${documentId}`,
    LIST: (documentId) => `${API_BASE_URL}/api/flashcard-sets?documentId=${documentId}`,
    DETAIL: (id) => `${API_BASE_URL}/api/flashcard-sets/${id}`,
  },

  // ==================== TRUE/FALSE ====================
  TRUE_FALSE: {
    GENERATE: (documentId) => `${API_BASE_URL}/api/true-false/generate/${documentId}`,
    LIST: (documentId) => `${API_BASE_URL}/api/true-false?documentId=${documentId}`,
  },


};

export default API_ENDPOINTS;
