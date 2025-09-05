
'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LifeBuoy } from "lucide-react";
import { motion } from 'framer-motion';

export default function FirstAidPage() {
  const firstAidGuides = [
    {
      type: "Earthquake",
      steps: [
        "Drop, Cover, and Hold On: Drop to your hands and knees. Cover your head and neck with your arms. Hold on to any sturdy shelter.",
        "Check for Injuries: Once the shaking stops, check yourself and others for injuries. Provide first aid for any minor injuries.",
        "Stay Away from Damaged Areas: Keep away from damaged buildings, walls, and power lines.",
        "Be Prepared for Aftershocks: Aftershocks are smaller earthquakes that can follow the main shock.",
      ],
    },
    {
      type: "Flood",
      steps: [
        "Move to Higher Ground: Immediately move to higher ground. Do not wait for instructions.",
        "Avoid Floodwaters: Do not walk, swim, or drive through floodwaters. Just six inches of moving water can knock you down.",
        "Listen to Emergency Information: Tune in to your local news for emergency information and evacuation orders.",
        "Be Aware of Contamination: Floodwater can be contaminated with sewage, chemicals, and other hazardous materials.",
      ],
    },
    {
      type: "Fire",
      steps: [
        "Know Your Escape Routes: Have at least two ways out of every room in your house.",
        "Crawl Low Under Smoke: If you encounter smoke, stay low to the ground and crawl to your exit.",
        "Feel Doors Before Opening: Before opening a door, feel it with the back of your hand. If it is hot, do not open it.",
        "Stop, Drop, and Roll: If your clothes catch fire, stop what you are doing, drop to the ground, and roll over and over to smother the flames.",
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-12 md:px-6 lg:py-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mx-auto max-w-3xl">
        <motion.div className="space-y-4 text-center" variants={itemVariants}>
            <LifeBuoy className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            First Aid Guides
          </h1>
          <p className="text-muted-foreground md:text-xl">
            Essential knowledge for emergency situations.
          </p>
        </motion.div>

        <motion.div className="mt-12" variants={itemVariants}>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {firstAidGuides.map((guide) => (
              <AccordionItem key={guide.type} value={guide.type} className="bg-card shadow-lg rounded-xl border-none transition-shadow hover:shadow-xl">
                <AccordionTrigger className="px-6 py-4 text-lg font-bold hover:no-underline rounded-t-xl">
                  {guide.type}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <ul className="list-decimal list-inside space-y-3 text-muted-foreground">
                    {guide.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </motion.div>
  );
}
