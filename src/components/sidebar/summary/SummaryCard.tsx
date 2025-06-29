import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ChevronDown, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { cn } from "@/lib/utils";
import { deleteSummaryById } from "@/lib/summaryStorage";

const SummaryCard = ({
  summary,
  setSummaries,
}: {
  summary: SummaryTypes;
  setSummaries: Dispatch<SetStateAction<SummaryTypes[]>>;
}) => {
  const [expand, setExpand] = useState(false);

  const deleteSummary = () => {
    deleteSummaryById(summary.id);
    setSummaries((prev) => prev.filter((data) => data.id !== summary.id));
  };
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="p-2 text-lg font-semibold">{summary.title}</h3>
        <div className="flex items-center justify-end gap-3">
          <ChevronDown
            onClick={() => setExpand(!expand)}
            className={cn("cursor-pointer", expand ? "rotate-180" : "rotate-0")}
          />
          <Trash2 onClick={deleteSummary} className="cursor-pointer" />
        </div>
      </div>
      <div
        className={cn(
          `markdown p relative flex flex-col gap-2 overflow-hidden rounded-md bg-gray-900 p-4`,
          expand ? "max-h-max" : "max-h-64",
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {summary.content}
        </ReactMarkdown>
        {!expand && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        )}
        <button
          onClick={() => setExpand(!expand)}
          className={cn(
            "flex items-center gap-1 self-center rounded-md bg-white p-2 px-3 text-sm text-black",
            !expand && "absolute bottom-3",
          )}
        >
          {expand ? "Collapse" : "Expand"}
          <ChevronDown className={cn(expand ? "rotate-180" : "rotate-0")} />
        </button>
      </div>
    </div>
  );
};

export default SummaryCard;
