// OpenWeatherMap API integration.
// This file will contain functions to fetch weather data, severe weather alerts,
// and other climate-related information to assess risks.
'use server';

const API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function getWeatherByCoords(lat: number, lon: number) {
  if (!API_KEY) {
    throw new Error('OpenWeatherMap API key is not configured.');
  }

  const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch weather data.');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data from the service.');
  }
}
