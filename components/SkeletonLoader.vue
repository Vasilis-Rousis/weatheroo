<!-- components/SkeletonLoader.vue -->
<template>
  <div>
    <!-- Current Weather Card Skeleton -->
    <div class="mb-8 rounded-2xl overflow-hidden glass-card">
      <div class="weather-hero-gradient p-7 sm:p-8 relative">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div>
            <div class="h-8 w-56 bg-white/20 rounded-lg mb-2.5 skeleton-pulse" />
            <div class="h-4 w-40 bg-white/15 rounded-md mb-2 skeleton-pulse" />
            <div class="h-3.5 w-36 bg-white/10 rounded-md skeleton-pulse" />
          </div>
          <div class="flex items-center mt-4 md:mt-0 gap-4">
            <div class="text-center md:text-right">
              <div class="h-14 w-28 bg-white/20 rounded-lg mb-2 skeleton-pulse" />
              <div class="h-4 w-24 bg-white/15 rounded-md skeleton-pulse" />
            </div>
            <div class="h-20 w-20 bg-white/15 rounded-full skeleton-pulse" />
          </div>
        </div>
      </div>

      <div class="p-5 sm:p-6 bg-card/80">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            v-for="i in 4"
            :key="i"
            class="text-center p-3.5 rounded-2xl bg-secondary"
          >
            <div class="h-8 w-8 bg-muted rounded-[0.625rem] mx-auto mb-2 skeleton-pulse" />
            <div class="h-3 w-14 bg-muted rounded-md mx-auto mb-2 skeleton-pulse" />
            <div class="h-5 w-10 bg-muted rounded-md mx-auto skeleton-pulse" />
          </div>
        </div>
      </div>
    </div>

    <!-- 5-Day Forecast Skeletons -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <div
        v-for="i in 5"
        :key="`forecast-${i}`"
        class="glass-card rounded-2xl p-4 text-center"
      >
        <div class="h-3 w-16 bg-muted rounded-md mx-auto skeleton-pulse" />
        <div class="h-16 w-16 bg-muted rounded-full mx-auto my-4 skeleton-pulse" />
        <div class="h-7 w-14 bg-muted rounded-md mb-1 mx-auto skeleton-pulse" />
        <div class="h-3 w-24 bg-muted rounded-md mx-auto skeleton-pulse" />
        <div class="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-1">
          <div class="h-2.5 w-8 bg-muted rounded-sm mx-auto skeleton-pulse" />
          <div class="h-2.5 w-10 bg-muted rounded-sm mx-auto skeleton-pulse" />
        </div>
      </div>
    </div>

    <!-- Weather Map Skeleton -->
    <div class="mt-8">
      <div class="glass-card rounded-2xl overflow-hidden h-64 md:h-80">
        <div class="h-full w-full bg-secondary/50 flex items-center justify-center">
          <div class="h-10 w-10 rounded-full bg-muted skeleton-pulse" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
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

.weather-hero-gradient {
  background: linear-gradient(135deg, hsl(217 72% 46%), hsl(213 80% 52%), hsl(200 70% 48%));
}

.dark .weather-hero-gradient {
  background: linear-gradient(135deg, hsl(217 55% 28%), hsl(213 60% 32%), hsl(200 50% 28%));
}

.skeleton-pulse {
  position: relative;
  overflow: hidden;
}

.skeleton-pulse::after {
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
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
