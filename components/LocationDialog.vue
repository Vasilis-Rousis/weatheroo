<!-- components/LocationDialog.vue -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm dialog-backdrop"
    @click="closeOnBackdrop ? handleNotNow() : null"
  >
    <div
      class="bg-card dark:bg-card rounded-2xl shadow-glass-lg max-w-sm w-full mx-4 p-6 border border-border/50 dialog-content"
      @click.stop
    >
      <div class="mb-5 flex justify-between items-start">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <MapPinIcon class="h-4 w-4 text-primary" />
          </div>
          <h3 class="text-base font-display font-bold">Location Access</h3>
        </div>
        <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg -mr-1 -mt-1" @click="handleNotNow">
          <XIcon class="h-3.5 w-3.5" />
        </Button>
      </div>

      <div class="space-y-3">
        <p class="text-sm leading-relaxed text-foreground/90">
          Share your location to see weather for where you are right now.
        </p>

        <div class="flex items-center justify-center py-4">
          <div
            class="w-14 h-14 bg-primary/8 dark:bg-primary/12 rounded-2xl flex items-center justify-center"
          >
            <MapPinIcon class="h-7 w-7 text-primary" />
          </div>
        </div>

        <p class="text-xs text-muted-foreground text-center">
          This helps show accurate weather for your current location.
        </p>
      </div>

      <div class="mt-6 flex gap-2.5">
        <Button variant="outline" class="flex-1 rounded-xl h-10 text-sm" @click="handleNotNow">
          Not now
        </Button>
        <Button class="flex-1 rounded-xl h-10 text-sm bg-primary hover:bg-primary/90" @click="confirm">
          <MapPinIcon class="h-3.5 w-3.5 mr-1.5" />
          Allow
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { MapPinIcon, XIcon } from "lucide-vue-next";
import { useUserPreferences } from "~/composables/useUserPreferences";

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

const emit = defineEmits(["update:modelValue", "confirm", "decline"]);

const isOpen = ref(props.modelValue);
const { markLocationPromptAsShown, denyLocationPermission } =
  useUserPreferences();

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

const handleNotNow = () => {
  // Mark the prompt as shown and the location as denied
  markLocationPromptAsShown();
  denyLocationPermission();
  emit("decline");
  close();
};

const confirm = () => {
  // Mark the prompt as shown
  markLocationPromptAsShown();
  emit("confirm");
  close();
};
</script>
