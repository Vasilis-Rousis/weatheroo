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
});