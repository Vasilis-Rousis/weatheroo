<!-- components/LocationButton.vue -->
<script setup>
import { ref, watch } from "vue";
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

const emit = defineEmits(["request-location", "disable-location"]);
const showEnabledMessage = ref(false);
const showDisabledMessage = ref(false);

// Watch for changes in isEnabled to control message visibility
watch(
  () => props.isEnabled,
  (newValue, oldValue) => {
    // Only show messages when there's an actual change in state
    // and not just on initial component mounting
    const isInitialMount = oldValue === undefined;

    if (newValue && !isInitialMount) {
      // Show the enabled message when isEnabled changes to true
      showEnabledMessage.value = true;
      showDisabledMessage.value = false;

      // Set a timer to hide the message after 2 seconds
      setTimeout(() => {
        showEnabledMessage.value = false;
      }, 2000);
    } else if (!newValue && oldValue === true) {
      // Only show disabled message if it was previously enabled
      showDisabledMessage.value = true;
      showEnabledMessage.value = false;

      // Set a timer to hide the message after 2 seconds
      setTimeout(() => {
        showDisabledMessage.value = false;
      }, 2000);
    }
  },
  { immediate: true }
);

const handleClick = () => {
  if (props.isEnabled) {
    // If location is enabled, emit event to disable it
    emit("disable-location");
  } else {
    // If location is disabled, emit event to request it
    emit("request-location");
  }
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
      @click="handleClick"
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
  </div>
</template>
