// server/api/weather.ts
import { defineEventHandler, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  // Get query parameters
  const query = getQuery(event);
  const city = query.city || "London";

  // Get API key from environment variable
  const config = useRuntimeConfig();
  const apiKey = config.openWeatherApiKey;

  try {
    // Fetch current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const currentData = await currentResponse.json();

    if (currentData.cod === "404") {
      return {
        error: "City not found",
      };
    }

    // Fetch forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
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
