import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
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

  const generateSummary = async () => {
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
      const prompt = getSummaryPrompt(text, recentSummarySlice);
      const response = await generateDataWithOpenAI({
        text,
        prompt,
        expect: "stringResponse",
        arrayLength: splittedTexts.length,
        index,
      });

      if (response.error) {
        alert("Error");
        break;
      }

      // setSummary({
      //   content: summary + response.replace("```markdown", ""),
      //   title: summary.title,
      // });
      setSummaries((prev) => {
        const newSummary = {
          title: name,
          content: response.replace("```markdown", "").trim(),
          isCompleted: true,
          id,
        };
        saveSummary(newSummary);
        const summaries = prev.length ? [...prev, newSummary] : [newSummary];
        return summaries;
      });
    }

    setSummaries((prev) => {
      (prev[prev.length - 1] as SummaryTypes).isCompleted = true;
      return [...prev];
    });
    setIsGenerating(false);
    setOpenGenerateSummary(false);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        generateSummary();
      }}
      className="fixed bottom-0 left-1/2 z-50 flex w-full -translate-x-1/2 flex-col gap-4 rounded-lg border bg-background p-5"
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
          />
        </div>
      </div>
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
    </form>
  );
};

export default GenerateSummary;
