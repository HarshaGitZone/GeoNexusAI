// src/config/api.js
const envUrl = (process.env.REACT_APP_API_URL || "").trim();
const isBrowser = typeof window !== "undefined";
const host = isBrowser ? window.location.hostname : "";
const isVercelHost = host.endsWith(".vercel.app");

// Priority:
// 1) Explicit env URL (works for both local and deployed)
// 2) Vercel same-origin proxy
// 3) Local default
const rawUrl = envUrl || (isVercelHost ? "/api" : "http://localhost:5000");

// Ensure there is NO trailing slash, preventing duplicate-slash URLs.
export const API_BASE = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;
