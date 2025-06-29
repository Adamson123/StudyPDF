import { useCallback, useContext, useState } from "react";
import { ViewerContext } from "../viewer/Viewer";
import { useRouter } from "next/navigation";
import { saveQuiz } from "@/lib/quizStorage";
import { v4 as uuidv4 } from "uuid";
import {
  getPDFTexts,
  splitChunks,
  splitTexts,
} from "../../../utils/pdfTextUtils";
import { saveFlashcard } from "@/lib/flashcardStorage";
import { env } from "@/env";
import useGenerateDataWithOpenAI from "@/hooks/useGenerateDataWithOpenAI";

function useGenerateData<T>({
  numOfPages,
  type,
  getPrompt,
  amountOfData,
  title,
}: {
  getPrompt: (amountOfDataToGenerate: number) => string;
  numOfPages: number;
  type: "quiz" | "flashcard";
  amountOfData: number;
  title: string;
}) {
  const [range, setRange] = useState({ from: 1, to: numOfPages });
  const { pdfInfo } = useContext(ViewerContext);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();
  const { generateDataWithOpenAI } = useGenerateDataWithOpenAI();

  const getAmountOfDataToGenerate = (
    chunks: string[],
    index: number,
    generatedData: T[],
  ) => {
    let amountOfDataToGenerate = !index
      ? Math.floor(amountOfData / chunks.length) +
        (amountOfData % chunks.length)
      : Math.floor(amountOfData / chunks.length);

    if (index === chunks.length - 1) {
      const remainingData = amountOfData - generatedData.length;
      amountOfDataToGenerate = remainingData;
    }

    console.log(
      `📝 Generating ${amountOfDataToGenerate} data for chunk ${
        index + 1
      }/${chunks.length}`,
    );
    return amountOfDataToGenerate;
  };

  const handleSaveAndRedirect = useCallback(
    async (data: T[]) => {
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
      const text = chunks[index] as string;
      console.log(`⏳ Sending chunk ${index + 1}/${chunks.length}`);

      const amountOfDataToGenerate = getAmountOfDataToGenerate(
        chunks,
        index,
        response,
      );
      const data = await generateDataWithOpenAI({
        text: text,
        prompt: getPrompt(amountOfDataToGenerate),
        expect: "objectResponse",
        arrayLength: chunks.length,
        index,
      });

      if (!data.error && data.length) {
        // Skip if no data generated
        response = response.length ? [...response, ...data] : data;
        setData(response);
      }

      if (data.error) error = "error";
    }

    if (error) {
      if (response.length) {
        setError(`An Error occured while generating ${type}`);
      } else {
        setError(`Error generating ${type}`);
      }
      return;
    }

    console.log(response);
    await handleSaveAndRedirect(response);
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
