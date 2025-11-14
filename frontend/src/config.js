export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  appName: import.meta.env.VITE_APP_NAME || 'IntelliLearn+',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['.pdf', '.txt', '.docx'],
  quizTimer: 30, // seconds per question
  streakGoal: 7,
};

// Export API_BASE_URL separately for convenience
export const API_BASE_URL = config.apiUrl;