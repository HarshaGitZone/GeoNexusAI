// src/config/api.js
const envUrl = (process.env.REACT_APP_API_URL || "").trim();
const isBrowser = typeof window !== "undefined";
const host = isBrowser ? window.location.hostname : "";
const isVercelHost = host.endsWith(".vercel.app");

// In Vercel deployments, route through same-origin /api rewrite to avoid browser CORS.
const rawUrl = isVercelHost ? "/api" : (envUrl || "http://localhost:5000");

// Ensure there is NO trailing slash, preventing duplicate-slash URLs.
export const API_BASE = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
