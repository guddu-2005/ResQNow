import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function AlertsPage() {
  // Placeholder for real-time alerts
  // Future Integration: This data will be fetched from a disaster alert API or Firebase based on user location.
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

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Real-time Alerts
          </h1>
          <p className="text-muted-foreground md:text-xl">
            Stay informed about active threats in your area.
          </p>
        </div>
        <div className="mt-12 space-y-6">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.severity === 'High' ? 'destructive' : 'default'} className="shadow-md">
              <AlertTriangle className="h-4 w-4" />
              <div className="flex justify-between items-start">
                  <div>
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>{alert.description}</AlertDescription>
                  </div>
                  <div className="text-right text-xs text-muted-foreground whitespace-nowrap pl-4">
                      <p>{alert.location}</p>
                      <p>{alert.time}</p>
                  </div>
              </div>
            </Alert>
          ))}
        </div>
      </div>
    </div>
  );
}
