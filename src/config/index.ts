// Centralized runtime configuration
// Keep this file minimal; validate envs in envSchema when needed

export const config = {
  // Example usage: config.apiBase
  apiBase: process.env.VITE_API_BASE || '',
};

export default config;
