// server/utils/redis.ts
import { Redis } from "@upstash/redis";

// Initialize Redis using Vercel's environment variables
// Vercel provides KV_REST_API_URL and KV_REST_API_TOKEN, but Upstash SDK expects UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "",
  token:
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Helper for setting values with expiry
export async function setWithExpiry(
  key: string,
  value: any,
  expirySeconds: number
) {
  try {
    await redis.set(key, JSON.stringify(value), { ex: expirySeconds });
    return true;
  } catch (error) {
    console.error("Redis setWithExpiry error:", error);
    return false;
  }
}

// Helper for getting values
export async function getValue(key: string) {
  try {
    const data = await redis.get(key);
    if (!data) return null;

    // Upstash returns parsed JSON automatically, but we stringify in setWithExpiry
    // so we need to parse if it's a string
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    return data;
  } catch (error) {
    console.error("Redis getValue error:", error);
    return null;
  }
}

// Helper to check if key exists
export async function keyExists(key: string) {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    console.error("Redis keyExists error:", error);
    return false;
  }
}

// Helper to delete a key
export async function deleteKey(key: string) {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error("Redis deleteKey error:", error);
    return false;
  }
}

// Helper to scan keys with pattern
export async function scanKeys(pattern: string): Promise<string[]> {
  try {
    const results: string[] = [];
    let cursor = 0;

    do {
      const scanResult = await redis.scan(cursor, {
        match: pattern,
        count: 100,
      });
      cursor = scanResult[0];
      results.push(...scanResult[1]);
    } while (cursor !== 0);

    return results;
  } catch (error) {
    console.error("Redis scanKeys error:", error);
    return [];
  }
}

// Increment a counter and set expiry if it doesn't exist
export async function incrementCounter(key: string, expirySeconds: number) {
  try {
    const value = await redis.incr(key);
    // Set expiry only if it's a new key (value is 1)
    if (value === 1) {
      await redis.expire(key, expirySeconds);
    }
    return value;
  } catch (error) {
    console.error("Redis incrementCounter error:", error);
    return 0;
  }
}

// Get current counter value
export async function getCounter(key: string) {
  try {
    const value = await redis.get(key);
    return value ? parseInt(value.toString(), 10) : 0;
  } catch (error) {
    console.error("Redis getCounter error:", error);
    return 0;
  }
}

// Get TTL for a key in seconds
export async function getTTL(key: string) {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.error("Redis getTTL error:", error);
    return -2; // -2 means key doesn't exist
  }
}

// Test Redis connection
export async function testRedisConnection() {
  try {
    // Check if environment variables are available
    const url =
      process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token =
      process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      return {
        connected: false,
        error:
          "Missing Redis configuration - URL or token not found in environment variables",
      };
    }

    const testKey = `test:${Date.now()}`;
    const testValue = { timestamp: Date.now(), test: true };

    // Test SET
    await setWithExpiry(testKey, testValue, 60);

    // Test GET
    const retrieved = await getValue(testKey);

    // Test DELETE
    await deleteKey(testKey);

    return {
      connected: true,
      operations: {
        set: true,
        get: !!retrieved && retrieved.test === true,
        delete: true,
      },
    };
  } catch (error) {
    console.error("Redis connection test failed:", error);
    return {
      connected: false,
      error: error.message,
    };
  }
}

export default redis;
