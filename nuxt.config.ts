// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/color-mode", // Add the color mode module
  ],
  // Configure the color mode module
  colorMode: {
    preference: "system", // default value is 'system'
    fallback: "light", // fallback value if not system preference found
    classSuffix: "", // This is important for Tailwind dark mode to work
    storageKey: "weatheroo-dark-mode", // Use your existing storage key
  },
  runtimeConfig: {
    // Private keys (only available on server-side)
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY,

    // Public keys (exposed to client-side for map tiles)
    public: {
      openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
    },
  },
  css: ["~/assets/css/main.css"],

  // Add build configuration for Leaflet
  build: {
    transpile: ["leaflet"],
  },

  // Add experimental features to enhance performance
  experimental: {
    payloadExtraction: true,
    asyncContext: true,
    viewTransition: true,
    componentIslands: true,
  },

  // Configure image module
  image: {
    quality: 80,
    format: ["webp", "avif", "jpg", "png"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    domains: ["openweathermap.org"],
    providers: {
      openweathermap: {
        provider: "ipx",
        options: {
          baseURL: "https://openweathermap.org/img/wn",
        },
      },
    },
    // Enable image preloading for critical images
    preload: true,
  },

  // Set app configuration
  app: {
    head: {
      title: "Weatheroo",
      meta: [
        {
          name: "description",
          content: "A beautiful weather app built with Nuxt 3",
        },
      ],
      htmlAttrs: {
        lang: "en",
      },
    },
  },
});
