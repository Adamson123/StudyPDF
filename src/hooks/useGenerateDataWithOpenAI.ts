import { env } from "@/env";
import parseAIJsonResponse from "@/utils/parseAIJsonResponse";
import { useCallback } from "react";

export default function useGenerateDataWithOpenAI() {
  const delay = async () => {
    console.log("Sleeping for 5 seconds to avoid rate limits...");
    await new Promise((r) => setTimeout(r, 5000));
  };

  const generateDataWithOpenAI = useCallback(
    async ({
      arrayLength,
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
      if (index > 0) {
        await delay(); // Delay to avoid rate limits
      }
      console.log({ index, length1: arrayLength - 1 });

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

        // Return valid object if expect is objectRes
        // let trimmedOutput = [];
        try {
          // const cleanedOutput = output
          //   .replace(/^.*?Raw output:\s*/s, "") // Remove "Raw output:" and everything before it
          //   .replace(/```(?:json)?/g, "") // Remove all ``` or ```json
          //   .replace(/^\s*\/\/.*$/gm, "") // Remove JS-style comments like `// something`
          //   .replace(/^\s*\*\*?.*?\*\*?\s*$/gm, "") // Remove Markdown bold/italic lines
          //   .replace(/^\s*[\*\-+]\s.*$/gm, "") // Remove Markdown bullet points
          //   .replace(/^\s*\n/gm, "") // Remove blank lines
          //   .trim(); // Final cleanup of whitespace

          // let parsed;
          // try {
          //   parsed = JSON.parse(cleanedOutput);
          // } catch (err) {
          //   console.error("💥 Failed to parse cleaned output:", cleanedOutput);
          //   throw err;
          // }

          const trimmedOutput = parseAIJsonResponse(output);
          console.log(`✅ Chunk  saved.`);
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

  return { generateDataWithOpenAI };
}
