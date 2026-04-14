"use server";

import { answerQuestion, type AnswerQuestionInput } from "@/ai/flows/answer-question-flow";

/**
 * Answers a user's question about a plant disease.
 * @param input The input containing the disease context and the user's question.
 * @returns An object containing the AI's answer.
 */
export async function askQuestionAboutDisease(input: AnswerQuestionInput) {
  try {
    const result = await answerQuestion(input);
    return {
      answer: result.answer,
    };
  } catch (error) {
    console.error("Error answering question:", error);
    throw new Error("Failed to get an answer from the AI service.");
  }
}
