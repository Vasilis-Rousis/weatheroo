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

  // Store whether the user has explicitly enabled location
  const locationPermissionEnabled = useStorage(
    "weatheroo-location-enabled",
    false
  );

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
    locationPermissionEnabled.value = false;
  };

  // Function to mark location permission as enabled
  const enableLocationPermission = () => {
    locationPermissionEnabled.value = true;
    locationPermissionDenied.value = false; // Make sure to clear the denied status
  };

  // Function to disable location permission that was previously enabled
  const disableLocationPermission = () => {
    locationPermissionEnabled.value = false;
  };

  return {
    lastCity,
    locationPromptShown,
    locationPermissionDenied,
    locationPermissionEnabled,
    updateLastCity,
    markLocationPromptAsShown,
    denyLocationPermission,
    enableLocationPermission,
    disableLocationPermission,
  };
}
