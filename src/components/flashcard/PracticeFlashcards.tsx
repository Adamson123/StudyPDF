import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { getColorClass } from "./utils";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppStore";
import { updateOneSetOfFlashcards } from "@/redux/features/flashcardsSlice";

const PracticeFlashcards = ({
    setPracticeFlashcards,
    flashcards,
    flashcardsInfo,
}: {
    setPracticeFlashcards: Dispatch<SetStateAction<boolean>>;
    flashcards: FlashcardTypes[];
    flashcardsInfo: { id: string; title: string };
}) => {
    const randomizeFlashcards = () => {
        const shuffledFlashcards = [...flashcards]
            .map((card, index) => ({ ...card, id: index }))
            .sort(() => Math.random() - 0.5);
        return shuffledFlashcards;
    };

    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [shuffledFlashcards, setShuffledFlashcards] = useState<
        (FlashcardTypes & { id: number })[]
    >(randomizeFlashcards());
    const dispatch = useAppDispatch();

    // Function to update the level of the current flashcard
    const updateFlashcardLevel = (level: string) => {
        // Get the flashcard with its original index
        const flashcardWidthID = shuffledFlashcards[
            currentFlashcardIndex
        ] as FlashcardTypes & { id: number };

        // Update the level of the flashcard with the matching id
        const updatedFlashcards = flashcards.map((flashcard, i) => {
            if (i === flashcardWidthID.id) {
                return { ...flashcard, level };
            }
            return flashcard;
        });

        //TODO:Remove comments
        // setFlashcards(updatedFlashcards);
        // saveFlashcard({ ...flashcardsInfo, cardsToSave: updatedFlashcards });

        dispatch(
            updateOneSetOfFlashcards({
                ...flashcardsInfo,
                cards: updatedFlashcards,
            }),
        );

        // Move to the next flashcard or end practice if it was the last one
        if (currentFlashcardIndex < flashcards.length - 1) {
            setCurrentFlashcardIndex(currentFlashcardIndex + 1);
        } else {
            // If it was the last flashcard, reset to the beginning and exit practice mode
            setPracticeFlashcards(false);
        }
        setShowAnswer(false);
        return updatedFlashcards;
    };

    const flashcardLevel = getColorClass(
        (shuffledFlashcards[currentFlashcardIndex] as FlashcardTypes).level,
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
                            Card &nbsp;{currentFlashcardIndex + 1} of{" "}
                            {flashcards.length}
                        </p>
                    </div>
                    {/* Progress */}
                    <progress
                        value={currentFlashcardIndex}
                        max={shuffledFlashcards.length}
                        className="h-2 w-full"
                    />
                </div>
                {/* Card */}
                <div
                    className={cn(
                        `flex min-h-80 w-full flex-col rounded bg-border/55 p-3 text-sm text-white`,
                        flashcardLevel.color,
                    )}
                >
                    <div
                        className={cn(
                            "flex w-full flex-grow items-center justify-center border-b text-center",
                            flashcardLevel.border,
                        )}
                    >
                        {" "}
                        {shuffledFlashcards[currentFlashcardIndex]?.front}
                    </div>
                    <div
                        className={`pt-3 text-center ${!showAnswer && "blur"}`}
                    >
                        {shuffledFlashcards[currentFlashcardIndex]?.back}
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
                                onClick={() =>
                                    updateFlashcardLevel(level.level)
                                }
                                key={i}
                                variant="outline"
                                className={cn(
                                    `flex-1 p-7 text-white`,
                                    level.color,
                                    `hover:${level.color} hover:opacity-[0.9]`,
                                )}
                            >
                                {level.level.charAt(0).toUpperCase() +
                                    level.level.slice(1)}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PracticeFlashcards;
