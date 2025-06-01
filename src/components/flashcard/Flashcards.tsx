"use client";

import { useEffect, useState } from "react";
import FlashcardsPreview from "./FlashcardsPreview";
import PracticeFlashcards from "./PracticeFlashcards";
import { flashcardsMock } from "@/data/static-data/flashcardsMock";
import { getFlashcardById } from "@/lib/flashcardStorage";
import { useParams } from "next/navigation";

const FlashCard = () => {
  const { id } = useParams() as { id: string };
  console.log("Flashcard ID:", id);
  const [practiceFlashcards, setPracticeFlashcards] = useState(false);
  const [flashcards, setFlashcards] = useState(flashcardsMock);

  useEffect(() => {
    const localFlashcards = getFlashcardById(id);
    if (localFlashcards) {
      setFlashcards(localFlashcards);
    }
  }, []);

  return (
    <main className="p-5">
      <h1 className="pb-5 text-xl">FlashCard Name</h1>
      {practiceFlashcards ? (
        <PracticeFlashcards
          setPracticeFlashcards={setPracticeFlashcards}
          flashcards={flashcards}
          setFlashcards={setFlashcards}
        />
      ) : (
        <FlashcardsPreview
          setPracticeFlashcards={setPracticeFlashcards}
          flashcards={flashcards}
          setFlashcards={setFlashcards}
        />
      )}
    </main>
  );
};

export default FlashCard;
