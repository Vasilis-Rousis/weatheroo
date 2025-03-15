// composables/useLocationService.ts
import { ref, onMounted } from "vue";

export function useLocationService() {
  const locationPermission = ref<PermissionState | null>(null);
  const locationEnabled = ref(false);
  const locationLoading = ref(false);
  const locationError = ref<string | null>(null);
  const coordinates = ref<{ latitude: number; longitude: number } | null>(null);

  // Check if the browser supports geolocation
  const isGeolocationSupported = () => {
    return "geolocation" in navigator;
  };

  // Check the current permission status
  const checkPermissionStatus = async () => {
    // Skip if geolocation is not supported
    if (!isGeolocationSupported()) {
      locationError.value = "Geolocation is not supported by your browser";
      return false;
    }

    try {
      // Check if we can access the permission status
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({
          name: "geolocation",
        });
        locationPermission.value = permissionStatus.state;

        // Set up a listener for permission changes
        permissionStatus.onchange = () => {
          locationPermission.value = permissionStatus.state;

          // If the permission is granted, try to get the position
          if (permissionStatus.state === "granted") {
            getPosition();
          } else {
            locationEnabled.value = false;
          }
        };

        return permissionStatus.state === "granted";
      } else {
        // For browsers that don't support permission query
        return false;
      }
    } catch (error) {
      console.error("Error checking geolocation permission:", error);
      return false;
    }
  };

  // Get the user's current position
  const getPosition = () => {
    return new Promise<{ latitude: number; longitude: number }>(
      (resolve, reject) => {
        locationLoading.value = true;
        locationError.value = null;

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            coordinates.value = { latitude, longitude };
            locationEnabled.value = true;
            locationLoading.value = false;
            resolve({ latitude, longitude });
          },
          (error) => {
            locationLoading.value = false;
            locationEnabled.value = false;

            switch (error.code) {
              case error.PERMISSION_DENIED:
                locationError.value = "Request for geolocation was denied";
                break;
              case error.POSITION_UNAVAILABLE:
                locationError.value = "Location information is unavailable";
                break;
              case error.TIMEOUT:
                locationError.value =
                  "The request to get user location timed out";
                break;
              default:
                locationError.value = "An unknown error occurred";
            }

            reject(locationError.value);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      }
    );
  };

  // Request the user's location
  const requestLocation = async () => {
    if (!isGeolocationSupported()) {
      locationError.value = "Geolocation is not supported by your browser";
      return null;
    }

    try {
      const position = await getPosition();
      return position;
    } catch (error) {
      console.error("Error getting location:", error);
      return null;
    }
  };

  // Clear the coordinates and set location as disabled
  const clearCoordinates = () => {
    coordinates.value = null;
    locationEnabled.value = false;
  };

  // Initialize on mount
  onMounted(async () => {
    const isGranted = await checkPermissionStatus();

    // If permission is already granted, get the position
    if (isGranted) {
      try {
        await getPosition();
      } catch (error) {
        console.error("Error getting initial position:", error);
      }
    }
  });

  return {
    locationPermission,
    locationEnabled,
    locationLoading,
    locationError,
    coordinates,
    isGeolocationSupported,
    checkPermissionStatus,
    requestLocation,
    clearCoordinates,
  };
}
