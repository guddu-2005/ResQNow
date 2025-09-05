import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Flame, Waves, Zap, Map, Newspaper } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const newsItems = [
    {
      id: 1,
      title: 'City Prepares for Hurricane Season with New Evacuation Routes',
      source: 'Local News Channel',
      time: '2h ago',
    },
    {
      id: 2,
      title: 'Wildfire Contained After Burning 500 Acres in National Forest',
      source: 'National News Wire',
      time: '8h ago',
    },
    {
      id: 3,
      title: 'Volunteers Needed for Flood Relief Efforts Downtown',
      source: 'Community Bulletin',
      time: '1d ago',
    },
  ];

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
                  <p className="text-sm">Real-time disaster tracking and resource locations.</p>
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
           {/* Placeholder for News Feed */}
           {/* Future Integration: News API for fetching real-time articles */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item) => (
              <Card key={item.id} className="flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-6 w-6 text-primary" />
                    <span>{item.title}</span>
                  </CardTitle>
                  <CardDescription>
                    {item.source} - {item.time}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm">Dummy description: This is a placeholder for the news article summary. More details will be shown here.</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="link" className="p-0 h-auto">Read More</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="risk-indicators" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl font-headline mb-8">
            Local Risk Indicators
          </h2>
          {/* Placeholder for Risk Indicators */}
          {/* Future Integration: Weather and geological APIs for real-time risk data */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="text-center shadow-sm">
              <CardHeader>
                <Zap className="h-10 w-10 mx-auto text-accent" />
                <CardTitle className="mt-4">Earthquake</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">Low</p>
                <p className="text-sm text-muted-foreground">Probability: 2%</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-sm">
              <CardHeader>
                <Waves className="h-10 w-10 mx-auto text-accent" />
                <CardTitle className="mt-4">Flood</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">Medium</p>
                <p className="text-sm text-muted-foreground">Probability: 15%</p>
              </CardContent>
            </Card>
            <Card className="text-center shadow-sm">
              <CardHeader>
                <Flame className="h-10 w-10 mx-auto text-accent" />
                <CardTitle className="mt-4">Fire</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">High</p>
                <p className="text-sm text-muted-foreground">Probability: 30%</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
