import ReactMarkdown from "react-markdown";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import remarkGfm from "remark-gfm";
import { ChevronDown, Copy, GripVertical, Trash2 } from "lucide-react";
import {
    Dispatch,
    DragEvent,
    forwardRef,
    SetStateAction,
    useRef,
    useState,
} from "react";
import { cn } from "@/lib/utils";
import copy from "@/utils/copy";

const SummaryCard = ({
    summary,
    setDataToDelete,
    summariesContainerRef,
}: {
    summary: SummaryTypes;
    setDataToDelete: Dispatch<SetStateAction<DataToDeleteTypes>>;
    summariesContainerRef: React.RefObject<HTMLDivElement>;
}) => {
    const [expand, setExpand] = useState(false);
    const summaryRef = useRef<HTMLDivElement | null>(null);
    const [draggable, setDraggable] = useState(false);

    const visibleContent = expand
        ? summary.content
        : summary.content.substring(0, 1000);

    const mathjaxConfig = {
        tex: {
            inlineMath: [["\\(", "\\)"]],
            displayMath: [["$$", "$$"]],
        },
    };

    //

    const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
        summaryRef.current?.classList.add("opacity-50", "dragged");

        // const summaryElement = summaryRef.current!;

        // const summaryheaderHeight = summaryElement
        //     .querySelector(".markdown-header")!
        //     .getBoundingClientRect().height;

        // const summaryRect = summaryElement.getBoundingClientRect();

        // const mouseXPos = e.clientX - summaryRect.x;
        // const mouseYPos = e.clientY - summaryRect.y;

        //  console.log(mouseXPos, mouseYPos);
    };
    const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
        summaryRef.current?.classList.remove("opacity-50", "dragged");
    };

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const sidebarScroll = document.querySelector(".sidebar-scroll")!;

        if (e.clientY >= window.innerHeight - 200) {
            sidebarScroll.scrollTo({
                behavior: "smooth",
                top: sidebarScroll.scrollTop + 10,
            });
        } else if (e.clientY <= 200) {
            sidebarScroll.scrollTo({
                behavior: "smooth",
                top: sidebarScroll.scrollTop - 10,
            });
        }
    };

    //TODO:

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        summaryRef.current?.classList.add("opacity-70");
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        summaryRef.current?.classList.remove("opacity-70");
        //   alert("drag leave");
    };

    const handleDrop = () => {
        // const summaries =
        //     summariesContainerRef.current!.querySelectorAll(".summary");

        // if (!summaries.length) {
        //     return;
        // }

        // summaries.forEach((summary) => {
        //     summary.classList.remove("opacity-70");
        // });
        const summaryElement = summaryRef.current!;

        summaryElement.classList.remove("opacity-70");
        const draggedSummary =
            summariesContainerRef.current?.querySelector(".dragged")!;

        if (!draggedSummary) return;

        draggedSummary.classList.remove("opacity-50", "dragged");

        const summaryElementClone = summaryElement.cloneNode(true);
        const draggedSummaryClone = draggedSummary.cloneNode(true);

        console.log(draggedSummary);

        summaryElement.replaceWith(draggedSummaryClone);
        draggedSummary.replaceWith(summaryElementClone);
    };

    //BUG texts longer than screen
    return (
        <div
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrag={handleDrag}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            ref={summaryRef}
            draggable={draggable}
            className="summary px-3"
        >
            {/* Header */}
            <div
                onClick={() => setExpand(!expand)}
                className="markdown-header flex max-w-full cursor-pointer items-center justify-between"
            >
                {/* left */}
                <div className="flex items-center">
                    {!expand && (
                        <div
                            onClick={(e) => {
                                e.preventDefault();
                            }}
                            onMouseDown={() => {
                                setDraggable(true);
                            }}
                            onMouseLeave={() => {
                                // setDraggable(false);
                            }}
                            onMouseUp={() => {
                                // setDraggable(false);
                            }}
                            className="flex cursor-move items-center -space-x-3 text-gray-400 hover:text-primary"
                        >
                            <GripVertical />
                            <GripVertical />
                        </div>
                    )}
                    <h3 className="p-2 text-lg font-semibold">
                        {summary.title}
                    </h3>
                </div>
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
};

export default SummaryCard;
