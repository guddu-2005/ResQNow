
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-12 md:px-6 lg:py-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            User Dashboard
            </h1>
            <p className="text-muted-foreground md:text-xl">
            Welcome, {user.displayName || user.email}!
            </p>
        </div>

        <Card className="w-full max-w-2xl shadow-xl rounded-xl transition-all hover:shadow-2xl hover:scale-105">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                    <User className="h-7 w-7 text-primary"/>
                    <span>Coming Soon</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-lg bg-secondary">
                    <p className="text-lg font-medium text-foreground">
                        The user dashboard will be available here soon.
                    </p>
                    <p className="text-muted-foreground">
                        It will feature saved locations, active alerts for your areas, and your contribution history.
                    </p>
                </div>
            </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
