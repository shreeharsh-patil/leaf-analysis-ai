import { z } from 'zod';

export const DayPlanSchema = z.object({
  day: z.number().describe('The day number (1-7).'),
  title: z.string().describe('A short title for the day\'s tasks.'),
  description: z.string().describe('A detailed description of the tasks for the day.'),
  icon: z.string().optional().describe('An emoji representing the day\'s main activity.'),
});
export type DayPlan = z.infer<typeof DayPlanSchema>;

const DiagnosisSchema = z.object({
    disease: z.string().optional().describe('The name of the disease, if the plant is not healthy.'),
    confidence: z.number().describe('The confidence score of the diagnosis, from 0.0 to 1.0.'),
});

export const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

export const AnalyzeImageOutputSchema = z.object({
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
