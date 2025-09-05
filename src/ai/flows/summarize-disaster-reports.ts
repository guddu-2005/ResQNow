// SummarizeDisasterReports
'use server';
/**
 * @fileOverview Summarizes submitted disaster reports using AI.
 *
 * - summarizeDisasterReports - A function that summarizes disaster reports.
 * - SummarizeDisasterReportsInput - The input type for the summarizeDisasterReports function.
 * - SummarizeDisasterReportsOutput - The return type for the summarizeDisasterReports function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDisasterReportsInputSchema = z.object({
  reports: z.array(
    z.object({
      name: z.string().describe('Name of the reporter.'),
      location: z.string().describe('Location of the disaster.'),
      disasterType: z.string().describe('Type of the disaster.'),
      description: z.string().describe('Description of the disaster.'),
    })
  ).describe('An array of disaster reports.'),
});
export type SummarizeDisasterReportsInput = z.infer<typeof SummarizeDisasterReportsInputSchema>;

const SummarizeDisasterReportsOutputSchema = z.object({
  summary: z.string().describe('A summary of the disaster reports.'),
});
export type SummarizeDisasterReportsOutput = z.infer<typeof SummarizeDisasterReportsOutputSchema>;

export async function summarizeDisasterReports(input: SummarizeDisasterReportsInput): Promise<SummarizeDisasterReportsOutput> {
  return summarizeDisasterReportsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDisasterReportsPrompt',
  input: {schema: SummarizeDisasterReportsInputSchema},
  output: {schema: SummarizeDisasterReportsOutputSchema},
  prompt: `You are an expert disaster analyst. Please summarize the following disaster reports to identify key issues and prioritize response efforts.\n\nDisaster Reports:\n{{#each reports}}\n- Name: {{this.name}}\n  Location: {{this.location}}\n  Disaster Type: {{this.disasterType}}\n  Description: {{this.description}}\n{{/each}}\n\nSummary:`,
});

const summarizeDisasterReportsFlow = ai.defineFlow(
  {
    name: 'summarizeDisasterReportsFlow',
    inputSchema: SummarizeDisasterReportsInputSchema,
    outputSchema: SummarizeDisasterReportsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
