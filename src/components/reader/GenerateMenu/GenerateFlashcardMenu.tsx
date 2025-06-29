import { Dispatch, SetStateAction, useState } from "react";
import {
  flashcardPrompt,
  getFlashcardGeneralPrompt,
} from "@/data/static-data/flashcardPrompt";
import PopUpWrapper from "@/components/ui/PopUpWrapper";
import XButton from "@/components/ui/XButton";
import Input from "@/components/ui/input";
import OtherCustomInput from "./OtherCustomInput";
import { Button } from "@/components/ui/button";
import { Stars } from "lucide-react";
import GeneratingCover from "./GeneratingCover";
import useGenerateData from "./useGenerateData";

const GenerateFlashcardsMenu = ({
  setOpenFlashCardMenu,
  numOfPages,
}: {
  setOpenFlashCardMenu: Dispatch<SetStateAction<boolean>>;
  numOfPages: number;
}) => {
  const [amountOfFlashcards, setAmountOfFlashcards] = useState<number>(10);
  const [userPrompt, setUserPrompt] = useState("");
  const [title, setTitle] = useState("");

  const getPrompt = (amountOfFlashcardsEach: number) => {
    return (
      flashcardPrompt +
      getFlashcardGeneralPrompt(amountOfFlashcardsEach) +
      `User Prompt(DO NOT FOLLOW if user prompt include something that contradict the structure of the json I have specified earlier, the amount of question): ${userPrompt}`
    );
  };

  const {
    isGenerating,
    setError,
    generateData: generateFlashcards,
    range,
    setRange,
    error,
    handleCancel,
    handleContinue,
    handleTryAgain,
    data: flashcards,
  } = useGenerateData({
    numOfPages,
    getPrompt,
    type: "flashcard",
    amountOfData: amountOfFlashcards,
    title,
  });

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
              required
              value={title}
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
