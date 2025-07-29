import { useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { saveQuiz } from "@/lib/quizStorage";
import { v4 as uuidv4 } from "uuid";
import { saveFlashcard } from "@/lib/flashcardStorage";
import useGenerateDataWithOpenAI from "@/hooks/useGenerateDataWithOpenAI";
import useGetPDFTexts from "@/hooks/useGetPDFTexts";
import { ViewerContext } from "@/components/reader/viewer/Viewer";
import { splitChunks, splitTextsToChunk } from "@/utils/pdfTextUtils";
import { is } from "node_modules/cypress/types/bluebird";

/**
 *
 * @param numOfPages - The total number of pages in the PDF document.
 * @param type - The type of data to generate, can be "quiz", "flashcard", or "summaryQuestion".
 * @param questionFrom - The source of the questions, can be "summary" or "pdf".
 * @param getPrompt - A function that returns a prompt string based on the amount of data to generate.
 * @param amountOfData - The total amount of data to generate.
 * @param title - The title for the generated data, used when saving the quiz or flashcard.
 * @param selectedSummaries - An optional array of summaries to use when generating questions from summary.
 * @returns An object containing functions and state related to data generation, including error handling, data saving, and UI state management.
 */

function useGenerateData<T>({
  numOfPages,
  type,
  getPrompt,
  amountOfData: totalAmountOfData,
  title,
  selectedSummaries = [],
  questionFrom = "pdf",
}: {
  getPrompt: (amountOfDataToGenerate: number) => string;
  numOfPages: number;
  type: "quiz" | "flashcards";
  questionFrom?: "summary" | "pdf";
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
  const {
    generateDataWithOpenAI,
    cancelDataGenerationWithOpenAI,
    setController,
  } = useGenerateDataWithOpenAI();
  const { getPDFTexts } = useGetPDFTexts();
  const [lastPDfBeforeErrorIndex, setLastPDfBeforeErrorIndex] =
    useState<number>(0);
  const [isAborted, setIsAborted] = useState(false);

  const getAmountOfDataOnEachReq = (
    chunks: string[],
    index: number,
    generatedData: T[],
  ) => {
    /*
     * Calculate the amount of data to generate for each chunk based on the total amount of data and the number of chunks.
     * If it is the last chunk, it will take the remaining data to reach the total amount.
     * This ensures that we are not exceeding or below the total amount of data.
     */

    let amountOfDataToGenerate = Math.floor(totalAmountOfData / chunks.length);

    if (index === chunks.length - 1) {
      const remainingData = totalAmountOfData - generatedData.length;
      amountOfDataToGenerate = remainingData;
    }

    console.log(
      `📝 Generating ${amountOfDataToGenerate} data for chunk ${
        index + 1
      }/${chunks.length}`,
    );
    return amountOfDataToGenerate;
  };

  // Function to handle saving data and redirecting to the quiz or flashcard page
  const handleSaveAndRedirect = useCallback(
    async (data: T[]) => {
      const id = uuidv4();

      if (!data.length) return; // No data to save

      setRange({ from: 1, to: numOfPages });
      if (type === "quiz" || questionFrom === "summary") {
        saveQuiz({ id, title, questionsToSave: data as any });
        router.push(`/quiz/${id}`);
      } else {
        saveFlashcard({ id, title, cardsToSave: data as any });
        router.push(`/flashcard/${id}`);
      }
    },
    [type, questionFrom, pdfData?.name, numOfPages, router, title],
  );

  const generateData = useCallback(async () => {
    setIsAborted(false);
    setIsGenerating(true);
    let response: T[] = data.length ? data : [];
    const pdfTexts = await getPDFTexts(range); // Get texts from PDF
    //TODO: IMprove Here
    let chunks: string[] = [];

    if (questionFrom === "summary") {
      chunks = selectedSummaries;
    } else {
      chunks = splitChunks(splitTextsToChunk(pdfTexts), totalAmountOfData); // Break chunks if needed
    }

    let error = "";

    for (let index = lastPDfBeforeErrorIndex; index < chunks.length; index++) {
      console.log(`⏳ Sending chunk ${index + 1}/${chunks.length}`);
      const text = chunks[index] as string;
      const amountOfDataToGenerate = getAmountOfDataOnEachReq(
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
        break;
      }

      if (isAborted) {
        break;
      }
    }

    // If the response is empty and an error occurred, set the error message
    if (error && response.length < totalAmountOfData) {
      if (response.length) {
        setError(`An Error occured while generating ${type}`);
      } else {
        setError(`Error generating ${type}`);
      }
      return;
    }

    setController(null); // Clear the controller after generation
    if (isAborted) return;

    // If we have generated enough data, reset the last index before error
    await handleSaveAndRedirect(response);
  }, [
    totalAmountOfData,
    generateDataWithOpenAI,
    handleSaveAndRedirect,
    pdfData?.url,
    range,
    data,
    lastPDfBeforeErrorIndex,
    selectedSummaries,
    isAborted,
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
    cancelDataGenerationWithOpenAI();
    setIsAborted(true); // Set aborted state to true
  }, [cancelDataGenerationWithOpenAI]);

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
