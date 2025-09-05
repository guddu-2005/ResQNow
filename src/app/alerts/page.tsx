
'use client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info, ShieldWarning } from "lucide-react";
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

export default function AlertsPage() {
  const alerts = [
    {
      id: "alert-001",
      title: "Severe Thunderstorm Warning",
      location: "Springfield County",
      time: "Issued at 4:30 PM",
      description: "A severe thunderstorm capable of producing large hail and damaging winds is moving through the area. Seek shelter immediately.",
      severity: "High",
    },
    {
      id: "alert-002",
      title: "Flash Flood Watch",
      location: "River Valley Area",
      time: "Effective until 10:00 PM",
      description: "Heavy rainfall is expected, which may lead to flash flooding in low-lying areas. Be prepared to move to higher ground.",
      severity: "Medium",
    },
    {
      id: "alert-003",
      title: "Air Quality Alert",
      location: "Metro City",
      time: "Until further notice",
      description: "Smoke from distant wildfires is causing poor air quality. Sensitive individuals should limit outdoor activities.",
      severity: "Low",
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

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'High':
        return {
          Icon: AlertTriangle,
          className: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400",
          iconColor: "text-red-500",
        };
      case 'Medium':
        return {
          Icon: ShieldWarning,
          className: "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400",
          iconColor: "text-orange-500",
        };
      case 'Low':
        return {
          Icon: Info,
          className: "border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-400",
          iconColor: "text-blue-500",
        };
      default:
        return {
          Icon: Info,
          className: "border-gray-500/50 bg-gray-500/10 text-gray-700 dark:text-gray-400",
          iconColor: "text-gray-500",
        };
    }
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
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Real-time Alerts
          </h1>
          <p className="text-muted-foreground md:text-xl">
            Stay informed about active threats in your area.
          </p>
        </motion.div>
        <motion.div 
          className="mt-12 space-y-6"
          variants={containerVariants}
        >
          {alerts.map((alert) => {
            const { Icon, className, iconColor } = getSeverityStyles(alert.severity);
            return (
              <motion.div key={alert.id} variants={itemVariants}>
                <Alert className={cn("shadow-lg rounded-lg transition-transform hover:scale-[1.02] hover:shadow-xl", className)}>
                  <Icon className={cn("h-5 w-5", iconColor)} />
                  <div className="flex flex-col sm:flex-row justify-between items-start ml-2 gap-2 sm:gap-4">
                      <div className="flex-grow">
                        <AlertTitle className="font-bold text-lg">{alert.title}</AlertTitle>
                        <AlertDescription className="mt-1">{alert.description}</AlertDescription>
                      </div>
                      <div className="text-left sm:text-right text-xs text-muted-foreground whitespace-nowrap pt-1 sm:pt-0">
                          <p>{alert.location}</p>
                          <p>{alert.time}</p>
                      </div>
                  </div>
                </Alert>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}
