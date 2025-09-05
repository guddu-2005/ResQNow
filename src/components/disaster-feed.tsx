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
};

async function getFeed() {
  try {
    const parser = new Parser<Record<string, unknown>, { creator: string }>({
      customFields: {
        item: ['dc:creator'],
      },
    });

    const feed = await parser.parseURL('https://www.gdacs.org/rss.aspx');
    // The default GDACS feed includes a "GDACS RSS information" item which we don't want to display.
    return feed.items.filter(item => !item.title?.includes("GDACS RSS information")).slice(0, 3);
  } catch (error) {
    console.error("Failed to fetch RSS feed:", error);
    return [];
  }
}

export async function DisasterFeed() {
  const items = await getFeed();

  if (items.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-3">
        <CardHeader>
          <CardTitle>Latest News & Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load disaster feed. Please check back later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {items.map((item) => {
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
