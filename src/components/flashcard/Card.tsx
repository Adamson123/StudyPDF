import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { getColorClass } from "./utils";
import { Dispatch, SetStateAction } from "react";
import { saveFlashcard } from "@/lib/flashcardStorage";

const Flashcard = ({
  flashcard,
  setFlashCards,
  index,
  setFlashcardToEdit,
  flashcardInfo,
}: {
  flashcard: FlashcardTypes;
  setFlashCards: Dispatch<SetStateAction<FlashcardTypes[]>>;
  //setShowEditFlashcards: Dispatch<SetStateAction<boolean>>;
  setFlashcardToEdit: Dispatch<
    SetStateAction<(FlashcardTypes & { index: number }) | null>
  >;
  flashcardInfo: { id: string; title: string };
  index: number;
}) => {
  const flashcardLevel = getColorClass(flashcard.level);
  const deleteFlashcard = () => {
    setFlashCards((prev) => {
      const flashcards = prev.filter((f, i) => index !== i);
      saveFlashcard({ ...flashcardInfo, cardsToSave: flashcards });
      return flashcards;
    });
  };
  flashcard.level && console.log(flashcard, flashcardLevel);

  return (
    <div
      className={cn(
        `relative space-y-6 rounded bg-border/35 p-7 pb-16 transition-all`,
        flashcardLevel.color,
      )}
    >
      <div className={cn("border-b pb-8", flashcardLevel.border)}>
        <h3 className="underline">Front</h3>
        <p className="text-xs">{flashcard.front}</p>
      </div>
      <div>
        <h3 className="underline">Back</h3>
        <p className="text-xs">{flashcard.back}</p>
      </div>
      <div className="absolute bottom-2 right-2 flex items-center">
        <button
          onClick={() => {
            setFlashcardToEdit({ ...flashcard, index } as
              | (FlashcardTypes & { index: number })
              | null);
          }}
          className="rounded p-3 hover:bg-gray-500/10"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={deleteFlashcard}
          className="rounded p-3 hover:bg-gray-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Flashcard;
