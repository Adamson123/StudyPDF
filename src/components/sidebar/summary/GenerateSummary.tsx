import AIOptions from "@/components/AIOptions";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import PopUpWrapper from "@/components/ui/PopUpWrapper";
import XButton from "@/components/ui/XButton";
import { getSummaryPrompt } from "@/data/prompts/summaryPrompts";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import useGetPDFTexts from "@/hooks/useGetPDFTexts";
//import { saveSummary } from "@/lib/summaryStorage";
import { cn } from "@/lib/utils";
import {
    addOneSummary,
    updateOneSummary,
} from "@/redux/features/summariesSlice";
import { getNumberInput } from "@/utils";
import { splitTextIntoChunksBySize } from "@/utils/textChunkUtils";
import { Stars } from "lucide-react";
import { Dispatch, RefObject, SetStateAction, useState } from "react";
import { v4 as uuid } from "uuid";

const GenerateSummary = ({
    setOpenGenerateSummary,
    setIsGenerating,
    isGenerating,
    generateDataWithAI,
    setError,
    isCancelled,
}: {
    setOpenGenerateSummary: Dispatch<SetStateAction<boolean>>;
    setIsGenerating: Dispatch<SetStateAction<boolean>>;
    // setSummaries: Dispatch<SetStateAction<SummaryTypes[]>>;
    isGenerating: boolean;
    generateDataWithAI: (param: {
        text: string;
        prompt: string;
        expect: "stringResponse" | "objectResponse";
        arrayLength: number;
        index: number;
        selectedAI?: AvailableAIOptions;
    }) => Promise<any>;
    setError: Dispatch<SetStateAction<string>>;
    isCancelled: RefObject<boolean>;
}) => {
    const {
        getPDFTexts,
        pdfData: { numOfPages },
    } = useGetPDFTexts();
    const [name, setName] = useState("");
    const [range, setRange] = useState({
        from: 1,
        to: Math.min(numOfPages, 15),
    });
    const [userPrompt, setUserPrompt] = useState("");
    const [selectedAI, setSelectedAI] = useState<AvailableAIOptions>("gemini");
    const dispatch = useAppDispatch();
    const summaries = useAppSelector((state) => state.summaries.items);

    const generateSummary = async () => {
        // Close the popup and reset the summary state
        setOpenGenerateSummary(false);
        setIsGenerating(true);
        setError("");

        // Fetch the PDF texts for the specified range
        const pdfTexts = await getPDFTexts({
            from: range.from,
            to: range.to,
        });

        // Split the fetched texts into manageable chunks
        const splittedTexts = splitTextIntoChunksBySize(pdfTexts);

        // Generate a unique ID for the summary
        const id = uuid();

        // Iterate through each chunk of text and generate a summary
        for (let index = 0; index < splittedTexts.length; index++) {
            const text = splittedTexts[index] as string;

            const existingSummary = summaries.find((s) => s.id === id);

            // Get the last 1000 characters of the current summary content
            const recentSummarySlice =
                existingSummary?.content.slice(-1000) || "";

            // Generate the prompt for OpenAI, including the user-provided prompt
            const prompt =
                getSummaryPrompt(text, recentSummarySlice) +
                `\nUser Prompt: ${userPrompt}`;

            // Call the OpenAI API to generate the summary
            const response = await generateDataWithAI({
                text,
                prompt,
                expect: "stringResponse",
                arrayLength: splittedTexts.length,
                index,
                selectedAI,
            });

            // Handle errors in the API response
            if (response.error) {
                console.log("cancelled", isCancelled.current);
                //Only set error if not cancelled
                // This prevents setting an error if the user cancels the operation
                if (!isCancelled.current) {
                    setError("Error generating summary");
                }
                break;
            }

            let newSummary = {
                title: name,
                content: response.replace("```markdown", "").trim(),
                isCompleted: false,
                id,
            };

            if (existingSummary) {
                newSummary = {
                    ...newSummary,
                    content:
                        existingSummary.content + "\n" + newSummary.content,
                };
            }

            dispatch(addOneSummary(newSummary));
        }

        // After all chunks are processed, mark the summary as completed
        const lastSummary = summaries.find((s) => s.id === id);

        if (lastSummary) {
            lastSummary.isCompleted = true;
            dispatch(updateOneSummary(lastSummary));
        }

        // Reset the generating state
        setIsGenerating(false);
    };

    return (
        <PopUpWrapper>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    generateSummary();
                }}
                className="flex w-full max-w-[700px] flex-col gap-4 rounded-lg border bg-background p-5"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl">Generate Summary</h2>
                        <h3 className="text-xs text-gray-500">
                            Generate PDF content summary
                        </h3>
                    </div>
                    <XButton onClick={() => setOpenGenerateSummary(false)} />
                </div>
                <div>
                    <label className="text-sm">Name:</label>
                    <Input
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        placeholder="Enter summary name"
                        required
                        className="bg-border"
                    />
                </div>
                {/* TODO: Use Range of pages as label instead */}
                <div className="flex w-full gap-4">
                    <div className="w-full">
                        <label className="text-sm">From:</label>
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
                            className="bg-border"
                        />
                    </div>
                    <div className="w-full">
                        <label className="text-sm">To:</label>
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
                            className="bg-border"
                        />
                    </div>
                </div>

                {/* User Prompt */}
                <div className="flex w-full flex-col gap-2">
                    <label
                        htmlFor="userPrompt"
                        className="flex justify-between text-sm"
                    >
                        <span>Custom Prompt (Optional):</span>{" "}
                        <span className="text-gray-500">
                            {userPrompt.length}/550
                        </span>
                    </label>
                    <textarea
                        id="userPrompt"
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        className="h-40 resize-none rounded bg-border p-3 text-xs ring-primary focus:outline-none focus:ring-1"
                        placeholder="Enter your custom prompt here..."
                    />

                    {/* AI options to select from */}
                    <AIOptions setSelectedAI={setSelectedAI} />

                    <Button
                        type="submit"
                        className={cn(
                            "flex w-full max-w-96 items-center self-center text-white",
                            isGenerating && "cursor-not-allowed bg-gray-600",
                        )}
                        disabled={isGenerating}
                    >
                        {isGenerating ? "Generating..." : "Generate Summary"}
                        <Stars className="ml-2" />
                    </Button>
                </div>
            </form>
        </PopUpWrapper>
    );
};

export default GenerateSummary;
