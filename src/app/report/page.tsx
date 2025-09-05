
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { motion } from 'framer-motion';

const reportFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must be at most 50 characters."),
  location: z.string().min(5, "Please provide a more specific location.").max(100),
  disasterType: z.enum(["Earthquake", "Flood", "Fire", "Tornado", "Hurricane", "Other"]),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500, "Description must be at most 500 characters."),
  media: z.any().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

export default function ReportPage() {
  const { toast } = useToast();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      name: "",
      location: "",
      description: "",
    },
  });

  const fileRef = form.register("media");

  function onSubmit(data: ReportFormValues) {
    console.log(data);
    toast({
      title: "Report Submitted Successfully!",
      description: "Thank you for helping your community. Your report has been received.",
      variant: 'default',
      className: 'bg-accent text-accent-foreground',
    });
    form.reset();
  }
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, type: 'spring', stiffness: 100 } },
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-12 md:px-6 lg:py-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
        <div className="mx-auto max-w-2xl">
            <div className="space-y-2 text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                Report a Disaster
                </h1>
                <p className="text-muted-foreground md:text-xl">
                Your report can help save lives. Please provide accurate information.
                </p>
            </div>

            <Card className="shadow-2xl rounded-xl">
                <CardHeader>
                    <CardTitle className="text-xl sm:text-2xl">Disaster Report Form</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} className="rounded-lg"/>
                            </FormControl>
                            <FormDescription>Please enter your full name.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Corner of Main St and 1st Ave, Springfield" {...field} className="rounded-lg"/>
                            </FormControl>
                            <FormDescription>
                                Provide a street address or a nearby landmark.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="disasterType"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Disaster Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger className="rounded-lg">
                                    <SelectValue placeholder="Select a disaster type" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-lg">
                                    <SelectItem value="Earthquake">Earthquake</SelectItem>
                                    <SelectItem value="Flood">Flood</SelectItem>
                                    <SelectItem value="Fire">Fire</SelectItem>
                                    <SelectItem value="Tornado">Tornado</SelectItem>
                                    <SelectItem value="Hurricane">Hurricane</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormDescription>
                                Choose the most accurate category for the incident.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Describe the situation, including any immediate dangers or people in need."
                                className="resize-y min-h-[120px] rounded-lg"
                                {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Be as detailed as possible.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                          control={form.control}
                          name="media"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Upload className="h-4 w-4" />
                                <span>Upload Images/Videos</span>
                              </FormLabel>
                              <FormControl>
                                <Input type="file" accept="image/*,video/*" multiple {...fileRef} className="rounded-lg file:text-primary file:font-semibold" />
                              </FormControl>
                              <FormDescription>
                                Please upload relevant images or videos of the disaster.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full text-lg py-6 rounded-lg shadow-lg transition-transform active:scale-95 hover:scale-105">Submit Report</Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </motion.div>
  );
}
