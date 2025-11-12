'use server';

/**
 * @fileOverview A Genkit flow to generate a 7-day improvement plan for a plant disease.
 *
 * - generate7DayPlan - A function that takes a disease name and returns a 7-day plan.
 * - Generate7DayPlanInput - The input type for the generate7DayPlan function.
 * - Generate7DayPlanOutput - The return type for the generate7DayPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const Generate7DayPlanInputSchema = z.object({
  diseaseName: z.string().describe('The name of the plant disease.'),
  commonName: z.string().describe('The common name of the plant.'),
  treatments: z.array(z.string()).describe('A list of suggested treatments.'),
});
export type Generate7DayPlanInput = z.infer<typeof Generate7DayPlanInputSchema>;

export const DayPlanSchema = z.object({
  day: z.number().describe('The day number (1-7).'),
  title: z.string().describe('A short title for the day\'s tasks.'),
  description: z.string().describe('A detailed description of the tasks for the day.'),
  icon: z.string().optional().describe('An emoji representing the day\'s main activity.'),
});
export type DayPlan = z.infer<typeof DayPlanSchema>;


const Generate7DayPlanOutputSchema = z.object({
  plan: z.array(DayPlanSchema).describe('A 7-day improvement plan with daily tasks.'),
});
export type Generate7DayPlanOutput = z.infer<typeof Generate7DayPlanOutputSchema>;

export async function generate7DayPlan(input: Generate7DayPlanInput): Promise<Generate7DayPlanOutput> {
  return generate7DayPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generate7DayPlanPrompt',
  input: { schema: Generate7DayPlanInputSchema },
  output: { schema: Generate7DayPlanOutputSchema },
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
  - Add a relevant emoji for each day's task (e.g., ✂️ for pruning,💧for watering, 観察 for monitoring).
  - Day 1 should focus on initial setup and treatment application.
  - Mid-week should be about monitoring and continued care.
  - Day 7 should be a final assessment and advice for ongoing care.
  - Be encouraging and supportive in your tone.
  
  Generate a JSON object for the 7-day plan.`,
});

const generate7DayPlanFlow = ai.defineFlow(
  {
    name: 'generate7DayPlanFlow',
    inputSchema: Generate7DayPlanInputSchema,
    outputSchema: Generate7DayPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
