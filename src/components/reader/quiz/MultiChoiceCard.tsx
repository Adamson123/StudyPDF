import { Stars } from "lucide-react";
import { FillAnswerCardTypes } from "./FillAnswerCard";

export type MultiChoiceQuestionTypes = {
  question: string;
  options: string[];
  answer: string;
  choosenAnswer: string;
  explanation: string;
  type: string;
};

const optionAlp = ["A", "B", "C", "D"];

const MultiChoiceCard = ({
  question: { question, answer, explanation, options, choosenAnswer },
  index,
  numberOfQuestions,
  setQuestion,
}: {
  question: MultiChoiceQuestionTypes;
  index: number;
  numberOfQuestions: number;
  setQuestion: React.Dispatch<
    React.SetStateAction<(FillAnswerCardTypes | MultiChoiceQuestionTypes)[]>
  >;
}) => {
  const handleOptionClick = (option: string) => {
    setQuestion(
      (prev) =>
        prev.map((q, i) =>
          i === index ? { ...q, choosenAnswer: option } : q,
        ) as (FillAnswerCardTypes | MultiChoiceQuestionTypes)[],
    );
  };

  const isCorrect = (ans: string) => {
    return ans === answer; //options.find((_, i) => ans === optionAlp[i]) === answer;
  };

  const choseAnswer = (i: number) => {
    return (
      choosenAnswer &&
      (choosenAnswer === optionAlp[i] || answer === optionAlp[i])
    );
  };

  return (
    <div className="flex min-w-[500px] snap-center flex-col items-start gap-5 rounded-md border border-gray-border p-5">
      <div className="flex items-center gap-1 rounded-md bg-primary/30 p-2 text-sm">
        <Stars className="h-4 w-4 fill-primary stroke-primary" />
        Question {index + 1} of {numberOfQuestions}
      </div>
      {/* Question */}
      <div className="text-md font-semibold">{question}</div>
      {/* Options */}
      <div className="flex w-full flex-col gap-2 border-b pb-5">
        {options.map((option, i) => (
          <div
            onClick={() => handleOptionClick(optionAlp[i] as string)}
            key={i}
            className={`flex cursor-pointer items-center gap-2 rounded-md border border-gray-border p-2 text-sm hover:opacity-[0.7] ${choseAnswer(i) && (isCorrect(choosenAnswer === optionAlp[i] ? optionAlp[i] : answer) ? "bg-green-500" : "bg-red-500")}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-border">
              {optionAlp[i]}
            </span>
            <span className="text-sm font-semibold">{option}</span>
          </div>
        ))}
      </div>
      {/* Explanation */}
      <div className="flex w-full flex-col gap-2">
        <div className="text-md underline">Explanation</div>
        <div className="text-sm font-semibold text-gray-500">{explanation}</div>
      </div>
    </div>
  );
};

export default MultiChoiceCard;
