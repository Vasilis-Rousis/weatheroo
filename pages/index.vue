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
      <header class="mb-8">
        <div class="flex flex-row items-center justify-between gap-2">
          <!-- Logo and Title - Responsive (Logo only on mobile) -->
          <div class="flex items-center flex-shrink-0">
            <CloudIcon
              class="h-16 w-16 sm:h-10 sm:w-10 mr-0 sm:mr-2 text-blue-500 header-element header-logo"
            />
            <h1
              class="hidden sm:block text-2xl sm:text-3xl font-bold header-element header-title"
            >
              Weatheroo
            </h1>
          </div>
          <div
            class="w-full md:w-96 relative header-element header-search min-w-0"
          >
            <div class="flex gap-2 items-center">
              <div class="relative md:max-w-60 flex-1 min-w-0">
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
                class="header-element location-button flex-shrink-0"
                @request-location="handleLocationRequest"
                @disable-location="handleLocationDisable"
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            class="header-element header-theme-toggle flex-shrink-0 w-9 h-9"
            @click="toggleTheme"
          >
            <ClientOnly>
              <SunIcon v-if="isDark" class="h-5 w-5" />
              <MoonIcon v-else class="h-5 w-5" />
              <template #fallback>
                <!-- Server-side placeholder -->
                <div class="h-5 w-5" />
              </template>
            </ClientOnly>
          </Button>
        </div>
      </header>

      <!-- Main content -->
      <main class="relative min-h-[800px]">
        <!-- Content Area -->
        <div
          v-if="loadingFinished && !loading"
          class="fade-in-content transition-opacity"
          :class="{
            'opacity-100': loadingFinished && !loading,
            'opacity-0': !loadingFinished || loading,
          }"
        >
          <!-- Error State -->
          <div v-if="error" class="text-center py-20">
            <AlertTriangleIcon class="w-16 h-16 mx-auto text-red-500 mb-4" />
            <p class="text-xl">{{ error }}</p>
            <Button class="mt-4" @click="searchCity">Try Again</Button>
          </div>

          <!-- Weather Data -->
          <div v-else>
            <!-- Current Weather Card -->
            <Card
              class="mb-8 overflow-hidden border-none shadow-lg transition-all duration-300 hover:shadow-xl opacity-90 weather-main-card"
            >
              <div
                class="bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800 p-6 text-white relative weather-card-header"
              >
                <div
                  class="flex flex-col md:flex-row justify-between items-center"
                >
                  <div class="weather-location-info flex flex-col items-center md:items-start">
                    <h2
                      class="text-3xl font-bold mb-1 flex items-center gap-2 weather-city"
                    >
                      {{ currentWeather.name }},
                      {{ currentWeather.sys?.country }}
                      <MapPinIcon
                        v-if="locationEnabled"
                        class="h-5 w-5 inline-block"
                      />
                    </h2>
                    <p class="text-lg opacity-90 weather-date">
                      {{ formattedDate }}
                    </p>
                    <p
                      v-if="cityLocalTime"
                      class="text-md opacity-80 weather-time"
                    >
                      {{ formattedLocalTime }} ({{ timezoneString }})
                    </p>
                  </div>

                  <div
                    class="flex items-center gap-2 mt-4 md:mt-0 weather-current-display"
                  >
                    <div class="text-center">
                      <h3 class="text-5xl font-bold weather-temp">
                        {{ Math.round(currentWeather.main?.temp) }}°C
                      </h3>
                      <p class="text-xl capitalize weather-desc">
                        {{ currentWeather.weather?.[0]?.description }}
                      </p>
                    </div>
                    <WeatherIcons
                      v-if="currentWeather.weather?.[0]?.icon"
                      :weather-code="currentWeather.weather[0].icon"
                      size="large"
                      class="weather-icon"
                    />
                  </div>
                </div>
              </div>

              <CardContent class="p-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 transition duration-300 hover:scale-105 weather-stat-item weather-stat-0"
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
                    class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 transition duration-300 hover:scale-105 weather-stat-item weather-stat-1"
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
                    class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 transition duration-300 hover:scale-105 weather-stat-item weather-stat-2"
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
                    class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 transition duration-300 hover:scale-105 weather-stat-item weather-stat-3"
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
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card
                v-for="(forecastDay, index) in dailyForecasts"
                :key="index"
                class="border-none shadow-md forecast-card transition-all duration-300 hover:shadow-lg hover:scale-105"
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
                  <p
                    class="text-sm capitalize text-gray-500 dark:text-gray-400"
                  >
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
              <ClientOnly>
                <WeatherMap
                  v-if="currentWeather?.coord"
                  :latitude="currentWeather.coord.lat"
                  :longitude="currentWeather.coord.lon"
                  :city-name="currentWeather.name"
                  :zoom="9"
                />
                <template #fallback>
                  <!-- Fallback content while loading -->
                  <div>
                    <Card
                      class="border-none shadow-md overflow-hidden h-64 md:h-80"
                    >
                      <CardContent
                        class="flex items-center justify-center h-full"
                      >
                        <div class="flex items-center gap-2">
                          <div
                            class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"
                          />
                          <span>Loading weather map...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>

        <!-- Loading State - Always present but with opacity controlled by state -->
        <div
          class="fade-out-skeleton absolute w-full top-0 left-0 transition-opacity duration-300"
          :class="{
            'opacity-0 z-0': loadingFinished && !loading,
            'opacity-100 z-10': !loadingFinished || loading,
          }"
        >
          <SkeletonLoader />
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
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
import SkeletonLoader from "~/components/SkeletonLoader.vue";
import { useLocationService } from "~/composables/useLocationService";
import { useWeatherService } from "~/composables/useWeatherService";
import { useUserPreferences } from "~/composables/useUserPreferences";
import WeatherMap from "~/components/WeatherMap.vue";

const searchQuery = ref("");
const currentWeather = ref({});
const forecast = ref({});
const loading = ref(true);
const loadingFinished = ref(false);
const error = ref(null);
const showLocationDialog = ref(false);

// Get user preferences
const {
  lastCity,
  locationPromptShown,
  locationPermissionDenied,
  locationPermissionEnabled,
  updateLastCity,
  enableLocationPermission,
  disableLocationPermission,
  denyLocationPermission,
} = useUserPreferences();

// Use Nuxt's color mode composable
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");

// Get location and weather services
const {
  locationEnabled,
  locationLoading,
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

// Toggle dark/light theme using colorMode
const toggleTheme = async () => {
  colorMode.preference = isDark.value ? "light" : "dark";
};

// Search for a city's weather
const searchCity = async () => {
  if (!searchQuery.value.trim()) return;

  // Reset states
  loading.value = true;
  loadingFinished.value = false;
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

      // IMPORTANT: When a user explicitly searches for a city,
      // we should mark location as denied to prevent auto-enabling
      denyLocationPermission();

      // Update the timezone offset and restart the clock
      if (result.current && result.current.timezone !== undefined) {
        timezoneOffsetSeconds.value = result.current.timezone;
        updateTimezoneString();
        startClock();
      }

      // Save the city in user preferences
      updateLastCity(searchQuery.value);
    }

    // Mark data as loaded
    loadingFinished.value = true;

    // Wait for content to be rendered
    await nextTick();

    // Slightly delay hiding the skeleton for smoother transition
    setTimeout(() => {
      loading.value = false;
    }, 400);
  } catch (err) {
    error.value = "Failed to fetch weather data. Please try again.";
    console.error(err);

    // Still mark as finished to show the error message
    loadingFinished.value = true;

    setTimeout(() => {
      loading.value = false;
    }, 400);
  }
};

// Handle location request
const handleLocationRequest = async () => {
  try {
    // Update preferences to enable location and remove any denied status
    enableLocationPermission();

    // Manually set location as enabled for immediate UI update
    locationEnabled.value = true;

    // Now request the location
    const position = await requestLocation();

    if (position) {
      // Reset states
      loading.value = true;
      loadingFinished.value = false;
      error.value = null;

      const result = await getWeatherByCoords(
        position.latitude,
        position.longitude
      );

      if (result.error) {
        error.value = result.error;

        // If there was an error getting weather, revert location enabled state
        locationEnabled.value = false;
        disableLocationPermission();
        denyLocationPermission();
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

      // Mark data as loaded
      loadingFinished.value = true;

      // Wait for content to be rendered
      await nextTick();

      // Slightly delay hiding the skeleton for smoother transition
      setTimeout(() => {
        loading.value = false;
      }, 400);
    } else {
      // If we couldn't get position, revert location enabled state
      locationEnabled.value = false;
      disableLocationPermission();
      denyLocationPermission();
    }
  } catch (err) {
    console.error("Error getting location:", err);

    // If there was an error, revert location enabled state
    locationEnabled.value = false;
    disableLocationPermission();
    denyLocationPermission();

    // Still update loading states
    loadingFinished.value = true;
    loading.value = false;
  }
};

// Handle disabling location
const handleLocationDisable = () => {
  // Update local state to disable location and clear coordinates
  clearCoordinates();

  // Update user preferences to EXPLICITLY disable location
  disableLocationPermission();

  // Also mark as denied to prevent auto-enabling on refresh
  denyLocationPermission();

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
  // Only process coordinate changes if location permission is explicitly enabled
  if (newCoords && locationPermissionEnabled.value) {
    // Reset states
    loading.value = true;
    loadingFinished.value = false;
    error.value = null;

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

    // Mark data as loaded
    loadingFinished.value = true;

    // Wait for content to be rendered
    await nextTick();

    // Slightly delay hiding the skeleton for smoother transition
    setTimeout(() => {
      loading.value = false;
    }, 400);
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

// Initialize app on page load
onMounted(async () => {
  try {
    loading.value = true;
    loadingFinished.value = false;

    // Change the priority order:
    // 1. First, check if location is EXPLICITLY DISABLED in the app preferences
    if (locationPermissionDenied.value) {
      // Make sure location UI state reflects this
      locationEnabled.value = false;

      // If location is explicitly disabled by the user, load the last city or default
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

          // Mark data as loaded
          loadingFinished.value = true;
          setTimeout(() => {
            loading.value = false;
          }, 800);
          return; // Exit early
        }
      }
      // Fall through to default city if last city failed
    }

    // 2. Check if location is EXPLICITLY ENABLED in preferences
    else if (locationPermissionEnabled.value && "geolocation" in navigator) {
      try {
        // Make sure location UI state reflects this
        locationEnabled.value = true;

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

            // Mark data as loaded and complete the loading transition
            loadingFinished.value = true;
            setTimeout(() => {
              loading.value = false;
            }, 800);
            return; // Exit early if geolocation worked
          }
        }
      } catch (err) {
        console.error("Error using saved location permission:", err);
      }
    }

    // 3. If no explicit location preference, check if we have a saved city to load
    if (lastCity.value) {
      // If we're loading a saved city and not using location, make sure the UI reflects this
      locationEnabled.value = false;

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

        // Mark data as loaded
        loadingFinished.value = true;
        setTimeout(() => {
          loading.value = false;
        }, 800);
        return; // Exit early
      }
    }

    // 4. Only prompt for location if no previous preferences exist
    if (
      "geolocation" in navigator &&
      !locationPermissionDenied.value &&
      !locationPermissionEnabled.value
    ) {
      // Only show the location dialog if it hasn't been shown before
      if (!locationPromptShown.value) {
        setTimeout(() => {
          showLocationDialog.value = true;
        }, 1500);
      }
    }

    // Fall back to London as the default city if everything else fails
    // And make sure location UI shows as disabled
    locationEnabled.value = false;

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

    // Mark data as loaded regardless of success/failure
    loadingFinished.value = true;
  } catch (err) {
    error.value = "Failed to fetch weather data";
    console.error(err);

    // Mark as loaded to show the error state
    loadingFinished.value = true;
  } finally {
    // Add a small delay for better UX
    setTimeout(() => {
      loading.value = false;
    }, 800);
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
  }
  to {
    opacity: 1;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

/* Header animation styles */
.header-element {
  opacity: 0;
  animation: fadeInHeader 0.6s ease-out forwards;
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

@keyframes fadeInHeader {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Smooth transition between content and skeleton */
.fade-in-content {
  position: relative;
  z-index: 10;
  transition: opacity 0.6s ease;
}

.fade-out-skeleton {
  transition: opacity 0.6s ease;
}

/* Make main a stacking context for proper overlay transitions */
main {
  position: relative;
  min-height: 800px;
}

/* Apply separate entrance animations to weather content items */
.forecast-card {
  opacity: 0;
  animation: simpleFadeIn 0.6s forwards;
}

.forecast-card:nth-child(1) {
  animation-delay: 100ms;
}
.forecast-card:nth-child(2) {
  animation-delay: 150ms;
}
.forecast-card:nth-child(3) {
  animation-delay: 200ms;
}
.forecast-card:nth-child(4) {
  animation-delay: 250ms;
}
.forecast-card:nth-child(5) {
  animation-delay: 300ms;
}

@keyframes simpleFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes simpleFadeInMainCard {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.9;
  }
}

/* Improved transition styles for skeleton elements */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Weather card entrance animations - Simple fade in only */
.weather-main-card {
  animation: simpleFadeInMainCard 0.5s ease-out forwards;
  opacity: 0;
}

.weather-card-header {
  animation: simpleFadeIn 0.6s ease-out forwards;
  opacity: 0;
}

.weather-location-info {
  animation: simpleFadeIn 0.7s ease-out forwards;
  opacity: 0;
}

.weather-city {
  animation: simpleFadeIn 0.6s ease-out 100ms forwards;
  opacity: 0;
}

.weather-date {
  animation: simpleFadeIn 0.6s ease-out 150ms forwards;
  opacity: 0;
}

.weather-time {
  animation: simpleFadeIn 0.6s ease-out 200ms forwards;
  opacity: 0;
}

.weather-current-display {
  animation: simpleFadeIn 0.7s ease-out forwards;
  opacity: 0;
}

.weather-temp {
  animation: simpleFadeIn 0.8s ease-out 250ms forwards;
  opacity: 0;
}

.weather-desc {
  animation: simpleFadeIn 0.8s ease-out 300ms forwards;
  opacity: 0;
}

.weather-stat-item {
  animation: simpleFadeIn 0.6s ease-out forwards;
  opacity: 0;
}

.weather-stat-0 {
  animation-delay: 200ms;
}

.weather-stat-1 {
  animation-delay: 250ms;
}

.weather-stat-2 {
  animation-delay: 300ms;
}

.weather-stat-3 {
  animation-delay: 350ms;
}
</style>
