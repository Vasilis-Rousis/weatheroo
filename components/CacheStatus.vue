<!-- components/CacheStatus.vue -->
<template>
  <div
    v-if="isCached"
    class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
  >
    <ClockIcon class="h-3 w-3" />
    <span>{{ notice || `Weather data from ${timeAgo}` }}</span>

    <Button
      v-if="showRefresh"
      variant="ghost"
      size="icon"
      class="h-5 w-5 ml-1"
      @click="$emit('refresh')"
    >
      <RefreshCwIcon class="h-3 w-3" />
    </Button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ClockIcon, RefreshCwIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";

const props = defineProps({
  timestamp: {
    type: [String, Number, Date],
    default: null,
  },
  isCached: {
    type: Boolean,
    default: false,
  },
  notice: {
    type: String,
    default: null,
  },
  showRefresh: {
    type: Boolean,
    default: true,
  },
});

const timeAgo = computed(() => {
  if (!props.timestamp) return "unknown time";

  try {
    const now = new Date();
    const time = new Date(props.timestamp);
    const diff = now - time;

    // Convert to minutes
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  } catch (e) {
    console.error("Error calculating time ago:", e);
    return "unknown time";
  }
});
</script>
