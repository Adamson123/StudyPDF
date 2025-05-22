"use client";
import { ChevronLeft, X } from "lucide-react";
import MultiChoiceCard, { MultiChoiceQuestionTypes } from "./MultiChoiceCard";
import FillAnswerCard, { FillAnswerCardTypes } from "./FillAnswerCard";
import { useEffect, useRef, useState } from "react";

export const questionsMock: (MultiChoiceQuestionTypes | FillAnswerCardTypes)[] =
  [
    {
      question: "What is the capital of Nigeria?",
      options: ["Abuja", "Lagos", "Kwara", "Abia"],
      answer: "A",
      choosenAnswer: "",
      explanation:
        "Abuja is the capital of Nigeria. It was chosen as the capital in 1991 because of its central location, which makes it more accessible to people from all parts of the country.",
      type: "multiChoice",
    },

    {
      question: "What is the largest planet in our solar system?",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      answer: "C",
      choosenAnswer: "",
      explanation:
        "Jupiter is the largest planet in our solar system. It is a gas giant and has a diameter of about 139,820 km.",
      type: "multiChoice",
    },
    {
      question: "Who wrote 'Romeo and Juliet'?",
      options: [
        "William Shakespeare",
        "Charles Dickens",
        "Mark Twain",
        "Jane Austen",
      ],
      answer: "A",
      choosenAnswer: "",
      explanation:
        "'Romeo and Juliet' is a famous tragedy written by William Shakespeare, one of the greatest playwrights in history.",
      type: "multiChoice",
    },
    {
      question: "What is the chemical symbol for water?",
      options: ["H2O", "O2", "CO2", "NaCl"],
      answer: "A",
      choosenAnswer: "",
      explanation:
        "The chemical symbol for water is H2O, which represents two hydrogen atoms bonded to one oxygen atom.",
      type: "multiChoice",
    },
    {
      question: "**The** gggg **conical flask** is a **laboratory equipment**.",
      choosenAnswer: [],
      answer: ["The", "conical flask", "laboratory equipment"],
      explanation:
        "Conical flasks are used in laboratories for mixing and heating liquids.",
      type: "fillAnswer",
    },
    {
      question: "Which continent is known as the 'Dark Continent'?",
      options: ["Africa", "Asia", "Europe", "South America"],
      answer: "A",
      choosenAnswer: "",
      explanation:
        "Africa was historically referred to as the 'Dark Continent' due to its unexplored and mysterious nature during the colonial era.",
      type: "multiChoice",
    },
    {
      question: "The **conical** flask is a **laboratory** equipment.",
      answer: ["conical", "laboratory"],
      choosenAnswer: [],
      explanation:
        "Conical flasks are used in laboratories for mixing and heating liquids.",
      type: "fillAnswer",
    },
  ];

const Quiz = ({
  questions: questions_1,
}: {
  questions: (MultiChoiceQuestionTypes | FillAnswerCardTypes)[];
}) => {
  const [questions, setQuestions] = useState(
    questions_1.length ? questions_1 : questionsMock,
  );
  const questionsContainerRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    if (!questions_1.length) return;
    setQuestions(questions_1);
  }, [questions_1]);

  const scrollToQuestion = (index: number) => {
    if (questionsContainerRef.current) {
      const questionCard = questionsContainerRef.current.children[
        index
      ] as HTMLElement;
      if (questionCard) {
        questionCard.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  const handleBack = () => {
    if (scrollIndex > 0) {
      setScrollIndex(scrollIndex - 1);
      scrollToQuestion(scrollIndex - 1);
      console.log(scrollIndex - 1);
    }
  };

  const handleNext = () => {
    if (scrollIndex < questions.length - 1) {
      setScrollIndex(scrollIndex + 1);
      scrollToQuestion(scrollIndex + 1);
      console.log(scrollIndex + 1);
    }
  };

  return (
    <div className="bg- fixed inset-0 z-[10] flex flex-col gap-3 overflow-y-auto bg-background p-6 pt-16">
      <div className="flex items-center justify-between border-gray-border bg-background">
        <div>
          <h2 className="text-3xl">Quiz: CIT108</h2>
          <h3 className="text-gray-500">Total QuestionCards: 10</h3>
        </div>
        <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-border">
          <X />
        </button>
      </div>

      {/* Question Cards  grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3*/}
      {
        <div
          ref={questionsContainerRef}
          style={{ scrollbarWidth: "none" }}
          className="m-auto flex w-[500px] snap-x snap-mandatory overflow-x-auto"
        >
          {questions.map((question, i) =>
            (question as MultiChoiceQuestionTypes).type === "multiChoice" ? (
              <MultiChoiceCard
                key={i}
                index={i}
                numberOfQuestions={questions.length}
                setQuestion={setQuestions}
                question={question as MultiChoiceQuestionTypes}
              />
            ) : (
              <FillAnswerCard
                key={i}
                question={question as FillAnswerCardTypes}
                index={i}
                setQuestion={setQuestions}
                numberOfQuestions={questions.length}
              />
            ),
          )}
        </div>
      }
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex w-full items-center justify-between gap-2">
          <button
            onClick={() => {
              handleBack();
            }}
            className="h-10 w-32 rounded-full border border-gray-border"
          >
            <ChevronLeft className="inline" /> &nbsp; Back
          </button>
          <button
            onClick={() => {
              handleNext();
            }}
            className="h-10 w-32 rounded-full border border-gray-border"
          >
            Next &nbsp; <ChevronLeft className="inline rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
