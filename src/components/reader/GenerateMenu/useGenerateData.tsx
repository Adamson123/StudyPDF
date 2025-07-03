import { useCallback, useContext, useState } from "react";
import { ViewerContext } from "../viewer/Viewer";
import { useRouter } from "next/navigation";
import { saveQuiz } from "@/lib/quizStorage";
import { v4 as uuidv4 } from "uuid";
import { splitChunks, splitTexts } from "../../../utils/pdfTextUtils";
import { saveFlashcard } from "@/lib/flashcardStorage";
import useGenerateDataWithOpenAI from "@/hooks/useGenerateDataWithOpenAI";
import useGetPDFTexts from "@/hooks/useGetPDFTexts";

function useGenerateData<T>({
  numOfPages,
  type,
  getPrompt,
  amountOfData,
  title,
  selectedSummaries = [],
}: {
  getPrompt: (amountOfDataToGenerate: number) => string;
  numOfPages: number;
  type: "quiz" | "flashcard" | "summaryQuestion";
  selectedSummaries?: string[];
  amountOfData: number;
  title: string;
}) {
  const [range, setRange] = useState({ from: 1, to: Math.min(numOfPages, 17) });
  const { pdfData } = useContext(ViewerContext);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();
  const { generateDataWithOpenAI } = useGenerateDataWithOpenAI();
  const { getPDFTexts } = useGetPDFTexts();
  const [lastPDfBeforeErrorIndex, setLastPDfBeforeErrorIndex] =
    useState<number>(0);

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
      if (type === "quiz" || type === "summaryQuestion") {
        saveQuiz({ id, title, questionsToSave: data as any });
        router.push(`/quiz/${id}`);
      } else {
        saveFlashcard({ id, title, cardsToSave: data as any });
        router.push(`/flashcard/${id}`);
      }
    },
    [type !== "summaryQuestion" && pdfData?.name, numOfPages, router, title],
  );

  const generateData = useCallback(async () => {
    setIsGenerating(true);
    let response: T[] = data.length ? data : [];
    const pdfTexts = await getPDFTexts(range); // Get texts from PDF
    //TODO: IMprove Here
    let chunks: string[] = [];

    if (type === "summaryQuestion") {
      chunks = selectedSummaries;
    } else {
      splitChunks(splitTexts(pdfTexts), amountOfData); // Break chunks if needed
    }
    console.log({ chunks });

    let error = "";

    for (let index = lastPDfBeforeErrorIndex; index < chunks.length; index++) {
      const text = chunks[index] as string;
      console.log({ text });

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

      //if no error occurred and data is generated, append to response
      if (!data.error && data.length) {
        // Skip if no data generated
        response = response.length ? [...response, ...data] : data;
        setData(response);
      }

      // If an error occurred, set the last index before the error
      if (data.error) {
        setLastPDfBeforeErrorIndex(index);
        error = "error";
      }
    }

    if (error && response.length < amountOfData) {
      if (response.length) {
        setError(`An Error occured while generating ${type}`);
      } else {
        setError(`Error generating ${type}`);
      }
      return;
    }

    await handleSaveAndRedirect(response);
  }, [
    amountOfData,
    generateDataWithOpenAI,
    handleSaveAndRedirect,
    pdfData?.url,
    range,
    data,
    lastPDfBeforeErrorIndex,
    selectedSummaries,
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
