'use server';

/**
 * @fileOverview Provides a Genkit flow to suggest treatments for a given plant disease.
 *
 * - suggestTreatmentsForDisease - A function that accepts a disease name and returns a list of potential treatments.
 * - SuggestTreatmentsForDiseaseInput - The input type for the suggestTreatmentsForDisease function.
 * - SuggestTreatmentsForDiseaseOutput - The return type for the suggestTreatmentsForDisease function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Simulated database of treatments
const treatmentDatabase: Record<string, string[]> = {
  "early blight": [
    "Remove affected leaves and stems.",
    "Ensure good air circulation around the plants.",
    "Apply a copper-based fungicide.",
  ],
  "late blight": [
    "Destroy infected plants to prevent spread.",
    "Apply fungicides preventively, especially in cool, moist conditions.",
    "Choose resistant plant varieties.",
  ],
  "powdery mildew": [
    "Increase air circulation and reduce humidity.",
    "Spray with a solution of potassium bicarbonate or neem oil.",
    "Remove and destroy infected plant parts.",
  ],
  "black spot": [
    "Prune and destroy infected leaves and canes.",
    "Water at the base of the plant to keep leaves dry.",
    "Apply a fungicide containing chlorothalonil or myclobutanil.",
  ],
  "rust": [
    "Remove and destroy infected leaves at the first sign of disease.",
    "Avoid overhead watering.",
    "Apply a sulfur or copper-based fungicide.",
  ],
};

const getTreatmentsTool = ai.defineTool(
  {
    name: 'getTreatmentsForDisease',
    description: 'Get a list of treatments for a specific plant disease from the database.',
    inputSchema: z.object({ disease: z.string().describe('The name of the disease') }),
    outputSchema: z.array(z.string()).describe('A list of treatments.'),
  },
  async (input) => {
    const disease = input.disease.toLowerCase();
    return treatmentDatabase[disease] || [];
  }
);


const SuggestTreatmentsForDiseaseInputSchema = z.object({
  diseaseName: z.string().describe('The name of the plant disease.'),
});
export type SuggestTreatmentsForDiseaseInput = z.infer<typeof SuggestTreatmentsForDiseaseInputSchema>;

const SuggestTreatmentsForDiseaseOutputSchema = z.object({
  treatments: z.array(z.string()).describe('A list of potential treatments for the disease.'),
});
export type SuggestTreatmentsForDiseaseOutput = z.infer<typeof SuggestTreatmentsForDiseaseOutputSchema>;

export async function suggestTreatmentsForDisease(input: SuggestTreatmentsForDiseaseInput): Promise<SuggestTreatmentsForDiseaseOutput> {
  return suggestTreatmentsForDiseaseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTreatmentsForDiseasePrompt',
  input: {schema: SuggestTreatmentsForDiseaseInputSchema},
  output: {schema: SuggestTreatmentsForDiseaseOutputSchema},
  tools: [getTreatmentsTool],
  prompt: `You are an expert in plant diseases. Your task is to provide treatment suggestions for a given plant disease.

  First, use the 'getTreatmentsForDisease' tool to fetch the treatments for the disease named: {{{diseaseName}}}

  - If the tool returns a list of treatments, output those treatments.
  - If the tool returns an empty list, use your general knowledge to suggest 3-4 common treatments for "{{{diseaseName}}}".
  `,
});

const suggestTreatmentsForDiseaseFlow = ai.defineFlow(
  {
    name: 'suggestTreatmentsForDiseaseFlow',
    inputSchema: SuggestTreatmentsForDiseaseInputSchema,
    outputSchema: SuggestTreatmentsForDiseaseOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
