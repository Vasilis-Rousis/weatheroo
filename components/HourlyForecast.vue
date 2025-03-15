<!-- components/HourlyForecast.vue -->
<template>
  <Card class="border-none shadow-md overflow-hidden mb-8">
    <div
      class="p-6 bg-white dark:bg-gray-800 flex justify-between items-center"
    >
      <Button
        v-if="currentPage > 0"
        variant="outline"
        size="icon"
        class="h-8 w-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
        @click="prevPage"
      >
        <ChevronLeftIcon class="h-5 w-5" />
      </Button>
      <div v-else class="w-8" />

      <div class="text-center">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ currentPage === 0 ? "Next 24 hours" : "Hours 25-48" }}
        </span>
      </div>

      <Button
        v-if="currentPage < maxPages - 1"
        variant="outline"
        size="icon"
        class="h-8 w-8 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
        @click="nextPage"
      >
        <ChevronRightIcon class="h-5 w-5" />
      </Button>
      <div v-else class="w-8" />
    </div>

    <CardContent class="p-4">
      <div class="h-64 relative">
        <div
          v-if="loading"
          class="absolute inset-0 flex items-center justify-center"
        >
          <div
            class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
        <div
          v-else-if="hourlyData.length === 0"
          class="absolute inset-0 flex items-center justify-center text-gray-500"
        >
          No hourly forecast data available
        </div>
        <div v-else class="h-full w-full">
          <!-- Temperature Visualization -->
          <div class="relative h-full flex flex-col">
            <!-- Temperature range and grid lines -->
            <div class="absolute inset-0 flex flex-col justify-between">
              <!-- Y-axis labels and horizontal grid lines -->
              <div class="flex items-center h-6">
                <div class="w-10 text-xs text-gray-500 font-medium pl-1">
                  {{ Math.ceil(maxTemp) }}°C
                </div>
                <div
                  class="flex-1 border-b border-gray-200 dark:border-gray-700"
                />
              </div>

              <div class="flex items-center">
                <div class="w-10 text-xs text-gray-500 font-medium pl-1">
                  {{ Math.round((maxTemp + minTemp) / 2) }}°C
                </div>
                <div
                  class="flex-1 border-b border-gray-200 dark:border-gray-700"
                />
              </div>

              <div class="flex items-center h-6">
                <div class="w-10 text-xs text-gray-500 font-medium pl-1">
                  {{ Math.floor(minTemp) }}°C
                </div>
                <div
                  class="flex-1 border-b border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            <!-- Temperature data visualization -->
            <div class="absolute inset-0 pt-6 pb-6 pl-10">
              <!-- Temperature curve -->
              <svg class="w-full h-full overflow-visible">
                <!-- Temperature line -->
                <path
                  :d="temperaturePath"
                  fill="none"
                  stroke="rgb(59, 130, 246)"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />

                <!-- Temperature area fill -->
                <path
                  :d="temperatureAreaPath"
                  fill="rgba(59, 130, 246, 0.1)"
                  stroke="none"
                />

                <!-- Temperature dots -->
                <circle
                  v-for="(point, i) in temperaturePoints"
                  :key="`temp-point-${i}`"
                  :cx="point.x"
                  :cy="point.y"
                  r="3"
                  fill="rgb(59, 130, 246)"
                />
              </svg>

              <!-- Hourly indicators with icons -->
              <div class="absolute bottom-0 left-0 right-0 flex">
                <div
                  v-for="(item, index) in currentPageData"
                  :key="index"
                  class="hourly-item relative flex-1 group"
                  style="height: 50px"
                >
                  <!-- Hour label -->
                  <div
                    class="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 text-center"
                    style="
                      transform: translateX(-50%) rotate(-45deg);
                      transform-origin: bottom center;
                      min-width: 36px;
                      bottom: -2px;
                    "
                  >
                    {{ formatHour(item.time) }}
                  </div>

                  <!-- Weather icon -->
                  <div
                    class="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                  >
                    <img
                      :src="`https://openweathermap.org/img/wn/${item.icon}.png`"
                      :alt="item.description"
                      class="w-8 h-8"
                    />
                  </div>

                  <!-- Tooltip on hover -->
                  <div
                    class="absolute bottom-16 left-1/2 transform -translate-x-1/2 p-2 bg-white dark:bg-gray-800 rounded shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
                  >
                    <p class="font-bold">{{ formatDayHour(item.time) }}</p>
                    <p class="text-blue-500">{{ item.temp.toFixed(1) }}°C</p>
                    <p class="capitalize">{{ item.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const props = defineProps({
  forecast: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const currentPage = ref(0);
const hoursPerPage = 24;
const hourlyData = ref([]);

// Calculate maximum number of pages based on data length
const maxPages = computed(() => {
  return Math.ceil(hourlyData.value.length / hoursPerPage);
});

// Get current page of data for display
const currentPageData = computed(() => {
  const start = currentPage.value * hoursPerPage;
  const end = start + hoursPerPage;
  return hourlyData.value.slice(start, end);
});

// Calculate min/max temperature for scaling the bars
const maxTemp = computed(() => {
  if (!currentPageData.value.length) return 0;
  // Add a small buffer to the max temperature to ensure all points fit on graph
  return Math.max(...currentPageData.value.map((item) => item.temp)) + 3;
});

const minTemp = computed(() => {
  if (!currentPageData.value.length) return 0;
  // Add a small buffer to the min temperature to ensure all points fit on graph
  return Math.min(...currentPageData.value.map((item) => item.temp)) - 3;
});

// Calculate SVG points for temperature line
const temperaturePoints = computed(() => {
  if (!currentPageData.value.length) return [];

  const tempRange = maxTemp.value - minTemp.value || 1; // Avoid division by zero
  const width = 100 / (currentPageData.value.length - 1); // Width percentage between points

  return currentPageData.value.map((item, index) => {
    // Calculate position as percentage
    const x = index * width + "%";
    const y = (1 - (item.temp - minTemp.value) / tempRange) * 100 + "%";

    return { x, y, temp: item.temp };
  });
});

// Generate SVG path for temperature line
const temperaturePath = computed(() => {
  if (temperaturePoints.value.length < 2) return "";

  return temperaturePoints.value.reduce((path, point, index) => {
    return (
      path +
      (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`)
    );
  }, "");
});

// Generate SVG path for temperature area fill
const temperatureAreaPath = computed(() => {
  if (temperaturePoints.value.length < 2) return "";

  const points = temperaturePoints.value;
  let path = `M ${points[0].x} ${points[0].y}`;

  // Add all line points
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  // Add bottom points to close the path
  path += ` L ${points[points.length - 1].x} 100%`;
  path += ` L ${points[0].x} 100%`;
  path += " Z"; // Close the path

  return path;
});

// Format a unix timestamp to hours (e.g., "15:00")
const formatHour = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// Format a unix timestamp to day + hour (e.g., "Mon, 15:00")
const formatDayHour = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return (
    date.toLocaleDateString("en-US", { weekday: "short" }) +
    ", " +
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );
};

// Navigation functions
const nextPage = () => {
  if (currentPage.value < maxPages.value - 1) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
};

// Process forecast data into hourly points
const processHourlyData = () => {
  if (!props.forecast?.list || props.forecast.list.length === 0) {
    hourlyData.value = [];
    return;
  }

  // Extract hourly data from the forecast
  hourlyData.value = props.forecast.list.map((item) => ({
    time: item.dt,
    temp: item.main.temp,
    feels_like: item.main.feels_like,
    icon: item.weather[0].icon,
    description: item.weather[0].description,
  }));

  // Reset to first page when new data loads
  currentPage.value = 0;
};

// Watch for changes in forecast data
watch(() => props.forecast, processHourlyData, { deep: true });

// Initialize the component
onMounted(() => {
  processHourlyData();
});
</script>

<style scoped>
.hourly-item {
  transition: all 0.2s ease;
}
.hourly-item:hover {
  transform: translateY(-4px);
}
</style>