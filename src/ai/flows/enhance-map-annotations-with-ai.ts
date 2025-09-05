'use server';
/**
 * @fileOverview A flow that enhances map annotations with AI-generated insights from disaster reports and news feeds.
 *
 * - enhanceMapAnnotations - A function that enhances map annotations with AI-generated insights.
 * - EnhanceMapAnnotationsInput - The input type for the enhanceMapAnnotations function.
 * - EnhanceMapAnnotationsOutput - The return type for the enhanceMapAnnotations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceMapAnnotationsInputSchema = z.object({
  disasterReports: z.array(z.string()).describe('An array of disaster reports.'),
  newsFeeds: z.array(z.string()).describe('An array of news feed articles.'),
});
export type EnhanceMapAnnotationsInput = z.infer<
  typeof EnhanceMapAnnotationsInputSchema
>;

const EnhanceMapAnnotationsOutputSchema = z.object({
  enhancedAnnotations: z
    .string()
    .describe('Enhanced map annotations with AI-generated insights.'),
});
export type EnhanceMapAnnotationsOutput = z.infer<
  typeof EnhanceMapAnnotationsOutputSchema
>;

export async function enhanceMapAnnotations(
  input: EnhanceMapAnnotationsInput
): Promise<EnhanceMapAnnotationsOutput> {
  return enhanceMapAnnotationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceMapAnnotationsPrompt',
  input: {schema: EnhanceMapAnnotationsInputSchema},
  output: {schema: EnhanceMapAnnotationsOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing disaster reports and news feeds to enhance map annotations.

  Disaster Reports: {{{disasterReports}}}
  News Feeds: {{{newsFeeds}}}

  Based on the provided disaster reports and news feeds, generate enhanced map annotations that provide a concise overview of the overall situation in the specific area.
  Return the enhanced map annotations.
  `,
});

const enhanceMapAnnotationsFlow = ai.defineFlow(
  {
    name: 'enhanceMapAnnotationsFlow',
    inputSchema: EnhanceMapAnnotationsInputSchema,
    outputSchema: EnhanceMapAnnotationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
