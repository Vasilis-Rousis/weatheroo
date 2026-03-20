<!-- app.vue -->
<template>
  <div>
    <Analytics />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt";
</script>

<style>
/* Global styles */
html {
  scroll-behavior: smooth;
}

body {
  font-family: "DM Sans", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: -0.01em;
}

h1, h2, h3, h4, h5, h6 {
  font-family: "Bricolage Grotesque", "DM Sans", system-ui, sans-serif;
  letter-spacing: -0.02em;
}

/* Scoped transitions - only on color/bg properties for theme switching */
* {
  transition-property: background-color, border-color, color;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animation keyframes (as a backup for the Tailwind animations) */
@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
    visibility: hidden;
  }
}

.animate-fadeOut {
  animation: fadeOut 0.5s ease-out forwards;
}
</style>
