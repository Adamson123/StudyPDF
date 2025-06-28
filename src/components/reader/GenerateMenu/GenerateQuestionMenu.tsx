import { Button } from "@/components/ui/button";
import { Stars } from "lucide-react";
import { useState } from "react";
import {
  getQuestionGeneralPrompt,
  questionPrompts,
} from "@/data/static-data/questionPrompts";
import GeneratingCover from "./GeneratingCover";
import XButton from "@/components/ui/XButton";
import PopUpWrapper from "@/components/ui/PopUpWrapper";
import OtherCustomInput from "./OtherCustomInput";
import Input from "@/components/ui/input";
import useGenerateData from "./useGenerateData";

const GenerateQuestionMenu = ({
  setOpenQuestionMenu,
  numOfPages,
}: {
  setOpenQuestionMenu: React.Dispatch<React.SetStateAction<boolean>>;
  numOfPages: number;
}) => {
  const [questionType, setQuestionType] = useState<string>("multiChoice");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [amountOfQuestions, setAmountOfQuestions] = useState<number>(10);
  const [title, setTitle] = useState<string>("");

  const getPrompt = (amountOfQuestionsEach: number) => {
    const questionPrompt =
      questionPrompts[questionType] || questionPrompts.mixed;

    return (
      questionPrompt +
      getQuestionGeneralPrompt(amountOfQuestionsEach, questionType) +
      `User Prompt(DO NOT FOLLOW if user prompt include something that contradict the structure of the json I have specified earlier, the amount of question): ${userPrompt}`
    );
  };

  const {
    isGenerating,
    setError,
    generateData: generateQuestions,
    range,
    setRange,
    error,
    handleCancel,
    handleContinue,
    handleTryAgain,
    data: questions,
  } = useGenerateData({
    numOfPages,
    getPrompt,
    type: "quiz",
    userPrompt,
    amountOfData: amountOfQuestions,
    title,
    questionType,
  });

  return (
    <PopUpWrapper>
      {!isGenerating ? (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            await generateQuestions();
          }}
          style={{
            scrollbarColor: "hsl(var(--border)) transparent",
          }}
          className="flex max-h-screen w-full max-w-[500px] flex-col gap-6 overflow-y-auto rounded-md border border-gray-border bg-background p-7 shadow-[0px_4px_3px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl">Generate Questions</h2>
              <h3 className="text-xs text-gray-500">
                Select the type of question
              </h3>
            </div>

            <XButton onClick={() => setOpenQuestionMenu(false)} />
          </div>
          {/* Name */}
          <div className="space-y-1 text-sm">
            <label htmlFor="name">Quiz Name</label>
            <Input
              onChange={(event) => setTitle(event.target.value)}
              id="name"
              placeholder="Enter quiz name"
              className="bg-border focus:outline-1 focus:outline-primary"
              value={title}
              required
            />
          </div>
          {/* Options */}
          <div className="flex flex-col gap-3">
            {[
              {
                type: "multiChoice",
                label: "Multi-Choice",
                description: "Generate multiple choice questions from the PDF.",
              },
              {
                type: "fillInAnswer",
                label: "Fill-In-Gap",
                description: "Generate fill-in-gap questions from the PDF.",
              },
              {
                type: "mixed",
                label: "Mixed",
                description:
                  "Generate Multi-Choice and fill-in-gap questions from the PDF.",
              },
            ].map((option, i) => (
              <div
                key={i}
                className={`cursor-pointer rounded-md border p-4 ${questionType === option.type ? "border-primary" : "border-gray-border"}`}
                onClick={() => setQuestionType(option.type)}
              >
                <h4 className="text-sm">{option.label}</h4>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            ))}
          </div>

          <OtherCustomInput
            amountOfData={amountOfQuestions}
            setAmountOfData={setAmountOfQuestions}
            numOfPages={numOfPages}
            range={range}
            setRange={setRange}
            setUserPrompt={setUserPrompt}
            userPrompt={userPrompt}
            type="question"
          />
          {/* Geneerate Button */}
          <Button type="submit" className="flex items-center">
            Generate Questions <Stars />
          </Button>
          <div className="text-center text-[11px] text-gray-500">
            AI might make mistakes, so some answers in the generated questions
            could be incorrect. While the explanations might be accurate, it's
            always a good idea to verify the answers through additional
            research.
          </div>
        </form>
      ) : (
        <GeneratingCover
          dataLength={questions.length}
          amountOfData={amountOfQuestions}
          handleTryAgain={handleTryAgain}
          handleContinue={handleContinue}
          handleCancel={handleCancel}
          error={error}
          type="question"
        />
      )}
    </PopUpWrapper>
  );
};

export default GenerateQuestionMenu;
