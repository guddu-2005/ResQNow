
'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DisasterFeed } from '@/components/disaster-feed';
import { motion } from 'framer-motion';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <motion.section
        className="w-full py-20 md:py-32 lg:py-40 xl:py-48 bg-gradient-to-b from-background to-secondary"
        variants={itemVariants}
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">
            <motion.div className="space-y-4" variants={itemVariants}>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline text-foreground">
                Rescue.ai
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Empowering communities to act fast, stay informed, and stay safe.
              </p>
            </motion.div>
            <motion.div className="space-x-4" variants={itemVariants}>
              <Button asChild size="lg" className="shadow-lg transition-transform active:scale-95 hover:scale-105">
                <Link href="/report">Report a Disaster</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild className="shadow-lg transition-transform active:scale-95 hover:scale-105">
                <Link href="/alerts">View Alerts</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="news"
        className="w-full py-20 md:py-24 lg:py-32 bg-background"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl font-headline mb-12 text-foreground">
            Latest News & Updates
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <DisasterFeed />
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
