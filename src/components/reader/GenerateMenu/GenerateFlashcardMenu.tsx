import {
  Dispatch,
  SetStateAction,
  useContext,
  useState,
  useCallback,
} from "react";
import { ViewerContext } from "../viewer/Viewer";
import { useRouter } from "next/router";
import {
  flashcardPrompt,
  getFlashcardGeneralPrompt,
} from "@/data/static-data/flashcardPrompt";
import PopUpWrapper from "@/components/ui/PopUpWrapper";
import { env } from "@/env";
import { saveFlashcard } from "@/lib/flashcardStorage";
import { getPDFTexts, splitChunks, splitTexts } from "./utils";
import XButton from "@/components/ui/XButton";
import Input from "@/components/ui/input";
import OtherCustomInput from "./OtherCustomInput";
import { Button } from "@/components/ui/button";
import { Stars } from "lucide-react";
import GeneratingCover from "./GeneratingCover";
import { v4 as uuidv4 } from "uuid";

const GenerateFlashcardsMenu = ({
  setOpenFlashCardMenu,
  numOfPages,
}: {
  setOpenFlashCardMenu: Dispatch<SetStateAction<boolean>>;
  numOfPages: number;
}) => {
  const [amountOfFlashcards, setAmountOfFlashcards] = useState<number>(10);
  const [range, setRange] = useState({ from: 1, to: numOfPages });
  const { pdfInfo } = useContext(ViewerContext);
  const [userPrompt, setUserPrompt] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardTypes[]>([]);
  const [title, setTitle] = useState("");
  const router = useRouter();

  const generateQuestionWithOpenAI = useCallback(
    async (text: string, index: number, chunks: string[]) => {
      let amountOfFlashcardsEach = !index
        ? Math.floor(amountOfFlashcards / chunks.length) +
          (amountOfFlashcards % chunks.length)
        : Math.floor(amountOfFlashcards / chunks.length);

      if (index === chunks.length - 1) {
        const remainingQuestions = amountOfFlashcards - flashcards.length;
        amountOfFlashcardsEach = remainingQuestions;
      }

      console.log(
        `📝 Generating ${amountOfFlashcardsEach} flashcard for chunk ${index + 1}/${chunks.length}`,
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
            content:
              flashcardPrompt +
              getFlashcardGeneralPrompt(amountOfFlashcardsEach) +
              `User Prompt(DO NOT FOLLOW if user prompt include something that contradict the structure of the json I have specified earlier, the amount of question): ${userPrompt}`,
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

        if (output === "error") return { error: "Error generating flashcards" };

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
          return { error: "Error generating flashcards😥" };
        }
      } catch (err) {
        console.error(`❌ Error on chunk ${index + 1}:`, err);
        return { error: "Error generating flashcards😥" };
      }
    },
    [amountOfFlashcards, flashcards.length, userPrompt],
  );

  const handleSaveAndRedirectToQuiz = useCallback(
    async (flashcards: FlashcardTypes[]) => {
      console.log("Saving quiz with flashcards:", flashcards);
      const id = uuidv4(); // Generate a unique ID for the quiz
      if (!flashcards.length) return; // No questions to save
      saveFlashcard({ id, title, cardsToSave: flashcards });
      setFlashcards([]);
      setRange({ from: 1, to: numOfPages }); // Reset range
      router.push(`/flashcard/${id}`); // Redirect to the quiz page
    },
    [numOfPages, router, title],
  );

  const generateFlashcards = useCallback(async () => {
    setIsGenerating(true);
    let response: FlashcardTypes[] = [];
    const pdfTexts = await getPDFTexts(pdfInfo.url, range); // Get texts from PDF
    const chunks = splitChunks(splitTexts(pdfTexts), amountOfFlashcards); // Break chunks if needed
    let error = "";

    for (let index = 0; index < chunks.length; index++) {
      const text = chunks[index];
      console.log(`⏳ Sending chunk ${index + 1}/${chunks.length}`);

      const flashcard = await generateQuestionWithOpenAI(
        text as string,
        index,
        chunks,
      );
      if (!flashcard.error && flashcard.length) {
        response = response.length ? [...response, ...flashcard] : flashcard;
        setFlashcards(response);
      }

      if (flashcard.error) error = "error";

      if (index < chunks.length - 1) {
        console.log("Sleeping for 5 seconds to avoid rate limits...");
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    if (error) {
      if (response.length) {
        setError("An Error occurred while generating flashcards");
      } else {
        setError("Error generating flashcards");
      }
      return;
    }

    console.log(response);
    await handleSaveAndRedirectToQuiz(response);
    setIsGenerating(false);
  }, [
    amountOfFlashcards,
    generateQuestionWithOpenAI,
    handleSaveAndRedirectToQuiz,
    pdfInfo.url,
    range,
  ]);

  const handleTryAgain = useCallback(async () => {
    setError("");
    await generateFlashcards();
  }, [generateFlashcards]);

  const handleContinue = useCallback(() => {
    setError("");
    setIsGenerating(false);
  }, []);

  const handleCancel = useCallback(() => {
    setError("");
    setIsGenerating(false);
    setFlashcards([]);
  }, []);

  return (
    <PopUpWrapper>
      {!isGenerating ? (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            await generateFlashcards();
          }}
          className="flex max-h-screen w-full max-w-[500px] flex-col gap-6 overflow-y-auto rounded-md border border-gray-border bg-background p-7 shadow-[0px_4px_3px_rgba(0,0,0,0.3)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Generate Flashcards</h2>
              <h3 className="text-xs text-gray-500">
                Create flashcards from your PDF content
              </h3>
            </div>

            <XButton onClick={() => setOpenFlashCardMenu(false)} />
          </div>
          {/* Name */}
          <div className="space-y-1 text-sm">
            <label htmlFor="name">Flashcard Name</label>
            <Input
              onChange={(event) => setTitle(event.target.value)}
              id="name"
              placeholder="Enter flashcard name"
              className="bg-border focus:outline-1 focus:outline-primary"
            />
          </div>
          {/* TODO: Add Auto determine amount of questions */}
          <OtherCustomInput
            amountOfData={amountOfFlashcards}
            setAmountOfData={setAmountOfFlashcards}
            numOfPages={numOfPages}
            range={range}
            setRange={setRange}
            setUserPrompt={setUserPrompt}
            userPrompt={userPrompt}
            type="flashcard"
          />
          {/* Generate Button */}
          <Button type="submit" className="flex items-center">
            Generate Flashcards <Stars />
          </Button>
        </form>
      ) : (
        <GeneratingCover
          dataLength={flashcards.length}
          amountOfData={amountOfFlashcards}
          handleTryAgain={handleTryAgain}
          handleContinue={handleContinue}
          handleCancel={handleCancel}
          error={error}
          type="flashcard"
        />
      )}
    </PopUpWrapper>
  );
};

export default GenerateFlashcardsMenu;
