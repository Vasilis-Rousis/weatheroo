// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
  ],
  runtimeConfig: {
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
  },
  css: ["~/assets/css/main.css"],
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
      title: "Nuxt Weather App",
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
