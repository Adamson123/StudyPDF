"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QuizActive } from "./QuizActive";
import QuestionsPreview from "./QuestionsPreview";
import { Play } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/hooks/useAppStore";
import { shuffleArray } from "@/utils/shuffle";

type SavedQuizProgress = {
    version: 1;
    questions: QuizTypes[];
    currentQuestionIndex: number;
};

const randomizeOptions = (quizzes?: QuizTypes[]) => {
    if (!quizzes || !quizzes.length) return [];

    return quizzes.map((q) => {
        if (q.type !== "multiChoice") return q;

        const multiChoiceQuestion = structuredClone(
            q,
        ) as MultiChoiceQuestionTypes;
        const optionLetters = ["A", "B", "C", "D"];
        const answerLetterIndex = optionLetters.indexOf(
            multiChoiceQuestion.answer,
        );
        const correctOption = multiChoiceQuestion.options[answerLetterIndex];
        const shuffledOptions = shuffleArray(multiChoiceQuestion.options);
        const newAnswerOptionIndex = shuffledOptions.indexOf(
            correctOption as string,
        );

        return {
            ...q,
            options: shuffledOptions,
            answer: optionLetters[newAnswerOptionIndex],
        };
    });
};

const Quiz = () => {
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
    const quizzes = useAppSelector((state) => state.quizzes.items);
    const selectedQuizzes = useMemo(
        () =>
            selectedIds
                .map((selectedId) =>
                    quizzes.find((quiz) => quiz.id === selectedId),
                )
                .filter((quiz): quiz is StoredQuiz => Boolean(quiz)),
        [quizzes, selectedIds],
    );
    const initialQuestions = useMemo(
        () => selectedQuizzes.flatMap((quiz) => quiz.questions),
        [selectedQuizzes],
    );
    const title =
        selectedQuizzes.length > 1
            ? `${selectedQuizzes.length} quizzes`
            : selectedQuizzes[0]?.title || "";
    const selectionKey = useMemo(
        () => [...selectedIds].sort().join("|"),
        [selectedIds],
    );

    const [startQuiz, setStartQuiz] = useState(false);
    const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [hydrated, setHydrated] = useState(false);
    const [questions, setQuestions] = useState<QuizTypes[]>([]);
    const progressKey = `study-pdf:quiz-progress:${selectionKey}`;

    const clearSavedProgress = useCallback(() => {
        try {
            localStorage.removeItem(progressKey);
        } catch {
            // Keep the quiz usable when browser storage is unavailable.
        }
    }, [progressKey]);

    useEffect(() => {
        try {
            const rawProgress = localStorage.getItem(progressKey);
            if (!rawProgress) return;

            const savedProgress = JSON.parse(rawProgress) as SavedQuizProgress;
            if (
                savedProgress.version !== 1 ||
                !Array.isArray(savedProgress.questions) ||
                savedProgress.questions.length === 0 ||
                !Number.isInteger(savedProgress.currentQuestionIndex)
            ) {
                clearSavedProgress();
                return;
            }

            setQuestions(savedProgress.questions);
            setCurrentQuestionIndex(
                Math.max(
                    0,
                    Math.min(
                        savedProgress.currentQuestionIndex,
                        savedProgress.questions.length - 1,
                    ),
                ),
            );
            setAutoSaveEnabled(true);
            setStartQuiz(true);
        } catch {
            clearSavedProgress();
        } finally {
            setHydrated(true);
        }
    }, [clearSavedProgress, progressKey]);

    useEffect(() => {
        if (!hydrated || startQuiz || !initialQuestions.length) return;

        setQuestions(randomizeOptions(initialQuestions) as QuizTypes[]);
    }, [hydrated, initialQuestions, startQuiz]);

    useEffect(() => {
        if (!hydrated || !autoSaveEnabled || !startQuiz) return;

        const progress: SavedQuizProgress = {
            version: 1,
            questions,
            currentQuestionIndex,
        };

        try {
            localStorage.setItem(progressKey, JSON.stringify(progress));
        } catch {
            // Keep the quiz usable when browser storage is unavailable.
        }
    }, [
        autoSaveEnabled,
        currentQuestionIndex,
        hydrated,
        progressKey,
        questions,
        startQuiz,
    ]);

    const handleAutoSaveChange = (enabled: boolean) => {
        setAutoSaveEnabled(enabled);
        if (!enabled) clearSavedProgress();
    };

    return (
        <main className="flex w-full flex-col gap-6 overflow-y-auto bg-background p-6">
            <div className="flex items-center justify-between border-gray-border bg-background">
                <div>
                    <h2 className="text-2xl">{title}</h2>
                    <h3 className="text-sm text-gray-500">
                        Total Questions: {questions.length}
                    </h3>
                </div>
                {!startQuiz && (
                    <button
                        onClick={() => setStartQuiz(true)}
                        disabled={!questions.length}
                        className="flex items-center gap-2 text-nowrap rounded bg-green-500 p-2 px-3 text-sm text-white transition-all hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Start Quiz <Play className="h-4 w-4 fill-white" />
                    </button>
                )}
            </div>

            {startQuiz ? (
                <QuizActive
                    autoSaveEnabled={autoSaveEnabled}
                    currentQuestionIndex={currentQuestionIndex}
                    onQuizCompleted={clearSavedProgress}
                    questions={questions}
                    setAutoSaveEnabled={handleAutoSaveChange}
                    setCurrentQuestionIndex={setCurrentQuestionIndex}
                    setQuestions={setQuestions}
                    setStartQuiz={setStartQuiz}
                />
            ) : (
                <QuestionsPreview
                    questions={questions}
                    setStartQuiz={setStartQuiz}
                />
            )}
        </main>
    );
};

export default Quiz;
