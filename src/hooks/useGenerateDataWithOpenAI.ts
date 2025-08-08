import { env } from "@/env";
import { delay } from "@/utils";
import parseAIJsonResponse from "@/utils/parseAIJsonResponse";
import { is } from "node_modules/cypress/types/bluebird";
import { useCallback, useRef, useState } from "react";

/**
 * @returns An object containing the function to generate data with OpenAI and a function to cancel the data generation.
 */
export default function useGenerateDataWithOpenAI() {
  const [controller, setController] = useState<AbortController | null>(null);
  const isCancelled = useRef(false);

  /**
   * @param index - The index of the current chunk being processed. Used to apply a delay between requests to avoid rate limits.
   * @param text - The text content to be processed by the AI model.
   * @param prompt - The prompt to be sent to the AI model, guiding it on how to process the text.
   * @param expect - Specifies the expected type of response from the AI model, either a string or an object.
   * @returns The generated data or an error object if the generation fails.
   */
  const generateDataWithOpenAI = useCallback(
    async ({
      //  arrayLength,
      index,
      text,
      prompt,
      expect,
    }: {
      text: string;
      prompt: string;
      expect: "stringResponse" | "objectResponse";
      arrayLength: number;
      index: number;
    }) => {
      isCancelled.current = false; // Reset cancellation state for each call
      if (index > 0) {
        console.log("Sleeping for 5 seconds to avoid rate limits...");
        await delay(); // Delay to avoid rate
      }

      // ✅ NEW ABORT CONTROLLER PER CALL SET
      const abortCtrl = new AbortController();
      setController(abortCtrl);

      const url = env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
      const apiKey = env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };

      const body = {
        messages: [
          {
            role: "user",
            content: prompt,
          },
          { role: "user", content: text },
        ],
        max_tokens: 4096,
        temperature: 0.8,
        top_p: 1,
        model: "gpt-4o",
      };

      try {
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
          signal: abortCtrl.signal,
        });

        const data = await res.json();

        if (!res.ok) {
          console.error(`❌ Error on chunk :`, data);
          return { error: "Error generating data😥" };
        }

        const output = data.choices?.[0]?.message?.content;
        if (!output) return { error: "Error generating data" };

        // Return raw string if expect is stringRes
        if (expect === "stringResponse") {
          return output;
        }

        // Return valid object if expect is objectResponse
        try {
          const trimmedOutput = parseAIJsonResponse(output);
          return trimmedOutput;
        } catch (error) {
          console.error(`❌ Error parsing JSON for chunk :`, error);
          console.error("Raw output:", output);
          return { error: "Error generating data😥" };
        }
      } catch (err) {
        console.error(`❌ Error on chunk :`, err);
        return { error: "Error generating data😥" };
      }
    },
    [],
  );

  const cancelDataGenerationWithOpenAI = () => {
    controller?.abort("Data generation cancelled by user.");
    isCancelled.current = true;
  };

  return {
    generateDataWithOpenAI,
    cancelDataGenerationWithOpenAI,
    setController,
    isCancelled,
  };
}
