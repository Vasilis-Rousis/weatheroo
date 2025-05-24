// server/api/health/redis.ts
import { defineEventHandler } from "h3";
import { testRedisConnection, getCounter } from "~/server/utils/redis";

export default defineEventHandler(async () => {
  const startTime = Date.now();

  try {
    // Test Redis connection and basic operations
    const connectionTest = await testRedisConnection();

    // Test counter operation (used in rate limiting)
    const counterKey = `health:counter:${Date.now()}`;
    const counterResult = await getCounter(counterKey);

    const responseTime = Date.now() - startTime;

    if (!connectionTest.connected) {
      throw new Error(`Redis connection failed: ${connectionTest.error}`);
    }

    return {
      status: "healthy",
      redis: {
        connected: true,
        responseTime: `${responseTime}ms`,
        operations: {
          ...connectionTest.operations,
          counter: counterResult === 0, // Should be 0 for new key
        },
        sdk: "@upstash/redis",
      },
      timestamp: new Date().toISOString(),
      environment: {
        hasKvUrl: !!process.env.KV_URL,
        hasRedisUrl: !!process.env.REDIS_URL,
        hasUpstashRestConfig: !!(
          process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
        ),
        sdkType: "upstash-redis",
      },
    };
  } catch (error) {
    console.error("Redis health check failed:", error);

    return {
      status: "unhealthy",
      redis: {
        connected: false,
        error: error.message,
        responseTime: `${Date.now() - startTime}ms`,
        sdk: "@upstash/redis",
      },
      timestamp: new Date().toISOString(),
      environment: {
        hasKvUrl: !!process.env.KV_URL,
        hasRedisUrl: !!process.env.REDIS_URL,
        hasUpstashRestConfig: !!(
          process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
        ),
        sdkType: "upstash-redis",
      },
    };
  }
});
