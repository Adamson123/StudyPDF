import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useState,
} from "react";
import MultiChoiceCard from "./MultiChoiceCard";
import FillAnswerCard from "./FillAnswerCard";
import DefinitionCard from "./DefinitionCard";
import Result from "./Result";
import { ChevronLeft } from "lucide-react";

export const QuizActive = ({
    autoSaveEnabled,
    currentQuestionIndex,
    onQuizCompleted,
    questions,
    setAutoSaveEnabled,
    setCurrentQuestionIndex,
    setQuestions,
    setStartQuiz,
}: {
    autoSaveEnabled: boolean;
    currentQuestionIndex: number;
    onQuizCompleted: () => void;
    questions: QuizTypes[];
    setAutoSaveEnabled: (enabled: boolean) => void;
    setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
    setQuestions: React.Dispatch<React.SetStateAction<QuizTypes[]>>;
    setStartQuiz: Dispatch<SetStateAction<boolean>>;
}) => {
    const [currentQuestion, setCurrentQuestion] = useState<
        MultiChoiceQuestionTypes | FillAnswerTypes | DefinitionQuestionTypes
    >();
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        const warnOnPageReload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", warnOnPageReload);

        return () => {
            window.removeEventListener("beforeunload", warnOnPageReload);
        };
    }, []);

    useEffect(() => {
        setCurrentQuestion(questions[currentQuestionIndex]);
    }, [currentQuestionIndex, questions]);

    useEffect(() => {
        if (showResult) onQuizCompleted();
    }, [onQuizCompleted, showResult]);

    const amountOfAnsweredQuestion = useMemo(
        () =>
            questions.filter((question) => question.choosenAnswer.length)
                .length,
        [questions],
    );

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    return (
        <div className="background w-full space-y-6">
            {!showResult && (
                <>
                    <div className="m-auto flex w-full flex-col items-center gap-7">
                        <div className="flex w-full max-w-[600px] flex-col items-center gap-2 pb-2 text-sm text-gray-500">
                            <p>
                                Answered &nbsp;{amountOfAnsweredQuestion} /{" "}
                                {questions.length}
                            </p>
                            <progress
                                value={amountOfAnsweredQuestion}
                                max={questions.length}
                                className="h-2 w-full"
                            />
                            <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-foreground">
                                <input
                                    type="checkbox"
                                    checked={autoSaveEnabled}
                                    onChange={(event) =>
                                        setAutoSaveEnabled(
                                            event.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 accent-primary"
                                />
                                Auto-save quiz progress on this device
                            </label>
                            <p className="text-center text-xs">
                                Resume from your last answered question after a
                                reload or accidental browser close.
                            </p>
                        </div>

                        {currentQuestion && (
                            <>
                                {(currentQuestion as MultiChoiceQuestionTypes)
                                    .type === "multiChoice" ? (
                                    <MultiChoiceCard
                                        index={currentQuestionIndex}
                                        numberOfQuestions={questions.length}
                                        setQuestions={setQuestions}
                                        question={
                                            currentQuestion as MultiChoiceQuestionTypes
                                        }
                                        setCurrentQuestion={
                                            setCurrentQuestion as any
                                        }
                                    />
                                ) : (currentQuestion as DefinitionQuestionTypes)
                                      .type === "definition" ? (
                                    <DefinitionCard
                                        question={
                                            currentQuestion as DefinitionQuestionTypes
                                        }
                                        index={currentQuestionIndex}
                                        setQuestions={setQuestions}
                                        numberOfQuestions={questions.length}
                                        setCurrentQuestion={
                                            setCurrentQuestion as React.Dispatch<
                                                React.SetStateAction<QuizTypes>
                                            >
                                        }
                                    />
                                ) : (
                                    <FillAnswerCard
                                        question={
                                            currentQuestion as FillAnswerTypes
                                        }
                                        index={currentQuestionIndex}
                                        setQuestions={setQuestions}
                                        numberOfQuestions={questions.length}
                                        setCurrentQuestion={
                                            setCurrentQuestion as React.Dispatch<
                                                React.SetStateAction<
                                                    | FillAnswerTypes
                                                    | MultiChoiceQuestionTypes
                                                    | DefinitionQuestionTypes
                                                >
                                            >
                                        }
                                    />
                                )}
                            </>
                        )}
                    </div>

                    <div className="flex w-full items-center justify-between gap-2 pt-10">
                        <div className="flex w-full items-center justify-between gap-2">
                            {currentQuestionIndex ? (
                                <button
                                    onClick={handleBack}
                                    className="h-10 w-32 rounded-full border border-gray-border"
                                >
                                    <ChevronLeft className="inline" /> &nbsp;
                                    Back
                                </button>
                            ) : (
                                <div className="w-32" />
                            )}
                            {amountOfAnsweredQuestion === questions.length && (
                                <button
                                    onClick={() => setShowResult(true)}
                                    className="h-10 w-32 rounded-md bg-primary text-white"
                                >
                                    Submit
                                </button>
                            )}
                            {currentQuestion?.choosenAnswer.length &&
                            currentQuestionIndex < questions.length - 1 ? (
                                <button
                                    onClick={handleNext}
                                    className="h-10 w-32 rounded-full border border-gray-border"
                                >
                                    Next &nbsp;
                                    <ChevronLeft className="inline rotate-180" />
                                </button>
                            ) : (
                                <div className="w-32" />
                            )}
                        </div>
                    </div>
                </>
            )}

            {showResult && (
                <Result
                    setCurrentQuestionIndex={setCurrentQuestionIndex}
                    setQuestions={setQuestions}
                    setShowResult={setShowResult}
                    questions={questions}
                    setStartQuiz={setStartQuiz}
                />
            )}
        </div>
    );
};
