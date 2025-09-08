"use server";

import { generateDiseaseSummary } from "@/ai/flows/generate-disease-summary";
import { suggestTreatmentsForDisease } from "@/ai/flows/suggest-treatments-for-disease";
import { answerQuestion, type AnswerQuestionInput } from "@/ai/flows/answer-question-flow";

/**
 * Fetches disease summary and treatment suggestions from AI flows.
 * @param diseaseName The name of the disease to look up.
 * @returns An object containing the disease summary and a list of treatments.
 */
export async function getDiseaseInfo(diseaseName: string) {
  try {
    const [summaryResult, treatmentsResult] = await Promise.all([
      generateDiseaseSummary({ diseaseName }),
      suggestTreatmentsForDisease({ diseaseName }),
    ]);

    return {
      summary: summaryResult.summary,
      treatments: treatmentsResult.treatments,
    };
  } catch (error) {
    console.error("Error fetching disease info:", error);
    // Propagate the error to be handled by the client
    throw new Error("Failed to fetch disease information from AI service.");
  }
}

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
