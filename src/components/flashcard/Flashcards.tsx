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

  const [flashcards, setFlashcards] = useState(flashcardsMock);
  const [flashcardInfo, setFlashcardInfo] = useState({ title: "", id });
  const [practiceFlashcards, setPracticeFlashcards] = useState(false);

  useEffect(() => {
    const localFlashcards = getFlashcardById(id);
    if (localFlashcards) {
      const { cards, id, title } = localFlashcards;
      setFlashcards(cards);
      setFlashcardInfo({ title, id });
    }
  }, []);

  return (
    <main className="p-5">
      <h1 className="pb-5 text-xl">{flashcardInfo.title}</h1>
      {practiceFlashcards ? (
        <PracticeFlashcards
          setPracticeFlashcards={setPracticeFlashcards}
          flashcards={flashcards}
          setFlashcards={setFlashcards}
          flashcardInfo={flashcardInfo}
        />
      ) : (
        <FlashcardsPreview
          setPracticeFlashcards={setPracticeFlashcards}
          flashcards={flashcards}
          setFlashcards={setFlashcards}
          flashcardInfo={flashcardInfo}
        />
      )}
    </main>
  );
};

export default FlashCard;
