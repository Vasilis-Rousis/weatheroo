<!-- pages/admin.vue -->
<template>
  <div
    class="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 p-6"
  >
    <div class="container mx-auto max-w-4xl">
      <header class="mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <ActivityIcon class="h-8 w-8 mr-2 text-blue-500" />
            <h1 class="text-3xl font-bold">Weather API Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" @click="refreshData">
            <RefreshCwIcon
              class="h-4 w-4 mr-2"
              :class="{ 'animate-spin': loading }"
            />
            Refresh
          </Button>
        </div>
      </header>

      <div v-if="loading" class="flex justify-center items-center my-12">
        <div
          class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"
        />
      </div>

      <div
        v-else-if="error"
        class="p-6 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-800 dark:text-red-200"
      >
        <AlertTriangleIcon class="h-6 w-6 mb-2" />
        <p>{{ error }}</p>
      </div>

      <div v-else class="grid gap-8">
        <!-- Current Period Usage -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <ClockIcon class="h-5 w-5 mr-2 text-blue-500" />
              Current Minute Usage
            </CardTitle>
            <CardDescription>
              Resets at {{ formatTime(usageData.currentPeriod.resetTime) }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex justify-between text-sm">
                <span
                  >{{ usageData.currentPeriod.requestCount }}/{{
                    usageData.currentPeriod.maxRequests
                  }}
                  requests</span
                >
                <span>{{ usageData.currentPeriod.remaining }} remaining</span>
              </div>
              <div
                class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"
              >
                <div
                  class="bg-blue-600 h-2.5 rounded-full"
                  :class="{
                    'bg-yellow-500': usageData.currentPeriod.percentUsed > 70,
                    'bg-red-500': usageData.currentPeriod.percentUsed > 90,
                  }"
                  :style="{ width: `${usageData.currentPeriod.percentUsed}%` }"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Daily Usage -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <CalendarIcon class="h-5 w-5 mr-2 text-blue-500" />
              Daily Usage
            </CardTitle>
            <CardDescription>
              Resets at midnight ({{
                formatTime(usageData.daily.resetTime, true)
              }})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex justify-between text-sm">
                <span
                  >{{ usageData.daily.count }}/{{
                    usageData.daily.limit
                  }}
                  requests</span
                >
                <span>{{ usageData.daily.remaining }} remaining</span>
              </div>
              <div
                class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"
              >
                <div
                  class="bg-blue-600 h-2.5 rounded-full"
                  :class="{
                    'bg-yellow-500': usageData.daily.percentUsed > 70,
                    'bg-red-500': usageData.daily.percentUsed > 90,
                  }"
                  :style="{ width: `${usageData.daily.percentUsed}%` }"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Cache Information -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center">
              <DatabaseIcon class="h-5 w-5 mr-2 text-blue-500" />
              Cache Status
            </CardTitle>
            <CardDescription>
              {{ usageData.cacheStats.size }} locations in cache
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="usageData.cacheStats.keys.length" class="mt-2">
              <h3 class="text-sm font-medium mb-2">Cached Locations:</h3>
              <div
                class="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-hidden"
              >
                <div
                  v-for="key in usageData.cacheStats.keys"
                  :key="key"
                  class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs truncate"
                >
                  {{ key }}
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 text-sm">
              No locations in cache.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  ActivityIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  ClockIcon,
  CalendarIcon,
  DatabaseIcon,
} from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const loading = ref(true);
const error = ref(null);
const usageData = ref({
  currentPeriod: {
    requestCount: 0,
    maxRequests: 50,
    resetTime: "",
    remaining: 50,
    percentUsed: 0,
  },
  daily: {
    count: 0,
    limit: 950,
    resetTime: "",
    remaining: 950,
    percentUsed: 0,
  },
  cacheStats: {
    size: 0,
    keys: [],
  },
});

// Format time for display
const formatTime = (isoString, dateOnly = false) => {
  if (!isoString) return "Unknown";

  try {
    const date = new Date(isoString);

    if (dateOnly) {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return isoString;
  }
};

// Fetch the usage data
const fetchUsageData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch("/api/admin/usage");

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    usageData.value = await response.json();
  } catch (e) {
    console.error("Error fetching usage data:", e);
    error.value = e.message || "Failed to load usage data";
  } finally {
    loading.value = false;
  }
};

// Refresh the data
const refreshData = () => {
  fetchUsageData();
};

// Auto-refresh every 15 seconds
let refreshInterval;

onMounted(() => {
  fetchUsageData();

  // Set up auto-refresh
  refreshInterval = setInterval(() => {
    fetchUsageData();
  }, 15000);
});

// Clean up the interval
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
