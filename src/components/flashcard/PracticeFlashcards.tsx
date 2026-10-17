import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "../ui/button";
import { getColorClass } from "./utils";
import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction, useState } from "react";
import { useAppDispatch } from "@/hooks/useAppStore";
import { updateOneCard } from "@/redux/features/flashcardsSlice";

export type PracticeFlashcard = FlashcardTypes & {
    sourceSetId: string;
    sourceCardIndex: number;
};

type SessionFlashcard = PracticeFlashcard & { sessionId: number };

const PracticeFlashcards = ({
    setPracticeFlashcards,
    flashcards,
}: {
    setPracticeFlashcards: Dispatch<SetStateAction<boolean>>;
    flashcards: PracticeFlashcard[];
}) => {
    const randomizeFlashcards = (): SessionFlashcard[] =>
        [...flashcards]
            .map((card, sessionId) => ({ ...card, sessionId }))
            .sort(() => Math.random() - 0.5);

    const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [shuffledFlashcards] = useState<SessionFlashcard[]>(
        randomizeFlashcards,
    );
    const dispatch = useAppDispatch();

    const updateFlashcardLevel = (level: string) => {
        const currentFlashcard = shuffledFlashcards[currentFlashcardIndex];
        if (!currentFlashcard) return;

        dispatch(
            updateOneCard({
                id: currentFlashcard.sourceSetId,
                cardIndex: currentFlashcard.sourceCardIndex,
                card: {
                    front: currentFlashcard.front,
                    back: currentFlashcard.back,
                    level,
                },
            }),
        );

        if (currentFlashcardIndex < shuffledFlashcards.length - 1) {
            setCurrentFlashcardIndex(currentFlashcardIndex + 1);
        } else {
            setPracticeFlashcards(false);
        }
        setShowAnswer(false);
    };

    const flashcardLevel = getColorClass(
        shuffledFlashcards[currentFlashcardIndex]?.level || "medium",
    );

    if (!shuffledFlashcards.length) {
        return (
            <div className="mx-auto max-w-[600px] py-10 text-center text-sm text-gray-500">
                There are no cards to practice.
            </div>
        );
    }

    return (
        <div>
            <div className="mx-auto flex w-full max-w-[600px] flex-col items-center gap-5 pb-2 text-sm text-gray-500">
                <div className="flex w-full flex-col items-center justify-between gap-4 pt-5">
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
                            {shuffledFlashcards.length}
                        </p>
                    </div>
                    <progress
                        value={currentFlashcardIndex}
                        max={shuffledFlashcards.length}
                        className="h-2 w-full"
                    />
                </div>
                <div
                    className={cn(
                        "flex min-h-80 w-full flex-col rounded bg-border/55 p-3 text-sm text-white",
                        flashcardLevel.color,
                    )}
                >
                    <div
                        className={cn(
                            "flex w-full flex-grow items-center justify-center border-b text-center",
                            flashcardLevel.border,
                        )}
                    >
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
                            { level: "hard", color: "bg-red-500" },
                            { level: "medium", color: "bg-yellow-500" },
                            { level: "easy", color: "bg-green-500" },
                        ].map((level) => (
                            <Button
                                onClick={() =>
                                    updateFlashcardLevel(level.level)
                                }
                                key={level.level}
                                variant="outline"
                                className={cn(
                                    "flex-1 p-7 text-white",
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
