"use server";

import { generateDiseaseSummary } from "@/ai/flows/generate-disease-summary";
import { suggestTreatmentsForDisease } from "@/ai/flows/suggest-treatments-for-disease";

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
