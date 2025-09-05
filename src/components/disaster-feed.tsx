
'use client';

import { useEffect, useState } from 'react';
import Parser from 'rss-parser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Rss, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type FeedItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  creator?: string;
};

async function getFeed(): Promise<FeedItem[]> {
    const parser = new Parser<Record<string, unknown>, { creator: string; }>({
      customFields: {
        item: ['dc:creator'],
      },
    });

    // CORS proxy to avoid browser-side restrictions
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const feedUrl = 'https://www.gdacs.org/rss.aspx';
    
    const feed = await parser.parseURL(`${proxyUrl}${encodeURIComponent(feedUrl)}`);
    return feed.items.filter(item => !item.title?.includes("GDACS RSS information"));
}

export function DisasterFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeed() {
      try {
        setLoading(true);
        const feedItems = await getFeed();
        setItems(feedItems.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch RSS feed:", err);
        setError("Could not fetch disaster alerts. The source may be temporarily unavailable.");
      } finally {
        setLoading(false);
      }
    }
    loadFeed();
  }, []);

  if (loading) {
    return (
      <>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="flex flex-col shadow-sm">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="flex-grow space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-6 w-20" />
            </CardFooter>
          </Card>
        ))}
      </>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1 sm:col-span-2 lg:col-span-3 bg-destructive/10 border-destructive">
        <CardHeader className="flex flex-row items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <CardTitle>Failed to Load News</CardTitle>
            <CardDescription className="text-destructive/80">{error}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      {items.map((item: FeedItem, index: number) => {
        const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'No date';
        const creator = item.creator || 'GDACS';
        
        return (
          <Card
            key={item.link || index}
            className="flex flex-col shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle className="flex items-start gap-2">
                <Rss className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <span>{item.title || 'Untitled Update'}</span>
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
            <CardFooter>
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link href={item.link || '#'} target="_blank" rel="noopener noreferrer">
                  Read More
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </>
  );
}
