<!-- pages/index.vue -->
<template>
  <div
    class="min-h-screen bg-background text-foreground relative overflow-hidden"
  >
    <!-- Atmospheric background -->
    <div class="fixed inset-0 pointer-events-none bg-mesh" />
    <div class="fixed inset-0 pointer-events-none bg-noise" />

    <div
      v-if="!loading && currentWeather?.weather?.[0]?.icon"
      class="fixed inset-0 overflow-hidden pointer-events-none"
    >
      <WeatherAnimation :weather-code="currentWeather.weather[0].icon" />
    </div>

    <div class="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-8">
      <!-- Location Permission Dialog -->
      <LocationDialog
        v-model="showLocationDialog"
        @confirm="handleLocationRequest"
        @decline="handleLocationDecline"
      />

      <header class="mb-10">
        <div class="flex flex-row items-center justify-between gap-3">
          <!-- Logo and Title -->
          <div class="flex items-center flex-shrink-0 gap-2.5">
            <div class="h-10 w-10 sm:h-9 sm:w-9 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center header-element header-logo">
              <CloudIcon
                class="h-5 w-5 sm:h-5 sm:w-5 text-primary"
              />
            </div>
            <h1
              class="hidden sm:block text-xl font-display font-bold tracking-tight header-element header-title"
            >
              Weatheroo
            </h1>
          </div>

          <!-- Search bar -->
          <div
            class="flex-1 max-w-sm relative header-element header-search min-w-0"
          >
            <div class="flex gap-2 items-center">
              <div class="relative flex-1 min-w-0">
                <Input
                  v-model="searchQuery"
                  placeholder="Search city..."
                  class="pr-10 bg-secondary/50 dark:bg-secondary/30 border-border/60 focus:border-primary/40 rounded-xl h-10 text-sm"
                  @keyup.enter="searchCity"
                />
                <Button
                  variant="ghost"
                  class="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                  @click="searchCity"
                >
                  <SearchIcon class="h-4 w-4" />
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

          <!-- Theme toggle -->
          <Button
            variant="ghost"
            size="icon"
            class="header-element header-theme-toggle flex-shrink-0 w-9 h-9 rounded-xl hover:bg-secondary/80"
            @click="toggleTheme"
          >
            <ClientOnly>
              <SunIcon v-if="isDark" class="h-4 w-4" />
              <MoonIcon v-else class="h-4 w-4" />
              <template #fallback>
                <div class="h-4 w-4" />
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
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-5">
              <AlertTriangleIcon class="w-8 h-8 text-destructive" />
            </div>
            <p class="text-lg font-medium mb-1">Something went wrong</p>
            <p class="text-muted-foreground mb-5">{{ error }}</p>
            <Button class="rounded-xl" @click="searchCity">Try Again</Button>
          </div>

          <!-- Weather Data -->
          <div v-else>
            <!-- Current Weather Card -->
            <div
              class="mb-8 rounded-2xl overflow-hidden weather-main-card glass-card shadow-glass-lg"
            >
              <!-- Hero gradient header -->
              <div
                class="weather-hero-gradient p-7 sm:p-8 text-white relative weather-card-header"
              >
                <div
                  class="flex flex-col md:flex-row justify-between items-center gap-4"
                >
                  <div class="weather-location-info flex flex-col items-center md:items-start">
                    <h2
                      class="text-2xl sm:text-3xl font-display font-bold mb-1 flex items-center gap-2 weather-city"
                    >
                      {{ currentWeather.name
                      }}<span class="text-white/70 font-medium">,
                      {{ currentWeather.sys?.country }}</span>
                      <MapPinIcon
                        v-if="locationEnabled"
                        class="h-4 w-4 text-white/70"
                      />
                    </h2>
                    <p class="text-sm text-white/75 font-medium weather-date">
                      {{ formattedDate }}
                    </p>
                    <p
                      v-if="cityLocalTime"
                      class="text-sm text-white/60 weather-time mt-0.5"
                    >
                      {{ formattedLocalTime }} ({{ timezoneString }})
                    </p>
                  </div>

                  <div
                    class="flex items-center gap-4 mt-2 md:mt-0 weather-current-display"
                  >
                    <div class="text-center md:text-right">
                      <h3 class="text-5xl sm:text-6xl font-display font-bold tracking-tighter weather-temp">
                        {{ Math.round(currentWeather.main?.temp) }}<span class="text-3xl sm:text-4xl font-semibold text-white/80">°C</span>
                      </h3>
                      <p class="text-sm capitalize text-white/80 mt-1 weather-desc">
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

              <!-- Stats row -->
              <div class="p-5 sm:p-6 bg-card/80 backdrop-blur-sm">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div
                    class="stat-card weather-stat-item weather-stat-0"
                  >
                    <div class="stat-icon-wrap bg-amber-500/10 dark:bg-amber-400/10">
                      <ThermometerIcon
                        class="h-4 w-4 text-amber-500 dark:text-amber-400"
                      />
                    </div>
                    <p class="text-xs text-muted-foreground font-medium mt-2">
                      Feels Like
                    </p>
                    <p class="text-lg font-display font-bold mt-0.5">
                      {{ Math.round(currentWeather.main?.feels_like) }}°
                    </p>
                  </div>

                  <div
                    class="stat-card weather-stat-item weather-stat-1"
                  >
                    <div class="stat-icon-wrap bg-primary/10">
                      <DropletIcon class="h-4 w-4 text-primary" />
                    </div>
                    <p class="text-xs text-muted-foreground font-medium mt-2">
                      Humidity
                    </p>
                    <p class="text-lg font-display font-bold mt-0.5">
                      {{ currentWeather.main?.humidity }}<span class="text-sm text-muted-foreground font-medium">%</span>
                    </p>
                  </div>

                  <div
                    class="stat-card weather-stat-item weather-stat-2"
                  >
                    <div class="stat-icon-wrap bg-slate-500/10 dark:bg-slate-400/10">
                      <WindIcon class="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <p class="text-xs text-muted-foreground font-medium mt-2">
                      Wind Speed
                    </p>
                    <p class="text-lg font-display font-bold mt-0.5">
                      {{ Math.round(currentWeather.wind?.speed) }} <span class="text-sm text-muted-foreground font-medium">m/s</span>
                    </p>
                  </div>

                  <div
                    class="stat-card weather-stat-item weather-stat-3"
                  >
                    <div class="stat-icon-wrap bg-sky-500/10 dark:bg-sky-400/10">
                      <CloudIcon class="h-4 w-4 text-sky-500 dark:text-sky-400" />
                    </div>
                    <p class="text-xs text-muted-foreground font-medium mt-2">
                      Cloudiness
                    </p>
                    <p class="text-lg font-display font-bold mt-0.5">
                      {{ currentWeather.clouds?.all }}<span class="text-sm text-muted-foreground font-medium">%</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Daily Forecast -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div
                v-for="(forecastDay, index) in dailyForecasts"
                :key="index"
                class="forecast-card glass-card rounded-2xl p-4 text-center"
              >
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {{ formatDay(forecastDay.dt) }}
                </p>
                <div class="my-4">
                  <WeatherIcons
                    :weather-code="forecastDay.weather[0].icon"
                    size="medium"
                    class="mx-auto"
                  />
                </div>
                <p class="text-2xl font-display font-bold">
                  {{ Math.round(forecastDay.main.temp) }}<span class="text-base text-muted-foreground font-medium">°</span>
                </p>
                <p
                  class="text-xs capitalize text-muted-foreground mt-1 leading-tight"
                >
                  {{ forecastDay.weather[0].description }}
                </p>
                <div
                  class="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-1 text-[11px] text-muted-foreground"
                >
                  <div class="flex items-center justify-center gap-1">
                    <DropletIcon class="h-2.5 w-2.5" />
                    {{ forecastDay.main.humidity }}%
                  </div>
                  <div class="flex items-center justify-center gap-1">
                    <WindIcon class="h-2.5 w-2.5" />
                    {{ Math.round(forecastDay.wind.speed) }}m/s
                  </div>
                </div>
              </div>
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
                  <div class="glass-card rounded-2xl overflow-hidden h-64 md:h-80 flex items-center justify-center">
                    <div class="flex items-center gap-2 text-muted-foreground">
                      <div
                        class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                      />
                      <span class="text-sm">Loading weather map...</span>
                    </div>
                  </div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>

        <!-- Loading State -->
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
        class="mt-16 text-center text-xs text-muted-foreground/60 py-6 border-t border-border/30"
      >
        <p>Built with Nuxt 3, Tailwind CSS & shadcn</p>
        <p class="mt-1">Weather data by OpenWeatherMap</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { storeToRefs } from 'pinia';
import { useWeatherStore } from '~/stores/weather';
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
import { useUserPreferences } from "~/composables/useUserPreferences";
const WeatherMap = defineAsyncComponent(() => import('~/components/WeatherMap.vue'));

const searchQuery = ref("");
const showLocationDialog = ref(false);

const weatherStore = useWeatherStore();
const { currentWeather, forecast, loading, loadingFinished, error } = storeToRefs(weatherStore);

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
  await weatherStore.fetchWeatherByCity(searchQuery.value);
  if (!error.value) {
    locationEnabled.value = false;
    denyLocationPermission();
    updateLastCity(searchQuery.value);
  }
};

// Handle location request
const handleLocationRequest = async () => {
  try {
    enableLocationPermission();
    locationEnabled.value = true;
    const position = await requestLocation();
    if (position) {
      await weatherStore.fetchWeatherByCoords(position.latitude, position.longitude);
      if (!error.value) {
        searchQuery.value = currentWeather.value.name;
        updateLastCity(currentWeather.value.name);
      }
    } else {
      locationEnabled.value = false;
      disableLocationPermission();
      denyLocationPermission();
    }
  } catch (err) {
    console.error("Error getting location:", err);
    locationEnabled.value = false;
    disableLocationPermission();
    denyLocationPermission();
  }
};

// Handle disabling location
const handleLocationDisable = () => {
  clearCoordinates();
  disableLocationPermission();
  denyLocationPermission();
  if (lastCity.value) {
    searchQuery.value = lastCity.value;
    searchCity();
  } else {
    searchQuery.value = "London";
    searchCity();
  }
};

// Handle when the user declines location permission
const handleLocationDecline = () => {
  if (lastCity.value) {
    searchQuery.value = lastCity.value;
    searchCity();
  }
};

// Watch for changes in the coordinates to update weather
watch(coordinates, async (newCoords) => {
  if (newCoords && locationPermissionEnabled.value) {
    await weatherStore.fetchWeatherByCoords(newCoords.latitude, newCoords.longitude);
    if (!error.value) {
      searchQuery.value = currentWeather.value.name;
      updateLastCity(currentWeather.value.name);
    }
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
  if (locationPermissionDenied.value) {
    locationEnabled.value = false;
    if (lastCity.value) {
      searchQuery.value = lastCity.value;
      await weatherStore.fetchWeatherByCity(lastCity.value);
      return;
    }
  } else if (locationPermissionEnabled.value && "geolocation" in navigator) {
    try {
      locationEnabled.value = true;
      const position = await requestLocation();
      if (position) {
        await weatherStore.fetchWeatherByCoords(position.latitude, position.longitude);
        if (!error.value) {
          searchQuery.value = currentWeather.value.name;
          updateLastCity(currentWeather.value.name);
        }
        return;
      }
    } catch (err) {
      console.error("Error using saved location permission:", err);
    }
  }

  if (lastCity.value) {
    locationEnabled.value = false;
    searchQuery.value = lastCity.value;
    await weatherStore.fetchWeatherByCity(lastCity.value);
    return;
  }

  if (
    "geolocation" in navigator &&
    !locationPermissionDenied.value &&
    !locationPermissionEnabled.value
  ) {
    if (!locationPromptShown.value) {
      setTimeout(() => {
        showLocationDialog.value = true;
      }, 1500);
    }
  }

  locationEnabled.value = false;
  await weatherStore.fetchWeatherByCity("London");
  if (!error.value) {
    searchQuery.value = "London";
    updateLastCity("London");
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
/* ========== Background atmosphere ========== */
.bg-mesh {
  background:
    radial-gradient(ellipse 80% 50% at 20% 40%, hsl(217 72% 50% / 0.06), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, hsl(213 80% 58% / 0.05), transparent),
    radial-gradient(ellipse 50% 60% at 50% 80%, hsl(36 90% 55% / 0.03), transparent);
}

.dark .bg-mesh {
  background:
    radial-gradient(ellipse 80% 50% at 20% 40%, hsl(217 72% 50% / 0.08), transparent),
    radial-gradient(ellipse 60% 40% at 80% 20%, hsl(213 80% 58% / 0.06), transparent),
    radial-gradient(ellipse 50% 60% at 50% 80%, hsl(36 90% 55% / 0.03), transparent);
}

.bg-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

/* ========== Glass surfaces ========== */
.glass-card {
  background: hsl(var(--glass-bg));
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  border: 1px solid hsl(var(--glass-border));
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.dark .glass-card {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

/* ========== Hero gradient ========== */
.weather-hero-gradient {
  background: linear-gradient(135deg, hsl(217 72% 46%), hsl(213 80% 52%), hsl(200 70% 48%));
}

.dark .weather-hero-gradient {
  background: linear-gradient(135deg, hsl(217 55% 28%), hsl(213 60% 32%), hsl(200 50% 28%));
}

/* ========== Stat cards ========== */
.stat-card {
  text-align: center;
  padding: 0.875rem;
  border-radius: 1rem;
  background: hsl(var(--secondary));
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.dark .stat-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.stat-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.625rem;
}

/* ========== Weather icon float ========== */
.weather-icon {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* ========== Fade-in keyframe ========== */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ========== Header entrance ========== */
.header-element {
  opacity: 0;
  animation: fadeInHeader 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.header-logo { animation-delay: 0ms; }
.header-title { animation-delay: 80ms; }
.header-search { animation-delay: 160ms; }
.location-button { animation-delay: 200ms; }
.header-theme-toggle { animation-delay: 240ms; }

@keyframes fadeInHeader {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========== Content transitions ========== */
.fade-in-content {
  position: relative;
  z-index: 10;
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-out-skeleton {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

main {
  position: relative;
  min-height: 800px;
}

/* ========== Forecast card cascade ========== */
.forecast-card {
  opacity: 0;
  animation: cardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
}

.forecast-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.dark .forecast-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.forecast-card:nth-child(1) { animation-delay: 80ms; }
.forecast-card:nth-child(2) { animation-delay: 130ms; }
.forecast-card:nth-child(3) { animation-delay: 180ms; }
.forecast-card:nth-child(4) { animation-delay: 230ms; }
.forecast-card:nth-child(5) { animation-delay: 280ms; }

@keyframes cardReveal {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========== Weather card entrance ========== */
.weather-main-card {
  animation: cardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

.weather-card-header {
  animation: simpleFadeIn 0.5s ease-out forwards;
  opacity: 0;
}

.weather-location-info {
  animation: simpleFadeIn 0.5s ease-out 50ms forwards;
  opacity: 0;
}

.weather-city {
  animation: simpleFadeIn 0.5s ease-out 80ms forwards;
  opacity: 0;
}

.weather-date {
  animation: simpleFadeIn 0.5s ease-out 120ms forwards;
  opacity: 0;
}

.weather-time {
  animation: simpleFadeIn 0.5s ease-out 160ms forwards;
  opacity: 0;
}

.weather-current-display {
  animation: simpleFadeIn 0.6s ease-out 60ms forwards;
  opacity: 0;
}

.weather-temp {
  animation: simpleFadeIn 0.6s ease-out 200ms forwards;
  opacity: 0;
}

.weather-desc {
  animation: simpleFadeIn 0.6s ease-out 250ms forwards;
  opacity: 0;
}

.weather-stat-item {
  animation: simpleFadeIn 0.5s ease-out forwards;
  opacity: 0;
}

.weather-stat-0 { animation-delay: 180ms; }
.weather-stat-1 { animation-delay: 220ms; }
.weather-stat-2 { animation-delay: 260ms; }
.weather-stat-3 { animation-delay: 300ms; }

@keyframes simpleFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ========== Transition helpers ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
