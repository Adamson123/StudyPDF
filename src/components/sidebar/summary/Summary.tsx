import "@/styles/markdown.css";
import "highlight.js/styles/github-dark.css";
import { Button } from "../../ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import SummaryCard from "./SummaryCard";

const Summary = ({
  setOpenGenerateSummary,
  isGenerating,
  summaries,
  setSummaries,
}: {
  setOpenGenerateSummary: Dispatch<SetStateAction<boolean>>;
  isGenerating: boolean;
  summaries: SummaryTypes[];
  setSummaries: Dispatch<SetStateAction<SummaryTypes[]>>;
}) => {
  return (
    <div className="flex flex-col items-center gap-3 px-6">
      {/* Create Summary */}

      {/* Summaries */}
      <div className="flex flex-col gap-3">
        {summaries.length > 0 ? (
          summaries.map((summary, index) => (
            <SummaryCard
              key={index}
              summary={summary}
              setSummaries={setSummaries}
            />
          ))
        ) : (
          <div className="flex w-full items-center justify-center rounded-lg bg-secondary p-4 text-sm text-secondary-foreground">
            No summaries available. Click the button to create one.
          </div>
        )}
      </div>
      {isGenerating ? (
        <RefreshCcw className="animate-spin self-center" />
      ) : (
        <div className="self-center rounded-lg bg-primary/30 p-[4px]">
          <Button
            onClick={() => setOpenGenerateSummary((prev) => !prev)}
            className="p-4"
          >
            Create a Summary
            <Plus />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Summary;
