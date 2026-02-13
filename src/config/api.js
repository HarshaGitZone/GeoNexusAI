// src/config/api.js
const envUrl = (process.env.REACT_APP_API_URL || "").trim();
const isBrowser = typeof window !== "undefined";
const host = isBrowser ? window.location.hostname : "";
const isVercelHost = host.endsWith(".vercel.app");

// Deploy (Vercel): always use same-origin proxy to avoid browser CORS to Render.
// Local/dev: honor explicit env URL, otherwise default localhost backend.
const rawUrl = isVercelHost ? "/api" : (envUrl || "http://localhost:5000");

// Ensure there is NO trailing slash, preventing duplicate-slash URLs.
export const API_BASE = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
