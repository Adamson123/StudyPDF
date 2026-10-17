import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Stars } from "lucide-react";
import React, { useEffect, useRef } from "react";

const FillAnswerCard = ({
    index,
    numberOfQuestions,
    question: { question, answer, explanation, choosenAnswer },
    setQuestions,
    setCurrentQuestion,
}: {
    question: FillAnswerTypes;
    index: number;
    numberOfQuestions: number;
    setQuestions: React.Dispatch<
        React.SetStateAction<QuizTypes[]>
    >;
    setCurrentQuestion: React.Dispatch<
        React.SetStateAction<QuizTypes>
    >;
}) => {
    const answerInputs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const inputs = answerInputs.current;
        if (inputs.length) {
            inputs.forEach((input, i) => {
                if (input) input.value = choosenAnswer[i] || "";
            });
        }
    }, [choosenAnswer]);

    const handleSubmitAnswer = () => {
        if (choosenAnswer.length) return;
        const pickedAnswers = answerInputs.current.map(
            (answer) => answer?.value.trimEnd().trimStart() || "",
        );

        const isCorrect = pickedAnswers.every(
            (pickedAnswer, i) =>
                pickedAnswer.toLowerCase() === answer[i]?.toLowerCase(),
        );

        setCurrentQuestion(
            (prev) =>
                ({
                    ...prev,
                    choosenAnswer: pickedAnswers,
                    isCorrect,
                }) as FillAnswerTypes,
        );
        setQuestions(
            (prev) =>
                prev.map((q, i) =>
                    i === index
                        ? { ...q, choosenAnswer: pickedAnswers, isCorrect }
                        : q,
                ) as QuizTypes[],
        );
    };

    const getAnswerInputIndex = (partIndex: number) => (partIndex - 1) / 2;

    const normalizeAnswer = (value?: string) => value?.trim().toLowerCase() || "";
    const isAnswerCorrect = (answerIndex: number) =>
        normalizeAnswer(choosenAnswer[answerIndex]) ===
        normalizeAnswer(answer[answerIndex]);

    const splittedQuestion = question.split(/(_{5,})/g);

    return (
        <div className="flex max-w-[600px] snap-center flex-col items-start gap-5 rounded-md border border-gray-border p-5">
            <div className="flex items-center gap-1 rounded-md bg-primary/30 p-2 text-sm">
                <Stars className="h-4 w-4 fill-primary stroke-primary" />
                Question {index + 1} of {numberOfQuestions}
            </div>

            {/* Question */}
            <div className="w-full flex-grow text-xs font-semibold leading-[23px]">
                {splittedQuestion.map((part, i) =>
                    i % 2 === 0 ? (
                        <span key={i} className="font-semibold">
                            {part}
                        </span>
                    ) : (
                        <span key={i}>
                            &nbsp;
                            <Input
                                ref={(el) => {
                                    answerInputs.current[
                                        getAnswerInputIndex(i)
                                    ] = el;
                                }}
                                className={`inline h-7 w-auto bg-gray-400/15 ${
                                    choosenAnswer.length > 0
                                        ? isAnswerCorrect(getAnswerInputIndex(i))
                                            ? "border-2 border-green-500"
                                            : "border-2 border-red-500"
                                        : ""
                                }`}
                            />{" "}
                            &nbsp;
                        </span>
                    ),
                )}
            </div>
            {/* Answer */}

            {choosenAnswer.length ? (
                <div className="flex w-full flex-col gap-2">
                    <div className="text-md underline">Answer</div>
                    <div className="w-full flex-grow text-xs font-semibold leading-[23px]">
                        {splittedQuestion.map((part, i) =>
                            i % 2 === 0 ? (
                                <span key={i} className="font-semibold">
                                    {part}
                                </span>
                            ) : (
                                <span
                                    key={i}
                                    className="mx-1 inline-block rounded border-2 border-green-500 px-1 text-green-500"
                                >
                                    {answer[getAnswerInputIndex(i)] || ""}
                                </span>
                            ),
                        )}
                    </div>
                </div>
            ) : (
                ""
            )}

            <div className="w-full border-b pb-3">
                {!choosenAnswer.length && (
                    <Button onClick={handleSubmitAnswer}>Submit Answer</Button>
                )}
            </div>

            {/* Explanation */}
            <div
                className={`flex w-full flex-col gap-2 ${choosenAnswer.length ? "" : "blur"}`}
            >
                <div className="text-md underline">Explanation</div>
                <div className="text-sm font-semibold text-gray-500">
                    {explanation}
                </div>
            </div>
        </div>
    );
};

export default FillAnswerCard;
