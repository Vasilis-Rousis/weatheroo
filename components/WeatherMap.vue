<!-- components/WeatherMap.vue -->
<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">Weather Map</h2>
    <Card class="border-none shadow-md overflow-hidden">
      <CardHeader class="pb-2">
        <div
          class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
        >
          <CardTitle class="text-lg">Interactive Weather Layers</CardTitle>
          <div class="flex flex-wrap gap-2">
            <!-- Layer Selection Buttons -->
            <Button
              v-for="layer in availableLayers"
              :key="layer.key"
              :variant="activeLayer === layer.key ? 'default' : 'outline'"
              size="sm"
              class="text-xs"
              @click="setActiveLayer(layer.key)"
            >
              <component :is="layer.icon" class="h-3 w-3 mr-1" />
              {{ layer.name }}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent class="p-0">
        <div class="relative">
          <!-- Map Container -->
          <div
            ref="mapContainer"
            class="w-full h-64 md:h-80 bg-gray-100 dark:bg-gray-800"
          />

          <!-- Loading Overlay -->
          <div
            v-if="isLoading"
            class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center backdrop-blur-sm"
          >
            <div class="flex items-center gap-2">
              <div
                class="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"
              />
              <span class="text-sm">Loading weather map...</span>
            </div>
          </div>

          <!-- Error State -->
          <div
            v-if="hasError"
            class="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center backdrop-blur-sm"
          >
            <div class="text-center p-4">
              <div class="text-red-500 mb-2">
                <AlertTriangleIcon class="h-8 w-8 mx-auto" />
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Unable to load weather map
              </p>
              <Button size="sm" class="mt-2" @click="retryMap">
                Try Again
              </Button>
            </div>
          </div>

          <!-- Legend -->
          <div
            v-if="showLegend && currentLayerInfo && !isLoading && !hasError"
            class="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 text-xs shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div class="font-semibold mb-2 text-gray-800 dark:text-gray-200">
              {{ currentLayerInfo.name }}
            </div>
            <div class="flex items-center gap-1 mb-2">
              <div
                v-for="(color, index) in currentLayerInfo.legend"
                :key="index"
                class="w-4 h-3 border border-gray-300 dark:border-gray-600"
                :style="{ backgroundColor: color }"
              />
            </div>
            <div class="text-gray-600 dark:text-gray-400">
              {{ currentLayerInfo.description }}
            </div>
          </div>

          <!-- Controls -->
          <div class="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              variant="outline"
              size="icon"
              class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
              @click="toggleLegend"
            >
              <InfoIcon class="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
              @click="centerOnLocation"
            >
              <LocateIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CloudRainIcon,
  CloudIcon,
  ThermometerIcon,
  WindIcon,
  GaugeIcon,
  AlertTriangleIcon,
  InfoIcon,
  LocateIcon,
} from "lucide-vue-next";

const props = defineProps({
  latitude: {
    type: Number,
    default: 51.5074, // Default to London
  },
  longitude: {
    type: Number,
    default: -0.1278,
  },
  zoom: {
    type: Number,
    default: 8,
  },
  cityName: {
    type: String,
    default: "",
  },
});

// Reactive references
const mapContainer = ref(null);
const isLoading = ref(true);
const hasError = ref(false);
const showLegend = ref(true);
const activeLayer = ref("precipitation");
const map = ref(null);
const weatherLayer = ref(null);
const marker = ref(null);

// Get runtime config for API key
const config = useRuntimeConfig();

// Available weather layers from OpenWeatherMap
const availableLayers = [
  {
    key: "precipitation",
    name: "Rain",
    icon: CloudRainIcon,
    owmLayer: "precipitation_new",
    legend: [
      "rgba(225, 200, 100, 0)",
      "rgba(200, 150, 150, 0.5)",
      "rgba(150, 150, 170, 0.7)",
      "rgba(120, 120, 190, 0.8)",
      "rgba(110, 110, 205, 0.9)",
    ],
    description: "Precipitation intensity (mm/h)",
  },
  {
    key: "clouds",
    name: "Clouds",
    icon: CloudIcon,
    owmLayer: "clouds_new",
    legend: [
      "rgba(255, 255, 255, 0.0)",
      "rgba(253, 253, 255, 0.1)",
      "rgba(220, 220, 255, 0.2)",
      "rgba(180, 180, 255, 0.5)",
      "rgba(150, 150, 255, 0.8)",
    ],
    description: "Cloud coverage (%)",
  },
  {
    key: "temperature",
    name: "Temp",
    icon: ThermometerIcon,
    owmLayer: "temp_new",
    legend: [
      "#000080",
      "#0000FF",
      "#00FFFF",
      "#00FF00",
      "#FFFF00",
      "#FF8C00",
      "#FF0000",
    ],
    description: "Temperature (°C)",
  },
  {
    key: "wind",
    name: "Wind",
    icon: WindIcon,
    owmLayer: "wind_new",
    legend: [
      "rgba(255, 255, 255, 0)",
      "rgba(238, 206, 206, 0.4)",
      "rgba(179, 100, 188, 0.7)",
      "rgba(63, 33, 59, 0.8)",
      "rgba(116, 76, 172, 0.9)",
    ],
    description: "Wind speed (m/s)",
  },
  {
    key: "pressure",
    name: "Pressure",
    icon: GaugeIcon,
    owmLayer: "pressure_new",
    legend: ["#000080", "#0000FF", "#00FF00", "#FFFF00", "#FF0000"],
    description: "Atmospheric pressure (hPa)",
  },
];

// Computed property for current layer info
const currentLayerInfo = computed(() => {
  return availableLayers.find((layer) => layer.key === activeLayer.value);
});

// Initialize map
const initMap = async () => {
  try {
    hasError.value = false;
    isLoading.value = true;

    // Dynamic import to avoid SSR issues
    const L = await import("leaflet");

    // Import Leaflet CSS
    await import("leaflet/dist/leaflet.css");

    // Fix for default markers in webpack
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    // Create map
    map.value = L.map(mapContainer.value, {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true,
      attributionControl: true,
    }).setView([props.latitude, props.longitude], props.zoom);

    // Add base tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map.value);

    // Add marker for current location
    await updateMarker();

    // Add initial weather layer
    await setActiveLayer(activeLayer.value);

    isLoading.value = false;
  } catch (error) {
    console.error("Error initializing map:", error);
    hasError.value = true;
    isLoading.value = false;
  }
};

// Update marker position
const updateMarker = async () => {
  try {
    if (!map.value) return;

    const L = await import("leaflet");

    // Remove existing marker
    if (marker.value) {
      map.value.removeLayer(marker.value);
    }

    // Create custom marker with city name
    const customIcon = L.divIcon({
      html: `
          <div class="flex flex-col items-center pointer-events-none">
            <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
            ${
              props.cityName
                ? `<div class="text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded mt-1 shadow-sm whitespace-nowrap">${props.cityName}</div>`
                : ""
            }
          </div>
        `,
      className: "custom-marker",
      iconSize: [100, 50],
      iconAnchor: [50, 25],
    });

    marker.value = L.marker([props.latitude, props.longitude], {
      icon: customIcon,
    }).addTo(map.value);

    // Center map on new coordinates
    map.value.setView([props.latitude, props.longitude], props.zoom);
  } catch (error) {
    console.error("Error updating marker:", error);
  }
};

// Set active weather layer
const setActiveLayer = async (layerKey) => {
  try {
    if (!map.value) return;

    activeLayer.value = layerKey;
    const layerInfo = availableLayers.find((layer) => layer.key === layerKey);

    if (!layerInfo) return;

    // Remove existing weather layer
    if (weatherLayer.value) {
      map.value.removeLayer(weatherLayer.value);
    }

    // Add new weather layer from OpenWeatherMap
    const L = await import("leaflet");

    // Get API key from runtime config
    const apiKey = config.public.openWeatherApiKey;

    if (!apiKey) {
      console.warn("OpenWeatherMap API key not found");
      return;
    }

    weatherLayer.value = L.tileLayer(
      `https://tile.openweathermap.org/map/${layerInfo.owmLayer}/{z}/{x}/{y}.png?appid=${apiKey}`,
      {
        attribution:
          '© <a href="https://openweathermap.org/">OpenWeatherMap</a>',
        opacity: 0.6,
        maxZoom: 18,
      }
    ).addTo(map.value);
  } catch (error) {
    console.error("Error setting weather layer:", error);
  }
};

// Toggle legend visibility
const toggleLegend = () => {
  showLegend.value = !showLegend.value;
};

// Center map on current location
const centerOnLocation = () => {
  if (map.value) {
    map.value.setView([props.latitude, props.longitude], props.zoom);
  }
};

// Retry map initialization
const retryMap = () => {
  hasError.value = false;
  initMap();
};

// Watch for coordinate changes
watch([() => props.latitude, () => props.longitude], () => {
  if (map.value && !isLoading.value) {
    updateMarker();
  }
});

// Watch for city name changes
watch(
  () => props.cityName,
  () => {
    if (map.value && !isLoading.value) {
      updateMarker();
    }
  }
);

// Initialize on mount
onMounted(async () => {
  await nextTick();
  if (mapContainer.value) {
    initMap();
  }
});

// Cleanup on unmount
onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});

// Handle window resize
const handleResize = () => {
  if (map.value) {
    setTimeout(() => {
      map.value.invalidateSize();
    }, 100);
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style>
/* Custom marker styles */
.custom-marker {
  background: transparent !important;
  border: none !important;
}

/* Leaflet controls styling for dark mode */
.leaflet-control-zoom a {
  @apply dark:bg-gray-800 dark:text-white dark:border-gray-600;
}

.leaflet-control-zoom a:hover {
  @apply dark:bg-gray-700;
}

.leaflet-control-attribution {
  @apply dark:bg-gray-800/90 dark:text-gray-300;
}

/* Ensure map container has proper styling */
.leaflet-container {
  @apply rounded-b-lg;
}

/* Custom popup styling */
.leaflet-popup-content-wrapper {
  @apply dark:bg-gray-800 dark:text-gray-200;
}

.leaflet-popup-tip {
  @apply dark:border-t-gray-800;
}
</style>
