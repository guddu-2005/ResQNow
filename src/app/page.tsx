
'use client';

import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Map, Wind, Thermometer, Cloud, Rss} from 'lucide-react';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {getWeatherByCoords} from '@/services/weather';
import { DisasterFeed } from '@/components/disaster-feed';

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

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async position => {
          try {
            const {latitude, longitude} = position.coords;
            const weatherData = await getWeatherByCoords(latitude, longitude);
            setWeather(weatherData);
          } catch (err) {
            setError('Could not fetch weather data.');
            console.error(err);
          }
        },
        err => {
          setError('Please enable location access to see local weather.');
          console.error(err);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, []);

  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-headline">
                Rescue.ai
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Empowering communities to act fast, stay informed, and stay safe.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/report">Report a Disaster</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/alerts">View Alerts</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="map" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl font-headline mb-8">
            Interactive Disaster Map
          </h2>
          <Card className="w-full shadow-lg">
            <CardContent className="p-0">
              {/* Placeholder for Interactive Map */}
              {/* Future Integration: Google Maps API will be used here */}
              <div className="flex items-center justify-center bg-secondary rounded-lg aspect-[16/7] text-muted-foreground">
                <div className="text-center space-y-2">
                  <Map className="mx-auto h-12 w-12" />
                  <p className="font-medium">Interactive Map Will Go Here</p>
                  <p className="text-sm">
                    Real-time disaster tracking and resource locations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="news" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl font-headline mb-8">
            Latest News & Updates
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
             <DisasterFeed />
          </div>
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
                  <CardTitle className="mt-4">{weather.name}</CardTitle>
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
             !error && <p className="text-center">Loading weather data...</p>
          )}
        </div>
      </section>
    </>
  );
}
