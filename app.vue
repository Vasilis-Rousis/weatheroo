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
  transition-property: background-color, border-color, color, fill, stroke;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
