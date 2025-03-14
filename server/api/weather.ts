// server/api/weather.ts
import { defineEventHandler, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  // Get query parameters
  const query = getQuery(event);
  const city = query.city;
  const lat = query.lat;
  const lon = query.lon;

  // Get API key from environment variable
  const config = useRuntimeConfig();
  const apiKey = config.openWeatherApiKey;

  let currentUrl;
  let forecastUrl;

  // Determine which API endpoint to use based on parameters
  if (lat && lon) {
    // Use coordinates for the API call
    currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  } else if (city) {
    // Use city name for the API call
    currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  } else {
    return {
      error:
        "No location specified. Please provide a city name or coordinates.",
    };
  }

  try {
    // Fetch current weather
    const currentResponse = await fetch(currentUrl);
    const currentData = await currentResponse.json();

    if (currentData.cod === "404" || currentData.cod === 404) {
      return {
        error: "Location not found",
      };
    }

    // Fetch forecast
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    return {
      current: currentData,
      forecast: forecastData,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return {
      error: "Failed to fetch weather data",
    };
  }
});
