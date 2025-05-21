// composables/useDebounce.ts
import { ref, watch } from "vue";

export function useDebounce<T>(value: T, delay = 300) {
  const debouncedValue = ref<T>(value);
  let timeout: ReturnType<typeof setTimeout>;

  watch(
    () => value,
    (newValue) => {
      // Clear the previous timeout
      clearTimeout(timeout);

      // Set a new timeout
      timeout = setTimeout(() => {
        debouncedValue.value = newValue;
      }, delay);
    },
    { immediate: true }
  );

  return debouncedValue;
}
