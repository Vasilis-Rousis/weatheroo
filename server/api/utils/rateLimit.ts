// server/api/utils/rateLimit.ts
import {
  setWithExpiry,
  getValue,
  scanKeys,
  incrementCounter,
  getCounter,
  getTTL,
} from "~/server/utils/redis";

// Constants
export const CACHE_DURATION = 30 * 60; // 30 minutes in seconds
export const RATE_LIMIT = {
  MINUTE_WINDOW: 60, // 1 minute in seconds
  MINUTE_LIMIT: 50, // 50 requests per minute
  DAILY_LIMIT: 950, // 950 requests per day
};

// Redis key prefixes
const KEY_PREFIX = {
  CACHE: "weatheroo:cache:",
  MINUTE_RATE: "weatheroo:rate:minute:",
  DAILY_RATE: "weatheroo:rate:daily:",
};

// Get the Redis key for the current minute window
function getMinuteWindowKey() {
  const now = new Date();
  const minute = Math.floor(now.getTime() / (1000 * 60));
  return `${KEY_PREFIX.MINUTE_RATE}${minute}`;
}

// Get the Redis key for the current day
function getDailyWindowKey() {
  const now = new Date();
  const day = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  return `${KEY_PREFIX.DAILY_RATE}${day}`;
}

// Check if we're hitting rate limits
export async function isRateLimited() {
  try {
    const minuteKey = getMinuteWindowKey();
    const dailyKey = getDailyWindowKey();

    const [minuteCount, dailyCount] = await Promise.all([
      getCounter(minuteKey),
      getCounter(dailyKey),
    ]);

    return (
      minuteCount >= RATE_LIMIT.MINUTE_LIMIT ||
      dailyCount >= RATE_LIMIT.DAILY_LIMIT
    );
  } catch (error) {
    console.error(
      "Error checking rate limits (Redis may be unavailable):",
      error
    );
    // Default to not rate-limited if Redis is unavailable
    // This allows the app to work without Redis, just without rate limiting
    return false;
  }
}

// Increment counters when making an API call
export async function trackApiCall() {
  try {
    const minuteKey = getMinuteWindowKey();
    const dailyKey = getDailyWindowKey();

    await Promise.all([
      incrementCounter(minuteKey, RATE_LIMIT.MINUTE_WINDOW),
      incrementCounter(dailyKey, 24 * 60 * 60), // 1 day in seconds
    ]);

    return true;
  } catch (error) {
    console.error("Error tracking API call (Redis may be unavailable):", error);
    // Return false but don't throw - the app can work without tracking
    return false;
  }
}

// Get current usage statistics
export async function getUsageStats() {
  try {
    const minuteKey = getMinuteWindowKey();
    const dailyKey = getDailyWindowKey();

    const [minuteCount, dailyCount, minuteTTL, dailyTTL] = await Promise.all([
      getCounter(minuteKey),
      getCounter(dailyKey),
      getTTL(minuteKey),
      getTTL(dailyKey),
    ]);

    // Calculate reset times
    const now = Date.now();
    const minuteResetTime = new Date(now + minuteTTL * 1000);
    const dailyResetTime = new Date(now + dailyTTL * 1000);

    return {
      currentPeriod: {
        requestCount: minuteCount,
        maxRequests: RATE_LIMIT.MINUTE_LIMIT,
        resetTime: minuteResetTime.toISOString(),
        remaining: Math.max(0, RATE_LIMIT.MINUTE_LIMIT - minuteCount),
        percentUsed: Math.round((minuteCount / RATE_LIMIT.MINUTE_LIMIT) * 100),
      },
      daily: {
        count: dailyCount,
        limit: RATE_LIMIT.DAILY_LIMIT,
        resetTime: dailyResetTime.toISOString(),
        remaining: Math.max(0, RATE_LIMIT.DAILY_LIMIT - dailyCount),
        percentUsed: Math.round((dailyCount / RATE_LIMIT.DAILY_LIMIT) * 100),
      },
    };
  } catch (error) {
    console.error(
      "Error getting usage stats (Redis may be unavailable):",
      error
    );
    // Return default values in case of error
    return {
      currentPeriod: {
        requestCount: 0,
        maxRequests: RATE_LIMIT.MINUTE_LIMIT,
        resetTime: new Date().toISOString(),
        remaining: RATE_LIMIT.MINUTE_LIMIT,
        percentUsed: 0,
      },
      daily: {
        count: 0,
        limit: RATE_LIMIT.DAILY_LIMIT,
        resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
        remaining: RATE_LIMIT.DAILY_LIMIT,
        percentUsed: 0,
      },
    };
  }
}

// Cache-related functions
export async function getCachedWeather(key: string) {
  try {
    const cacheKey = `${KEY_PREFIX.CACHE}${key}`;
    return await getValue(cacheKey);
  } catch (error) {
    console.error(
      "Error getting cached weather (Redis may be unavailable):",
      error
    );
    // Return null if Redis is unavailable - this will trigger a fresh API call
    return null;
  }
}

export async function setCachedWeather(key: string, data: any) {
  try {
    const cacheKey = `${KEY_PREFIX.CACHE}${key}`;
    return await setWithExpiry(
      cacheKey,
      {
        data,
        timestamp: Date.now(),
      },
      CACHE_DURATION
    );
  } catch (error) {
    console.error(
      "Error setting cached weather (Redis may be unavailable):",
      error
    );
    // Return false but don't throw - the app can work without caching
    return false;
  }
}

// Get all cache keys
export async function getAllCacheKeys() {
  try {
    return await scanKeys(`${KEY_PREFIX.CACHE}*`);
  } catch (error) {
    console.error(
      "Error getting all cache keys (Redis may be unavailable):",
      error
    );
    return [];
  }
}

// Get cache statistics
export async function getCacheStats() {
  try {
    const keys = await getAllCacheKeys();

    // Extract location part from cache keys
    const locations = keys.map((key) => key.replace(KEY_PREFIX.CACHE, ""));

    return {
      size: keys.length,
      keys: locations,
    };
  } catch (error) {
    console.error(
      "Error getting cache stats (Redis may be unavailable):",
      error
    );
    return {
      size: 0,
      keys: [],
    };
  }
}
