
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import { HomeClient } from '@/components/home-client';
import { DisasterFeed } from '@/components/disaster-feed';
import { Card } from '@/components/ui/card';


export default function Home() {

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

      <HomeClient />

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
      
    </>
  );
}
