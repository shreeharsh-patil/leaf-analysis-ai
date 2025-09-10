'use server';

/**
 * @fileOverview An AI flow for analyzing an image of a leaf to identify the plant and diagnose its health.
 *
 * - analyzeImage - A function that takes a leaf image and returns an analysis.
 * - AnalyzeImageInput - The input type for the analyzeImage function.
 * - AnalyzeImageOutput - The return type for the analyzeImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  identification: z.object({
    isPlant: z.boolean().describe('Whether or not the image contains a plant.'),
    commonName: z.string().describe('The common name of the identified plant.'),
    latinName: z.string().describe('The Latin name of the identified plant.'),
  }),
  diagnosis: z.object({
    isHealthy: z.boolean().describe('Whether or not the plant appears to be healthy.'),
    disease: z.string().optional().describe('The name of the disease, if the plant is not healthy.'),
    confidence: z.number().describe('The confidence score of the diagnosis, from 0.0 to 1.0.'),
  }),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: { schema: AnalyzeImageInputSchema },
  output: { schema: AnalyzeImageOutputSchema },
  prompt: `You are an expert botanist and plant pathologist. You will act as a modern deep learning CNN model to analyze the provided image.

  1.  **Feature Extraction**: Analyze the image for key visual features like spots, discoloration, texture, and shape.
  2.  **Identification**: Based on the extracted features, identify the plant species. If it's not a plant, indicate that.
  3.  **Diagnosis**: Classify the plant's health. Determine if it's healthy or shows signs of a disease from your knowledge base of over 80,000 diseases.
  4.  **Output**: If a disease is present, provide its name and a confidence score (0.0 to 1.0) for your diagnosis.

  Use the following image as the primary source for your analysis.

  Photo: {{media url=photoDataUri}}`,
});

const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
