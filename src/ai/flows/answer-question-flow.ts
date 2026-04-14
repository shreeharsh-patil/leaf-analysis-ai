'use server';

/**
 * @fileOverview A Genkit flow to answer user questions about a plant disease diagnosis.
 *
 * - answerQuestion - A function that takes the disease context and a user question, and returns an answer.
 * - AnswerQuestionInput - The input type for the answerQuestion function.
 * - AnswerQuestionOutput - The return type for the answerQuestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnswerQuestionInputSchema = z.object({
  diseaseName: z.string().describe('The name of the plant disease.'),
  summary: z.string().describe('A summary of the disease.'),
  treatments: z.array(z.string()).describe('A list of suggested treatments.'),
  question: z.string().describe('The user\'s question about the disease.'),
});
export type AnswerQuestionInput = z.infer<typeof AnswerQuestionInputSchema>;

const AnswerQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question.'),
});
export type AnswerQuestionOutput = z.infer<typeof AnswerQuestionOutputSchema>;

export async function answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
  return answerQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionPrompt',
  input: { schema: AnswerQuestionInputSchema },
  output: { schema: AnswerQuestionOutputSchema },
  prompt: `You are an expert botanist and plant pathologist. A user has received a diagnosis for their plant and has a follow-up question.

  Here is the context of the diagnosis:
  - Disease Name: {{{diseaseName}}}
  - Disease Summary: {{{summary}}}
  - Suggested Treatments:
  {{#each treatments}}
  - {{{this}}}
  {{/each}}

  Here is the user's question:
  "{{{question}}}"

  Please provide a helpful and concise answer to the user's question based on the provided context. Do not provide information outside of the context of the plant disease.`,
});

const answerQuestionFlow = ai.defineFlow(
  {
    name: 'answerQuestionFlow',
    inputSchema: AnswerQuestionInputSchema,
    outputSchema: AnswerQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
