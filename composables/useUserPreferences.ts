// composables/useUserPreferences.ts
import { useStorage } from "@vueuse/core";

export function useUserPreferences() {
  // Store the last searched city
  const lastCity = useStorage("weatheroo-last-city", "");

  // Store whether the user has seen the location prompt
  const locationPromptShown = useStorage(
    "weatheroo-location-prompt-shown",
    false
  );

  // Store whether the user has explicitly denied location permission
  const locationPermissionDenied = useStorage(
    "weatheroo-location-denied",
    false
  );

  // Store the user's theme preference (light/dark)
  const darkMode = useStorage("weatheroo-dark-mode", false);

  // Function to update the last city
  const updateLastCity = (city: string) => {
    lastCity.value = city;
  };

  // Function to mark the location prompt as shown
  const markLocationPromptAsShown = () => {
    locationPromptShown.value = true;
  };

  // Function to mark location permission as denied
  const denyLocationPermission = () => {
    locationPermissionDenied.value = true;
  };

  // Function to update theme preference
  const updateThemePreference = (isDark: boolean) => {
    darkMode.value = isDark;
  };

  return {
    lastCity,
    locationPromptShown,
    locationPermissionDenied,
    darkMode,
    updateLastCity,
    markLocationPromptAsShown,
    denyLocationPermission,
    updateThemePreference,
  };
}
