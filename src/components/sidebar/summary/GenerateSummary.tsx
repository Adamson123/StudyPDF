import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import PopUpWrapper from "@/components/ui/PopUpWrapper";
import XButton from "@/components/ui/XButton";
import { getSummaryPrompt } from "@/data/prompts/summaryPrompts";
import useGenerateDataWithOpenAI from "@/hooks/useGenerateDataWithOpenAI";
import useGetPDFTexts from "@/hooks/useGetPDFTexts";
import { saveSummary } from "@/lib/summaryStorage";
import { cn } from "@/lib/utils";
import { getNumberInput } from "@/utils";
import { splitTexts } from "@/utils/pdfTextUtils";
import { Stars } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { v4 as uuid } from "uuid";

const GenerateSummary = ({
  setOpenGenerateSummary,
  setSummary,
  summary,
  setIsGenerating,
  setSummaries,
  isGenerating,
}: {
  setOpenGenerateSummary: Dispatch<SetStateAction<boolean>>;
  setSummary: Dispatch<SetStateAction<{ title: string; content: string }>>;
  summary: { title: string; content: string };
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
  setSummaries: Dispatch<SetStateAction<SummaryTypes[]>>;
  isGenerating: boolean;
}) => {
  const { generateDataWithOpenAI } = useGenerateDataWithOpenAI();
  const {
    getPDFTexts,
    pdfData: { numOfPages },
  } = useGetPDFTexts();
  const [name, setName] = useState("");
  const [range, setRange] = useState({ from: 1, to: Math.min(numOfPages, 15) });
  const [userPrompt, setUserPrompt] = useState("");

  const generateSummary = async () => {
    console.log("Generating summary with range:", range);
    //Close
    setOpenGenerateSummary(false);
    setSummary({ title: "", content: "" });
    setIsGenerating(true);
    const pdfTexts = await getPDFTexts({
      from: range.from,
      to: range.to,
    });
    const splittedTexts = splitTexts(pdfTexts);
    const id = uuid();
    for (let index = 0; index < splittedTexts.length; index++) {
      const text = splittedTexts[index] as string;
      const recentSummarySlice = summary.content.slice(-1000);
      const prompt =
        getSummaryPrompt(text, recentSummarySlice) +
        `\nUser Prompt: ${userPrompt}`;
      const response = await generateDataWithOpenAI({
        text,
        prompt,
        expect: "stringResponse",
        arrayLength: splittedTexts.length,
        index,
      });

      if (response.error) {
        alert("Error generating summary");
        break;
      }
      setSummaries((prev) => {
        let newSummary = {} as SummaryTypes;
        const existingSummary = prev.find((s) => s.id === id);
        let summaries = [] as SummaryTypes[];
        if (existingSummary) {
          existingSummary.content += `\n\n${response.replace("```markdown", "").trim()}`;
          newSummary = existingSummary;
          summaries = prev.map((s) => (s.id === id ? newSummary : s));
        } else {
          newSummary = {
            title: name,
            content: response.replace("```markdown", "").trim(),
            isCompleted: true,
            id,
          };
          summaries = prev.length ? [...prev, newSummary] : [newSummary];
        }
        saveSummary(newSummary);

        return summaries;
      });
    }

    setSummaries((prev) => {
      (prev[prev.length - 1] as SummaryTypes).isCompleted = true;
      return [...prev];
    });
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
