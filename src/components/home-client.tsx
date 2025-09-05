
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Wind, Thermometer, Cloud} from 'lucide-react';
import {useEffect, useState} from 'react';
import {getWeatherByCoords} from '@/services/weather';
import { SearchBar } from './SearchBar';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map-view').then((mod) => mod.MapView), {
  ssr: false,
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

type Location = {
  latitude: number;
  longitude: number;
}

export function HomeClient({ children }: { children: React.ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [searchedPlace, setSearchedPlace] = useState<string>('');


  const handleLocationSearch = (lat: number, lon: number, placeName: string) => {
    const newCenter: [number, number] = [lat, lon];
    setLocation({ latitude: lat, longitude: lon });
    setMapCenter(newCenter);
    setMarkerPosition(newCenter);
    setSearchedPlace(placeName);
  };

  useEffect(() => {
    const fetchInitialData = async (lat: number, lon: number) => {
      try {
        const weatherData = await getWeatherByCoords(lat, lon);
        setWeather(weatherData);
        if(!markerPosition) {
          setMapCenter([lat, lon]);
          setMarkerPosition([lat, lon]);
          setSearchedPlace(weatherData.name);
        }
      } catch (err) {
        setError('Could not fetch weather data.');
        console.error(err);
      }
    };
    
    if (location) {
        fetchInitialData(location.latitude, location.longitude);
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchInitialData(latitude, longitude);
        },
        (err) => {
          setError('Please enable location access to see local weather and disaster alerts.');
          console.error(err);
          // Fallback to default location if permission is denied
          fetchInitialData(mapCenter[0], mapCenter[1]);
          setSearchedPlace('India');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      // Fallback to default location
      fetchInitialData(mapCenter[0], mapCenter[1]);
      setSearchedPlace('India');
    }
  }, [location]);

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
               <MapView center={mapCenter} markerPosition={markerPosition} placeName={searchedPlace} />
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
             {children}
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
