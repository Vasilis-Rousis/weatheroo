// server/api/admin/usage.ts
import { defineEventHandler } from "h3";
import { getUsageStats, getCacheStats } from "../utils/rateLimit";

export default defineEventHandler(async () => {
  // In a real app, you would add authentication here
  // const authHeader = getHeader(event, 'Authorization')
  // if (!authHeader || !validateAdminToken(authHeader)) {
  //   throw createError({
  //     statusCode: 401,
  //     message: 'Unauthorized'
  //   })
  // }

  // Get usage statistics and cache stats
  const [usageStats, cacheStats] = await Promise.all([
    getUsageStats(),
    getCacheStats(),
  ]);

  return {
    ...usageStats,
    cacheStats,
  };
});
