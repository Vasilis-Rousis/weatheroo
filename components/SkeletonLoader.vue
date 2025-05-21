<!-- components/SkeletonLoader.vue -->
<template>
  <div>
    <!-- Current Weather Card Skeleton -->
    <Card class="mb-8 overflow-hidden border-none shadow-lg">
      <div
        class="bg-gradient-to-r from-blue-400/70 to-blue-600/70 dark:from-blue-600/50 dark:to-blue-800/50 p-6 relative"
      >
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div>
            <!-- Location Name Skeleton -->
            <div
              class="h-8 w-64 bg-white/30 dark:bg-white/20 rounded-md mb-2 animate-pulse"
            />
            <!-- Date Skeleton -->
            <div
              class="h-5 w-48 bg-white/30 dark:bg-white/20 rounded-md mb-2 animate-pulse"
            />
            <!-- Time Skeleton -->
            <div
              class="h-4 w-40 bg-white/30 dark:bg-white/20 rounded-md animate-pulse"
            />
          </div>

          <div class="flex items-center mt-4 md:mt-0">
            <!-- Weather Icon Skeleton -->
            <div
              class="h-20 w-20 bg-white/30 dark:bg-white/20 rounded-full animate-pulse mr-4"
            />
            <div class="text-center">
              <!-- Temperature Skeleton -->
              <div
                class="h-12 w-24 bg-white/30 dark:bg-white/20 rounded-md mb-2 animate-pulse"
              />
              <!-- Weather Description Skeleton -->
              <div
                class="h-6 w-32 bg-white/30 dark:bg-white/20 rounded-md animate-pulse"
              />
            </div>
          </div>
        </div>
      </div>

      <CardContent class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Weather Stats Skeletons -->
          <div
            v-for="i in 4"
            :key="i"
            class="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <div
              class="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2 animate-pulse"
            />
            <div
              class="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto mb-2 animate-pulse"
            />
            <div
              class="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto animate-pulse"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 5-Day Forecast Skeletons -->
    <div
      class="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 animate-pulse"
    />
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card v-for="i in 5" :key="`forecast-${i}`" class="border-none shadow-md">
        <CardHeader class="pb-2">
          <div
            class="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
          />
        </CardHeader>
        <CardContent class="text-center py-2">
          <div
            class="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto my-8 animate-pulse"
          />
          <div
            class="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md mb-1 mx-auto animate-pulse"
          />
          <div
            class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto animate-pulse"
          />
        </CardContent>
        <CardFooter class="pt-0 pb-4">
          <div class="w-full grid grid-cols-2 gap-2">
            <div
              class="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"
            />
            <div
              class="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded-md justify-self-end animate-pulse"
            />
          </div>
        </CardFooter>
      </Card>
    </div>

    <!-- Weather Map Skeleton -->
    <div class="mt-8">
      <div
        class="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 animate-pulse"
      />
      <Card class="border-none shadow-md overflow-hidden h-64">
        <div
          class="h-full w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        >
          <div
            class="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
          />
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup>
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
</script>

<style scoped>
.animate-pulse {
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    to right,
    rgba(var(--background), 0.1),
    rgba(var(--background), 0.2),
    rgba(var(--background), 0.1)
  ) !important;
}

.animate-pulse::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Add transition classes for smooth content appearance */
:deep(.fade-enter-active),
:deep(.fade-leave-active) {
  transition: opacity 0.5s ease;
}

:deep(.fade-enter-from),
:deep(.fade-leave-to) {
  opacity: 0;
}
</style>
