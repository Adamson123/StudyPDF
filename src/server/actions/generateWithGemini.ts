"use server";

import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

let abortController: AbortController | null = null;
const generateWithGemini = async ({
  prompt,
  text,
  // signal,
}: {
  prompt: string;
  text: string;
  // signal: AbortSignal;
}) => {
  console.log("Generating with Gemini AI...>>>>>>");
  abortController = new AbortController();

  try {
    const result = await model.generateContent(
      [
        {
          text,
        },
        prompt,
      ],
      { signal: abortController.signal },
    );
    const textResponse = result.response.text();
    if (abortController.signal.aborted) {
      console.log("Generation was aborted by user.");
      return { error: "Generation cancelled by user." };
    }
    console.log("Gemini response:", textResponse);
    return textResponse;
  } catch (error) {
    console.error(error, "errrr");
    return { error: "Error generating data" };
  }
};

export const cancelGeminiGeneration = async () => {
  if (abortController) {
    abortController.abort("Generation cancelled by user.");
    abortController = null; // Reset the controller after aborting
    console.log("Gemini generation cancelled.");
  }
};

export default generateWithGemini;
