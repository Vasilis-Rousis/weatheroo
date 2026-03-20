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
    "@pinia/nuxt",
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
      link: [
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap",
        },
      ],
    },
  },
});
