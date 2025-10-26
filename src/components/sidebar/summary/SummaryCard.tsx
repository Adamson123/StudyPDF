import ReactMarkdown from "react-markdown";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import remarkGfm from "remark-gfm";
import { ChevronDown, Copy, Trash2 } from "lucide-react";
import { Dispatch, forwardRef, SetStateAction, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import copy from "@/utils/copy";

const SummaryCard = forwardRef<
    HTMLDivElement,
    {
        summary: SummaryTypes;
        setDataToDelete: Dispatch<SetStateAction<DataToDeleteTypes>>;
    }
>(({ summary, setDataToDelete }, ref) => {
    const [expand, setExpand] = useState(false);
    const summaryRef = useRef<HTMLDivElement | null>(null);

    // Combine the forwarded ref with the internal ref
    const combinedRef = (node: HTMLDivElement | null) => {
        summaryRef.current = node;
        if (typeof ref === "function") {
            ref(node);
        } else if (ref) {
            ref.current = node;
        }
    };

    const visibleContent = expand
        ? summary.content
        : summary.content.substring(0, 1000);

    const mathjaxConfig = {
        tex: {
            inlineMath: [["\\(", "\\)"]],
            displayMath: [["$$", "$$"]],
        },
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        summaryRef.current?.classList.add("opacity-50");
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        summaryRef.current?.classList.remove("opacity-50");
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    //BUG texts longer than screen
    return (
        <div
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            ref={combinedRef}
            draggable={true}
            className="px-3"
        >
            <div
                onClick={() => setExpand(!expand)}
                className="flex max-w-full cursor-pointer items-center justify-between"
            >
                <h3 className="p-2 text-lg font-semibold">{summary.title}</h3>
                <div className="flex items-center justify-end gap-4">
                    <ChevronDown
                        className={cn(
                            "cursor-pointer",
                            expand ? "rotate-180" : "rotate-0",
                        )}
                    />
                    <Copy
                        onClick={(e) => {
                            e.stopPropagation();
                            copy(summary.content);
                        }}
                    />
                    <Trash2
                        onClick={(e) => {
                            e.stopPropagation();
                            setDataToDelete({
                                id: summary.id,
                                type: "summary",
                            });
                        }}
                        className="cursor-pointer"
                    />
                </div>
            </div>

            <div
                className={cn(
                    `markdown relative flex w-full flex-col gap-2 overflow-hidden overflow-x-auto rounded-md bg-gray-900 p-5`,
                    expand ? "max-h-max" : "h-64",
                )}
            >
                <MathJaxContext config={mathjaxConfig}>
                    <MathJax dynamic inline>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {visibleContent}
                        </ReactMarkdown>
                    </MathJax>
                </MathJaxContext>

                {!expand && (
                    <div className="pointer-events-none absolute inset-0 h-64 bg-gradient-to-t from-black to-transparent">
                        {/* <div className="relative h-full w-full overflow-hidden">
              <button
                onClick={() => setExpand(!expand)}
                className={cn(
                  "absolute bottom-3 flex items-center gap-1 self-center rounded-md bg-white p-2 px-3 text-sm text-black",
                )}
              >
                Expand
                <ChevronDown className="rotate-0" />
              </button>
            </div> */}
                    </div>
                )}

                <button
                    onClick={() => setExpand(!expand)}
                    className={cn(
                        "flex items-center gap-1 self-center rounded-md bg-white p-2 px-3 text-sm text-black",
                        !expand && "absolute bottom-3",
                    )}
                >
                    {expand ? "Collapse" : "Expand"}
                    <ChevronDown
                        className={cn(expand ? "rotate-180" : "rotate-0")}
                    />
                </button>
            </div>
        </div>
    );
});

export default SummaryCard;
