
'use client';

import React, { useEffect, useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { fetchNews, NewsArticle } from '@/services/news';

const REFETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const NewsFeedComponent = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndSetNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const newsArticles = await fetchNews('disaster OR weather', 6);
      if (newsArticles.length === 0) {
        setError("Could not fetch disaster news at this moment. The source may be unavailable or there are no recent articles.");
      }
      setArticles(newsArticles);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while fetching news.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetNews();
    const intervalId = setInterval(fetchAndSetNews, REFETCH_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 100,
      },
    }),
  };
  
  return (
      <div>
        <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl font-headline mb-12 text-foreground">
            Latest News & Updates
        </h2>

        {loading ? (
             <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="flex flex-col rounded-xl shadow-md overflow-hidden">
                        <Skeleton className="h-48 w-full" />
                        <CardHeader>
                            <Skeleton className="h-4 w-1/4 rounded-lg" />
                            <Skeleton className="h-6 w-3/4 mt-2 rounded-lg" />
                            <Skeleton className="h-4 w-1/2 mt-2 rounded-lg" />
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                            <Skeleton className="h-4 w-full rounded-lg" />
                            <Skeleton className="h-4 w-5/6 rounded-lg" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        ) : error ? (
             <Card className="col-span-1 sm:col-span-2 lg:grid-cols-3 bg-destructive/10 border-destructive rounded-xl shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <div>
                        <CardTitle>Failed to Load News</CardTitle>
                        <CardDescription className="text-destructive/80">{error}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
        ) : (
             <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article, index) => (
                    <motion.div
                        key={article.url}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                    >
                        <Card className="flex flex-col rounded-xl shadow-md h-full transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden">
                           <div className="relative w-full h-48">
                             <Image 
                                src={article.urlToImage} 
                                alt={article.title} 
                                fill={true} 
                                objectFit="cover" 
                                className="bg-secondary"
                                unoptimized
                             />
                           </div>
                           <CardHeader>
                               {article.category && (
                                    <Badge variant="secondary" className="w-fit mb-2">{article.category}</Badge>
                               )}
                               <CardTitle className="text-lg leading-snug">
                                   <Link href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {article.title}
                                   </Link>
                               </CardTitle>
                               <CardDescription>
                                   {article.source.name} &middot; {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
                               </CardDescription>
                           </CardHeader>
                           <CardContent className="flex-grow">
                               <p className="text-muted-foreground text-sm line-clamp-3">
                                   {article.description}
                               </p>
                           </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        )}
      </div>
  )
}

export const NewsFeed = memo(NewsFeedComponent);

    