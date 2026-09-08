import { Button } from "@/components/ui/button";
import { Stars } from "lucide-react";
import React, { useEffect, useState } from "react";

const normalize = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

const hasKeyword = (answer: string, keyword: string) => {
    const normalizedKeyword = normalize(keyword);
    return normalizedKeyword
        .split(" ")
        .every((word) => new RegExp(`(^|\\s)${word}(?=\\s|$)`).test(answer));
};

const DefinitionCard = ({
    index,
    numberOfQuestions,
    question: { question, answer, keywords, explanation, choosenAnswer, matchedKeywords = [] },
    setQuestions,
    setCurrentQuestion,
}: {
    question: DefinitionQuestionTypes;
    index: number;
    numberOfQuestions: number;
    setQuestions: React.Dispatch<React.SetStateAction<QuizTypes[]>>;
    setCurrentQuestion: React.Dispatch<React.SetStateAction<QuizTypes>>;
}) => {
    const [response, setResponse] = useState(choosenAnswer);

    useEffect(() => setResponse(choosenAnswer), [choosenAnswer]);

    const submitAnswer = () => {
        const submittedAnswer = response.trim();
        if (!submittedAnswer || choosenAnswer) return;

        const normalizedAnswer = normalize(submittedAnswer);
        const matched = keywords.filter((keyword) => hasKeyword(normalizedAnswer, keyword));
        const isCorrect = matched.length === keywords.length;

        const updated = {
            question,
            answer,
            keywords,
            explanation,
            type: "definition" as const,
            choosenAnswer: submittedAnswer,
            matchedKeywords: matched,
            isCorrect,
        };

        setCurrentQuestion(updated);
        setQuestions((previous) =>
            previous.map((item, itemIndex) =>
                itemIndex === index ? updated : item,
            ),
        );
    };

    const missingKeywords = keywords.filter(
        (keyword) => !matchedKeywords.includes(keyword),
    );

    return (
        <div className="flex max-w-[600px] flex-col items-start gap-5 rounded-md border border-gray-border p-5">
            <div className="flex items-center gap-1 rounded-md bg-primary/30 p-2 text-sm">
                <Stars className="h-4 w-4 fill-primary stroke-primary" />
                Question {index + 1} of {numberOfQuestions}
            </div>

            <div className="w-full text-sm font-semibold leading-6">{question}</div>

            <textarea
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                disabled={Boolean(choosenAnswer)}
                placeholder="Write your definition in your own words…"
                className="min-h-32 w-full rounded-md border border-gray-border bg-gray-400/15 p-3 text-sm outline-none focus:border-primary disabled:cursor-not-allowed"
            />

            {!choosenAnswer ? (
                <Button onClick={submitAnswer} disabled={!response.trim()}>
                    Submit Definition
                </Button>
            ) : (
                <div className="flex w-full flex-col gap-3 text-sm">
                    <div className="rounded-md bg-primary/10 p-3">
                        <strong>Keyword score: </strong>
                        {matchedKeywords.length} / {keywords.length}
                    </div>
                    <div>
                        <strong>Matched: </strong>
                        {matchedKeywords.length ? matchedKeywords.join(", ") : "None yet"}
                    </div>
                    {missingKeywords.length > 0 && (
                        <div className="text-red-500">
                            <strong>Missing: </strong>
                            {missingKeywords.join(", ")}
                        </div>
                    )}
                    <div>
                        <strong>Expected definition: </strong>
                        {answer}
                    </div>
                    <div className="text-gray-500">
                        <strong>Explanation: </strong>
                        {explanation}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DefinitionCard;
