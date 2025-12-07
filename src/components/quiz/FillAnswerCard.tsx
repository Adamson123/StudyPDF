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
        React.SetStateAction<(FillAnswerTypes | MultiChoiceQuestionTypes)[]>
    >;
    setCurrentQuestion: React.Dispatch<
        React.SetStateAction<FillAnswerTypes | MultiChoiceQuestionTypes>
    >;
}) => {
    const answerInputs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const inputs = answerInputs.current;
        if (inputs.length) {
            inputs.forEach((input, i) => {
                console.log("Setting input value", choosenAnswer[i], i);
                if (input) input!.value = (choosenAnswer[i] as string) || "";
            });
        }
    }, [answer]);

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
                ) as (FillAnswerTypes | MultiChoiceQuestionTypes)[],
        );
    };

    const getAnswerInputIndex = (i: number) => (i + 1) / 2 - 1;

    const splittedQuestion = question.split(/_{5,}/g);
    let count = 0;
    question.split(/_{5,}/g).forEach((q, i) => {
        if (i % 2 === 0) {
            // const word = splittedQuestion[i + 1] as string;
            // splittedQuestion[i + 1] = answer[count] as string;
            // splittedQuestion[i + 2] = word;
            const ans = answer[count] as string;
            splittedQuestion.splice(i + 1, 0, ans);
        }
    });

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
                                className={`inline h-7 w-auto bg-gray-400/15 ${choosenAnswer.length && (choosenAnswer[getAnswerInputIndex(i)] === answer[getAnswerInputIndex(i)] ? "bg-green-500/40" : "bg-red-500/40")}`}
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
                                <span key={i} className="text-green-500">
                                    {part}
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
