<!-- components/LocationDialog.vue -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fadeIn"
    @click="closeOnBackdrop ? close() : null"
  >
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6 transform transition-all"
      @click.stop
    >
      <div class="mb-4 flex justify-between items-start">
        <div class="flex items-center text-blue-500 dark:text-blue-400">
          <MapPinIcon class="h-6 w-6 mr-2" />
          <h3 class="text-lg font-semibold">Location Access</h3>
        </div>
        <Button variant="ghost" size="icon" @click="close">
          <XIcon class="h-4 w-4" />
        </Button>
      </div>

      <div class="py-2 space-y-4">
        <p>
          Would you like to share your location to get the weather for where you
          are?
        </p>

        <div class="flex items-center justify-center mb-4">
          <div
            class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center"
          >
            <MapPinIcon class="h-8 w-8 text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          This helps us show you accurate weather information for your current
          location.
        </p>
      </div>

      <div class="mt-6 flex gap-3">
        <Button variant="outline" class="flex-1" @click="close">
          Not now
        </Button>
        <Button class="flex-1" @click="confirm">
          <MapPinIcon class="h-4 w-4 mr-1" />
          Allow location
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { MapPinIcon, XIcon } from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const isOpen = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newVal) => {
    isOpen.value = newVal;
  }
);

const close = () => {
  isOpen.value = false;
  emit("update:modelValue", false);
};

const confirm = () => {
  emit("confirm");
  close();
};
</script>
