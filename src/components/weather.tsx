
'use client';

import React, { useEffect, useState, memo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, MapPin, Sun, Cloud, Wind, Droplets, Search, CloudRain, CloudSnow, History, Calendar, Thermometer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { format, fromUnixTime, subDays } from 'date-fns';

type WeatherData = {
  current: {
    dt: number;
    temp: number;
    humidity: number;
    wind_speed: number;
    weather: {
      description: string;
      icon: string;
      main: string;
    }[];
  };
  daily: {
    dt: number;
    temp: {
      day: number;
      night: number;
    };
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
  }[];
  lat: number;
  lon: number;
  timezone: string;
};

type HistoricalWeatherData = {
    dt: number;
    temp: number;
    weather: {
        icon: string;
        main: string;
    }[];
}[];

type FullWeatherData = {
  current: WeatherData;
  historical: HistoricalWeatherData;
  locationName: string;
};

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;

async function fetchWeather(lat: number, lon: number): Promise<Omit<FullWeatherData, 'locationName'>> {
  if (!API_KEY) throw new Error('OpenWeather API key not configured. Please add NEXT_PUBLIC_OPENWEATHER_KEY to your environment variables.');
  
  // Fetch current and forecast data
  const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&appid=${API_KEY}&units=metric`;
  const oneCallRes = await fetch(oneCallUrl);
  if (!oneCallRes.ok) throw new Error(`Weather API request failed with status ${oneCallRes.status}. Check your API key and permissions.`);
  const currentAndForecastData: WeatherData = await oneCallRes.json();

  // Fetch historical data for the last 2 days
  const historicalPromises = [subDays(new Date(), 2), subDays(new Date(), 1)].map(date => {
    const historyUrl = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${Math.floor(date.getTime() / 1000)}&appid=${API_KEY}&units=metric`;
    return fetch(historyUrl);
  });
  
  const historicalResponses = await Promise.all(historicalPromises);
  const historicalData: HistoricalWeatherData = (await Promise.all(historicalResponses.map(res => {
      if (!res.ok) throw new Error(`Historical weather API request failed with status ${res.status}`);
      return res.json();
  }))).map(h => h.data[0]);

  return { current: currentAndForecastData, historical: historicalData };
}

async function geocodeCity(city: string): Promise<{ lat: number; lon: number }> {
    if (!API_KEY) throw new Error('OpenWeather API key not configured.');
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`;
    const res = await fetch(geocodeUrl);
    if (!res.ok) throw new Error(`Geocoding request failed with status ${res.status}`);
    const data = await res.json();
    if (data.length === 0) throw new Error('City not found.');
    return { lat: data[0].lat, lon: data[0].lon };
}


const getWeatherIcon = (iconCode: string, main: string, size: 'sm' | 'lg' = 'lg') => {
    const s = size === 'lg' ? "w-16 h-16" : "w-10 h-10";
    if (main.includes('Sun') || main.includes('Clear')) return <Sun className={`${s} text-yellow-400`} />;
    if (main.includes('Rain')) return <CloudRain className={`${s} text-blue-400`} />;
    if (main.includes('Snow')) return <CloudSnow className={`${s} text-white`} />;
    return <Cloud className={`${s} text-gray-400`} />;
};


const WeatherComponent = () => {
  const [weatherData, setWeatherData] = useState<FullWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleFetchWeather = useCallback(async (query: { lat: number; lon: number; name?: string } | { city: string }) => {
    setLoading(true);
    setError(null);
    try {
      if (!API_KEY) {
        throw new Error('OpenWeather API key not configured.');
      }
      let lat, lon, name;
      if ('city' in query) {
        const coords = await geocodeCity(query.city);
        lat = coords.lat;
        lon = coords.lon;
        name = query.city;
      } else {
        lat = query.lat;
        lon = query.lon;
        name = query.name || `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
      }

      const { current, historical } = await fetchWeather(lat, lon);
      const locationName = name;
      setWeatherData({ current, historical, locationName });
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
  }, [toast]);
  
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported. Using default location.");
      handleFetchWeather({ city: 'New York' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleFetchWeather({ lat: position.coords.latitude, lon: position.coords.longitude, name: 'Current Location' });
      },
      () => {
        setError("Using default location. Enable location services for local weather.");
        handleFetchWeather({ city: 'New York' });
      }
    );
  }, [handleFetchWeather]);

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if(searchQuery.trim()){
          handleFetchWeather({city: searchQuery});
      }
  }

  const tabContentVariant = {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <Card className="w-full shadow-xl rounded-2xl transition-all hover:shadow-2xl overflow-hidden">
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
                ) : error && !weatherData ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 h-[350px]">
                        <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
                        <p className="font-semibold">Failed to load weather</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                ) : weatherData ? (
                    <Tabs defaultValue="today" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="today">Today</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                            <TabsTrigger value="forecast">Forecast</TabsTrigger>
                        </TabsList>
                        <AnimatePresence mode="wait">
                            <TabsContent value="today">
                                <motion.div variants={tabContentVariant} initial="hidden" animate="visible" exit="hidden">
                                    <TodayWeather weatherData={weatherData} />
                                </motion.div>
                            </TabsContent>
                            <TabsContent value="history">
                                <motion.div variants={tabContentVariant} initial="hidden" animate="visible" exit="hidden">
                                    <HistoryWeather weatherData={weatherData} />
                                </motion.div>
                            </TabsContent>
                            <TabsContent value="forecast">
                                <motion.div variants={tabContentVariant} initial="hidden" animate="visible" exit="hidden">
                                   <ForecastWeather weatherData={weatherData} />
                                </motion.div>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>
                ): null}
            </CardContent>
        </Card>
    </motion.div>
  );
};

const TodayWeather = ({ weatherData }: { weatherData: FullWeatherData }) => {
    const { current } = weatherData.current;
    return (
        <div className="py-4">
            <div className="text-center pb-4">
                <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
                    <MapPin className="h-7 w-7 text-primary" />
                    <span>{weatherData.locationName}</span>
                </CardTitle>
                <CardDescription className="text-lg">
                    {format(fromUnixTime(current.dt), 'EEEE, MMMM d')}
                </CardDescription>
            </div>
            <div className="flex items-center justify-center text-7xl font-bold my-4">
                {getWeatherIcon(current.weather[0].icon, current.weather[0].main)}
                <span className="ml-4">{Math.round(current.temp)}°C</span>
            </div>
            <p className="capitalize text-center text-2xl text-muted-foreground -mt-4 mb-6">{current.weather[0].description}</p>
            <div className="grid grid-cols-2 gap-4 text-center text-muted-foreground">
                <div className="flex items-center justify-center gap-2 bg-secondary p-3 rounded-lg">
                    <Droplets className="w-5 h-5" />
                    <span>Humidity: {current.humidity}%</span>
                </div>
                <div className="flex items-center justify-center gap-2 bg-secondary p-3 rounded-lg">
                    <Wind className="w-5 h-5" />
                    <span>Wind: {current.wind_speed.toFixed(1)} m/s</span>
                </div>
            </div>
        </div>
    );
};

const HistoryWeather = ({ weatherData }: { weatherData: FullWeatherData }) => {
    return (
       <div className="py-4">
         <h3 className="text-center text-xl font-semibold mb-4 flex items-center justify-center gap-2">
           <History className="h-5 w-5" />
           <span>Past 2 Days</span>
         </h3>
         <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
            {weatherData.historical.map((day, index) => (
                <CarouselItem key={day.dt} className="basis-1/2 md:basis-1/3">
                    <Card className="flex flex-col items-center justify-center p-4 h-full bg-secondary">
                        <p className="font-semibold text-sm">{format(fromUnixTime(day.dt), 'EEE, MMM d')}</p>
                        {getWeatherIcon(day.weather[0].icon, day.weather[0].main, 'sm')}
                        <p className="text-lg font-bold">{Math.round(day.temp)}°C</p>
                    </Card>
                </CarouselItem>
            ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
         </Carousel>
       </div>
    );
};

const ForecastWeather = ({ weatherData }: { weatherData: FullWeatherData }) => {
    return (
       <div className="py-4">
         <h3 className="text-center text-xl font-semibold mb-4 flex items-center justify-center gap-2">
           <Calendar className="h-5 w-5" />
           <span>7-Day Forecast</span>
         </h3>
         <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
            {weatherData.current.daily.slice(1).map((day) => (
                <CarouselItem key={day.dt} className="basis-1/2 md:basis-1/3">
                     <Card className="flex flex-col items-center justify-center p-4 h-full bg-secondary">
                        <p className="font-semibold text-sm">{format(fromUnixTime(day.dt), 'EEE, MMM d')}</p>
                        {getWeatherIcon(day.weather[0].icon, day.weather[0].main, 'sm')}
                        <p className="text-lg font-bold">{Math.round(day.temp.day)}°C</p>
                        <p className="text-sm text-muted-foreground">{Math.round(day.temp.night)}°C</p>
                    </Card>
                </CarouselItem>
            ))}
            </CarouselContent>
             <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
         </Carousel>
       </div>
    );
}

const WeatherSkeleton = () => {
    return (
        <div className="h-[370px] space-y-4 py-4">
            <div className="text-center space-y-2">
                <Skeleton className="h-8 w-3/5 mx-auto rounded-lg" />
                <Skeleton className="h-6 w-2/5 mx-auto rounded-lg" />
            </div>
            <div className="flex items-center justify-center my-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-12 w-24 ml-4 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-1/2 mx-auto rounded-lg" />
            <div className="grid grid-cols-2 gap-4 pt-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>
             <div className="grid grid-cols-2 gap-4 pt-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
            </div>
        </div>
    )
}

export const Weather = memo(WeatherComponent);
