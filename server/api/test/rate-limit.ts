// server/api/test/rate-limit.ts
import { defineEventHandler, getQuery } from "h3";
import {
  isRateLimited,
  trackApiCall,
  getUsageStats,
  getCacheStats,
} from "../utils/rateLimit";
import {
  getCounter,
  getTTL,
  testRedisConnection,
} from "~/server/utils/redis";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const action = query.action as string;
  const count = parseInt(query.count as string) || 1;

  switch (action) {
    case "check": {
      // Check current rate limit status
      const isLimited = await isRateLimited();
      const stats = await getUsageStats();

      return {
        action: "check",
        isRateLimited: isLimited,
        currentPeriod: stats.currentPeriod,
        daily: stats.daily,
        timestamp: new Date().toISOString(),
      };
    }

    case "simulate": {
      // Simulate a single API call
      const beforeStats = await getUsageStats();
      const tracked = await trackApiCall();
      const afterStats = await getUsageStats();

      return {
        action: "simulate",
        success: tracked,
        before: beforeStats,
        after: afterStats,
        timestamp: new Date().toISOString(),
      };
    }

    case "detailed": {
      // Get detailed information about rate limiting
      const stats = await getUsageStats();
      const cacheStats = await getCacheStats();
      const redisHealth = await testRedisConnection();

      // Get the actual keys being used
      const now = new Date();
      const minute = Math.floor(now.getTime() / (1000 * 60));
      const day = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      const minuteKey = `weatheroo:rate:minute:${minute}`;
      const dailyKey = `weatheroo:rate:daily:${day}`;

      // Get direct counter values
      const [minuteCounter, dailyCounter, minuteTTL, dailyTTL] =
        await Promise.all([
          getCounter(minuteKey),
          getCounter(dailyKey),
          getTTL(minuteKey),
          getTTL(dailyKey),
        ]);

      return {
        action: "detailed",
        rateLimits: {
          minute: {
            key: minuteKey,
            counter: minuteCounter,
            ttl: minuteTTL,
            limit: 50,
          },
          daily: {
            key: dailyKey,
            counter: dailyCounter,
            ttl: dailyTTL,
            limit: 950,
          },
        },
        stats: stats,
        cache: cacheStats,
        redis: {
          connected: redisHealth.connected,
          operations: redisHealth.operations,
        },
        timestamp: new Date().toISOString(),
      };
    }

    case "stress": {
      // Stress test - make multiple calls
      const results = [];
      const initialStats = await getUsageStats();

      for (let i = 0; i < count; i++) {
        const tracked = await trackApiCall();
        const afterCount = await getUsageStats();
        const isLimited = await isRateLimited();

        results.push({
          call: i + 1,
          tracked,
          isLimited,
          minuteCount: afterCount.currentPeriod.requestCount,
          dailyCount: afterCount.daily.count,
        });

        // Stop if we hit rate limit
        if (isLimited) {
          break;
        }
      }

      const finalStats = await getUsageStats();

      return {
        action: "stress",
        requestCount: count,
        results: results,
        initialStats,
        finalStats,
        summary: {
          totalCalls: results.length,
          successfulCalls: results.filter((r) => r.tracked).length,
          hitRateLimit: results.some((r) => r.isLimited),
          minuteUsage: `${finalStats.currentPeriod.requestCount}/${finalStats.currentPeriod.maxRequests}`,
          dailyUsage: `${finalStats.daily.count}/${finalStats.daily.limit}`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    default: {
      return {
        error: "Invalid action. Use: check, simulate, detailed, or stress",
        availableActions: ["check", "simulate", "detailed", "stress"],
        timestamp: new Date().toISOString(),
      };
    }
  }
});
