import { config } from 'dotenv';
config();

import '@/ai/flows/generate-disease-summary.ts';
import '@/ai/flows/suggest-treatments-for-disease.ts';
import '@/ai/flows/analyze-image-flow.ts';
import '@/ai/flows/answer-question-flow.ts';
