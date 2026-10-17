"use client";

import { useMemo, useState } from "react";
import FlashcardsPreview from "./FlashcardsPreview";
import PracticeFlashcards, {
    type PracticeFlashcard,
} from "./PracticeFlashcards";
import { useParams, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/hooks/useAppStore";

const FlashCard = () => {
    const { id } = useParams() as { id: string };
    const searchParams = useSearchParams();
    const selectedIdsKey = searchParams.get("ids") || id;
    const selectedIds = useMemo(
        () =>
            selectedIdsKey
                .split(",")
                .map((selectedId) => decodeURIComponent(selectedId))
                .filter(Boolean),
        [selectedIdsKey],
    );
    const [practiceFlashcards, setPracticeFlashcards] = useState(false);
    const flashcardSets = useAppSelector((state) => state.flashcards.items);
    const selectedSets = useMemo(
        () =>
            selectedIds
                .map((selectedId) =>
                    flashcardSets.find((flashcardSet) => flashcardSet.id === selectedId),
                )
                .filter(
                    (flashcardSet): flashcardSet is StoredFlashcard =>
                        Boolean(flashcardSet),
                ),
        [flashcardSets, selectedIds],
    );
    const flashcards = useMemo<PracticeFlashcard[]>(
        () =>
            selectedSets.flatMap((flashcardSet) =>
                flashcardSet.cards.map((card, sourceCardIndex) => ({
                    ...card,
                    sourceSetId: flashcardSet.id,
                    sourceCardIndex,
                })),
            ),
        [selectedSets],
    );
    const isMultiSet = selectedSets.length > 1;
    const flashcardsInfo = {
        title: isMultiSet
            ? `${selectedSets.length} flashcard sets`
            : selectedSets[0]?.title || "",
        id: selectedSets[0]?.id || "",
    };

    return (
        <main className="p-5">
            <h1 className="pb-5 text-xl">{flashcardsInfo.title}</h1>
            {practiceFlashcards ? (
                <PracticeFlashcards
                    setPracticeFlashcards={setPracticeFlashcards}
                    flashcards={flashcards}
                />
            ) : (
                <FlashcardsPreview
                    setPracticeFlashcards={setPracticeFlashcards}
                    flashcards={flashcards}
                    flashcardsInfo={flashcardsInfo}
                    isMultiSet={isMultiSet}
                />
            )}
        </main>
    );
};

export default FlashCard;
