import "@/styles/markdown.css";
import "highlight.js/styles/github-dark.css";
import { Button } from "../../ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import SummaryCard from "./SummaryCard";
import { useAppSelector } from "@/hooks/useAppStore";

const Summary = ({
    setOpenGenerateSummary,
    isGenerating,
    // summaries,
    setDataToDelete,
    cancelSummaryGeneration,
    error,
}: {
    setOpenGenerateSummary: Dispatch<SetStateAction<boolean>>;
    isGenerating: boolean;
    // summaries: SummaryTypes[];
    setDataToDelete: Dispatch<SetStateAction<DataToDeleteTypes>>;
    cancelSummaryGeneration: () => void;
    error: string;
}) => {
    const summaries = useAppSelector((state) => state.summaries.items);

    return (
        <div className="flex flex-col items-center gap-4 px-2 pb-20">
            {/* Create Summary */}
            {/* Summaries */}
            <div className="flex flex-col gap-5">
                {summaries.length > 0 ? (
                    summaries.map((summary, index) => (
                        <SummaryCard
                            key={index}
                            summary={summary}
                            setDataToDelete={setDataToDelete}
                        />
                    ))
                ) : (
                    <div className="w-full rounded-lg bg-secondary p-4 text-center text-sm text-secondary-foreground">
                        No summaries available. Click the button to create one.
                    </div>
                )}
            </div>
            {isGenerating ? (
                <div className="flex flex-col items-center gap-2">
                    <RefreshCcw className="animate-spin" />
                    <Button
                        onClick={cancelSummaryGeneration}
                        className="w-full px-5"
                    >
                        Cancel Summary Generation
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 px-2">
                    {error && (
                        <span className="rounded-lg bg-primary/30 p-3 text-sm text-red-500">
                            {error}
                        </span>
                    )}
                    <div className="self-center rounded-lg bg-primary/30 p-[4px]">
                        <Button
                            onClick={() =>
                                setOpenGenerateSummary((prev) => !prev)
                            }
                            className="p-4"
                        >
                            Create a Summary
                            <Plus />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Summary;
