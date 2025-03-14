<!-- components/LocationButton.vue -->
<script setup>
import { defineEmits } from "vue";
import { MapPinIcon, MapPinOffIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const props = defineProps({
  isEnabled: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["request-location"]);

const requestLocation = () => {
  emit("request-location");
};
</script>

<template>
  <div :class="cn('inline-flex items-center', props.class)">
    <Button
      variant="outline"
      size="icon"
      :disabled="isLoading"
      :class="
        isEnabled
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : ''
      "
      @click="requestLocation"
    >
      <div
        v-if="isLoading"
        class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"
      />
      <MapPinIcon
        v-else-if="isEnabled"
        class="h-5 w-5 text-green-600 dark:text-green-400"
      />
      <MapPinOffIcon v-else class="h-5 w-5" />
    </Button>

    <span
      v-if="isEnabled"
      class="ml-2 text-xs text-green-600 dark:text-green-400 animate-fadeIn"
    >
      Location enabled
    </span>
  </div>
</template>
