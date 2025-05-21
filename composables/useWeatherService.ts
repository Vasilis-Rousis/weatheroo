// composables/useWeatherService.ts
import { ref } from "vue";

interface WeatherCache {
  current: any;
  forecast: any;
  timestamp: number;
  cachedAt?: string;
}

export function useWeatherService() {
  const currentWeather = ref<any>({});
  const forecast = ref<any>({});
  const loading = ref(false);
  const error = ref<string | null>(null);
  const cacheInfo = ref<{ isCached: boolean; timestamp: string | null }>({
    isCached: false,
    timestamp: null,
  });

  // Add cache duration control - can be adjusted based on needs
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Helper to get cached weather data
  const getCachedWeather = (key: string): WeatherCache | null => {
    // Skip cache in SSR mode
    if (typeof window === "undefined") return null;

    const cached = localStorage.getItem(`weatheroo-cache-${key}`);
    if (!cached) return null;

    try {
      const data = JSON.parse(cached) as WeatherCache;
      // Check if cache is still valid
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data;
      }
      // Clear expired cache
      localStorage.removeItem(`weatheroo-cache-${key}`);
    } catch (e) {
      console.error("Error parsing cached weather data", e);
      localStorage.removeItem(`weatheroo-cache-${key}`);
    }
    return null;
  };

  // Helper to set cached weather data
  const setCachedWeather = (key: string, data: any) => {
    // Skip cache in SSR mode
    if (typeof window === "undefined") return;

    try {
      const cacheData: WeatherCache = {
        ...data,
        timestamp: Date.now(),
      };

      localStorage.setItem(`weatheroo-cache-${key}`, JSON.stringify(cacheData));
    } catch (e) {
      console.error("Error caching weather data", e);
    }
  };

  // Get weather by city name
  const getWeatherByCity = async (city: string) => {
    if (!city.trim()) return { error: "City name is required" };

    loading.value = true;
    error.value = null;

    // Reset cache info
    cacheInfo.value = { isCached: false, timestamp: null };

    // Check client cache first
    const cacheKey = `city-${city.toLowerCase().trim()}`;
    const cachedData = getCachedWeather(cacheKey);

    if (cachedData) {
      console.log("Using client-cached weather data for", city);
      currentWeather.value = cachedData.current;
      forecast.value = cachedData.forecast;
      cacheInfo.value = {
        isCached: true,
        timestamp: new Date(cachedData.timestamp).toISOString(),
      };
      loading.value = false;
      return {
        current: cachedData.current,
        forecast: cachedData.forecast,
        cached: true,
        cachedAt: new Date(cachedData.timestamp).toISOString(),
      };
    }

    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}`
      );

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          error.value = `Rate limit exceeded. Please try again later. (${data.retryAfter}s)`;
          return { error: error.value };
        }
        error.value = "Failed to fetch weather data. Please try again.";
        return { error: error.value };
      }

      const data = await response.json();

      if (data.error) {
        error.value = "City not found. Please try another location.";
        return { error: error.value };
      } else {
        // Update cache info
        cacheInfo.value = {
          isCached: !!data.cached,
          timestamp: data.cachedAt || data.timestamp || null,
        };

        // Store the response in client cache
        setCachedWeather(cacheKey, {
          current: data.current,
          forecast: data.forecast,
          timestamp: Date.now(),
          cachedAt: data.cachedAt || data.timestamp,
        });

        currentWeather.value = data.current;
        forecast.value = data.forecast;
        return {
          current: data.current,
          forecast: data.forecast,
          cached: data.cached,
          cachedAt: data.cachedAt,
          notice: data.notice,
        };
      }
    } catch (err) {
      error.value = "Failed to fetch weather data. Please try again.";
      console.error(err);
      return { error: error.value };
    } finally {
      loading.value = false;
    }
  };

  // Get weather by coordinates
  const getWeatherByCoords = async (lat: number, lon: number) => {
    loading.value = true;
    error.value = null;

    // Reset cache info
    cacheInfo.value = { isCached: false, timestamp: null };

    // Check client cache first - round coordinates to 2 decimal places to increase cache hits
    const roundedLat = lat.toFixed(2);
    const roundedLon = lon.toFixed(2);
    const cacheKey = `coords-${roundedLat}-${roundedLon}`;
    const cachedData = getCachedWeather(cacheKey);

    if (cachedData) {
      console.log("Using client-cached coords data");
      currentWeather.value = cachedData.current;
      forecast.value = cachedData.forecast;
      cacheInfo.value = {
        isCached: true,
        timestamp: new Date(cachedData.timestamp).toISOString(),
      };
      loading.value = false;
      return {
        current: cachedData.current,
        forecast: cachedData.forecast,
        cached: true,
        cachedAt: new Date(cachedData.timestamp).toISOString(),
      };
    }

    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);

      if (!response.ok) {
        if (response.status === 429) {
          const data = await response.json();
          error.value = `Rate limit exceeded. Please try again later. (${data.retryAfter}s)`;
          return { error: error.value };
        }
        error.value = "Failed to fetch weather data. Please try again.";
        return { error: error.value };
      }

      const data = await response.json();

      if (data.error) {
        error.value = "Location not found. Please try again.";
        return { error: error.value };
      } else {
        // Update cache info
        cacheInfo.value = {
          isCached: !!data.cached,
          timestamp: data.cachedAt || data.timestamp || null,
        };

        // Store in cache
        setCachedWeather(cacheKey, {
          current: data.current,
          forecast: data.forecast,
          timestamp: Date.now(),
          cachedAt: data.cachedAt || data.timestamp,
        });

        currentWeather.value = data.current;
        forecast.value = data.forecast;
        return {
          current: data.current,
          forecast: data.forecast,
          cached: data.cached,
          cachedAt: data.cachedAt,
          notice: data.notice,
        };
      }
    } catch (err) {
      error.value = "Failed to fetch weather data. Please try again.";
      console.error(err);
      return { error: error.value };
    } finally {
      loading.value = false;
    }
  };

  // Clear client cache (useful for testing)
  const clearCache = () => {
    if (typeof window === "undefined") return;

    // Clear all weather cache items
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("weatheroo-cache-")) {
        localStorage.removeItem(key);
      }
    });
  };

  return {
    currentWeather,
    forecast,
    loading,
    error,
    cacheInfo,
    getWeatherByCity,
    getWeatherByCoords,
    clearCache,
  };
}
