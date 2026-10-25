"use client";

import {
    ChangeEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { QuizActive } from "./QuizActive";
import QuestionsPreview from "./QuestionsPreview";
import { Download, Play, Upload } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/hooks/useAppStore";
import { shuffleArray } from "@/utils/shuffle";

type SavedQuizProgress = {
    version: 1;
    questions: QuizTypes[];
    currentQuestionIndex: number;
};

type ExportedQuizProgress = SavedQuizProgress & {
    format: "study-pdf-quiz-progress";
    exportedAt: string;
    quizIds: string[];
    title: string;
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

const isStringArray = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every((item) => typeof item === "string");

const isValidQuestion = (question: unknown): question is QuizTypes => {
    if (!question || typeof question !== "object") return false;
    const value = question as Record<string, unknown>;

    if (
        typeof value.question !== "string" ||
        typeof value.explanation !== "string" ||
        typeof value.isCorrect !== "boolean"
    ) {
        return false;
    }

    if (value.type === "multiChoice") {
        return (
            isStringArray(value.options) &&
            value.options.length > 0 &&
            typeof value.answer === "string" &&
            typeof value.choosenAnswer === "string"
        );
    }

    if (value.type === "definition") {
        return (
            typeof value.answer === "string" &&
            isStringArray(value.keywords) &&
            typeof value.choosenAnswer === "string"
        );
    }

    return (
        typeof value.type === "string" &&
        isStringArray(value.answer) &&
        isStringArray(value.choosenAnswer)
    );
};

const parseImportedProgress = (value: unknown): ExportedQuizProgress => {
    if (!value || typeof value !== "object") {
        throw new Error("The file must contain a quiz progress object.");
    }

    const progress = value as Record<string, unknown>;
    if (progress.format !== "study-pdf-quiz-progress") {
        throw new Error("This is not a StudyPDF quiz progress export.");
    }
    if (progress.version !== 1) {
        throw new Error("This quiz progress file uses an unsupported version.");
    }
    if (!Array.isArray(progress.questions) || !progress.questions.length) {
        throw new Error("The export must include at least one question.");
    }
    if (!progress.questions.every(isValidQuestion)) {
        throw new Error(
            "One or more questions are missing required quiz fields.",
        );
    }
    if (
        !Number.isInteger(progress.currentQuestionIndex) ||
        (progress.currentQuestionIndex as number) < 0 ||
        (progress.currentQuestionIndex as number) >= progress.questions.length
    ) {
        throw new Error("The saved current-question position is invalid.");
    }
    if (!isStringArray(progress.quizIds)) {
        throw new Error("The export is missing its source quiz information.");
    }
    if (typeof progress.title !== "string") {
        throw new Error("The export is missing its quiz title.");
    }

    return progress as ExportedQuizProgress;
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
    const selectedTitle =
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
    const [sessionKey, setSessionKey] = useState(selectionKey);
    const [importedTitle, setImportedTitle] = useState<string | null>(null);
    const [importError, setImportError] = useState("");
    const importInputRef = useRef<HTMLInputElement>(null);
    const progressKey = `study-pdf:quiz-progress:${sessionKey}`;
    const title = importedTitle || selectedTitle;

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
                !savedProgress.questions.every(isValidQuestion) ||
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

    const exportProgress = () => {
        const progress: ExportedQuizProgress = {
            format: "study-pdf-quiz-progress",
            version: 1,
            exportedAt: new Date().toISOString(),
            quizIds: selectedIds,
            title,
            questions,
            currentQuestionIndex,
        };
        const blob = new Blob([JSON.stringify(progress, null, 2)], {
            type: "application/json",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = "study-pdf-quiz-progress.json";
        link.click();
        URL.revokeObjectURL(url);
    };

    const importProgress = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        try {
            const parsedProgress = parseImportedProgress(
                JSON.parse(await file.text()),
            );
            setImportError("");
            setSessionKey(`imported-${Date.now()}`);
            setImportedTitle(parsedProgress.title);
            setQuestions(parsedProgress.questions);
            setCurrentQuestionIndex(parsedProgress.currentQuestionIndex);
            setAutoSaveEnabled(true);
            setStartQuiz(true);
        } catch (error) {
            setImportError(
                error instanceof Error
                    ? error.message
                    : "Unable to read this quiz progress file.",
            );
        }
    };

    return (
        <main className="flex w-full flex-col gap-6 overflow-y-auto bg-background p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-gray-border bg-background">
                <div>
                    <h2 className="text-2xl">{title}</h2>
                    <h3 className="text-sm text-gray-500">
                        Total Questions: {questions.length}
                    </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        ref={importInputRef}
                        type="file"
                        accept="application/json,.json"
                        onChange={importProgress}
                        className="hidden"
                    />
                    <button
                        onClick={() => importInputRef.current?.click()}
                        className="flex items-center gap-2 rounded border border-gray-border p-2 px-3 text-sm hover:bg-primary/10"
                    >
                        Import progress <Upload className="h-4 w-4" />
                    </button>
                    {startQuiz && (
                        <button
                            onClick={exportProgress}
                            className="flex items-center gap-2 rounded border border-gray-border p-2 px-3 text-sm hover:bg-primary/10"
                        >
                            Export progress <Download className="h-4 w-4" />
                        </button>
                    )}
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
            </div>

            {importError && (
                <p
                    role="alert"
                    className="rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600"
                >
                    Import failed: {importError}
                </p>
            )}

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
