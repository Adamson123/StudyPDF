"use client";

import { useState } from "react";
import FlashcardsPreview from "./FlashcardsPreview";
import PracticeFlashcards from "./PracticeFlashcards";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/hooks/useAppStore";

const FlashCard = () => {
    const { id } = useParams() as { id: string };
    const [practiceFlashcards, setPracticeFlashcards] = useState(false);
    const flashcardsData = useAppSelector((state) =>
        state.flashcards.items.find((f) => f.id === id),
    );
    const flashcardsInfo = {
        title: flashcardsData?.title || "",
        id: flashcardsData?.id || "",
    };
    const flashcards = flashcardsData?.cards || [];

    return (
        <main className="p-5">
            <h1 className="pb-5 text-xl">{flashcardsInfo.title}</h1>
            {practiceFlashcards ? (
                <PracticeFlashcards
                    setPracticeFlashcards={setPracticeFlashcards}
                    flashcards={flashcards}
                    flashcardsInfo={flashcardsInfo}
                />
            ) : (
                <FlashcardsPreview
                    setPracticeFlashcards={setPracticeFlashcards}
                    flashcards={flashcards}
                    flashcardsInfo={flashcardsInfo}
                />
            )}
        </main>
    );
};

export default FlashCard;
