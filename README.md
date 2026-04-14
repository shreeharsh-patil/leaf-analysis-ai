# Leaf Analysis - Local Setup

This is a Next.js 15 application powered by Genkit and Gemini for plant disease detection.

## Prerequisites

- Node.js (v18 or later)
- An API key from [Google AI Studio](https://aistudio.google.com/)

## Local Development Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`.
   - Add your `GOOGLE_GENAI_API_KEY` to the `.env` file.

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

4. **Run Genkit Developer UI (Optional):**
   If you want to debug or test the AI flows directly:
   ```bash
   npm run genkit:dev
   ```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **AI Engine:** Genkit with Google Generative AI (Gemini 2.5 Flash)
- **UI Components:** ShadCN UI & Tailwind CSS
- **Icons:** Lucide React
