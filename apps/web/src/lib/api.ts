/**
 * Central API base URL — reads from env so it works in all environments.
 * Set NEXT_PUBLIC_API_URL in .env.local for development.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
