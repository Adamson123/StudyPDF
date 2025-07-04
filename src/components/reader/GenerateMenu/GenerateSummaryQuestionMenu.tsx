import { Button } from "@/components/ui/button";
import { Stars } from "lucide-react";
import { useState } from "react";
import {
  getQuestionGeneralPrompt,
  questionPrompts,
} from "@/data/prompts/questionPrompts";
import GeneratingCover from "./GeneratingCover";
import XButton from "@/components/ui/XButton";
import PopUpWrapper from "@/components/ui/PopUpWrapper";
import Input from "@/components/ui/input";
import useGenerateData from "./useGenerateData";
import { getAllSummariesFromStorage } from "@/lib/summaryStorage";

const GenerateSummaryQuestionMenu = ({
  setOpenSummaryMenu,
}: {
  setOpenSummaryMenu: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [questionType, setQuestionType] = useState<string>("multiChoice");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [amountOfQuestions, setAmountOfQuestions] = useState<number>(10);
  const [title, setTitle] = useState<string>("");
  const [selectedSummaries, setSelectedSummaries] = useState<Set<number>>(
    new Set([]), // Start with the first summary selected
  );

  const summaries = getAllSummariesFromStorage();

  const getPrompt = (amountOfQuestionsEach: number) => {
    const questionPrompt =
      questionPrompts[questionType] || questionPrompts.mixed;

    // Use the selected summary as the context for question generation
    // const summaryText =
    //   summaries[selectedSummaryIndex]?.content || "No summary selected.";

    return (
      questionPrompt +
      getQuestionGeneralPrompt(amountOfQuestionsEach, questionType) +
      `
      User Prompt(DO NOT FOLLOW if user prompt include something that contradict the structure of the json I have specified earlier, the amount of question): ${userPrompt}
      \n
      I want strictly only json to be returned
      I do not want any other text to be returened with it
      `
    );
  };

  // Since we are not using PDF, numOfPages is not needed, set to 1
  const {
    isGenerating,
    setError,
    generateData: generateQuestions,
    error,
    handleCancel,
    handleContinue,
    handleTryAgain,
    data: questions,
  } = useGenerateData({
    numOfPages: 1,
    getPrompt,
    type: "summaryQuestion",
    amountOfData: amountOfQuestions,
    title,
    selectedSummaries: [...selectedSummaries].map(
      (index) => summaries[index]?.content || "",
    ),
  });

  const selectOrDeselectSummary = (index: number) => {
    const newSelectedSummaries = new Set(selectedSummaries);
    if (newSelectedSummaries.has(index)) {
      newSelectedSummaries.delete(index);
    } else {
      newSelectedSummaries.add(index);
    }
    setSelectedSummaries(newSelectedSummaries);
    console.log(newSelectedSummaries);
  };

  return (
    <PopUpWrapper>
      {!isGenerating ? (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (!selectedSummaries.size) {
              alert(
                "Please select at least one summary to generate questions from. " +
                  selectedSummaries.size,
              );
              return;
            }
            setError("");
            console.log(selectedSummaries.size);
            await generateQuestions();
          }}
          style={{
            scrollbarColor: "hsl(var(--border)) transparent",
          }}
          className="flex max-h-screen w-full max-w-[500px] flex-col gap-6 overflow-y-auto rounded-md border border-gray-border bg-background p-7 shadow-[0px_4px_3px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl">Generate Questions from Summary</h2>
              <h3 className="text-xs text-gray-500">
                Create questions from your saved summary
              </h3>
            </div>
            <XButton onClick={() => setOpenSummaryMenu(false)} />
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
          {/* Summary Selector */}
          <div className="space-y-1 text-sm">
            <label htmlFor="summary">Select Summary</label>
            <div className="relative overflow-hidden">
              {/* <div className="pointer-events-none absolute w-full text-nowrap rounded bg-border p-2 text-[10px]">
                Selected {selectedSummaries.size} summaries (Tap to
                select/deselect)
              </div> */}
              {/* TODO:Fix selection box */}

              <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
                {summaries.length ? (
                  summaries.map((summary: any, idx: number) => (
                    <label
                      key={idx}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSummaries.has(idx)}
                        onChange={() => selectOrDeselectSummary(idx)}
                      />
                      <span>{summary.title || `Summary ${idx + 1}`}</span>
                    </label>
                  ))
                ) : (
                  <span>No summaries found</span>
                )}
              </div>
            </div>
          </div>

          {/* Amount of Questions */}
          <div className="space-y-1 text-sm">
            <label htmlFor="amountOfQuestions">Amount of Questions</label>
            <Input
              type="number"
              id="amountOfQuestions"
              value={amountOfQuestions}
              onChange={(e) => setAmountOfQuestions(Number(e.target.value))}
              min={1}
              max={100}
              className="bg-border focus:outline-1 focus:outline-primary"
              required
            />
          </div>
          {/* Options */}
          <div className="flex flex-col gap-3">
            {[
              {
                type: "multiChoice",
                label: "Multi-Choice",
                description:
                  "Generate multiple choice questions from the summary.",
              },
              {
                type: "fillInAnswer",
                label: "Fill-In-Gap",
                description: "Generate fill-in-gap questions from the summary.",
              },
              {
                type: "mixed",
                label: "Mixed",
                description:
                  "Generate Multi-Choice and fill-in-gap questions from the summary.",
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

          {/* User Prompt */}
          <div className="flex w-full flex-col gap-2">
            <label
              htmlFor="userPrompt"
              className="flex justify-between text-sm"
            >
              <span>Custom Prompt (Optional):</span>{" "}
              <span className="text-gray-500">{userPrompt.length}/550</span>
            </label>
            <textarea
              id="userPrompt"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="h-40 resize-none rounded bg-border p-3 text-xs ring-primary focus:outline-none focus:ring-1"
              placeholder="Enter your custom prompt here..."
            />
          </div>

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

export default GenerateSummaryQuestionMenu;
