'use server';

/**
 * @fileOverview Provides a Genkit flow to suggest treatments for a given plant disease.
 *
 * - suggestTreatmentsForDisease - A function that accepts a disease name and returns a list of potential treatments.
 * - SuggestTreatmentsForDiseaseInput - The input type for the suggestTreatmentsForDisease function.
 * - SuggestTreatmentsForDiseaseOutput - The return type for the suggestTreatmentsForDisease function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  prompt: `You are an expert in plant diseases and their treatments.

  Provide a list of potential treatments for the following disease:

  Disease: {{{diseaseName}}}

  Treatments:`, // Ensure the AI provides a treatments output with no leading characters.
});

const suggestTreatmentsForDiseaseFlow = ai.defineFlow(
  {
    name: 'suggestTreatmentsForDiseaseFlow',
    inputSchema: SuggestTreatmentsForDiseaseInputSchema,
    outputSchema: SuggestTreatmentsForDiseaseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
