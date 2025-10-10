import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useMemo,
    useState,
} from "react";
import MultiChoiceCard from "./MultiChoiceCard";
import FillAnswerCard from "./FillAnswerCard";
import Result from "./Result";
import { ChevronLeft } from "lucide-react";

export const QuizActive = ({
    questions,
    setQuestions,
    setStartQuiz,
}: {
    questions: QuizTypes[];
    setQuestions: React.Dispatch<React.SetStateAction<QuizTypes[]>>;
    setStartQuiz: Dispatch<SetStateAction<boolean>>;
}) => {
    const [currentQuestion, setCurrentQuestion] = useState<
        MultiChoiceQuestionTypes | FillAnswerTypes
    >();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        //TODO: Remove the event listener when the component unmounts
        const warnOnPageReload = (event: BeforeUnloadEvent) => {
            // if (questions.some((question) => question.choosenAnswer.length)) {
            event.preventDefault();
            event.returnValue = ""; // This is required for some browsers to show the confirmation dialog
            // }
        };

        window.addEventListener("beforeunload", warnOnPageReload);

        return () => {
            window.removeEventListener("beforeunload", warnOnPageReload);
        };
    }, []);

    useEffect(() => {
        const question = questions[currentQuestionIndex];
        setCurrentQuestion(question);
    }, [currentQuestionIndex, questions]);

    const amountOfAnsweredQuestion = useMemo(() => {
        return questions.filter((question) => question.choosenAnswer.length)
            .length;
    }, [questions]);

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            console.log(currentQuestionIndex - 1);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            console.log(currentQuestionIndex + 1);
        }
    };

    return (
        <div className="background w-full space-y-6">
            {!showResult && (
                <>
                    <div className="m-auto flex w-full flex-col items-center gap-7">
                        {/* Progress */}
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
                        </div>
                        {currentQuestion && (
                            <div className="">
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
                                                >
                                            >
                                        }
                                    />
                                )}
                            </div>
                        )}
                    </div>
                    {/* Question */}
                    <div className="flex w-full items-center justify-between gap-2 pt-10">
                        <div className="flex w-full items-center justify-between gap-2">
                            {currentQuestionIndex ? (
                                <button
                                    onClick={() => {
                                        handleBack();
                                    }}
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
                                    onClick={() => {
                                        setShowResult(true);
                                    }}
                                    className="h-10 w-32 rounded-md bg-primary text-white"
                                >
                                    Submit
                                </button>
                            )}
                            {currentQuestion?.choosenAnswer.length &&
                            currentQuestionIndex < questions.length - 1 ? (
                                <button
                                    onClick={() => {
                                        handleNext();
                                    }}
                                    className="h-10 w-32 rounded-full border border-gray-border"
                                >
                                    Next &nbsp;{" "}
                                    <ChevronLeft className="inline rotate-180" />
                                </button>
                            ) : (
                                <div className="w-32" />
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* result */}
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
