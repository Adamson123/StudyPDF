import Card from "./Card";
import { Button } from "../ui/button";
import { Play, Plus } from "lucide-react";
import EditFlashcards from "./EditFlashcards";
import { Dispatch, SetStateAction, useMemo, useState } from "react";

const FlashcardsPreview = ({
    setPracticeFlashcards,
    flashcards,
    flashcardsInfo,
    isMultiSet = false,
}: {
    setPracticeFlashcards: Dispatch<SetStateAction<boolean>>;
    flashcards: FlashcardTypes[];
    flashcardsInfo: { id: string; title: string };
    isMultiSet?: boolean;
}) => {
    const [showEditFlashcards, setShowEditFlashcards] = useState(false);
    const [flashcardToEdit, setFlashcardToEdit] = useState<
        (FlashcardTypes & { index: number }) | null
    >(null);

    const levelPercentages = useMemo(() => {
        const totalCards = flashcards.length;
        const hardCards = flashcards.filter(
            (card) => card.level === "hard",
        ).length;
        const mediumCards = flashcards.filter(
            (card) => card.level === "medium",
        ).length;
        const easyCards = flashcards.filter(
            (card) => card.level === "easy",
        ).length;

        return {
            hard: totalCards ? Math.round((hardCards / totalCards) * 100) : 0,
            medium: totalCards
                ? Math.round((mediumCards / totalCards) * 100)
                : 0,
            easy: totalCards ? Math.round((easyCards / totalCards) * 100) : 0,
        };
    }, [flashcards]);

    const levelAmounts = useMemo(() => {
        const hardCards = flashcards.filter(
            (card) => card.level === "hard",
        ).length;
        const mediumCards = flashcards.filter(
            (card) => card.level === "medium",
        ).length;
        const easyCards = flashcards.filter(
            (card) => card.level === "easy",
        ).length;

        return {
            hard: hardCards,
            medium: mediumCards,
            easy: easyCards,
        };
    }, [flashcards]);

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-5">
            <div className="mx-auto w-full rounded border">
                <div className="flex justify-between gap-2 border-b p-5 text-sm">
                    <h2>Learning Progress</h2>
                    <h3 className="text-gray-400">
                        {flashcards.length} Total cards
                    </h3>
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
                    ].map((level) => (
                        <div key={level.label} className="space-y-3 text-xs">
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
            <div className="flex w-full flex-col justify-between gap-2 sm:flex-row">
                <Button
                    onClick={() => setPracticeFlashcards(true)}
                    disabled={!flashcards.length}
                    className="flex items-center gap-2 p-5"
                >
                    Practice Flashcards <Play className="h-4 w-4 fill-white" />
                </Button>
                {!isMultiSet && (
                    <Button
                        onClick={() => setShowEditFlashcards(true)}
                        variant="ghost"
                        className="flex items-center gap-2 border p-5"
                    >
                        Add Flashcard <Plus className="h-4 w-4" />
                    </Button>
                )}
            </div>
            {isMultiSet && (
                <p className="text-sm text-gray-500">
                    Editing is available when viewing an individual flashcard set.
                </p>
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {flashcards.map((flashcard, index) => (
                    <Card
                        key={`${flashcard.front}-${flashcard.back}-${index}`}
                        flashcard={flashcard}
                        index={index}
                        setFlashcardToEdit={setFlashcardToEdit}
                        flashcardsInfo={flashcardsInfo}
                        allowEditing={!isMultiSet}
                    />
                ))}
            </div>
            {!isMultiSet && (showEditFlashcards || flashcardToEdit) && (
                <EditFlashcards
                    setShowEditFlashcards={setShowEditFlashcards}
                    flashcardToEdit={flashcardToEdit}
                    setFlashcardToEdit={setFlashcardToEdit}
                    flashcardsInfo={flashcardsInfo}
                />
            )}
        </div>
    );
};

export default FlashcardsPreview;
