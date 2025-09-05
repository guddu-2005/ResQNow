
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { User, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            User Dashboard
            </h1>
            <p className="text-muted-foreground md:text-xl">
            Welcome, {user.displayName || user.email}!
            </p>
        </div>

        <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-6 w-6 text-primary"/>
                    <span>Coming Soon</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-lg bg-muted">
                    <p className="text-lg font-medium text-muted-foreground">
                        The user dashboard will be available here soon.
                    </p>
                    <p className="text-sm">
                        It will feature saved locations, active alerts for your areas, and your contribution history.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
