import Input from "@/components/ui/input";
import { getAllSummariesFromStorage } from "@/lib/summaryStorage";
import { getNumberInput } from "@/utils";
import { Dispatch, SetStateAction, useMemo } from "react";

/**
 * OtherCustomInput component for handling user input for data generation.
 * @param setAmountOfData - Function to set the amount of data.
 * @param amountOfData - Current amount of data.
 * @param numOfPages - Total number of pages in the PDF.
 * @param range - Object containing the range of pages to select from.
 * @param setRange - Function to set the range of pages.
 * @param userPrompt - User's custom prompt for data generation.
 * @param setUserPrompt - Function to set the user's custom prompt.
 * @param type - Type of data to generate, either "question" or "flashcard".
 * @param setSelectedSummaries - Function to set the selected summaries.
 * @param selectedSummaries - Set of selected summary indices.
 * @param questionsFrom - Source of questions, either "summary" or "pdf".
 * @param param0 - Contains various state setters and values for input handling.
 * @returns JSX.Element
 */
const OtherCustomInput = ({
  setAmountOfData,
  amountOfData,
  numOfPages,
  range,
  setRange,
  setUserPrompt,
  userPrompt,
  type,
  setSelectedSummaries = () => {},
  selectedSummaries = new Set(),
  questionsFrom = "pdf",
}: {
  setAmountOfData: Dispatch<SetStateAction<number>>;
  amountOfData: number;
  numOfPages: number;
  range: { from: number; to: number };
  setRange: Dispatch<SetStateAction<{ from: number; to: number }>>;
  userPrompt: string;
  setSelectedSummaries?: Dispatch<SetStateAction<Set<number>>>;
  selectedSummaries?: Set<number>;
  setUserPrompt: Dispatch<SetStateAction<string>>;
  type: "quiz" | "flashcards";
  questionsFrom?: "summary" | "pdf";
}) => {
  const summaries = useMemo(() => getAllSummariesFromStorage(), []);

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
    <div className="flex flex-col gap-6">
      {/* Amount of questions and range */}
      <div className="start flex flex-col gap-2">
        <label htmlFor="amountOfData" className="text-nowrap text-sm">
          Amount of {type} (10 - 70):
        </label>
        <Input
          required
          onChange={(e) => setAmountOfData(getNumberInput(e))}
          id="amountOfData"
          value={amountOfData}
          type="number"
          min={10}
          max={70}
          className="bg-border focus:outline-1 focus:outline-primary"
          placeholder="Enter Amount of question (10 - 70)"
        />
      </div>

      {questionsFrom === "summary" ? (
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
                  className="accent-primary"
                />
                <span>{summary.title || `Summary ${idx + 1}`}</span>
              </label>
            ))
          ) : (
            <span>No summaries found</span>
          )}
        </div>
      ) : (
        <div className="flex w-full flex-col items-start gap-2">
          <label className="text-nowrap text-sm">Range of pages:</label>
          <div className="flex w-full items-center gap-3">
            <Input
              type="number"
              required
              min={1}
              max={numOfPages}
              value={range.from}
              onChange={(e) =>
                setRange({
                  ...range,
                  from: getNumberInput(e),
                })
              }
              placeholder="Enter starting page"
              className="bg-border focus:outline-1 focus:outline-primary"
            />
            <span>-</span>
            <Input
              type="number"
              required
              min={range.from}
              max={numOfPages}
              value={range.to}
              onChange={(e) =>
                setRange({
                  ...range,
                  to: getNumberInput(e),
                })
              }
              placeholder="Enter ending page"
              className="bg-border focus:outline-1 focus:outline-primary"
            />
          </div>
        </div>
      )}

      {/* User Prompt */}
      <div className="flex w-full flex-col gap-2">
        <label htmlFor="userPrompt" className="flex justify-between text-sm">
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
    </div>
  );
};

export default OtherCustomInput;
