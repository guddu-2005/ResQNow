
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Wind, Thermometer, Cloud, Loader2} from 'lucide-react';
import {useEffect, useState, useCallback} from 'react';
import {getWeatherByCoords} from '@/services/weather';
import { SearchBar } from './SearchBar';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-muted flex items-center justify-center rounded-lg"><Loader2 className="h-8 w-8 animate-spin" /></div>,
});

type WeatherData = {
  name: string;
  main: {
    temp: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
  wind: {
    speed: number;
  };
};

type LocationState = {
  lat: number;
  lon: number;
  name: string;
};

export function HomeClient() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const weatherData = await getWeatherByCoords(lat, lon);
      setWeather(weatherData);
      // Don't update location name from weather data to avoid extra re-renders
    } catch (err) {
      setError('Could not fetch weather data.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude, name: 'Your Location' });
          fetchWeather(latitude, longitude);
        },
        (err) => {
          setError('Please enable location access to see local weather and disaster alerts.');
          console.error(err);
          // Fallback to a default location if permission is denied
          const defaultLat = 20.5937;
          const defaultLon = 78.9629;
          setLocation({ lat: defaultLat, lon: defaultLon, name: 'India' });
          fetchWeather(defaultLat, defaultLon); 
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      // Fallback to a default location
      const defaultLat = 20.5937;
      const defaultLon = 78.9629;
      setLocation({ lat: defaultLat, lon: defaultLon, name: 'India' });
      fetchWeather(defaultLat, defaultLon);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on initial mount

  const handleLocationSearch = (lat: number, lon: number, placeName: string) => {
    setLocation({ lat, lon, name: placeName });
    fetchWeather(lat, lon);
  };

  return (
    <>
      <section id="map" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl font-headline">
              Interactive Disaster Map
            </h2>
             <SearchBar onSearch={handleLocationSearch} />
          </div>
          <Card className="w-full shadow-lg">
            <CardContent className="p-0">
               {location ? (
                <MapView center={[location.lat, location.lon]} placeName={location.name} />
               ) : (
                <div className="h-[400px] w-full bg-muted flex items-center justify-center rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
               )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        id="risk-indicators"
        className="w-full py-12 md:py-24 lg:py-32 bg-muted"
      >
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl font-headline mb-8">
            Live Weather
          </h2>
          {error && (
            <div className="text-center text-red-500">
              <p>{error}</p>
            </div>
          )}
          {weather && !error ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="text-center shadow-sm">
                <CardHeader>
                  <Cloud className="h-10 w-10 mx-auto text-accent" />
                  <CardTitle className="mt-4">{location?.name || weather.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {weather.weather[0].main}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {weather.weather[0].description}
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-sm">
                <CardHeader>
                  <Thermometer className="h-10 w-10 mx-auto text-accent" />
                  <CardTitle className="mt-4">Temperature</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{weather.main.temp}°C</p>
                  <p className="text-sm text-muted-foreground">Current temperature</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-sm">
                <CardHeader>
                  <Wind className="h-10 w-10 mx-auto text-accent" />
                  <CardTitle className="mt-4">Wind Speed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{weather.wind.speed} m/s</p>
                   <p className="text-sm text-muted-foreground">Current wind speed</p>
                </CardContent>
              </Card>
            </div>
          ) : (
             !error && <div className="text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto"/></div>
          )}
        </div>
      </section>
    </>
  );
}
