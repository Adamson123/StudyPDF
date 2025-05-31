import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { getColorClass } from "./utils";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction, useState } from "react";

const PracticeFlashcards = ({
  setPracticeFlashcards,
  flashcards,
  setFlashcards,
}: {
  setPracticeFlashcards: Dispatch<SetStateAction<boolean>>;
  flashcards: FlashcardTypes[];
  setFlashcards: Dispatch<SetStateAction<FlashcardTypes[]>>;
}) => {
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // const flashcardLevel = getColorClass(flashcard.level);
  const updateFlashcardLevel = (level: string) => {
    const updatedFlashcards = flashcards.map((flashcard, i) => {
      if (i === currentFlashcardIndex) {
        return { ...flashcard, level };
      }
      return flashcard;
    });

    setFlashcards(updatedFlashcards);
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
    } else {
      setCurrentFlashcardIndex(0);
    }
    setShowAnswer(false);
    return updatedFlashcards;
  };

  const flashcardLevel = getColorClass(
    (flashcards[currentFlashcardIndex] as FlashcardTypes).level,
  );

  return (
    <div>
      <div className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-5 pb-2 text-sm text-gray-500">
        {/* Head */}
        <div className="flex w-full flex-col items-center justify-between gap-4 pt-5">
          {/* Count */}
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              onClick={() => setPracticeFlashcards(false)}
              variant="ghost"
              className="flex items-center border text-white"
            >
              <ArrowLeft />
              Exit
            </Button>
            <p>
              Card &nbsp;{currentFlashcardIndex + 1} of {flashcards.length}
            </p>
          </div>
          {/* Progress */}
          <progress
            value={currentFlashcardIndex}
            max={flashcards.length}
            className="h-2 w-full"
          />
        </div>
        {/* Card */}
        <div
          className={cn(
            `flex min-h-72 w-full flex-col rounded bg-border/55 p-3 text-sm text-white`,
            flashcardLevel.color,
          )}
        >
          <div
            className={cn(
              "flex w-full flex-grow items-center justify-center border-b",
              flashcardLevel.border,
            )}
          >
            {" "}
            {flashcards[currentFlashcardIndex]?.front}
          </div>
          <div className={`pt-3 text-center ${!showAnswer && "blur"}`}>
            {flashcards[currentFlashcardIndex]?.back}
          </div>
        </div>
        {!showAnswer ? (
          <Button
            onClick={() => setShowAnswer(true)}
            className="flex items-center"
          >
            Show Answer <Eye />
          </Button>
        ) : (
          <div className="flex w-full gap-2">
            {[
              {
                level: "hard",
                color: "bg-red-500",
              },
              {
                level: "medium",
                color: "bg-yellow-500",
              },
              {
                level: "easy",
                color: "bg-green-500",
              },
            ].map((level, i) => (
              <Button
                onClick={() => updateFlashcardLevel(level.level)}
                key={i}
                variant="outline"
                className={cn(`flex-1 p-7 text-white`, level.color)}
              >
                {level.level.charAt(0).toUpperCase() + level.level.slice(1)}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeFlashcards;
