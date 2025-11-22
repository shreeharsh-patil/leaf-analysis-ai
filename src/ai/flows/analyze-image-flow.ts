'use server';

/**
 * @fileOverview An AI flow for analyzing an image of a leaf to identify the plant and diagnose its health.
 *
 * - analyzeImage - A function that takes a leaf image and returns a comprehensive analysis,
 *   including diagnosis, summary, causes, symptoms, treatments, and a 7-day plan.
 * - AnalyzeImageInput - The input type for the analyzeImage function.
 * - AnalyzeImageOutput - The return type for the analyzeImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { suggestTreatmentsForDisease } from './suggest-treatments-for-disease';
import { generateDiseaseSummary } from './generate-disease-summary';


const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const DiagnosisSchema = z.object({
    disease: z.string().optional().describe('The name of the disease, if the plant is not healthy.'),
    confidence: z.number().describe('The confidence score of the diagnosis, from 0.0 to 1.0.'),
});

export const DayPlanSchema = z.object({
  day: z.number().describe('The day number (1-7).'),
  title: z.string().describe('A short title for the day\'s tasks.'),
  description: z.string().describe('A detailed description of the tasks for the day.'),
  icon: z.string().optional().describe('An emoji representing the day\'s main activity.'),
});
export type DayPlan = z.infer<typeof DayPlanSchema>;

const AnalyzeImageOutputSchema = z.object({
  identification: z.object({
    isPlant: z.boolean().describe('Whether or not the image contains a plant.'),
    commonName: z.string().describe('The common name of the identified plant.'),
    latinName: z.string().describe('The Latin name of the identified plant.'),
  }),
  diagnosis: z.object({
    isHealthy: z.boolean().describe('Whether or not the plant appears to be healthy.'),
    primary: DiagnosisSchema.describe('The most likely diagnosis.'),
    otherPossibilities: z.array(DiagnosisSchema).describe('A list of other possible diagnoses, if any.'),
  }),
  diseaseInfo: z.object({
      summary: z.string().describe('A short summary of the disease.'),
      causes: z.array(z.string()).describe('A list of common causes for the disease.'),
      symptoms: z.array(z.string()).describe('A list of common symptoms for the disease.'),
      treatments: z.array(z.string()).describe('A list of potential treatments for the disease.'),
  }).optional(),
  sevenDayPlan: z.array(DayPlanSchema).optional().describe('A 7-day improvement plan for the plant.'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const initialAnalysisPrompt = ai.definePrompt({
  name: 'initialAnalysisPrompt',
  input: { schema: AnalyzeImageInputSchema },
  output: { schema: z.object({
    identification: z.object({
      isPlant: z.boolean().describe('Whether or not the image contains a plant.'),
      commonName: z.string().describe('The common name of the identified plant.'),
      latinName: z.string().describe('The Latin name of the identified plant.'),
    }),
    diagnosis: z.object({
      isHealthy: z.boolean().describe('Whether or not the plant appears to be healthy.'),
      primary: DiagnosisSchema.describe('The most likely diagnosis.'),
      otherPossibilities: z.array(DiagnosisSchema).describe('A list of other possible diagnoses, up to 2 others, ordered by confidence.'),
    }),
  }) },
  prompt: `You are an expert botanist and plant pathologist. You will act as a modern deep learning CNN model to analyze the provided image.

  1.  **Feature Extraction**: Analyze the image for key visual features like spots, discoloration, texture, and shape.
  2.  **Identification**: Based on the extracted features, identify the plant species. If it's not a plant, indicate that.
  3.  **Diagnosis**: Classify the plant's health. Determine if it's healthy or shows signs of a disease from your knowledge base of over 80,000 diseases. If a disease is present, provide the most likely diagnosis as 'primary'. If there are other possibilities, provide up to two other potential diseases in the 'otherPossibilities' array, sorted by confidence.

  Use the following image as the primary source for your analysis.

  Photo: {{media url=photoDataUri}}`,
});

const generate7DayPlanPrompt = ai.definePrompt({
  name: 'generate7DayPlanPrompt',
  input: { schema: z.object({
    diseaseName: z.string().describe('The name of the plant disease.'),
    commonName: z.string().describe('The common name of the plant.'),
    treatments: z.array(z.string()).describe('A list of suggested treatments.'),
  }) },
  output: { schema: z.object({
    plan: z.array(DayPlanSchema).describe('A 7-day improvement plan with daily tasks.'),
  }) },
  prompt: `You are an expert botanist creating a 7-day recovery plan for a plant.

  Plant Details:
  - Species: {{{commonName}}}
  - Diagnosed with: {{{diseaseName}}}
  - Suggested Treatments: {{#each treatments}}- {{{this}}}\n{{/each}}

  Your Task:
  Create a simple, actionable 7-day plan to help the user treat their plant and nurse it back to health.
  - The plan should be easy for a beginner to follow.
  - Each day should have a clear title and a description of the actions to take.
  - Incorporate the suggested treatments into the plan. Start with the most critical actions first.
  - Include general plant care tips (e.g., watering, light, monitoring) appropriate for recovery.
  - Add a relevant emoji for each day's task (e.g., ✂️ for pruning,💧for watering, 👀 for monitoring).
  - Day 1 should focus on initial setup and treatment application.
  - Mid-week should be about monitoring and continued care.
  - Day 7 should be a final assessment and advice for ongoing care.
  - Be encouraging and supportive in your tone.
  
  Generate a JSON object for the 7-day plan.`,
});


const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async input => {
    const { output: initialAnalysis } = await initialAnalysisPrompt(input);

    if (!initialAnalysis || initialAnalysis.diagnosis.isHealthy || !initialAnalysis.diagnosis.primary.disease) {
      return {
        ...initialAnalysis!,
      };
    }

    const diseaseName = initialAnalysis.diagnosis.primary.disease;
    const commonName = initialAnalysis.identification.commonName;

    const [summaryResult, treatmentsResult] = await Promise.all([
      generateDiseaseSummary({ diseaseName }),
      suggestTreatmentsForDisease({ diseaseName }),
    ]);
    
    const { output: planResult } = await generate7DayPlanPrompt({ 
        diseaseName, 
        commonName,
        treatments: treatmentsResult.treatments,
    });

    return {
      ...initialAnalysis,
      diseaseInfo: {
        summary: summaryResult.summary,
        causes: summaryResult.causes,
        symptoms: summaryResult.symptoms,
        treatments: treatmentsResult.treatments,
      },
      sevenDayPlan: planResult?.plan,
    };
  }
);
