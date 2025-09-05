
type WeatherData = {
  name: string;
  weather: {
    description: string;
  }[];
  main: {
    temp: number;
    humidity: number;
  };
};

export async function getWeather(lat: number, lon: number): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
  if (!apiKey) {
    throw new Error('OpenWeather API key not configured.');
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Weather API request failed with status ${res.status}`);
    }
    const data: WeatherData = await res.json();
    return `Weather in ${data.name}: ${data.weather[0].description}, Temp: ${data.main.temp}°C, Humidity: ${data.main.humidity}%.`;
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    throw new Error("Could not retrieve weather information at this time.");
  }
}
