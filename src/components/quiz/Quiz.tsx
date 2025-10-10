"use client";

import { useEffect, useState } from "react";
//import { questionsMock } from "@/data/static-data/questionMock";
import { QuizActive } from "./QuizActive";
import QuestionsPreview from "./QuestionsPreview";
import { Play } from "lucide-react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/hooks/useAppStore";

const Quiz = () => {
    const { id } = useParams() as { id: string };
    const [startQuiz, setStartQuiz] = useState(false);
    const quizzesData = useAppSelector((state) =>
        state.quizzes.items.find((q) => q.id === id),
    );
    const title = quizzesData?.title || "";
    const [questions, setQuestions] = useState(quizzesData?.questions || []);

    useEffect(() => {
        const warnOnPageReload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = ""; // This is required for some browsers to show the confirmation dialog
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
                    <h2 className="text-2xl">{title}</h2>
                    <h3 className="text-sm text-gray-500">
                        Total Questions: {questions.length}
                    </h3>
                </div>
                {!startQuiz && (
                    <button
                        onClick={() => setStartQuiz(true)}
                        className="flex items-center gap-2 text-nowrap rounded bg-green-500 p-2 px-3 text-sm text-white transition-all hover:bg-green-600"
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
                <QuestionsPreview
                    questions={questions}
                    setStartQuiz={setStartQuiz}
                />
            )}
        </main>
    );
};

export default Quiz;
