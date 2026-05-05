'use server';

/**
 * @fileOverview An AI flow for analyzing an image of a leaf to identify the plant and diagnose its health.
 *
 * - analyzeImage - A function that takes a leaf image and returns a comprehensive analysis,
 *   including diagnosis, visual observations, symptoms, treatments, and a recovery plan.
 */

import { ai } from '@/ai/genkit';
import {
  type AnalyzeImageInput,
  AnalyzeImageInputSchema,
  type AnalyzeImageOutput,
  AnalyzeImageOutputSchema,
} from '@/app/types';

export async function analyzeImage(
  input: AnalyzeImageInput
): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const analyzeImagePrompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: { schema: AnalyzeImageInputSchema },
  output: { schema: AnalyzeImageOutputSchema },
  prompt: `You are an expert botanist and plant pathologist. Analyze the plant leaf in the image.

  1.  **Identification**: Identify the plant species (common and latin names). If not a plant, set isPlant=false.
  2.  **Visual Findings**: Identify specific markers like "chlorotic spots", "interveinal yellowing", etc.
  3.  **Diagnosis**: Classify health. If unhealthy, provide primary diagnosis, confidence, and severity.
  4.  **Actionable Insights**:
      *   Summary of the condition.
      *   Causes (environmental, nutritional, etc.).
      *   Symptoms.
      *   Treatments (specific, actionable steps).
      *   Prevention (long-term advice).
  5.  **7-Day Recovery Plan (REQUIRED if unhealthy)**:
      *   Provide a day-by-day roadmap (Day 1-7) to help the plant recover.
      *   Include a short title, icon, and description for each day.

  Photo: {{media url=photoDataUri}}`,
});

const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeImagePrompt(input);
    return output!;
  }
);
