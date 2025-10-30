import "@/styles/markdown.css";
import "highlight.js/styles/github-dark.css";
import { Button } from "../../ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import { Dispatch, SetStateAction, useRef } from "react";
import SummaryCard from "./SummaryCard";
import { useAppSelector } from "@/hooks/useAppStore";
import NoItemsFound from "@/components/ui/NoItemsFound";

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
    const summariesContainerRef = useRef<HTMLDivElement | null>(null);

    return (
        <div className="flex flex-col items-center gap-4 px-2 pb-20">
            {/* Create Summary */}
            {/* Summaries */}
            <div ref={summariesContainerRef} className="flex flex-col gap-5">
                {summaries.length > 0 ? (
                    summaries.map((summary, index) => (
                        <SummaryCard
                            summariesContainerRef={summariesContainerRef}
                            key={summary.id}
                            summary={summary}
                            setDataToDelete={setDataToDelete}
                        />
                    ))
                ) : (
                    <NoItemsFound text="No summaries available. Click the button to create one." />
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
