import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Stars } from "lucide-react";
import React, { useRef } from "react";
import { MultiChoiceQuestionTypes } from "./MultiChoiceCard";

export type FillAnswerCardTypes = {
  question: string;
  answer: string[];
  choosenAnswer: string[];
  explanation: string;
};

const FillAnswerCard = ({
  index,
  numberOfQuestions,
  question: { question, answer, explanation, choosenAnswer },
  setQuestion,
}: {
  question: FillAnswerCardTypes;
  index: number;
  numberOfQuestions: number;
  setQuestion: React.Dispatch<
    React.SetStateAction<(FillAnswerCardTypes | MultiChoiceQuestionTypes)[]>
  >;
}) => {
  const answerInputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmitAnswer = () => {
    const pickedAnswers = answerInputs.current.map(
      (answer) => answer?.value.trim() || "",
    );

    setQuestion(
      (prev) =>
        prev.map((q, i) =>
          i === index ? { ...q, choosenAnswer: pickedAnswers } : q,
        ) as (FillAnswerCardTypes | MultiChoiceQuestionTypes)[],
    );
  };

  const getAnswerInputIndex = (i: number) => (i + 1) / 2 - 1;

  return (
    <div className="flex min-w-[500px] snap-center flex-col items-start gap-5 rounded-md border border-gray-border p-5">
      <div className="flex items-center gap-1 rounded-md bg-primary/30 p-2 text-sm">
        <Stars className="h-4 w-4 fill-primary stroke-primary" />
        Question {index + 1} of {numberOfQuestions}
      </div>

      {/* Question */}
      <div className="w-full flex-grow text-xs font-semibold leading-[23px]">
        {question.split(/\*\*(.*?)\*\*/).map((part, i) =>
          i % 2 === 0 ? (
            <span key={i} className="font-semibold">
              {part}
            </span>
          ) : (
            <span key={i}>
              &nbsp;
              <Input
                ref={(el) => {
                  answerInputs.current[getAnswerInputIndex(i)] = el;
                }}
                className={`"bg-gray-400/15" inline h-7 w-auto ${choosenAnswer.length && (choosenAnswer[getAnswerInputIndex(i)] === answer[getAnswerInputIndex(i)] ? "bg-green-500" : "bg-red-500")}`}
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
            {question.split(/\*\*(.*?)\*\*/).map((part, i) =>
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

      <div className="w-full border-b pb-5">
        <Button onClick={handleSubmitAnswer}>Submit Answer</Button>
      </div>
      {/* Explanation */}
      <div className="flex w-full flex-col gap-2">
        <div className="text-md underline">Explanation</div>
        <div className="text-sm font-semibold text-gray-500">{explanation}</div>
      </div>
    </div>
  );
};

export default FillAnswerCard;
