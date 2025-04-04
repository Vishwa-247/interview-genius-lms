
/**
 * Environment configuration for the application
 */

// Base URL for the Flask API
export const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || "http://localhost:5000";

// Feature flags
export const FEATURES = {
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  ENABLE_INTERVIEWS: true,
  ENABLE_COURSES: true
};
