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

const reportFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name must be at most 50 characters."),
  location: z.string().min(5, "Please provide a more specific location.").max(100),
  disasterType: z.enum(["Earthquake", "Flood", "Fire", "Tornado", "Hurricane", "Other"]),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500, "Description must be at most 500 characters."),
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

  function onSubmit(data: ReportFormValues) {
    // Future Integration: Implement API call to submit disaster report to a backend service like Firebase Firestore.
    console.log(data);

    toast({
      title: "Report Submitted",
      description: "Thank you for helping your community. Your report has been received.",
    });

    form.reset();
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
        <div className="mx-auto max-w-2xl">
            <div className="space-y-2 text-center mb-12">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                Report a Disaster
                </h1>
                <p className="text-muted-foreground md:text-xl">
                Your report can help save lives. Please provide accurate information.
                </p>
            </div>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Disaster Report Form</CardTitle>
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
                                <Input placeholder="John Doe" {...field} />
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
                                <Input placeholder="e.g., Corner of Main St and 1st Ave, Springfield" {...field} />
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a disaster type" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
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
                                className="resize-y min-h-[100px]"
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
                        <Button type="submit" className="w-full">Submit Report</Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
