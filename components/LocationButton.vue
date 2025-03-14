<!-- components/LocationButton.vue -->
<script setup>
import { defineEmits, ref, watch } from "vue";
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
const showEnabledMessage = ref(false);

// Watch for changes in isEnabled to control message visibility
watch(
  () => props.isEnabled,
  (newValue) => {
    if (newValue) {
      // Show the message
      showEnabledMessage.value = true;

      // Set a timer to hide the message after 2 seconds
      setTimeout(() => {
        showEnabledMessage.value = false;
      }, 2000);
    }
  },
  { immediate: true }
);

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
      v-if="isEnabled && showEnabledMessage"
      class="ml-2 text-xs text-green-600 dark:text-green-400 transition-opacity duration-300"
      :class="showEnabledMessage ? 'animate-fadeIn' : 'animate-fadeOut'"
    >
      Location enabled
    </span>
  </div>
</template>
