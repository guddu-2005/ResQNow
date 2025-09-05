import axios from 'axios';

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
    return 'OpenWeather API key not configured.';
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const res = await axios.get<WeatherData>(url);
    const data = res.data;
    return `Weather in ${data.name}: ${data.weather[0].description}, Temp: ${data.main.temp}°C, Humidity: ${data.main.humidity}%.`;
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return "Could not retrieve weather information at this time.";
  }
}
