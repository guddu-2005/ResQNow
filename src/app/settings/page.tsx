
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { Loader2, Moon, Sun, Bell, User as UserIcon, LogOut, KeyRound, Languages } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type AlertSettings = {
  critical: boolean;
  high: boolean;
  medium: boolean;
  low: boolean;
};

export default function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    critical: true,
    high: true,
    medium: true,
    low: false,
  });
  const [language, setLanguage] = useState('en');

  const fetchSettings = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const settingsDocRef = doc(db, 'users', userId);
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.alerts) setAlertSettings(data.alerts);
        if (data.theme) setTheme(data.theme);
        if (data.language) setLanguage(data.language);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Don't show a toast on initial fetch error, might be offline
    } finally {
      setIsLoading(false);
    }
  }, [setTheme]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchSettings(user.uid);
      }
    }
  }, [user, authLoading, router, fetchSettings]);

  const handleAlertsChange = async (key: keyof AlertSettings, value: boolean) => {
    if (!user) return;
    const newSettings = { ...alertSettings, [key]: value };
    setAlertSettings(newSettings);
    try {
      await setDoc(doc(db, 'users', user.uid), { alerts: newSettings }, { merge: true });
      toast({
        title: "Success",
        description: "Alert preferences updated.",
      });
    } catch (error) {
       console.error("Error saving alert settings:", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save alert preferences.",
      });
    }
  };

  const handleThemeChange = async (isDarkMode: boolean) => {
    if (!user) return;
    const newTheme = isDarkMode ? 'dark' : 'light';
    setTheme(newTheme);
     try {
      await setDoc(doc(db, 'users', user.uid), { theme: newTheme }, { merge: true });
       toast({
        title: "Success",
        description: `Theme changed to ${newTheme}.`,
      });
    } catch (error) {
       console.error("Error saving theme settings:", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save theme preference.",
      });
    }
  };

  const handleLanguageChange = async (newLanguage: string) => {
    if (!user) return;
    setLanguage(newLanguage);
    try {
      await setDoc(doc(db, 'users', user.uid), { language: newLanguage }, { merge: true });
      toast({
        title: "Success",
        description: "Language preference updated. The change will be reflected in a future version.",
      });
    } catch (error) {
      console.error("Error saving language settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save language preference.",
      });
    }
  };


  const handleChangePassword = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Password Reset Email Sent",
        description: `An email has been sent to ${user.email} with instructions to reset your password.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
      return null; // or a message telling to login
  }

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, type: 'spring', stiffness: 100 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <motion.div 
      className="container mx-auto max-w-4xl px-4 py-12 md:px-6 lg:py-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="space-y-4 mb-12 text-center" variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
          Settings
        </h1>
        <p className="text-muted-foreground md:text-xl">
          Manage your notification preferences and account settings.
        </p>
      </motion.div>

      <motion.div className="grid gap-8 md:grid-cols-2" variants={containerVariants}>
        {/* Left Column */}
        <div className="space-y-8">
            {/* Profile Card */}
            <motion.div variants={itemVariants}>
            <Card className="shadow-lg rounded-xl transition-all hover:shadow-xl">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <UserIcon className="h-5 w-5 text-primary"/>
                    <span>Profile</span>
                </CardTitle>
                <CardDescription>Manage your personal account information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user.email || ''} readOnly disabled />
                </div>
                <Button onClick={handleChangePassword} variant="outline" className="w-full">
                    <KeyRound className="mr-2 h-4 w-4"/>
                    Change Password
                </Button>
                </CardContent>
            </Card>
            </motion.div>
            
            {/* Account Card */}
            <motion.div variants={itemVariants}>
            <Card className="shadow-lg rounded-xl transition-all hover:shadow-xl">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <LogOut className="h-5 w-5 text-destructive"/>
                    <span>Account</span>
                </CardTitle>
                <CardDescription>Log out from your account.</CardDescription>
                </CardHeader>
                <CardContent>
                <Button onClick={signOut} variant="destructive" className="w-full">
                    Sign Out
                </Button>
                </CardContent>
            </Card>
            </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
            {/* Appearance Card */}
            <motion.div variants={itemVariants}>
            <Card className="shadow-lg rounded-xl transition-all hover:shadow-xl">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    {theme === 'dark' ? <Moon className="h-5 w-5 text-primary"/> : <Sun className="h-5 w-5 text-primary"/>}
                    <span>Appearance</span>
                </CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={handleThemeChange}/>
                  </div>
                </CardContent>
            </Card>
            </motion.div>

            {/* Language Card */}
            <motion.div variants={itemVariants}>
            <Card className="shadow-lg rounded-xl transition-all hover:shadow-xl">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Languages className="h-5 w-5 text-primary"/>
                    <span>Language</span>
                </CardTitle>
                <CardDescription>Choose your preferred language.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                      <SelectItem value="or">Odia (ଓଡ଼ିଆ)</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
            </Card>
            </motion.div>

            {/* Alerts Card */}
            <motion.div variants={itemVariants}>
            <Card className="shadow-lg rounded-xl transition-all hover:shadow-xl">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Bell className="h-5 w-5 text-primary"/>
                    <span>Alert Notifications</span>
                </CardTitle>
                <CardDescription>Choose which types of alerts you want to receive.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <Label htmlFor="critical-alerts" className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-red-500"></span>
                    <span>Critical</span>
                    </Label>
                    <Switch id="critical-alerts" checked={alertSettings.critical} onCheckedChange={(val) => handleAlertsChange('critical', val)} />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="high-alerts" className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-orange-500"></span>
                    <span>High</span>
                    </Label>
                    <Switch id="high-alerts" checked={alertSettings.high} onCheckedChange={(val) => handleAlertsChange('high', val)} />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="medium-alerts" className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                    <span>Medium</span>
                    </Label>
                    <Switch id="medium-alerts" checked={alertSettings.medium} onCheckedChange={(val) => handleAlertsChange('medium', val)} />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="low-alerts" className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-green-500"></span>
                    <span>Low</span>
                    </Label>
                    <Switch id="low-alerts" checked={alertSettings.low} onCheckedChange={(val) => handleAlertsChange('low', val)} />
                </div>
                </CardContent>
            </Card>
            </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
