import Flashcard from "./Flashcard";
import { Button } from "../ui/button";
import { Play, Plus } from "lucide-react";
import EditFlashcards from "./EditFlashcards";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

const FlashcardsPreview = ({
  setPracticeFlashcards,
  flashcards,
  setFlashcards,
}: {
  setPracticeFlashcards: Dispatch<SetStateAction<boolean>>;
  flashcards: FlashcardTypes[];
  setFlashcards: Dispatch<SetStateAction<FlashcardTypes[]>>;
}) => {
  const [showEditFlashcards, setShowEditFlashcards] = useState(false);
  const [flashcardToEdit, setFlashcardToEdit] = useState<
    (FlashcardTypes & { index: number }) | null
  >(null);

  const levelPercentages = useMemo(() => {
    const totalCards = flashcards.length;
    const hardCards = flashcards.filter((card) => card.level === "hard").length;
    const mediumCards = flashcards.filter(
      (card) => card.level === "medium",
    ).length;
    const easyCards = flashcards.filter((card) => card.level === "easy").length;

    return {
      hard: Math.round((hardCards / totalCards) * 100),
      medium: Math.round((mediumCards / totalCards) * 100),
      easy: Math.round((easyCards / totalCards) * 100),
    };
  }, [flashcards]);

  const levelAmounts = useMemo(() => {
    const hardCards = flashcards.filter((card) => card.level === "hard").length;
    const mediumCards = flashcards.filter(
      (card) => card.level === "medium",
    ).length;
    const easyCards = flashcards.filter((card) => card.level === "easy").length;

    return {
      hard: hardCards,
      medium: mediumCards,
      easy: easyCards,
    };
  }, [flashcards]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-5">
      {/* learning progress */}
      <div className="mx-auto w-full rounded border">
        <div className="flex justify-between gap-2 border-b p-5 text-sm">
          <h2 className="">Learning Progress</h2>
          <h3 className="text-gray-400">36 Total cards</h3>
        </div>
        <div className="space-y-4 p-5">
          {[
            {
              label: "Hard",
              amount: levelAmounts.hard,
              percentage: levelPercentages.hard,
              class: "hardPercentage",
            },
            {
              label: "Medium",
              amount: levelAmounts.medium,
              percentage: levelPercentages.medium,
              class: "mediumPercentage",
            },
            {
              label: "Easy",
              amount: levelAmounts.easy,
              percentage: levelPercentages.easy,
              class: "easyPercentage",
            },
          ].map((level, i) => (
            <div key={i} className="space-y-3 text-xs">
              <p>
                {level.label} ({level.percentage}%)
              </p>
              <progress
                value={level.amount}
                max={flashcards.length}
                className={`h-1.5 w-full ${level.class}`}
              />
            </div>
          ))}
        </div>
      </div>
      {/*  */}
      <div className="flex w-full flex-col justify-between gap-2 sm:flex-row">
        <Button
          onClick={() => setPracticeFlashcards(true)}
          className="flex items-center gap-2 p-5"
        >
          Practice Flashcards <Play className="h-4 w-4 fill-white" />
        </Button>
        <Button
          onClick={() => setShowEditFlashcards(true)}
          variant="ghost"
          className="flex items-center gap-2 border p-5"
        >
          {" "}
          Add Flashcard <Plus className="h-4 w-4" />
        </Button>
      </div>
      {/* Flashcards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flashcards.map((flashcard, index) => (
          <Flashcard
            key={index}
            setFlashCards={setFlashcards}
            // setShowEditFlashcards={setShowEditFlashcards}
            flashcard={flashcard}
            index={index}
            setFlashcardToEdit={setFlashcardToEdit}
          />
        ))}
      </div>
      {(showEditFlashcards || flashcardToEdit) && (
        <EditFlashcards
          setFlashcards={setFlashcards}
          setShowEditFlashcards={setShowEditFlashcards}
          flashcardToEdit={flashcardToEdit}
          setFlashcardToEdit={setFlashcardToEdit}
        />
      )}
    </div>
  );
};

export default FlashcardsPreview;
