
'use client';

import React, { useEffect, useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, MapPin, Sun, Cloud, Wind, Droplets, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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

async function fetchWeather(query: { lat: number; lon: number } | { city: string }): Promise<WeatherData> {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
  if (!apiKey) {
    throw new Error('OpenWeather API key not configured.');
  }

  let url = '';
  if ('city' in query) {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${query.city}&appid=${apiKey}&units=metric`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${query.lat}&lon=${query.lon}&appid=${apiKey}&units=metric`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`City not found.`);
    }
    throw new Error(`Weather API request failed with status ${res.status}`);
  }
  return res.json();
}


const WeatherComponent = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();


  const handleFetchWeather = async (query: { lat: number; lon: number } | { city: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(query);
      setWeather(data);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || "Could not fetch weather data.";
      setError(errorMessage);
       toast({
        variant: "destructive",
        title: "Weather Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleFetchWeather({ lat: position.coords.latitude, lon: position.coords.longitude });
      },
      () => {
        setError("Using default location. Enable location services for local weather.");
        handleFetchWeather({ city: 'New York' }); // Fallback location
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if(searchQuery.trim()){
          handleFetchWeather({city: searchQuery});
      }
  }

  const getWeatherIcon = (iconCode: string) => {
    if (iconCode.includes('01')) return <Sun className="w-6 h-6 text-yellow-400" />;
    if (iconCode.includes('02') || iconCode.includes('03') || iconCode.includes('04')) return <Cloud className="w-6 h-6 text-gray-400" />;
    // Add more icon mappings as needed for rain, snow, etc.
    return <Cloud className="w-6 h-6 text-gray-400" />;
  }

  return (
    <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <Card className="w-full shadow-xl rounded-2xl transition-all hover:shadow-2xl">
            <CardHeader className="pb-4">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <Input 
                        placeholder="Search for a city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-full"
                    />
                    <Button type="submit" size="icon" className="rounded-full flex-shrink-0">
                        <Search className="w-4 h-4" />
                    </Button>
                </form>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <WeatherSkeleton />
                ) : error && !weather ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 h-[208px]">
                        <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
                        <p className="font-semibold">Failed to load weather</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                ) : weather ? (
                    <>
                        <div className="text-center pb-2">
                            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                                <MapPin className="h-6 w-6 text-primary" />
                                <span>{weather.name}</span>
                            </CardTitle>
                            <CardDescription className="capitalize text-lg">
                                {weather.weather[0].description}
                            </CardDescription>
                        </div>
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
                    </>
                ): null}
            </CardContent>
        </Card>
    </motion.div>
  );
};

const WeatherSkeleton = () => {
    return (
        <div className="h-[208px]">
            <div className="text-center pb-2">
                <Skeleton className="h-8 w-3/5 mx-auto rounded-lg" />
                <Skeleton className="h-6 w-2/5 mx-auto mt-2 rounded-lg" />
            </div>
            <div className="flex items-center justify-center my-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-12 w-24 ml-4 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-6 w-full rounded-lg" />
                <Skeleton className="h-6 w-full rounded-lg" />
            </div>
        </div>
    )
}

export const Weather = memo(WeatherComponent);
