<!-- components/WeatherMap.vue -->
<template>
  <div>
    <div class="map-glass-card rounded-2xl overflow-hidden">
      <div class="px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
        <div
          class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
        >
          <h3 class="text-sm font-display font-bold">Weather Layers</h3>
          <div class="flex flex-wrap gap-1.5">
            <Button
              v-for="layer in availableLayers"
              :key="layer.key"
              :variant="activeLayer === layer.key ? 'default' : 'outline'"
              size="sm"
              class="text-xs h-7 px-2.5 rounded-lg"
              :class="activeLayer === layer.key ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 border-border/50 hover:bg-secondary'"
              @click="setActiveLayer(layer.key)"
            >
              <component :is="layer.icon" class="h-3 w-3 mr-1" />
              {{ layer.name }}
            </Button>
          </div>
        </div>
      </div>
      <div class="p-0">
        <div class="relative">
          <div
            ref="mapContainer"
            class="w-full map-container bg-secondary/50 relative z-0"
          />

          <!-- Loading Overlay -->
          <div
            v-if="isLoading"
            class="absolute inset-0 bg-card/80 flex items-center justify-center backdrop-blur-sm z-20"
          >
            <div class="flex items-center gap-2 text-muted-foreground">
              <div
                class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
              />
              <span class="text-sm">Loading map...</span>
            </div>
          </div>

          <!-- Error State -->
          <div
            v-if="hasError"
            class="absolute inset-0 bg-card/90 flex items-center justify-center backdrop-blur-sm z-20"
          >
            <div class="text-center p-4">
              <div class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-destructive/10 mb-3">
                <AlertTriangleIcon class="h-5 w-5 text-destructive" />
              </div>
              <p class="text-sm text-muted-foreground">
                Unable to load weather map
              </p>
              <Button size="sm" class="mt-3 rounded-lg text-xs" @click="retryMap">
                Try Again
              </Button>
            </div>
          </div>

          <!-- Legend -->
          <div
            v-if="showLegend && currentLayerInfo && !isLoading && !hasError"
            class="absolute bottom-4 left-4 bg-card/95 backdrop-blur-md rounded-xl p-3 text-xs shadow-glass border border-border/50 z-30 legend-container"
          >
            <div class="font-semibold mb-2 text-sm">
              {{ currentLayerInfo.name }}
            </div>
            <div class="flex items-center gap-0.5 mb-2">
              <div
                v-for="(color, index) in currentLayerInfo.legend"
                :key="index"
                class="w-5 h-3 first:rounded-l last:rounded-r"
                :style="{ backgroundColor: color }"
              />
            </div>
            <div class="text-muted-foreground">
              {{ currentLayerInfo.description }}
            </div>
          </div>

          <!-- Controls -->
          <div
            class="absolute top-4 right-4 flex flex-col gap-1.5 z-30 controls-container"
          >
            <Button
              variant="outline"
              size="icon"
              class="h-8 w-8 bg-card/95 backdrop-blur-md shadow-glass border-border/50 rounded-lg control-button"
              @click="toggleLegend"
            >
              <InfoIcon class="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="h-8 w-8 bg-card/95 backdrop-blur-md shadow-glass border-border/50 rounded-lg control-button"
              @click="centerOnLocation"
            >
              <LocateIcon class="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from "vue";
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
const showLegend = ref(false);
const activeLayer = ref("precipitation");
const map = ref(null);
const weatherLayer = ref(null);
const marker = ref(null);
const leafletLoaded = ref(false);

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

// Load Leaflet library
const loadLeaflet = () => {
  return new Promise((resolve, reject) => {
    if (leafletLoaded.value || window.L) {
      resolve(window.L);
      return;
    }

    // Create script tag for Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";

    // Create link tag for Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";

    script.onload = () => {
      leafletLoaded.value = true;
      resolve(window.L);
    };

    script.onerror = () => {
      reject(new Error("Failed to load Leaflet"));
    };

    // Add to document head
    document.head.appendChild(link);
    document.head.appendChild(script);
  });
};

// Initialize map
const initMap = async () => {
  try {
    hasError.value = false;
    isLoading.value = true;

    const L = await loadLeaflet();

    if (!mapContainer.value) {
      throw new Error("Map container not found");
    }

    // Create map with performance optimizations
    map.value = L.map(mapContainer.value, {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true,
      attributionControl: true,
      zoomControlOptions: {
        position: "topleft", // Move zoom controls away from our custom controls
      },
      // Performance optimizations
      preferCanvas: true, // Use canvas for better performance
      renderer: L.canvas(), // Force canvas renderer
      wheelDebounceTime: 60, // Reduce wheel event frequency
      wheelPxPerZoomLevel: 120, // Smoother zoom steps
    }).setView([props.latitude, props.longitude], props.zoom);

    // Add base tile layer with performance optimizations
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      // Performance optimizations
      maxNativeZoom: 18,
      tileSize: 256,
      zoomOffset: 0,
      keepBuffer: 2, // Keep fewer tiles in memory
      updateWhenIdle: true, // Only update tiles when map is idle
      updateWhenZooming: false, // Don't update during zoom animation
      reuseTiles: true, // Reuse tiles when possible
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

    const L = window.L;
    if (!L) {
      console.warn("Leaflet not available for marker update");
      return;
    }

    // Remove existing marker
    if (marker.value) {
      map.value.removeLayer(marker.value);
    }

    // Create custom marker using divIcon (more reliable than default markers)
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

    const L = window.L;
    if (!L) {
      console.warn("Leaflet not available for layer update");
      return;
    }

    activeLayer.value = layerKey;
    const layerInfo = availableLayers.find((layer) => layer.key === layerKey);

    if (!layerInfo) return;

    // Remove existing weather layer
    if (weatherLayer.value) {
      map.value.removeLayer(weatherLayer.value);
    }

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
        // Performance optimizations for weather layer
        maxNativeZoom: 16, // Weather tiles often don't go beyond zoom 16
        tileSize: 256,
        keepBuffer: 1, // Keep fewer weather tiles in memory
        updateWhenIdle: true, // Only update when map stops moving
        updateWhenZooming: false, // Don't update during zoom
        reuseTiles: true,
        crossOrigin: true,
        // Reduce tile loading priority for smoother base map
        className: "weather-tiles",
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
  // Add a small delay to ensure DOM is ready
  setTimeout(() => {
    if (mapContainer.value) {
      initMap();
    }
  }, 500);
});

// Cleanup on unmount
onUnmounted(() => {
  if (map.value) {
    try {
      map.value.remove();
    } catch (error) {
      console.warn("Error removing map:", error);
    }
  }
});

// Handle window resize with debouncing for better performance
const handleResize = (() => {
  let timeoutId = null;
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      if (map.value) {
        try {
          map.value.invalidateSize();
        } catch (error) {
          console.warn("Error invalidating map size:", error);
        }
      }
    }, 150); // Debounce resize events
  };
})();

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style>
/* Glass card for map */
.map-glass-card {
  background: hsl(var(--glass-bg));
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  border: 1px solid hsl(var(--glass-border));
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.dark .map-glass-card {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

/* Custom marker styles */
.custom-marker {
  background: transparent !important;
  border: none !important;
}

/* Map container responsive heights */
.map-container {
  height: 16rem;
}

@media (min-width: 640px) {
  .map-container {
    height: 20rem;
  }
}

@media (min-width: 768px) {
  .map-container {
    height: 24rem;
  }
}

@media (min-width: 1024px) {
  .map-container {
    height: 32rem;
  }
}

/* Leaflet styling */
.leaflet-container {
  @apply rounded-b-2xl;
  z-index: 1 !important;
  transform: translateZ(0);
  will-change: transform;
  image-rendering: optimizeSpeed;
  image-rendering: -webkit-optimize-contrast;
}

.weather-tiles {
  transform: translateZ(0);
  will-change: opacity;
}

.leaflet-container.leaflet-drag-target .absolute {
  backdrop-filter: blur(2px) !important;
}

.leaflet-control-zoom a {
  @apply dark:bg-card dark:text-foreground dark:border-border;
  transform: translateZ(0);
  border-radius: 0.5rem !important;
}

.leaflet-control-zoom a:hover {
  @apply dark:bg-secondary;
}

.leaflet-control-zoom {
  border-radius: 0.75rem !important;
  overflow: hidden;
  border: 1px solid hsl(var(--border)) !important;
}

.leaflet-control-attribution {
  @apply dark:bg-card/90 dark:text-muted-foreground;
  text-rendering: optimizeSpeed;
  font-size: 10px !important;
}

.leaflet-control-container {
  pointer-events: none;
}

.leaflet-control {
  pointer-events: auto;
  transform: translateZ(0);
}

.leaflet-popup-content-wrapper {
  @apply dark:bg-card dark:text-foreground;
  border-radius: 0.75rem !important;
}

.leaflet-popup-tip {
  @apply dark:border-t-card;
}

.absolute.z-30 {
  z-index: 1000 !important;
  transform: translateZ(0);
  will-change: transform;
}

.absolute.z-30 button {
  backdrop-filter: blur(8px) !important;
  transform: translateZ(0);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.absolute.z-30 button:hover {
  transform: translateZ(0) scale(1.04);
}

.leaflet-tile-container {
  transform: translateZ(0);
}

.leaflet-tile {
  image-rendering: auto;
  transform: translateZ(0);
}

@media (prefers-reduced-motion: reduce) {
  .leaflet-container { transition: none !important; }
  .control-button { transition: none !important; }
  .control-button:hover { transform: none !important; }
}

@media (max-width: 768px) {
  .leaflet-container { touch-action: pan-x pan-y; }
  .control-button { backdrop-filter: blur(2px) !important; }
  .legend-container { backdrop-filter: blur(2px) !important; }
}
</style>
