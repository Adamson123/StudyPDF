import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

const FlashcardList = ({
  setDataToDelete,
  dataToDelete,
  flashcards,
}: {
  setDataToDelete: Dispatch<SetStateAction<DataToDeleteTypes>>;
  dataToDelete: DataToDeleteTypes;
  flashcards: StoredFlashcard[];
}) => {
  const [openDropDown, setOpenDropDown] = useState(false);
  const router = useRouter();

  return (
    <div className="flex -translate-y-1 flex-col gap-1">
      <h2
        onClick={() => setOpenDropDown(!openDropDown)}
        className="flex cursor-pointer items-center justify-between rounded border-b p-4 text-2xl"
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
        className={`flex flex-col overflow-y-auto ${openDropDown ? "max-h-max" : "max-h-0"} listOverflow transition-all duration-300 ease-in-out`}
      >
        {flashcards.length
          ? flashcards.map((card, i) => (
              <div
                onClick={() => router.push(`/flashcard/${card.id}`)}
                key={i}
                className="flex cursor-pointer items-center justify-between border-b border-primary bg-primary/15 p-3 text-xs transition-colors hover:bg-primary/50"
              >
                <span className="overflow-hidden text-nowrap">
                  {card.title || card.id}
                </span>
                <Trash2
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the click from propagating to the parent div
                    setDataToDelete({ id: card.id, type: "flashcard" });
                  }}
                  className="h-5 w-5 cursor-pointer stroke-primary hover:fill-primary"
                />
              </div>
            ))
          : ""}
      </div>
    </div>
  );
};

export default FlashcardList;
