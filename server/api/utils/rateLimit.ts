// server/utils/rateLimit.ts
// In-memory cache to store weather data
export const cache = new Map();
export const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// Rate limiting variables
export const rateLimit = {
  windowMs: 60 * 1000, // 1 minute window
  maxRequests: 50, // Keep below 60 to have a safety margin
  requestCount: 0,
  resetTime: Date.now() + 60 * 1000,
  dailyCount: 0,
  dailyResetTime: new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000, // Next midnight
  dailyLimit: 700, // Keep below 1000 for safety
};

// Reset the rate limit counter
export function resetRateLimitIfNeeded() {
  const now = Date.now();

  // Reset minute counter if the window has passed
  if (now > rateLimit.resetTime) {
    rateLimit.requestCount = 0;
    rateLimit.resetTime = now + rateLimit.windowMs;
  }

  // Reset daily counter if day has changed
  if (now > rateLimit.dailyResetTime) {
    rateLimit.dailyCount = 0;
    rateLimit.dailyResetTime =
      new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000;
  }
}

// Check if we're hitting rate limits
export function isRateLimited() {
  resetRateLimitIfNeeded();
  return (
    rateLimit.requestCount >= rateLimit.maxRequests ||
    rateLimit.dailyCount >= rateLimit.dailyLimit
  );
}

// Increment counters when making an API call
export function trackApiCall() {
  resetRateLimitIfNeeded();
  rateLimit.requestCount++;
  rateLimit.dailyCount++;
}
