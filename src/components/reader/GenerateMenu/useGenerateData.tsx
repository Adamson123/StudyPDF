import { useCallback, useContext, useState } from "react";
import { ViewerContext } from "../viewer/Viewer";
import { useRouter } from "next/navigation";
import { saveQuiz } from "@/lib/quizStorage";
import { v4 as uuidv4 } from "uuid";
import { getPDFTexts, splitChunks, splitTexts } from "./utils";
import { saveFlashcard } from "@/lib/flashcardStorage";
import { env } from "@/env";

function useGenerateData<T>({
  numOfPages,
  type,
  userPrompt,
  getPrompt,
  amountOfData,
  title,
}: {
  getPrompt: (amountOfDataEach: number) => string;
  numOfPages: number;
  type: "quiz" | "flashcard";
  userPrompt: string;
  amountOfData: number;
  title: string;
}) {
  const [range, setRange] = useState({ from: 1, to: numOfPages });
  const { pdfInfo } = useContext(ViewerContext);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  const generateDataWithOpenAI = useCallback(
    async (
      text: string,
      index: number,
      chunks: string[],
      generatedData: T[],
    ) => {
      let amountOfDataEach = !index
        ? Math.floor(amountOfData / chunks.length) +
          (amountOfData % chunks.length)
        : Math.floor(amountOfData / chunks.length);

      if (index === chunks.length - 1) {
        const remainingData = amountOfData - generatedData.length;
        amountOfDataEach = remainingData;
      }

      console.log(
        `📝 Generating ${amountOfDataEach} data for chunk ${
          index + 1
        }/${chunks.length}`,
      );

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
            content: getPrompt(amountOfDataEach),
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
        const output = data.choices?.[0]?.message?.content || "error";

        if (output === "error") return { error: "Error generating data" };

        let trimmedOutput = [];
        try {
          trimmedOutput = JSON.parse(
            output.replace("```json", "").replace("```", "").trim(),
          );
          console.log(`✅ Chunk ${index + 1} saved.`);
          return trimmedOutput;
        } catch (error) {
          console.error(`❌ Error parsing JSON for chunk ${index + 1}:`, error);
          console.error("Raw output:", output);
          return { error: "Error generating data😥" };
        }
      } catch (err) {
        console.error(`❌ Error on chunk ${index + 1}:`, err);
        return { error: "Error generating data😥" };
      }
    },
    [amountOfData, userPrompt, data.length],
  );

  const handleSaveAndRedirect = useCallback(
    async (data: T[]) => {
      console.log("Saving with data", data);
      const id = uuidv4();

      if (!data.length) return; // No data to save

      setRange({ from: 1, to: numOfPages });
      if (type === "quiz") {
        saveQuiz({ id, title, questionsToSave: data as any });
        router.push(`/quiz/${id}`);
      } else {
        saveFlashcard({ id, title, cardsToSave: data as any });
        router.push(`/flashcard/${id}`);
      }
    },
    [pdfInfo.name, numOfPages, router, title],
  );

  const generateData = useCallback(async () => {
    setIsGenerating(true);
    let response: T[] = [];
    const pdfTexts = await getPDFTexts(pdfInfo.url, range); // Get texts from PDF
    const chunks = splitChunks(splitTexts(pdfTexts), amountOfData); // Break chunks if needed
    let error = "";

    for (let index = 0; index < chunks.length; index++) {
      const text = chunks[index];
      console.log(`⏳ Sending chunk ${index + 1}/${chunks.length}`);

      const data = await generateDataWithOpenAI(
        text as string,
        index,
        chunks,
        response,
      );
      if (!data.error && data.length) {
        // Skip if no data generated
        response = response.length ? [...response, ...data] : data;
        setData(response);
      }

      if (data.error) error = "error";

      if (index < chunks.length - 1) {
        console.log("Sleeping for 5 seconds to avoid rate limits...");
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    if (error) {
      if (response.length) {
        setError("An Error occured while generating data");
      } else {
        setError("Error generating data");
      }
      return;
    }

    console.log(response);
    await handleSaveAndRedirect(response);
    // setIsGenerating(false);
    // return response;
  }, [
    amountOfData,
    generateDataWithOpenAI,
    handleSaveAndRedirect,
    pdfInfo.url,
    range,
  ]);

  const handleTryAgain = useCallback(async () => {
    setError("");
    await generateData();
  }, [generateData]);

  const handleContinue = useCallback(() => {
    setError("");
    setIsGenerating(false);
    handleSaveAndRedirect(data);
  }, [handleSaveAndRedirect, data]);

  const handleCancel = useCallback(() => {
    setError("");
    setIsGenerating(false);
    setData([]);
  }, []);

  return {
    handleTryAgain,
    handleContinue,
    handleCancel,
    isGenerating,
    generateData,
    range,
    setRange,
    setError,
    error,
    data,
  };
}

export default useGenerateData;
