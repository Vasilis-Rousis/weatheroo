<!-- components/WeatherAnimation.vue -->
<template>
  <div class="weather-animation-container">
    <div v-if="weatherType === 'clear'" class="sunny-animation">
      <div class="sun" />
      <div
        v-for="i in 5"
        :key="i"
        class="sun-ray"
        :style="{ transform: `rotate(${i * 36}deg)` }"
      />
    </div>

    <div v-else-if="weatherType === 'clouds'" class="cloudy-animation">
      <div
        v-for="i in 3"
        :key="i"
        class="cloud"
        :style="{
          left: `${20 + i * 20}%`,
          top: `${10 + (i % 2) * 15}%`,
          animationDuration: `${20 + i * 5}s`,
        }"
      />
    </div>

    <div v-else-if="weatherType === 'rain'" class="rain-animation">
      <div
        v-for="i in 20"
        :key="i"
        class="raindrop"
        :style="{
          left: `${Math.random() * 100}%`,
          animationDuration: `${0.5 + Math.random() * 0.7}s`,
          animationDelay: `${Math.random() * 2}s`,
        }"
      />
      <div class="cloud" style="left: 30%; top: 10%" />
      <div class="cloud" style="left: 60%; top: 20%" />
    </div>

    <div v-else-if="weatherType === 'snow'" class="snow-animation">
      <div
        v-for="i in 30"
        :key="i"
        class="snowflake"
        :style="{
          left: `${Math.random() * 100}%`,
          animationDuration: `${3 + Math.random() * 5}s`,
          animationDelay: `${Math.random() * 3}s`,
        }"
      />
    </div>

    <div v-else-if="weatherType === 'thunderstorm'" class="thunder-animation">
      <div class="cloud" style="left: 30%; top: 10%" />
      <div class="cloud" style="left: 50%; top: 15%" />
      <div class="lightning" :class="{ flash: isLightningFlash }" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";

const props = defineProps({
  weatherCode: {
    type: String,
    default: "01d", // clear sky day
  },
});

// Map OpenWeatherMap codes to animation types
const weatherType = computed(() => {
  const code = props.weatherCode;
  if (code.startsWith("01")) return "clear"; // clear sky
  if (code.startsWith("02") || code.startsWith("03") || code.startsWith("04"))
    return "clouds"; // clouds
  if (code.startsWith("09") || code.startsWith("10")) return "rain"; // rain
  if (code.startsWith("11")) return "thunderstorm"; // thunderstorm
  if (code.startsWith("13")) return "snow"; // snow
  return "clear"; // default
});

// For thunder animation
const isLightningFlash = ref(false);
const thunderInterval = null;

const triggerLightning = () => {
  isLightningFlash.value = true;
  setTimeout(() => {
    isLightningFlash.value = false;
  }, 200);

  // Random interval for next flash
  setTimeout(triggerLightning, 3000 + Math.random() * 5000);
};

watch(
  () => weatherType.value,
  (newType) => {
    if (newType === "thunderstorm") {
      setTimeout(triggerLightning, 1000);
    }
  }
);

onMounted(() => {
  if (weatherType.value === "thunderstorm") {
    setTimeout(triggerLightning, 1000);
  }
});

onUnmounted(() => {
  clearTimeout(thunderInterval);
});
</script>

<style scoped>
.weather-animation-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
  opacity: 0.7;
}

/* Sunny animation */
.sunny-animation {
  position: absolute;
  top: 40px;
  right: 40px;
}

.sun {
  width: 60px;
  height: 60px;
  background: #ffd700;
  border-radius: 50%;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.7);
  animation: pulse 3s infinite alternate;
}

.sun-ray {
  position: absolute;
  top: 30px;
  left: 30px;
  width: 80px;
  height: 3px;
  background: #ffd700;
  transform-origin: 0 0;
  animation: rotate 10s linear infinite;
}

/* Cloudy animation */
.cloud {
  position: absolute;
  width: 80px;
  height: 40px;
  background: white;
  border-radius: 40px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  animation: floatWithFade 20s linear infinite;
}

.cloud::before,
.cloud::after {
  content: "";
  position: absolute;
  background: white;
  border-radius: 50%;
}

.cloud::before {
  width: 50px;
  height: 50px;
  top: -20px;
  left: 10px;
}

.cloud::after {
  width: 40px;
  height: 40px;
  top: -15px;
  right: 10px;
}

/* Rain animation */
.rain-animation {
  position: relative;
  width: 100%;
  height: 100%;
}

.raindrop {
  position: absolute;
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, transparent, #3498db);
  top: -20px;
  animation: rain linear infinite;
}

/* Snow animation */
.snowflake {
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  top: -10px;
  opacity: 0.8;
  animation: snow linear infinite;
}

/* Thunder animation */
.thunder-animation {
  position: relative;
  width: 100%;
  height: 100%;
}

.lightning {
  position: absolute;
  top: 60px;
  left: 50%;
  width: 5px;
  height: 80px;
  background: rgba(255, 255, 255, 0);
  transform: translateX(-50%);
  clip-path: polygon(
    50% 0%,
    40% 40%,
    100% 50%,
    55% 55%,
    90% 100%,
    45% 65%,
    0% 80%,
    40% 50%,
    0% 40%,
    50% 30%
  );
}

.lightning.flash {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 0, 0.6);
}

/* Animations */
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100vw);
  }
}

@keyframes rain {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(calc(100vh + 20px));
  }
}

@keyframes snow {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(calc(100vh + 10px)) rotate(360deg);
  }
}

@keyframes floatWithFade {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  2.5% {
    /* 0.5s in a 20s animation = 2.5% */
    opacity: 1;
  }
  100% {
    transform: translateX(100vw);
    opacity: 1;
  }
}
</style>
