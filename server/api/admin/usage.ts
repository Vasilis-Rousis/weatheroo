// server/api/admin/usage.ts
import { defineEventHandler } from "h3";
import { cache, rateLimit } from "../utils/rateLimit";

export default defineEventHandler(async () => {
  // In a real app, you would add authentication here
  // const authHeader = getHeader(event, 'Authorization')
  // if (!authHeader || !validateAdminToken(authHeader)) {
  //   throw createError({
  //     statusCode: 401,
  //     message: 'Unauthorized'
  //   })
  // }

  return {
    currentPeriod: {
      requestCount: rateLimit.requestCount,
      maxRequests: rateLimit.maxRequests,
      resetTime: new Date(rateLimit.resetTime).toISOString(),
      remaining: rateLimit.maxRequests - rateLimit.requestCount,
      percentUsed: Math.round(
        (rateLimit.requestCount / rateLimit.maxRequests) * 100
      ),
    },
    daily: {
      count: rateLimit.dailyCount,
      limit: rateLimit.dailyLimit,
      resetTime: new Date(rateLimit.dailyResetTime).toISOString(),
      remaining: rateLimit.dailyLimit - rateLimit.dailyCount,
      percentUsed: Math.round(
        (rateLimit.dailyCount / rateLimit.dailyLimit) * 100
      ),
    },
    cacheStats: {
      size: cache.size,
      keys: Array.from(cache.keys()),
    },
  };
});
