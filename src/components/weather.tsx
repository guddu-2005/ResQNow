
'use client';

import React, { useEffect, useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, MapPin, Sun, Cloud, Wind, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

type WeatherData = {
  name: string;
  weather: {
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
};

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
  if (!apiKey) {
    throw new Error('OpenWeather API key not configured.');
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather API request failed with status ${res.status}`);
  }
  return res.json();
}

const WeatherComponent = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await fetchWeather(position.coords.latitude, position.coords.longitude);
          setWeather(data);
        } catch (err) {
          console.error(err);
          setError("Could not fetch weather data. Please try again later.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location. Please enable location services.");
        setLoading(false);
      }
    );
  }, []);

  const getWeatherIcon = (iconCode: string) => {
    if (iconCode.includes('01')) return <Sun className="w-6 h-6 text-yellow-400" />;
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return <Cloud className="w-6 h-6 text-gray-400" />;
    // Add more icon mappings as needed for rain, snow, etc.
    return <Cloud className="w-6 h-6 text-gray-400" />;
  }

  if (loading) {
    return <WeatherSkeleton />;
  }

  if (error) {
    return (
      <Card className="w-full max-w-md bg-destructive/10 border-destructive rounded-xl shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <CardTitle>Weather Error</CardTitle>
            <CardDescription className="text-destructive/80">{error}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <Card className="w-full max-w-md shadow-xl rounded-2xl transition-all hover:shadow-2xl hover:scale-105">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                    <MapPin className="h-6 w-6 text-primary" />
                    <span>{weather.name}</span>
                </CardTitle>
                <CardDescription className="capitalize text-lg">
                    {weather.weather[0].description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center text-6xl font-bold my-4">
                    {getWeatherIcon(weather.weather[0].icon)}
                    <span className="ml-4">{Math.round(weather.main.temp)}°C</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                        <Droplets className="w-5 h-5" />
                        <span>Humidity: {weather.main.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Wind className="w-5 h-5" />
                        <span>Wind: {weather.wind.speed.toFixed(1)} m/s</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
  );
};

const WeatherSkeleton = () => {
    return (
        <Card className="w-full max-w-md shadow-lg rounded-2xl">
            <CardHeader className="text-center pb-2">
                <Skeleton className="h-8 w-3/5 mx-auto rounded-lg" />
                <Skeleton className="h-6 w-2/5 mx-auto mt-2 rounded-lg" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center my-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-12 w-24 ml-4 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-6 w-full rounded-lg" />
                    <Skeleton className="h-6 w-full rounded-lg" />
                </div>
            </CardContent>
        </Card>
    )
}

export const Weather = memo(WeatherComponent);
