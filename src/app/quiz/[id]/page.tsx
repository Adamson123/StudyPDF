"use client";
import Quiz from "@/components/quiz/Quiz";
import { useParams } from "next/navigation";

const QuizPage = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Quiz />
    </div>
  );
};

export default QuizPage;
