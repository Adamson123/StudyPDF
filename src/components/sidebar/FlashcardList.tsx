import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { updateOneSetOfFlashcards } from "@/redux/features/flashcardsSlice";
import {
    Check,
    ChevronDown,
    ChevronUp,
    Pencil,
    Play,
    Trash2,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

const FlashcardList = ({
    setDataToDelete,
}: {
    setDataToDelete: Dispatch<SetStateAction<DataToDeleteTypes>>;
}) => {
    const [openDropDown, setOpenDropDown] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const dispatch = useAppDispatch();
    const router = useRouter();
    const flashcards = useAppSelector((state) => state.flashcards.items);

    const toggleSelection = (id: string) => {
        setSelectedIds((previous) =>
            previous.includes(id)
                ? previous.filter((selectedId) => selectedId !== id)
                : [...previous, id],
        );
    };

    const toggleSelectionMode = () => {
        setSelectionMode((previous) => !previous);
        setSelectedIds([]);
        setEditingId(null);
    };

    const saveRename = (flashcardSet: StoredFlashcard) => {
        const nextTitle = title.trim();
        if (!nextTitle) return;

        dispatch(
            updateOneSetOfFlashcards({ ...flashcardSet, title: nextTitle }),
        );
        setEditingId(null);
    };

    const startSelectedFlashcards = () => {
        if (!selectedIds.length) return;
        const ids = selectedIds.map(encodeURIComponent).join(",");
        router.push(`/flashcard/${selectedIds[0]}?ids=${ids}`);
    };

    return (
        <div className="flex -translate-y-1 flex-col gap-1">
            <div className="flex items-center justify-between border-b p-4">
                <h2
                    onClick={() => setOpenDropDown(!openDropDown)}
                    className="flex cursor-pointer items-center gap-2 text-2xl"
                >
                    Flashcards
                    {openDropDown ? (
                        <ChevronUp className="h-5 w-5" />
                    ) : (
                        <ChevronDown className="h-5 w-5" />
                    )}
                </h2>
                <button
                    onClick={toggleSelectionMode}
                    className="rounded border border-gray-border px-2 py-1 text-xs hover:bg-primary/15"
                >
                    {selectionMode ? "Cancel" : "Select"}
                </button>
            </div>
            <div
                style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "var(--primary) transparent",
                }}
                className={`flex flex-col overflow-y-auto ${openDropDown ? "max-h-max" : "max-h-0"} listOverflow transition-all duration-300 ease-in-out`}
            >
                {flashcards.map((flashcardSet) => (
                    <div
                        onClick={() =>
                            selectionMode
                                ? toggleSelection(flashcardSet.id)
                                : router.push(
                                      `/flashcard/${flashcardSet.id}`,
                                  )
                        }
                        key={flashcardSet.id}
                        className="flex cursor-pointer items-center justify-between gap-2 border-b border-primary bg-primary/15 p-3 text-xs transition-colors hover:bg-primary/50"
                    >
                        {selectionMode && (
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(flashcardSet.id)}
                                onChange={() => toggleSelection(flashcardSet.id)}
                                onClick={(event) => event.stopPropagation()}
                                className="h-4 w-4 accent-primary"
                            />
                        )}
                        {editingId === flashcardSet.id ? (
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    saveRename(flashcardSet);
                                }}
                                className="flex flex-1 items-center gap-1"
                            >
                                <input
                                    autoFocus
                                    value={title}
                                    onChange={(event) =>
                                        setTitle(event.target.value)
                                    }
                                    className="min-w-0 flex-1 rounded border border-gray-border bg-background px-2 py-1"
                                />
                                <button
                                    type="submit"
                                    aria-label="Save flashcard set name"
                                    className="rounded p-1 hover:bg-primary/20"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setEditingId(null);
                                    }}
                                    aria-label="Cancel rename"
                                    className="rounded p-1 hover:bg-primary/20"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </form>
                        ) : (
                            <>
                                <span className="flex-1 truncate">
                                    {flashcardSet.title || flashcardSet.id}
                                </span>
                                {!selectionMode && (
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setTitle(flashcardSet.title || "");
                                            setEditingId(flashcardSet.id);
                                        }}
                                        aria-label="Rename flashcard set"
                                        className="rounded p-1 hover:bg-primary/20"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                )}
                            </>
                        )}
                        {!selectionMode && editingId !== flashcardSet.id && (
                            <Trash2
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setDataToDelete({
                                        id: flashcardSet.id,
                                        type: "flashcard",
                                    });
                                }}
                                className="h-5 w-5 cursor-pointer stroke-primary hover:fill-primary"
                            />
                        )}
                    </div>
                ))}
                {selectionMode && (
                    <button
                        onClick={startSelectedFlashcards}
                        disabled={!selectedIds.length}
                        className="m-3 flex items-center justify-center gap-2 rounded bg-primary p-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Practice {selectedIds.length} selected
                        <Play className="h-4 w-4 fill-white" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FlashcardList;
