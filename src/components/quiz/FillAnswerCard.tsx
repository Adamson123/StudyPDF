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
  const answerInputs = useRef<(HTMLInputElement | null)[]>([]); // Keep as array, access [0]

  useEffect(() => {
    const input = answerInputs.current[0];
    if (input) {
      if (choosenAnswer.length) {
        input.value = (choosenAnswer[0] as string) || "";
      } else {
        input.value = ""; // Clear if no chosen answer yet or question changes
      }
    }
  }, [choosenAnswer, question.question]); // question.question to reset if question changes

  const handleSubmitAnswer = () => {
    if (choosenAnswer.length) return;
    // Ensure answer[0] exists for comparison, though prompt implies it will.
    const pickedAnswer = answerInputs.current[0]?.value.trim() || "";
    const isCorrect = answer && answer.length > 0 && pickedAnswer === answer[0];
    const pickedAnswers = [pickedAnswer]; // Store as an array as per FillAnswerTypes

    setCurrentQuestion(
      (prev) =>
        ({
          ...prev,
          choosenAnswer: pickedAnswers, // choosenAnswer is string[]
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

  // const getAnswerInputIndex = (i: number) => (i + 1) / 2 - 1; // No longer needed

  return (
    <div className="flex max-w-[600px] snap-center flex-col items-start gap-5 rounded-md border border-gray-border p-5">
      <div className="flex items-center gap-1 rounded-md bg-primary/30 p-2 text-sm">
        <Stars className="h-4 w-4 fill-primary stroke-primary" />
        Question {index + 1} of {numberOfQuestions}
      </div>

      {/* Question Display */}
      <div className="w-full flex-grow text-xs font-semibold leading-[23px]">
        {question.split(/(____)/g).map((part, i) =>
          part === "____" ? (
            <span key={i} className="font-semibold">
              {" "}
              ____{" "}
            </span>
          ) : (
            <span key={i} className="font-semibold">
              {part}
            </span>
          ),
        )}
      </div>

      {/* Input Field for Answer */}
      {!choosenAnswer.length ? (
        <Input
          ref={(el) => {
            answerInputs.current[0] = el;
          }}
          className="h-7 w-auto bg-gray-400/15"
          placeholder="Type your answer here..."
        />
      ) : (
        // Display submitted answer in a styled input (read-only)
        <Input
          ref={(el) => {
            answerInputs.current[0] = el;
          }}
          className={`h-7 w-auto ${question.isCorrect ? "bg-green-500/40 border-green-700" : "bg-red-500/40 border-red-700"}`}
          defaultValue={(choosenAnswer[0] as string) || ""}
          readOnly
        />
      )}

      {/* Display Correct Answer after submission */}
      {choosenAnswer.length && answer && answer.length > 0 ? (
        <div className="flex w-full flex-col gap-2">
          <div className="text-md underline">Correct Answer</div>
          <div className="w-full flex-grow text-xs font-semibold leading-[23px]">
            <span className="font-bold">{answer[0]}</span>
          </div>
        </div>
      ) : null}

      <div className="w-full border-b pb-3">
        {!choosenAnswer.length && (
          <Button onClick={handleSubmitAnswer}>Submit Answer</Button>
        )}
      </div>

      {/* Justification Prompt */}
      {choosenAnswer.length > 0 && question.justification_prompt && (
        <div className="flex w-full flex-col gap-2 pt-2">
          <div className="text-md underline">Reflection Prompt</div>
          <div className="text-sm font-semibold text-gray-600">
            {question.justification_prompt}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div
        className={`flex w-full flex-col gap-2 ${
          choosenAnswer.length > 0 ? "" : "blur"
        } ${choosenAnswer.length > 0 && question.justification_prompt ? "pt-2" : ""}`}
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
