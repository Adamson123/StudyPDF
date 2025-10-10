import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import useGenerateWithAI from "@/hooks/useGenerateWithAI";
import useGetPDFTexts from "@/hooks/useGetPDFTexts";
import {
    splitChunksByQuestionLimit,
    splitTextIntoChunksBySize,
} from "@/utils/textChunkUtils";
import { useDispatch } from "react-redux";
import { addOneSetOfFlashcards } from "@/redux/features/flashcardsSlice";
import { addOneSetOfQuizzes } from "@/redux/features/quizzesSlice";

/**
 *
 * @param numOfPages - The total number of pages in the PDF document.
 * @param type - The type of data to generate, can be "quiz", "flashcard"
 * @param questionFrom - The source of the questions, can be "summary" or "pdf".
 * @param getPrompt - A function that returns a prompt string based on the amount of data to generate.
 * @param amountOfData - The total amount of data to generate.
 * @param title - The title for the generated data, used when saving the quiz or flashcard.
 * @param selectedSummaries - An optional array of summaries to use when generating questions from summary.
 * @param selectedAI - The AI model to use for data generation, defaulting to "gemini".
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
    selectedAI,
}: {
    getPrompt: (amountOfDataToGenerate: number) => string;
    numOfPages: number;
    type: "quiz" | "flashcards";
    questionFrom?: "summary" | "pdf";
    selectedSummaries?: string[];
    amountOfData: number;
    title: string;
    selectedAI: AvailableAIOptions;
}) {
    const [range, setRange] = useState({
        from: 1,
        to: Math.min(numOfPages, 17),
    });
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [data, setData] = useState<T[]>([]);
    const [error, setError] = useState("");
    const router = useRouter();
    const {
        generateDataWithAI,
        cancelDataGenerationWithAI,
        setController,
        isCancelled,
    } = useGenerateWithAI();
    const { getPDFTexts } = useGetPDFTexts();
    const [lastPDfBeforeErrorIndex, setLastPDfBeforeErrorIndex] =
        useState<number>(0);
    const dispatch = useDispatch();

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

        let amountOfDataToGenerate = Math.floor(
            totalAmountOfData / chunks.length,
        );

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
    const handleSaveAndRedirect = async (data: T[]) => {
        const id = uuidv4();

        if (!data.length) return; // No data to save

        setRange({ from: 1, to: numOfPages });
        if (type === "quiz" || questionFrom === "summary") {
            dispatch(addOneSetOfQuizzes({ id, title, questions: data as any }));
            router.push(`/quiz/${id}`);
        } else {
            dispatch(addOneSetOfFlashcards({ id, title, cards: data as any }));
            router.push(`/flashcard/${id}`);
        }
    };

    const generateData = async () => {
        setError(""); // Reset error state
        setIsGenerating(true);
        let response: T[] = data.length ? data : [];
        const pdfTexts = await getPDFTexts(range); // Get texts from PDF
        //TODO: IMprove Here
        let chunks: string[] = [];

        // Decide how to split the text based on the question source
        if (questionFrom === "summary") {
            // Use provided summaries as chunks
            chunks = splitChunksByQuestionLimit(
                selectedSummaries,
                totalAmountOfData,
            );
        } else {
            // Split PDF text into chunks based on size
            chunks = splitChunksByQuestionLimit(
                splitTextIntoChunksBySize(pdfTexts),
                totalAmountOfData,
            );
        }

        let error = "";

        // Loop through each chunk and generate data
        for (
            let index = lastPDfBeforeErrorIndex;
            index < chunks.length;
            index++
        ) {
            console.log(`⏳ Sending chunk ${index + 1}/${chunks.length}`);
            const text = chunks[index] as string;

            const amountOfDataToGenerate = getAmountOfDataOnEachReq(
                chunks,
                index,
                response,
            );

            const data = await generateDataWithAI({
                text: text,
                prompt: getPrompt(amountOfDataToGenerate),
                expect: "objectResponse",
                arrayLength: chunks.length,
                index,
                selectedAI,
            });

            //if no error occurred and data is generated, append to response
            if (!data.error && data.length) {
                // Skip if no data generated
                response = response.length ? [...response, ...data] : data;
                setData(response);
            }

            // If an error occurred, set the last index before the error
            if (data.error) {
                console.log("There wasan error");
                setLastPDfBeforeErrorIndex(index);
                error = "error";
                break;
            }

            //if the generation was cancelld, break the loop
            if (isCancelled.current) {
                console.log("There wasan error");
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
            console.log("Should redirect to another page");

            return;
        }

        setController(null); // Clear the controller after generation
        // if the generation was cancelled, do not proceed
        if (isCancelled.current) {
            return;
        }

        // If we have generated enough data, reset the last index before error
        await handleSaveAndRedirect(response);
    };

    const handleTryAgain = async () => {
        setError("");
        await generateData();
    };

    const handleContinue = () => {
        setError("");
        setIsGenerating(false);
        handleSaveAndRedirect(data);
    };

    const handleCancel = () => {
        setError("");
        setIsGenerating(false);
        setData([]);
        cancelDataGenerationWithAI();
        // setIsAborted(true); // Set aborted state to true
    };

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
