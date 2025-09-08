'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a summary of a plant disease,
 * including common causes and symptoms. It takes the disease name as input and returns a structured
 * object with summary, causes, and symptoms.
 *
 * @exports generateDiseaseSummary - The main function to generate the disease summary.
 * @exports GenerateDiseaseSummaryInput - The input type for the generateDiseaseSummary function.
 * @exports GenerateDiseaseSummaryOutput - The output type for the generateDiseaseSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema for the disease name
const GenerateDiseaseSummaryInputSchema = z.object({
  diseaseName: z.string().describe('The name of the plant disease to summarize.'),
});
export type GenerateDiseaseSummaryInput = z.infer<typeof GenerateDiseaseSummaryInputSchema>;

// Define the output schema for the disease summary
const GenerateDiseaseSummaryOutputSchema = z.object({
  summary: z.string().describe('A short summary of the disease.'),
  causes: z.array(z.string()).describe('A list of common causes for the disease.'),
  symptoms: z.array(z.string()).describe('A list of common symptoms for the disease.'),
});
export type GenerateDiseaseSummaryOutput = z.infer<typeof GenerateDiseaseSummaryOutputSchema>;

// Define the main function to generate the disease summary
export async function generateDiseaseSummary(input: GenerateDiseaseSummaryInput): Promise<GenerateDiseaseSummaryOutput> {
  return generateDiseaseSummaryFlow(input);
}

// Define the prompt for generating the disease summary
const generateDiseaseSummaryPrompt = ai.definePrompt({
  name: 'generateDiseaseSummaryPrompt',
  input: { schema: GenerateDiseaseSummaryInputSchema },
  output: { schema: GenerateDiseaseSummaryOutputSchema },
  prompt: `You are an expert in plant diseases. For the disease named {{{diseaseName}}}, provide a concise summary, a list of common causes, and a list of common symptoms.`,
});

// Define the Genkit flow for generating the disease summary
const generateDiseaseSummaryFlow = ai.defineFlow(
  {
    name: 'generateDiseaseSummaryFlow',
    inputSchema: GenerateDiseaseSummaryInputSchema,
    outputSchema: GenerateDiseaseSummaryOutputSchema,
  },
  async input => {
    const { output } = await generateDiseaseSummaryPrompt(input);
    return output!;
  }
);
