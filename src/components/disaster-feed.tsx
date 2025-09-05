import Parser from 'rss-parser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Rss } from 'lucide-react';

type FeedItem = {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  creator: string;
  'georss:point'?: string;
};

// Haversine formula to calculate distance between two lat/lon points
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getFeed(latitude?: number, longitude?: number) {
  try {
    const parser = new Parser<Record<string, unknown>, { creator: string; 'georss:point': string; }>({
      customFields: {
        item: ['dc:creator', 'georss:point'],
      },
    });

    const feed = await parser.parseURL('https://www.gdacs.org/rss.aspx');
    let items = feed.items.filter(item => !item.title?.includes("GDACS RSS information"));

    if (latitude && longitude) {
        const nearbyItems = items.filter(item => {
            if (item['georss:point']) {
                const [itemLat, itemLon] = item['georss:point'].split(' ').map(Number);
                const distance = getDistance(latitude, longitude, itemLat, itemLon);
                // Filter for alerts within a 500km radius
                return distance <= 500;
            }
            return false;
        });
        // If nearby alerts are found, show them, otherwise show the 3 latest global alerts
        if(nearbyItems.length > 0) {
            return nearbyItems.slice(0, 3);
        }
    }
    
    return items.slice(0, 3);
  } catch (error) {
    console.error("Failed to fetch RSS feed:", error);
    return [];
  }
}

export async function DisasterFeed({ latitude, longitude }: { latitude?: number, longitude?: number}) {
  const items = await getFeed(latitude, longitude);

  if (items.length === 0) {
    return (
      <Card className="col-span-1 sm:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Latest News & Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No disaster alerts found for your location. Showing latest global alerts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {items.map((item: any) => {
        const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'No date';
        const creator = item.creator || 'GDACS';
        
        return (
          <Card
            key={item.link}
            className="flex flex-col shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle className="flex items-start gap-2">
                <Rss className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <span>{item.title}</span>
              </CardTitle>
              <CardDescription>
                {creator} - {pubDate}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground text-sm line-clamp-3">
                {item.contentSnippet || 'No description available.'}
              </p>
            </CardContent>
            <div className="p-6 pt-0">
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link href={item.link!} target="_blank" rel="noopener noreferrer">
                  Read More
                </Link>
              </Button>
            </div>
          </Card>
        );
      })}
    </>
  );
}
