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
      <!-- Location Permission Dialog -->
      <LocationDialog
        v-model="showLocationDialog"
        @confirm="handleLocationRequest"
        @decline="handleLocationDecline"
      />

      <!-- Header with Logo and Search -->
      <header class="mb-8">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div class="flex items-center">
            <CloudIcon
              class="h-8 w-8 mr-2 text-blue-500 header-element header-logo"
            />
            <h1 class="text-3xl font-bold header-element header-title">
              Weatheroo
            </h1>
          </div>

          <div
            class="w-full md:w-96 mr-20 relative header-element header-search"
          >
            <div class="flex gap-2 items-center">
              <div class="relative md:max-w-60 flex-1">
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

              <!-- Location Button Component -->
              <LocationButton
                :is-enabled="locationEnabled"
                :is-loading="locationLoading"
                class="header-element location-button"
                @request-location="handleLocationRequest"
                @disable-location="handleLocationDisable"
              />
            </div>

            <!-- Location error message -->
            <div
              v-if="locationError && showLocationError"
              class="absolute mt-1 text-xs text-red-500 transition-opacity duration-300"
              :class="showLocationError ? 'animate-fadeIn' : 'animate-fadeOut'"
            >
              {{ locationError }}
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            class="header-element header-theme-toggle"
            @click="toggleTheme"
          >
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
                  <h2 class="text-3xl font-bold mb-1 flex items-center gap-2">
                    {{ currentWeather.name }}, {{ currentWeather.sys?.country }}
                    <MapPinIcon
                      v-if="locationEnabled"
                      class="h-5 w-5 inline-block"
                    />
                  </h2>
                  <p class="text-lg opacity-90">{{ formattedDate }}</p>
                  <p v-if="cityLocalTime" class="text-md opacity-80">
                    {{ formattedLocalTime }} ({{ timezoneString }})
                  </p>
                </div>

                <div class="flex items-center mt-4 md:mt-0">
                  <WeatherIcons
                    v-if="currentWeather.weather?.[0]?.icon"
                    :weather-code="currentWeather.weather[0].icon"
                    size="large"
                    class="weather-icon"
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
              v-for="(forecastDay, index) in dailyForecasts"
              :key="index"
              class="border-none shadow-md forecast-card transition-all duration-300 transform hover:shadow-lg hover:scale-105"
            >
              <CardHeader class="pb-2">
                <CardTitle class="text-lg">{{
                  formatDay(forecastDay.dt)
                }}</CardTitle>
              </CardHeader>
              <CardContent class="text-center py-2">
                <WeatherIcons
                  :weather-code="forecastDay.weather[0].icon"
                  size="medium"
                  class="mx-auto my-8"
                />
                <p class="text-2xl font-bold mb-1">
                  {{ Math.round(forecastDay.main.temp) }}°C
                </p>
                <p class="text-sm capitalize text-gray-500 dark:text-gray-400">
                  {{ forecastDay.weather[0].description }}
                </p>
              </CardContent>
              <CardFooter class="pt-0 pb-4">
                <div
                  class="w-full grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400"
                >
                  <div class="flex items-center">
                    <DropletIcon class="h-3 w-3 mr-1" />
                    {{ forecastDay.main.humidity }}%
                  </div>
                  <div class="flex items-center justify-end">
                    <WindIcon class="h-3 w-3 mr-1" />
                    {{ Math.round(forecastDay.wind.speed) }} m/s
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
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import {
  CloudIcon,
  SearchIcon,
  SunIcon,
  MoonIcon,
  MapPinIcon,
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
import WeatherIcons from "~/components/WeatherIcons.vue";
import LocationButton from "~/components/LocationButton.vue";
import LocationDialog from "~/components/LocationDialog.vue";
import { useLocationService } from "~/composables/useLocationService";
import { useWeatherService } from "~/composables/useWeatherService";
import { useUserPreferences } from "~/composables/useUserPreferences";

const searchQuery = ref("");
const currentWeather = ref({});
const forecast = ref({});
const loading = ref(true);
const error = ref(null);
const showLocationDialog = ref(false);
const showLocationError = ref(false);

// Get user preferences
const {
  lastCity,
  locationPromptShown,
  locationPermissionDenied,
  locationPermissionEnabled,
  darkMode,
  updateLastCity,
  enableLocationPermission,
  disableLocationPermission,
} = useUserPreferences();

// Set isDark from stored preference
const isDark = ref(darkMode.value);

// Get location and weather services
const {
  locationEnabled,
  locationLoading,
  locationError,
  coordinates,
  requestLocation,
  clearCoordinates,
} = useLocationService();

const { getWeatherByCity, getWeatherByCoords } = useWeatherService();

// Clock and timezone variables
const cityLocalTime = ref(null);
const timezoneOffsetSeconds = ref(0);
const clockInterval = ref(null);
const timezoneString = ref("");

// Format the current date
const formattedDate = computed(() => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Format just the time portion
const formattedLocalTime = computed(() => {
  if (!cityLocalTime.value) return "";

  return cityLocalTime.value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
});

// Update the city's local time every second
const startClock = () => {
  // Clear any existing interval
  if (clockInterval.value) {
    clearInterval(clockInterval.value);
  }

  // Set up the interval to update every second
  clockInterval.value = setInterval(() => {
    updateCityTime();
  }, 1000);

  // Initialize the time immediately
  updateCityTime();
};

// Update the city's local time based on the timezone offset from the API
const updateCityTime = () => {
  // Get current UTC time
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;

  // Calculate city's local time by applying the timezone offset
  cityLocalTime.value = new Date(utcTime + timezoneOffsetSeconds.value * 1000);
};

// Format the timezone string (GMT+XX:XX format)
const updateTimezoneString = () => {
  const offsetSeconds = timezoneOffsetSeconds.value;
  const timezoneHours = Math.abs(Math.floor(offsetSeconds / 3600));
  const timezoneMinutes = Math.abs(Math.floor((offsetSeconds % 3600) / 60));

  timezoneString.value = `GMT${offsetSeconds >= 0 ? "+" : "-"}${timezoneHours
    .toString()
    .padStart(2, "0")}:${timezoneMinutes.toString().padStart(2, "0")}`;
};

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

  // Save the theme preference
  darkMode.value = isDark.value;
};

// Search for a city's weather
const searchCity = async () => {
  if (!searchQuery.value.trim()) return;

  loading.value = true;
  error.value = null;

  try {
    const result = await getWeatherByCity(searchQuery.value);

    if (result.error) {
      error.value = result.error;
    } else {
      currentWeather.value = result.current;
      forecast.value = result.forecast;

      // Update location state
      locationEnabled.value = false;

      // Update the timezone offset and restart the clock
      if (result.current && result.current.timezone !== undefined) {
        timezoneOffsetSeconds.value = result.current.timezone;
        updateTimezoneString();
        startClock();
      }

      // Save the city in user preferences
      updateLastCity(searchQuery.value);
    }
  } catch (err) {
    error.value = "Failed to fetch weather data. Please try again.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Handle location request
const handleLocationRequest = async () => {
  try {
    const position = await requestLocation();

    if (position) {
      loading.value = true;
      const result = await getWeatherByCoords(
        position.latitude,
        position.longitude
      );

      if (result.error) {
        error.value = result.error;
      } else {
        currentWeather.value = result.current;
        forecast.value = result.forecast;
        searchQuery.value = result.current.name;

        // Update the timezone offset and restart the clock
        if (result.current && result.current.timezone !== undefined) {
          timezoneOffsetSeconds.value = result.current.timezone;
          updateTimezoneString();
          startClock();
        }

        // Save the city in user preferences
        updateLastCity(result.current.name);

        // Save location permission preference
        enableLocationPermission();
      }

      loading.value = false;
    }
  } catch (err) {
    console.error("Error getting location:", err);
  }
};

// Handle disabling location
const handleLocationDisable = () => {
  // Update local state to disable location and clear coordinates
  clearCoordinates();

  // Update user preferences to disable location
  disableLocationPermission();

  // If we have a last city, load it
  if (lastCity.value) {
    searchQuery.value = lastCity.value;
    searchCity();
  } else {
    // Otherwise, load a default city (London)
    searchQuery.value = "London";
    searchCity();
  }
};

// Handle when the user declines location permission
const handleLocationDecline = () => {
  // If the user previously allowed location but now declined, we should load their last city or default
  if (lastCity.value) {
    searchQuery.value = lastCity.value;
    searchCity();
  }
};

// Watch for changes in the coordinates to update weather
watch(coordinates, async (newCoords) => {
  if (newCoords) {
    loading.value = true;
    const result = await getWeatherByCoords(
      newCoords.latitude,
      newCoords.longitude
    );

    if (result.error) {
      error.value = result.error;
    } else {
      currentWeather.value = result.current;
      forecast.value = result.forecast;
      searchQuery.value = result.current.name;

      // Update the timezone offset and restart the clock
      if (result.current && result.current.timezone !== undefined) {
        timezoneOffsetSeconds.value = result.current.timezone;
        updateTimezoneString();
        startClock();
      }

      // Save the city in user preferences
      updateLastCity(result.current.name);
    }

    loading.value = false;
  }
});

// Watch for changes in the currentWeather timezone
watch(
  () => currentWeather.value?.timezone,
  (newTimezone) => {
    if (newTimezone !== undefined) {
      timezoneOffsetSeconds.value = newTimezone;
      updateTimezoneString();
      startClock();
    }
  }
);

// Watch for changes in the locationError value
watch(
  locationError,
  (newValue) => {
    if (newValue) {
      // Show the error message
      showLocationError.value = true;

      // Set a timer to hide the message after 2 seconds
      setTimeout(() => {
        showLocationError.value = false;
      }, 2000);
    }
  },
  { immediate: true }
);

// Initialize app on page load
onMounted(async () => {
  // Apply stored theme preference
  if (isDark.value) {
    document.documentElement.classList.add("dark");
  }

  try {
    loading.value = true;

    // First, check if location is enabled in preferences and coordinates are available
    if (locationPermissionEnabled.value && "geolocation" in navigator) {
      try {
        const position = await requestLocation();
        if (position) {
          const result = await getWeatherByCoords(
            position.latitude,
            position.longitude
          );

          if (!result.error) {
            currentWeather.value = result.current;
            forecast.value = result.forecast;
            searchQuery.value = result.current.name;
            updateLastCity(result.current.name);

            if (result.current && result.current.timezone !== undefined) {
              timezoneOffsetSeconds.value = result.current.timezone;
              updateTimezoneString();
              startClock();
            }

            loading.value = false;
            return; // Exit early if geolocation worked
          }
        }
      } catch (err) {
        console.error("Error using saved location permission:", err);
      }
    }

    // Second, check if we have a saved city to load
    if (lastCity.value) {
      searchQuery.value = lastCity.value;
      const result = await getWeatherByCity(lastCity.value);

      if (!result.error) {
        currentWeather.value = result.current;
        forecast.value = result.forecast;

        // Initialize timezone info
        if (result.current && result.current.timezone !== undefined) {
          timezoneOffsetSeconds.value = result.current.timezone;
          updateTimezoneString();
          startClock();
        }

        loading.value = false;
        return; // Exit early if we successfully loaded the last city
      }
    }

    // If we don't have a saved city or it failed to load, try geolocation if available
    if ("geolocation" in navigator && !locationPermissionDenied.value) {
      // Check if the location prompt has been shown before
      if (!locationPromptShown.value) {
        // Show the location permission dialog after a short delay
        setTimeout(() => {
          showLocationDialog.value = true;
        }, 1500);
      }
      // If prompt was shown and location is enabled, use it
      else if (coordinates.value) {
        const result = await getWeatherByCoords(
          coordinates.value.latitude,
          coordinates.value.longitude
        );

        if (!result.error) {
          currentWeather.value = result.current;
          forecast.value = result.forecast;
          searchQuery.value = result.current.name;
          updateLastCity(result.current.name);

          if (result.current && result.current.timezone !== undefined) {
            timezoneOffsetSeconds.value = result.current.timezone;
            updateTimezoneString();
            startClock();
          }

          loading.value = false;
          return; // Exit early if geolocation worked
        }
      }
    }

    // Fall back to London as the default city if everything else fails
    const result = await getWeatherByCity("London");

    if (!result.error) {
      currentWeather.value = result.current;
      forecast.value = result.forecast;
      searchQuery.value = "London";
      updateLastCity("London");

      if (result.current && result.current.timezone !== undefined) {
        timezoneOffsetSeconds.value = result.current.timezone;
        updateTimezoneString();
        startClock();
      }
    } else {
      error.value = "Failed to load weather data";
    }
  } catch (err) {
    error.value = "Failed to fetch weather data";
    console.error(err);
  } finally {
    loading.value = false;
  }
});

// Clean up the interval when the component is destroyed
onUnmounted(() => {
  if (clockInterval.value) {
    clearInterval(clockInterval.value);
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

/* Header animation styles */
.header-element {
  opacity: 0;
  transform: translateY(-15px);
  animation: fadeInTopDown 0.6s ease-out forwards;
}

/* For mobile (vertical layout) - top to bottom sequence */
.header-logo {
  animation-delay: 0ms;
}

.header-title {
  animation-delay: 100ms;
}

.header-search {
  animation-delay: 200ms;
}

.location-button {
  animation-delay: 250ms;
}

.header-theme-toggle {
  animation-delay: 300ms;
}

@keyframes fadeInTopDown {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
