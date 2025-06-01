import React, { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import XButton from "../ui/XButton";
import { Check } from "lucide-react";
import { saveFlashcard } from "@/lib/flashcardStorage";

const EditFlashcards = ({
  setShowEditFlashcards,
  setFlashcards,
  flashcardToEdit,
  setFlashcardToEdit,
  flashcardInfo,
}: {
  setShowEditFlashcards: Dispatch<SetStateAction<boolean>>;
  setFlashcards: Dispatch<SetStateAction<FlashcardTypes[]>>;
  flashcardToEdit: (FlashcardTypes & { index: number }) | null;
  setFlashcardToEdit: Dispatch<
    SetStateAction<(FlashcardTypes & { index: number }) | null>
  >;
  flashcardInfo: { id: string; title: string };
}) => {
  const [newFlashcard, setNewFlashcard] = React.useState<FlashcardTypes>({
    front: flashcardToEdit?.front || "",
    back: flashcardToEdit?.back || "",
    level: flashcardToEdit?.level || "", // Default level
  });

  const handleSave = () => {
    if (!flashcardToEdit) {
      setFlashcards((prev) => {
        const flashcards = [...prev, newFlashcard];
        saveFlashcard({ ...flashcardInfo, cardsToSave: flashcards });
        return flashcards;
      });
      setShowEditFlashcards(false);
    } else {
      setFlashcards((prev) => {
        const flashcards = prev.map((flashcard, i) =>
          i === flashcardToEdit.index ? newFlashcard : flashcard,
        );
        saveFlashcard({ ...flashcardInfo, cardsToSave: flashcards });
        return flashcards;
      });
      setShowEditFlashcards(false);
      setFlashcardToEdit(null);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col justify-center gap-4 rounded-lg bg-background p-6 shadow-lg">
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Edit Flashcard</h2>
            <p className="text-xs text-gray-500">
              Add or edit your flashcards below. Click "Save" when you're done.
            </p>
          </div>
          <XButton
            onClick={() => {
              setFlashcardToEdit(null);
              setShowEditFlashcards(false);
            }}
          />
        </div>
        {/* Front */}
        <div className="flex w-full flex-col gap-2 border-b pb-6">
          <label htmlFor="front" className="underline">
            Front
          </label>
          <textarea
            onChange={(e) =>
              setNewFlashcard({ ...newFlashcard, front: e.target.value })
            }
            value={newFlashcard.front}
            id="front"
            className="min-h-40 w-full resize-none rounded bg-border p-3 text-sm outline-none focus:border focus:border-primary"
          />
        </div>
        {/* Back */}
        <div className="flex w-full flex-col gap-2">
          <label htmlFor="back" className="underline">
            Back
          </label>
          <textarea
            onChange={(e) =>
              setNewFlashcard({ ...newFlashcard, back: e.target.value })
            }
            value={newFlashcard.back}
            id="back"
            className="min-h-40 w-full resize-none rounded bg-border p-3 text-sm outline-none focus:border focus:border-primary"
          />
        </div>
        {/*  */}
        <Button
          onClick={handleSave}
          className="flex items-center gap-1 self-center px-7"
        >
          Save <Check className="h-10 w-10" />
        </Button>
      </div>
    </div>
  );
};

export default EditFlashcards;
