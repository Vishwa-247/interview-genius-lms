
// Environment variables
export const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || "http://localhost:5000";
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === "true";

// Neon DB
export const NEON_DATABASE_URL = import.meta.env.VITE_NEON_DATABASE_URL || "";

// Gemini AI
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
