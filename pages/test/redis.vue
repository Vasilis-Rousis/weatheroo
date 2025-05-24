<!-- pages/test/redis.vue -->
<template>
  <div
    class="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6"
  >
    <div class="container mx-auto max-w-4xl">
      <header class="mb-8">
        <h1 class="text-3xl font-bold flex items-center">
          <DatabaseIcon class="h-8 w-8 mr-2 text-blue-500" />
          Redis Integration Test
        </h1>
      </header>

      <!-- Redis Health Check -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Redis Health Check</CardTitle>
        </CardHeader>
        <CardContent>
          <Button :disabled="loading" class="mb-4" @click="testRedisHealth">
            <RefreshCwIcon
              class="h-4 w-4 mr-2"
              :class="{ 'animate-spin': loading }"
            />
            Test Redis Connection
          </Button>

          <div
            v-if="healthResult"
            class="p-4 rounded-lg"
            :class="{
              'bg-green-100 dark:bg-green-900/20':
                healthResult.status === 'healthy',
              'bg-red-100 dark:bg-red-900/20':
                healthResult.status === 'unhealthy',
            }"
          >
            <pre class="text-sm overflow-x-auto">{{
              JSON.stringify(healthResult, null, 2)
            }}</pre>
          </div>
        </CardContent>
      </Card>

      <!-- Cache Test -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Cache Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Button :disabled="loading" @click="testCacheWrite">
              Write to Cache
            </Button>
            <Button :disabled="loading" @click="testCacheRead">
              Read from Cache
            </Button>
            <Button :disabled="loading" @click="testCacheStats">
              Cache Statistics
            </Button>
          </div>

          <div
            v-if="cacheResult"
            class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg"
          >
            <pre class="text-sm overflow-x-auto">{{
              JSON.stringify(cacheResult, null, 2)
            }}</pre>
          </div>
        </CardContent>
      </Card>

      <!-- Rate Limiting Test -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Rate Limiting Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Button :disabled="loading" @click="testRateLimit('check')">
              Check Limits
            </Button>
            <Button :disabled="loading" @click="testRateLimit('simulate')">
              Simulate Call
            </Button>
            <Button :disabled="loading" @click="testRateLimit('detailed')">
              Detailed Info
            </Button>
            <Button
              :disabled="loading"
              variant="destructive"
              @click="testRateLimit('stress')"
            >
              Stress Test
            </Button>
          </div>

          <div
            v-if="rateLimitResult"
            class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg"
          >
            <pre class="text-sm overflow-x-auto">{{
              JSON.stringify(rateLimitResult, null, 2)
            }}</pre>
          </div>
        </CardContent>
      </Card>

      <!-- Weather API Test -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Weather API Cache Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex gap-4 mb-4">
            <Input
              v-model="testCity"
              placeholder="Enter city name"
              class="flex-1"
            />
            <Button :disabled="loading" @click="testWeatherAPI">
              Test Weather API
            </Button>
          </div>

          <div
            v-if="weatherResult"
            class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg"
          >
            <div class="mb-2">
              <span class="font-semibold">Cached:</span>
              <span
                :class="
                  weatherResult.cached ? 'text-green-600' : 'text-red-600'
                "
              >
                {{ weatherResult.cached ? "Yes" : "No" }}
              </span>
            </div>
            <div v-if="weatherResult.cachedAt" class="mb-2">
              <span class="font-semibold">Cache Time:</span>
              {{ weatherResult.cachedAt }}
            </div>
            <div v-if="weatherResult.notice" class="mb-2 text-orange-600">
              <span class="font-semibold">Notice:</span>
              {{ weatherResult.notice }}
            </div>
            <pre class="text-xs overflow-x-auto">{{
              JSON.stringify(weatherResult, null, 2)
            }}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { DatabaseIcon, RefreshCwIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const loading = ref(false);
const healthResult = ref(null);
const cacheResult = ref(null);
const rateLimitResult = ref(null);
const weatherResult = ref(null);
const testCity = ref("London");

const testRedisHealth = async () => {
  loading.value = true;
  try {
    const response = await fetch("/api/health/redis");
    healthResult.value = await response.json();
  } catch (error) {
    healthResult.value = { error: error.message };
  } finally {
    loading.value = false;
  }
};

const testCacheWrite = async () => {
  loading.value = true;
  try {
    // Test writing to cache by making a weather API call
    const response = await fetch("/api/weather?city=TestCity");
    cacheResult.value = { operation: "write", result: await response.json() };
  } catch (error) {
    cacheResult.value = { operation: "write", error: error.message };
  } finally {
    loading.value = false;
  }
};

const testCacheRead = async () => {
  loading.value = true;
  try {
    // Test reading from cache by making the same call again
    const response = await fetch("/api/weather?city=TestCity");
    const result = await response.json();
    cacheResult.value = {
      operation: "read",
      result,
      wasCached: result.cached === true,
    };
  } catch (error) {
    cacheResult.value = { operation: "read", error: error.message };
  } finally {
    loading.value = false;
  }
};

const testCacheStats = async () => {
  loading.value = true;
  try {
    const response = await fetch("/api/admin/usage");
    const result = await response.json();
    cacheResult.value = { operation: "stats", result: result.cacheStats };
  } catch (error) {
    cacheResult.value = { operation: "stats", error: error.message };
  } finally {
    loading.value = false;
  }
};

const testRateLimit = async (action) => {
  loading.value = true;
  try {
    const url =
      action === "stress"
        ? `/api/test/rate-limit?action=${action}&count=20`
        : `/api/test/rate-limit?action=${action}`;
    const response = await fetch(url);
    rateLimitResult.value = await response.json();
  } catch (error) {
    rateLimitResult.value = { error: error.message };
  } finally {
    loading.value = false;
  }
};

const testWeatherAPI = async () => {
  loading.value = true;
  try {
    const response = await fetch(
      `/api/weather?city=${encodeURIComponent(testCity.value)}`
    );
    if (response.status === 429) {
      const errorData = await response.json();
      weatherResult.value = { error: `Rate limited: ${errorData.data?.error}` };
    } else {
      weatherResult.value = await response.json();
    }
  } catch (error) {
    weatherResult.value = { error: error.message };
  } finally {
    loading.value = false;
  }
};

// Auto-run health check on mount
onMounted(() => {
  testRedisHealth();
});
</script>
