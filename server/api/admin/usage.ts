// server/api/admin/usage.ts
import { defineEventHandler } from "h3";
import { getUsageStats, getCacheStats } from "../utils/rateLimit";

export default defineEventHandler(async () => {

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
