// composables/useWeatherService.ts
import { ref } from "vue";

export function useWeatherService() {
  const currentWeather = ref({});
  const forecast = ref({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Get weather by city name
  const getWeatherByCity = async (city: string) => {
    if (!city.trim()) return { error: "City name is required" };

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}`
      );
      const data = await response.json();

      if (data.error) {
        error.value = "City not found. Please try another location.";
        return { error: error.value };
      } else {
        currentWeather.value = data.current;
        forecast.value = data.forecast;
        return {
          current: data.current,
          forecast: data.forecast,
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

    try {
      // Update the API endpoint to handle coordinates
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const data = await response.json();

      if (data.error) {
        error.value = "Location not found. Please try again.";
        return { error: error.value };
      } else {
        currentWeather.value = data.current;
        forecast.value = data.forecast;
        return {
          current: data.current,
          forecast: data.forecast,
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

  return {
    currentWeather,
    forecast,
    loading,
    error,
    getWeatherByCity,
    getWeatherByCoords,
  };
}
