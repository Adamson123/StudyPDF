"use client";
import { ChevronLeft } from "lucide-react";
import MultiChoiceCard from "./MultiChoiceCard";
import FillAnswerCard from "./FillAnswerCard";
import { useEffect, useState } from "react";
import Result from "./Result";
import { questionsMock } from "@/data/static-data/questionMock";
import { getQuizById } from "@/lib/quizStorage";

const Quiz = ({ id }: { id: string }) => {
  const [questions, setQuestions] = useState(questionsMock);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<
    MultiChoiceQuestionTypes | FillAnswerTypes
  >();
  const [showResult, setShowResult] = useState(false);

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

  useEffect(() => {
    const question = questions[currentQuestionIndex];
    setCurrentQuestion(question);
  }, [currentQuestionIndex, questions]);

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

  const getAmountOfAnsweredQuestion = () => {
    return questions.filter((question) => question.choosenAnswer.length).length;
  };

  const amountOfAnsweredQuestion = getAmountOfAnsweredQuestion();

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col gap-6 overflow-y-auto bg-background p-6">
      <div className="flex items-center justify-between border-gray-border bg-background">
        <div>
          <h2 className="text-3xl">Quiz: CIT108</h2>
          <h3 className="text-gray-500">Total Questions: {questions.length}</h3>
        </div>
        {/* <button
          onClick={() => setOpenQuiz(false)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-border"
        >
          <X />
        </button> */}
      </div>

      <div className="m-auto flex w-full flex-col items-center gap-7">
        <div className="flex flex-col items-center gap-2 pb-2 text-sm text-gray-500">
          <progress
            value={amountOfAnsweredQuestion}
            max={questions.length}
            className="w-[300px]"
          />
          <p>
            Answered &nbsp;{amountOfAnsweredQuestion} / {questions.length}
          </p>
        </div>
        {currentQuestion && (
          <div className="">
            {(currentQuestion as MultiChoiceQuestionTypes).type ===
            "multiChoice" ? (
              <MultiChoiceCard
                index={currentQuestionIndex}
                numberOfQuestions={questions.length}
                setQuestions={setQuestions}
                question={currentQuestion as MultiChoiceQuestionTypes}
                setCurrentQuestion={setCurrentQuestion as any}
              />
            ) : (
              <FillAnswerCard
                question={currentQuestion as FillAnswerTypes}
                index={currentQuestionIndex}
                setQuestions={setQuestions}
                numberOfQuestions={questions.length}
                setCurrentQuestion={
                  setCurrentQuestion as React.Dispatch<
                    React.SetStateAction<
                      FillAnswerTypes | MultiChoiceQuestionTypes
                    >
                  >
                }
              />
            )}
          </div>
        )}
      </div>

      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex w-full items-center justify-between gap-2">
          {currentQuestionIndex ? (
            <button
              onClick={() => {
                handleBack();
              }}
              className="h-10 w-32 rounded-full border border-gray-border"
            >
              <ChevronLeft className="inline" /> &nbsp; Back
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
              Next &nbsp; <ChevronLeft className="inline rotate-180" />
            </button>
          ) : (
            <div className="w-32" />
          )}
        </div>
      </div>
      {showResult && (
        <Result
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          setQuestions={setQuestions}
          setShowResult={setShowResult}
          questions={questions}
        />
      )}
    </div>
  );
};

export default Quiz;
