"use client";
import Quiz from "@/components/quiz/Quiz";
import { useParams } from "next/navigation";

const QuizPage = () => {
  const { id } = useParams();
  console.log("Quiz ID:", id);
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Quiz id={id as string} />
    </div>
  );
};

export default QuizPage;
