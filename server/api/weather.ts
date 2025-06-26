// server/api/weather.ts
import { defineEventHandler, getQuery, createError } from "h3";
import { z } from "zod";
import {
  CACHE_DURATION,
  isRateLimited,
  trackApiCall,
  getCachedWeather,
  setCachedWeather,
  getUsageStats,
} from "./utils/rateLimit";

// Define the schema for the query parameters
const querySchema = z.object({
  city: z.string().optional(),
  lat: z.string().optional(),
  lon: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  // Validate and parse the query parameters
  const query = await getQuery(event);
  const parsedQuery = querySchema.safeParse(query);

  if (!parsedQuery.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      data: { error: "Invalid query parameters" },
    });
  }

  const { city, lat, lon } = parsedQuery.data;

  // Create a cache key based on the query parameters
  const cacheKey = city
    ? `city:${city.toLowerCase().trim()}`
    : lat && lon
    ? `coords:${parseFloat(lat).toFixed(2)},${parseFloat(lon).toFixed(2)}`
    : null;

  if (!cacheKey) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      data: { error: "Invalid query parameters" },
    });
  }

  // Check cache first
  const cachedData = await getCachedWeather(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION * 1000) {
    console.log(`[Weather API] Cache hit for ${cacheKey}`);
    return {
      ...cachedData.data,
      cached: true,
      cachedAt: new Date(cachedData.timestamp).toISOString(),
    };
  }

  // Check if we're rate limited
  if (await isRateLimited()) {
    console.warn(
      `[Weather API] Rate limit exceeded - returning cached data if available`
    );

    // If we have stale cache, return it with a notice
    if (cachedData) {
      return {
        ...cachedData.data,
        cached: true,
        cachedAt: new Date(cachedData.timestamp).toISOString(),
        notice: "Using older cached data due to API rate limits",
      };
    }

    // Get current usage stats for message
    const stats = await getUsageStats();
    const resetSeconds = Math.ceil(
      (new Date(stats.currentPeriod.resetTime).getTime() - Date.now()) / 1000
    );

    throw createError({
      statusCode: 429,
      statusMessage: "Too Many Requests",
      data: {
        error: "API rate limit reached. Please try again later.",
        retryAfter: resetSeconds,
      },
    });
  }

  // Get API key from environment variable
  const config = useRuntimeConfig();
  const apiKey = config.openWeatherApiKey;

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: "Service Unavailable",
      data: {
        error: "Weather service configuration error. Please try again later.",
      },
    });
  }

  let currentUrl;
  let forecastUrl;

  // Determine which API endpoint to use based on parameters
  if (lat && lon) {
    // Use coordinates for the API call
    currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  } else if (city) {
    // Use city name for the API call
    currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
      city
    )}&appid=${apiKey}&units=metric`;
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      data: {
        error:
          "No location specified. Please provide a city name or coordinates.",
      },
    });
  }

  try {
    // Track this API call
    await trackApiCall();

    // Fetch current weather
    const currentResponse = await fetch(currentUrl);
    const currentData = await currentResponse.json();

    if (currentData.cod === "404" || currentData.cod === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        data: { error: "Location not found" },
      });
    }

    // If we get an error from OpenWeatherMap related to the API key
    if (currentData.cod === 401 || currentData.cod === "401") {
      console.error("[Weather API] API key error:", currentData.message);

      throw createError({
        statusCode: 503,
        statusMessage: "Service Unavailable",
        data: {
          error:
            "Weather API service temporarily unavailable. Please check your API key.",
        },
      });
    }

    // Track this API call too
    await trackApiCall();

    // Fetch forecast
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    // Prepare response data
    const responseData = {
      current: currentData,
      forecast: forecastData,
      timestamp: new Date().toISOString(),
    };

    // Store in cache
    await setCachedWeather(cacheKey, responseData);

    // Log API call for monitoring
    console.log(`[Weather API] New data fetched for ${cacheKey}`);

    return responseData;
  } catch (error: unknown) {
    console.error("Error fetching weather data:", error);

    if (typeof error === 'object' && error !== null && 'statusCode' in error) {
        const h3Error = error as { statusCode: number };
        if (h3Error.statusCode) {
            throw error;
        }
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      data: {
        error: "Failed to fetch weather data. Please try again later.",
      },
    });
  }
});
