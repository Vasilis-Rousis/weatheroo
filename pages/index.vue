<!-- pages/index.vue -->
<template>
  <div
    class="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-300"
  >
    <div
      v-if="!loading && currentWeather?.weather?.[0]?.icon"
      class="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <WeatherAnimation :weather-code="currentWeather.weather[0].icon" />
    </div>

    <div class="container mx-auto px-4 py-8">
      <!-- Header with Logo and Search -->
      <header class="mb-8">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div class="flex items-center">
            <CloudIcon class="h-8 w-8 mr-2 text-blue-500" />
            <h1 class="text-3xl font-bold">Nuxt Weather</h1>
          </div>

          <div class="w-full md:w-64">
            <div class="relative">
              <Input
                v-model="searchQuery"
                placeholder="Search city..."
                class="pr-10"
                @keyup.enter="searchCity"
              />
              <Button
                variant="ghost"
                class="absolute right-0 top-0 h-full px-3"
                @click="searchCity"
              >
                <SearchIcon class="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Button variant="outline" size="icon" @click="toggleTheme">
            <SunIcon v-if="isDark" class="h-5 w-5" />
            <MoonIcon v-else class="h-5 w-5" />
          </Button>
        </div>
      </header>

      <!-- Main content -->
      <main>
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-20">
          <div
            class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
          <AlertTriangleIcon class="w-16 h-16 mx-auto text-red-500 mb-4" />
          <p class="text-xl">{{ error }}</p>
          <Button class="mt-4" @click="searchCity">Try Again</Button>
        </div>

        <!-- Weather Data -->
        <div v-else>
          <!-- Current Weather Card -->
          <Card
            class="mb-8 overflow-hidden border-none shadow-lg transform transition-all duration-300 hover:shadow-xl"
          >
            <div
              class="bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 p-6 text-white relative"
            >
              <div
                class="flex flex-col md:flex-row justify-between items-center"
              >
                <div>
                  <h2 class="text-3xl font-bold mb-1">
                    {{ currentWeather.name }}, {{ currentWeather.sys?.country }}
                  </h2>
                  <p class="text-lg opacity-90">{{ formattedDate }}</p>
                </div>

                <div class="flex items-center mt-4 md:mt-0">
                  <NuxtImg
                    v-if="currentWeather.weather?.[0]?.icon"
                    :src="`https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`"
                    :alt="currentWeather.weather?.[0]?.description"
                    width="80"
                    height="80"
                    class="weather-icon"
                    loading="eager"
                    format="webp"
                  />
                  <div class="text-center">
                    <h3 class="text-5xl font-bold">
                      {{ Math.round(currentWeather.main?.temp) }}°C
                    </h3>
                    <p class="text-xl capitalize">
                      {{ currentWeather.weather?.[0]?.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <CardContent class="p-6">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 transform transition duration-300 hover:scale-105"
                >
                  <ThermometerIcon
                    class="h-6 w-6 mx-auto mb-2 text-yellow-500"
                  />
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Feels Like
                  </p>
                  <p class="text-xl font-semibold">
                    {{ Math.round(currentWeather.main?.feels_like) }}°C
                  </p>
                </div>

                <div
                  class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 transform transition duration-300 hover:scale-105"
                >
                  <DropletIcon class="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Humidity
                  </p>
                  <p class="text-xl font-semibold">
                    {{ currentWeather.main?.humidity }}%
                  </p>
                </div>

                <div
                  class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 transform transition duration-300 hover:scale-105"
                >
                  <WindIcon class="h-6 w-6 mx-auto mb-2 text-gray-500" />
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Wind Speed
                  </p>
                  <p class="text-xl font-semibold">
                    {{ Math.round(currentWeather.wind?.speed) }} m/s
                  </p>
                </div>

                <div
                  class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 transform transition duration-300 hover:scale-105"
                >
                  <CloudIcon class="h-6 w-6 mx-auto mb-2 text-gray-400" />
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Cloudiness
                  </p>
                  <p class="text-xl font-semibold">
                    {{ currentWeather.clouds?.all }}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Daily Forecast -->
          <h2 class="text-2xl font-bold mb-4">5-Day Forecast</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card
              v-for="(forecast, index) in dailyForecasts"
              :key="index"
              class="border-none shadow-md forecast-card transition-all duration-300 transform hover:shadow-lg hover:scale-105"
            >
              <CardHeader class="pb-2">
                <CardTitle class="text-lg">{{
                  formatDay(forecast.dt)
                }}</CardTitle>
              </CardHeader>
              <CardContent class="text-center py-2">
                <NuxtImg
                  :src="`https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`"
                  :alt="forecast.weather[0].description"
                  width="64"
                  height="64"
                  class="mx-auto"
                  loading="lazy"
                  format="webp"
                />
                <p class="text-2xl font-bold mb-1">
                  {{ Math.round(forecast.main.temp) }}°C
                </p>
                <p class="text-sm capitalize text-gray-500 dark:text-gray-400">
                  {{ forecast.weather[0].description }}
                </p>
              </CardContent>
              <CardFooter class="pt-0 pb-4">
                <div
                  class="w-full grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400"
                >
                  <div class="flex items-center">
                    <DropletIcon class="h-3 w-3 mr-1" />
                    {{ forecast.main.humidity }}%
                  </div>
                  <div class="flex items-center">
                    <WindIcon class="h-3 w-3 mr-1" />
                    {{ Math.round(forecast.wind.speed) }} m/s
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          <!-- Weather Map Section -->
          <div
            class="mt-8 opacity-0 animate-fadeIn"
            style="animation-delay: 300ms; animation-fill-mode: forwards"
          >
            <h2 class="text-2xl font-bold mb-4">Weather Map</h2>
            <Card class="border-none shadow-md overflow-hidden h-64">
              <div
                class="h-full w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              >
                <p class="text-gray-500">Weather map will be displayed here</p>
                <!-- You can integrate a real map using libraries like Mapbox or Google Maps -->
              </div>
            </Card>
          </div>
        </div>
      </main>

      <footer
        class="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm py-4"
      >
        <p>Made with Nuxt 3, Tailwind CSS and shadcn components</p>
        <p class="mt-1">Weather data provided by OpenWeatherMap</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from "vue";
import {
  CloudIcon,
  SearchIcon,
  SunIcon,
  MoonIcon,
  ThermometerIcon,
  DropletIcon,
  WindIcon,
  AlertTriangleIcon,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import WeatherAnimation from "~/components/WeatherAnimation.vue";

const searchQuery = ref("");
const currentWeather = ref({});
const forecast = ref({});
const loading = ref(true);
const error = ref(null);
const isDark = ref(false);

// Format the current date
const formattedDate = computed(() => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Extract daily forecasts (one per day)
const dailyForecasts = computed(() => {
  if (!forecast.value?.list) return [];

  const uniqueDays = [];
  const dateMap = new Map();

  forecast.value.list.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();

    // Only take the first forecast for each day (usually around noon)
    if (!dateMap.has(date)) {
      dateMap.set(date, item);
      uniqueDays.push(item);
    }
  });

  return uniqueDays.slice(0, 5);
});

// Format timestamp to day name
const formatDay = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// Toggle dark/light theme
const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
};

// Search for a city's weather
const searchCity = async () => {
  if (!searchQuery.value.trim()) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(
      `/api/weather?city=${encodeURIComponent(searchQuery.value)}`
    );
    const data = await response.json();

    if (data.error) {
      error.value = "City not found. Please try another location.";
    } else {
      currentWeather.value = data.current;
      forecast.value = data.forecast;
    }
  } catch (err) {
    error.value = "Failed to fetch weather data. Please try again.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Initialize with a default city on page load
onMounted(async () => {
  try {
    const response = await fetch("/api/weather?city=London");
    const data = await response.json();

    if (data.error) {
      error.value = "Failed to load weather data";
    } else {
      currentWeather.value = data.current;
      forecast.value = data.forecast;
    }
  } catch (err) {
    error.value = "Failed to fetch weather data";
    console.error(err);
  } finally {
    loading.value = false;
  }

  // Check for system dark mode preference
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    isDark.value = true;
    document.documentElement.classList.add("dark");
  }
});
</script>

<style>
.weather-icon {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
</style>
