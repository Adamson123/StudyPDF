"use client";

import { useState } from "react";
import FlashcardsPreview from "./FlashcardsPreview";
import PracticeFlashcards from "./PracticeFlashcards";
import { flashcardsMock } from "@/data/static-data/flashcardsMock";

const FlashCard = () => {
  const [practiceFlashcards, setPracticeFlashcards] = useState(false);
  const [flashcards, setFlashcards] = useState(flashcardsMock);

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
