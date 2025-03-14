<!-- app.vue -->
<template>
  <div>
    <NuxtPage />
  </div>
</template>

<style>
/* Global styles */
html {
  scroll-behavior: smooth;
}

body {
  font-family: "Inter", "Segoe UI", sans-serif;
}

/* Add smooth transitions for all elements */
* {
  transition-property: background-color, border-color, color, fill, stroke,
    opacity, transform, visibility;
  transition-duration: 300ms;
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
