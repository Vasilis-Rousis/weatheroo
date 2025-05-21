// composables/useWeatherService.ts
import { ref } from "vue";

// Weather data interfaces
interface WeatherMain {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

interface WeatherWind {
  speed: number;
  deg: number;
}

interface WeatherClouds {
  all: number;
}

interface WeatherSys {
  country: string;
  sunrise: number;
  sunset: number;
}

interface WeatherInfo {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface CurrentWeather {
  coord: { lon: number; lat: number };
  weather: WeatherInfo[];
  main: WeatherMain;
  visibility: number;
  wind: WeatherWind;
  clouds: WeatherClouds;
  dt: number;
  sys: WeatherSys;
  timezone: number;
  id: number;
  name: string;
  cod: number | string;
}

interface ForecastItem {
  dt: number;
  main: WeatherMain;
  weather: WeatherInfo[];
  clouds: WeatherClouds;
  wind: WeatherWind;
  visibility: number;
  pop: number;
  dt_txt: string;
}

interface Forecast {
  list: ForecastItem[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
  };
}

interface WeatherCache {
  current: CurrentWeather;
  forecast: Forecast;
  timestamp: number;
  cachedAt?: string;
}

interface ApiResponse {
  current?: CurrentWeather;
  forecast?: Forecast;
  error?: string;
  cached?: boolean;
  cachedAt?: string;
  notice?: string;
  timestamp?: string;
  retryAfter?: number;
}

interface WeatherResult {
  current?: CurrentWeather;
  forecast?: Forecast;
  error?: string;
  cached?: boolean;
  cachedAt?: string;
  notice?: string;
}

interface CacheInfo {
  isCached: boolean;
  timestamp: string | null;
}

export function useWeatherService() {
  const currentWeather = ref<Partial<CurrentWeather>>({});
  const forecast = ref<Partial<Forecast>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);
  const cacheInfo = ref<CacheInfo>({
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
  const setCachedWeather = (key: string, data: WeatherResult) => {
    // Skip cache in SSR mode
    if (typeof window === "undefined") return;

    try {
      const cacheData: WeatherCache = {
        current: data.current as CurrentWeather,
        forecast: data.forecast as Forecast,
        timestamp: Date.now(),
        cachedAt: data.cachedAt,
      };

      localStorage.setItem(`weatheroo-cache-${key}`, JSON.stringify(cacheData));
    } catch (e) {
      console.error("Error caching weather data", e);
    }
  };

  // Get weather by city name
  const getWeatherByCity = async (city: string): Promise<WeatherResult> => {
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
          const responseData = (await response.json()) as {
            data?: { retryAfter?: number };
          };
          const retryAfter = responseData?.data?.retryAfter || "";
          const errorMsg = `Rate limit exceeded. Please try again later. (${retryAfter}s)`;
          error.value = errorMsg;
          return { error: errorMsg };
        }
        error.value = "Failed to fetch weather data. Please try again.";
        return { error: error.value };
      }

      const data = (await response.json()) as ApiResponse;

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
        setCachedWeather(cacheKey, data);

        currentWeather.value = data.current as CurrentWeather;
        forecast.value = data.forecast as Forecast;
        return {
          current: data.current,
          forecast: data.forecast,
          cached: data.cached,
          cachedAt: data.cachedAt,
          notice: data.notice,
        };
      }
    } catch (err) {
      const errorMsg = "Failed to fetch weather data. Please try again.";
      error.value = errorMsg;
      console.error(err);
      return { error: errorMsg };
    } finally {
      loading.value = false;
    }
  };

  // Get weather by coordinates
  const getWeatherByCoords = async (
    lat: number,
    lon: number
  ): Promise<WeatherResult> => {
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
          const responseData = (await response.json()) as {
            data?: { retryAfter?: number };
          };
          const retryAfter = responseData?.data?.retryAfter || "";
          const errorMsg = `Rate limit exceeded. Please try again later. (${retryAfter}s)`;
          error.value = errorMsg;
          return { error: errorMsg };
        }
        error.value = "Failed to fetch weather data. Please try again.";
        return { error: error.value };
      }

      const data = (await response.json()) as ApiResponse;

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
        setCachedWeather(cacheKey, data);

        currentWeather.value = data.current as CurrentWeather;
        forecast.value = data.forecast as Forecast;
        return {
          current: data.current,
          forecast: data.forecast,
          cached: data.cached,
          cachedAt: data.cachedAt,
          notice: data.notice,
        };
      }
    } catch (err) {
      const errorMsg = "Failed to fetch weather data. Please try again.";
      error.value = errorMsg;
      console.error(err);
      return { error: errorMsg };
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
