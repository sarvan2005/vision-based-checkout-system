/// <reference types="vite/client" />
// Vision-Based Checkout System Configuration

// API Configuration
// If VITE_API_URL is set (in .env), use it. Otherwise fallback to localhost.
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Google Gemini API Key
// export const API_KEY = "AIzaSyAoN5-3PCxVUuYLG9IrASTda5iC9DRDqDY";
