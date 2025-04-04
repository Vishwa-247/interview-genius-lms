
/**
 * Environment configuration
 */

// URL for the Flask API
export const FLASK_API_URL = process.env.FLASK_API_URL || "http://localhost:5000";

// Config for enabling/disabling features
export const FEATURES = {
  USE_FLASK_API: true, // When false, would fall back to Supabase (if implemented)
};
