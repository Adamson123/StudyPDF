import Input from "@/components/ui/input";
import { Dispatch, SetStateAction } from "react";

const OtherCustomInput = ({
  setAmountOfData,
  amountOfData,
  numOfPages,
  range,
  setRange,
  setUserPrompt,
  userPrompt,
  type,
}: {
  setAmountOfData: Dispatch<SetStateAction<number>>;
  amountOfData: number;
  numOfPages: number;
  range: { from: number; to: number };
  setRange: Dispatch<SetStateAction<{ from: number; to: number }>>;
  userPrompt: string;
  setUserPrompt: Dispatch<SetStateAction<string>>;
  type: "question" | "flashcard";
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Amount of questions and range */}
      <div className="start flex flex-col gap-2">
        <label htmlFor="amountOfData" className="text-nowrap text-sm">
          Amount of {type} (10 - 70):
        </label>
        <Input
          onChange={(e) => setAmountOfData(Number(e.target.value))}
          id="amountOfData"
          value={amountOfData}
          type="number"
          min={10}
          max={70}
          className="bg-border focus:outline-1 focus:outline-primary"
          placeholder="Enter Amount of question (10 - 70)"
        />
      </div>
      {/* Range */}
      <div className="flex w-full flex-col items-start gap-2">
        <label className="text-nowrap text-sm">Range of pages:</label>
        <div className="flex w-full items-center gap-3">
          <Input
            type="number"
            min={1}
            max={numOfPages}
            value={range.from}
            onChange={(e) =>
              setRange({ ...range, from: Number(e.target.value) })
            }
            className="bg-border focus:outline-1 focus:outline-primary"
          />
          <span>-</span>
          <Input
            type="number"
            min={numOfPages > range.from + 1 ? range.from + 1 : numOfPages}
            max={numOfPages}
            value={range.to}
            onChange={(e) => setRange({ ...range, to: Number(e.target.value) })}
            className="bg-border focus:outline-1 focus:outline-primary"
          />
        </div>
      </div>
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
          className="h-36 resize-none rounded bg-border p-3 text-xs ring-primary focus:outline-none focus:ring-1"
          placeholder="Enter your custom prompt here..."
        />
      </div>
    </div>
  );
};

export default OtherCustomInput;
