import { defineStore } from 'pinia';
import {
  useWeatherService,
  type CurrentWeather,
  type Forecast,
} from '~/composables/useWeatherService';

interface WeatherState {
  currentWeather: CurrentWeather | null;
  forecast: Forecast | null;
  loading: boolean;
  loadingFinished: boolean;
  error: string | null;
}

export const useWeatherStore = defineStore('weather', {
  state: (): WeatherState => ({
    currentWeather: null,
    forecast: null,
    loading: true,
    loadingFinished: false,
    error: null,
  }),
  actions: {
    async fetchWeatherByCity(city: string) {
      this.loading = true;
      this.loadingFinished = false;
      this.error = null;
      try {
        const { getWeatherByCity } = useWeatherService();
        const result = await getWeatherByCity(city);
        if (result.error) {
          this.error = result.error;
        } else {
          this.currentWeather = result.current || null;
          this.forecast = result.forecast || null;
        }
      } catch (err: unknown) {
        this.error = 'Failed to fetch weather data. Please try again.';
        console.error('Fetch weather by city error:', err);
      } finally {
        this.loadingFinished = true;
        setTimeout(() => {
          this.loading = false;
        }, 400);
      }
    },
    async fetchWeatherByCoords(lat: number, lon: number) {
      this.loading = true;
      this.loadingFinished = false;
      this.error = null;
      try {
        const { getWeatherByCoords } = useWeatherService();
        const result = await getWeatherByCoords(lat, lon);
        if (result.error) {
          this.error = result.error;
        } else {
          this.currentWeather = result.current || null;
          this.forecast = result.forecast || null;
        }
      } catch (err: unknown) {
        this.error = 'Failed to fetch weather data. Please try again.';
        console.error('Fetch weather by coords error:', err);
      } finally {
        this.loadingFinished = true;
        setTimeout(() => {
          this.loading = false;
        }, 400);
      }
    },
  },
});
