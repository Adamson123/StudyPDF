import { getAllFlashcardsFromStorage } from "@/lib/flashcardStorage";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const FlashcardList = () => {
  const [openDropDown, setOpenDropDown] = useState(false);
  const router = useRouter();
  //TODO Use usememo to optimize performance
  const flashcards = useMemo(getAllFlashcardsFromStorage, []);

  return (
    <div className="flex -translate-y-1 flex-col gap-1">
      <h2
        onClick={() => setOpenDropDown(!openDropDown)}
        className="flex cursor-pointer items-center justify-between rounded border p-2"
      >
        Flashcards{" "}
        {openDropDown ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </h2>
      <div
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--primary) transparent",
        }}
        className={`flex flex-col gap-1 overflow-y-auto ${openDropDown ? "max-h-max" : "max-h-0"} listOverflow transition-all duration-300 ease-in-out`}
      >
        {flashcards.map((card, i) => (
          <div
            onClick={() => router.push(`/flashcard/${card.id}`)}
            key={i}
            className="flex cursor-pointer items-center justify-between rounded border border-primary bg-primary/15 p-3 text-xs transition-colors hover:bg-primary/70"
          >
            <span className="overflow-hidden text-nowrap">
              {card.title || card.id}
            </span>
            <Trash2 className="h-5 w-5 cursor-pointer stroke-primary hover:fill-primary" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardList;
