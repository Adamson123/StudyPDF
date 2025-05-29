import { Check, Home, RotateCcw, X } from "lucide-react";
import React, { SetStateAction, useEffect, useState } from "react";
import MultiChoiceCard from "./MultiChoiceCard";
import FillAnswerCard from "./FillAnswerCard";
import { useRouter } from "next/navigation";

const getRemark = (score: number) => {
  if (score === 100) return "Excellent!";
  if (score >= 80) return "Great job!";
  if (score >= 50) return "Good effort!";
  return "Keep trying!";
};

const Result = ({
  questions,
  setShowResult,
  setQuestions,

  setCurrentQuestionIndex,
}: {
  questions: (MultiChoiceQuestionTypes | FillAnswerTypes)[];
  setShowResult: React.Dispatch<SetStateAction<boolean>>;
  setQuestions: React.Dispatch<
    React.SetStateAction<(MultiChoiceQuestionTypes | FillAnswerTypes)[]>
  >;

  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [result, setResult] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    score: 0,
  });
  const router = useRouter();

  useEffect(() => {
    if (questions.length === 0) return;

    const totalQuestions = questions.length;
    const correctAnswers = questions.filter((q) => q.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    setResult({ totalQuestions, correctAnswers, incorrectAnswers, score });
  }, [questions]);

  const restartQuiz = () => {
    setShowResult(false);

    setQuestions((prev) =>
      prev.map(
        (q) =>
          ({
            ...q,
            choosenAnswer: q.type === "multiChoice" ? "" : [],
            isCorrect: false,
          }) as MultiChoiceQuestionTypes | FillAnswerTypes,
      ),
    );
    setCurrentQuestionIndex(0);
  };

  const { totalQuestions, correctAnswers, incorrectAnswers, score } = result;

  return (
    <div className="fixed inset-0 flex flex-col items-center gap-10 overflow-auto bg-background px-5 pb-10 pt-20">
      <div className="flex w-full flex-col items-center gap-3">
        <div className="text-lg font-semibold">
          {score}% {getRemark(score)}
        </div>

        <div className="flex w-full max-w-[500px] items-center gap-2">
          {/* <div className="h-2 flex-grow rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${score}%` }}
              ></div>
            </div> */}
          <progress value={score} max={100} className="resultProgress w-full" />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span>
            <Check className="inline h-5 w-5 stroke-green-500" />{" "}
            {correctAnswers} correct
          </span>
          <span>·</span>
          <span>
            <X className="inline h-5 w-5 stroke-red-500" /> {incorrectAnswers}{" "}
            incorrect
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={restartQuiz}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-white"
            aria-label="Retry"
          >
            Restart Quiz
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.replace("/")}
            className="flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm text-white"
            aria-label="Retry"
          >
            Go Home
            <Home className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {questions.map((question, index) =>
          (question as MultiChoiceQuestionTypes).type === "multiChoice" ? (
            <MultiChoiceCard
              key={index}
              index={index}
              setQuestions={() => {}}
              setCurrentQuestion={() => {}}
              numberOfQuestions={questions.length}
              question={question as MultiChoiceQuestionTypes}
            />
          ) : (
            <FillAnswerCard
              key={index}
              setQuestions={() => {}}
              question={question as FillAnswerTypes}
              index={index}
              setCurrentQuestion={() => {}}
              numberOfQuestions={questions.length}
            />
          ),
        )}
      </div>
    </div>
  );
};

export default Result;
