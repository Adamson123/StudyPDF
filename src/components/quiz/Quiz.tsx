"use client";

import { useEffect, useState } from "react";
import { questionsMock } from "@/data/static-data/questionMock";
import { getQuizById } from "@/lib/quizStorage";
import { QuizActive } from "./QuizActive";
import Preview from "./Preview";
import { Play } from "lucide-react";

const Quiz = ({ id }: { id: string }) => {
  const [questions, setQuestions] = useState(questionsMock);
  const [startQuiz, setStartQuiz] = useState(false);

  useEffect(() => {
    const localQuestions = getQuizById(id);
    if (localQuestions) {
      setQuestions(localQuestions);
    }

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

  return (
    <main className="flex w-full flex-col gap-6 overflow-y-auto bg-background p-6">
      <div className="flex items-center justify-between border-gray-border bg-background">
        <div className="">
          <h2 className="text-2xl">CIT108.pdf</h2>
          <h3 className="text-sm text-gray-500">
            Total Questions: {questions.length}
          </h3>
        </div>
        {!startQuiz && (
          <button
            onClick={() => setStartQuiz(true)}
            className="flex items-center gap-2 rounded bg-green-500 p-2 px-3 text-sm text-white transition-all hover:bg-green-600"
          >
            Start Quiz <Play className="h-4 w-4 fill-white" />
          </button>
        )}
      </div>
      {/* Quiz Active */}
      {startQuiz ? (
        <QuizActive
          setStartQuiz={setStartQuiz}
          questions={questions}
          setQuestions={setQuestions}
        />
      ) : (
        <Preview questions={questions} setStartQuiz={setStartQuiz} />
      )}
    </main>
  );
};

export default Quiz;
