<!-- components/WeatherIcons.vue -->
<template>
  <div class="weather-icon-container">
    <!-- Clear Sky (Sun) -->
    <div v-if="isWeatherCode('01')" class="sun-icon">
      <div class="sun-circle"/>
      <div v-for="i in 8" :key="`ray-${i}`" class="sun-ray" :style="{ transform: `rotate(${i * 45}deg)` }"/>
    </div>

    <!-- Few Clouds / Partly Cloudy -->
    <div v-else-if="isWeatherCode('02')" class="partly-cloudy-icon">
      <div class="sun-circle-small"/>
      <div class="cloud-small"/>
    </div>

    <!-- Scattered Clouds -->
    <div v-else-if="isWeatherCode('03')" class="scattered-clouds-icon">
      <div class="cloud-medium"/>
    </div>

    <!-- Broken Clouds -->
    <div v-else-if="isWeatherCode('04')" class="broken-clouds-icon">
      <div class="cloud-medium cloud-back"/>
      <div class="cloud-small cloud-front"/>
    </div>

    <!-- Shower Rain -->
    <div v-else-if="isWeatherCode('09')" class="shower-rain-icon">
      <div class="cloud-medium"/>
      <div
v-for="i in 5" :key="`drop-${i}`" class="raindrop" 
           :style="{ left: `${10 + i * 15}px`, animationDelay: `${i * 0.2}s` }"/>
    </div>

    <!-- Rain -->
    <div v-else-if="isWeatherCode('10')" class="rain-icon">
      <div class="sun-circle-small sun-behind-cloud"/>
      <div class="cloud-medium"/>
      <div
v-for="i in 3" :key="`drop-${i}`" class="raindrop" 
           :style="{ left: `${15 + i * 20}px`, animationDelay: `${i * 0.3}s` }"/>
    </div>

    <!-- Thunderstorm -->
    <div v-else-if="isWeatherCode('11')" class="thunderstorm-icon">
      <div class="cloud-medium"/>
      <div class="lightning"/>
      <div
v-for="i in 2" :key="`drop-${i}`" class="raindrop" 
           :style="{ left: `${20 + i * 25}px`, animationDelay: `${i * 0.2}s` }"/>
    </div>

    <!-- Snow -->
    <div v-else-if="isWeatherCode('13')" class="snow-icon">
      <div class="cloud-medium"/>
      <div
v-for="i in 4" :key="`flake-${i}`" class="snowflake" 
           :style="{ left: `${10 + i * 15}px`, animationDelay: `${i * 0.3}s` }"/>
    </div>

    <!-- Mist/Fog -->
    <div v-else-if="isWeatherCode('50')" class="mist-icon">
      <div
v-for="i in 3" :key="`mist-${i}`" class="mist-line" 
           :style="{ top: `${15 + i * 15}px`, width: `${60 - i * 10}px` }"/>
    </div>

    <!-- Fallback to text if no matching icon -->
    <div v-else class="fallback-icon">
      {{ weatherCode }}
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  weatherCode: {
    type: String,
    required: true,
    default: '01d'
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
});

// Extract the main weather code (first two chars) to match icon types
const isWeatherCode = (code) => props.weatherCode.startsWith(code);
</script>

<style scoped>
.weather-icon-container {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Size variants */
.weather-icon-container[size="small"] {
  width: 50px;
  height: 50px;
  transform: scale(0.6);
}

.weather-icon-container[size="large"] {
  width: 120px;
  height: 120px;
  transform: scale(1.5);
}

/* Clear Sky - Sun */
.sun-icon {
  position: relative;
  width: 100%;
  height: 100%;
}

.sun-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: #FFD700;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}

.sun-circle-small {
  position: absolute;
  top: 25%;
  left: 25%;
  width: 30px;
  height: 30px;
  background: #FFD700;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
}

.sun-behind-cloud {
  z-index: 0;
  opacity: 0.9;
}

.sun-ray {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 4px;
  background: #FFD700;
  transform-origin: 0 50%;
  border-radius: 2px;
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.4);
}

/* Cloud Styles */
.cloud-small, .cloud-medium {
  position: absolute;
  background: white;
  border-radius: 50px;
  box-shadow: 0 0 10px rgba(200, 200, 200, 0.5);
}

.cloud-small {
  width: 50px;
  height: 25px;
  bottom: 20%;
  right: 20%;
}

.cloud-medium {
  width: 60px;
  height: 30px;
  bottom: 25%;
  right: 10%;
}

.cloud-small:before, .cloud-small:after,
.cloud-medium:before, .cloud-medium:after {
  content: '';
  position: absolute;
  background: white;
  border-radius: 50%;
}

.cloud-small:before {
  width: 20px;
  height: 20px;
  top: -10px;
  left: 12px;
}

.cloud-small:after {
  width: 15px;
  height: 15px;
  top: -6px;
  right: 12px;
}

.cloud-medium:before {
  width: 25px;
  height: 25px;
  top: -12px;
  left: 15px;
}

.cloud-medium:after {
  width: 20px;
  height: 20px;
  top: -8px;
  right: 15px;
}

.cloud-back {
  z-index: 1;
  filter: brightness(0.9);
  transform: translateX(-15px);
}

.cloud-front {
  z-index: 2;
}

/* Rain Drops */
.raindrop {
  position: absolute;
  bottom: 10px;
  width: 3px;
  height: 15px;
  background: linear-gradient(to bottom, #88c1f8, #4b93e4);
  border-radius: 0 0 5px 5px;
  animation: falling 1.5s infinite;
}

@keyframes falling {
  0% {
    transform: translateY(-10px);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(30px);
    opacity: 0;
  }
}

/* Lightning */
.lightning {
  position: absolute;
  bottom: 15px;
  left: 30px;
  width: 15px;
  height: 25px;
  background: #FFEB3B;
  clip-path: polygon(40% 0%, 100% 50%, 60% 50%, 80% 100%, 0% 50%, 40% 50%);
  animation: flash 3s infinite;
  box-shadow: 0 0 10px rgba(255, 235, 59, 0.7);
}

@keyframes flash {
  0%, 90%, 100% {
    opacity: 0.2;
  }
  95% {
    opacity: 1;
  }
}

/* Snowflakes */
.snowflake {
  position: absolute;
  bottom: 15px;
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
  animation: snowfall 2s infinite;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
}

@keyframes snowfall {
  0% {
    transform: translateY(-10px) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(30px) rotate(90deg);
    opacity: 0;
  }
}

/* Mist/Fog */
.mist-line {
  position: absolute;
  left: 10px;
  height: 6px;
  background: rgba(200, 200, 200, 0.8);
  border-radius: 3px;
}

/* Fallback */
.fallback-icon {
  font-size: 12px;
  color: #666;
}
</style>