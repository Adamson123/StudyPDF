import { useEffect, useState } from "react";
import FlashcardList from "./FlashcardList";
import QuizList from "./QuizList";
import GenerateSummary from "./summary/GenerateSummary";
import Summary from "./summary/Summary";
import Popup from "../ui/Popup";
import { cn } from "@/lib/utils";
import useGenerateWithAI from "@/hooks/useGenerateWithAI";
import { useAppDispatch } from "@/hooks/useAppStore";
import { deleteOneSummary } from "@/redux/features/summariesSlice";
import { deleteOneSetOfFlashcards } from "@/redux/features/flashcardsSlice";
import { deleteOneSetOfQuizzes } from "@/redux/features/quizzesSlice";

const Sidebar = ({ showSidebar }: { showSidebar: boolean }) => {
    const [openGenerateSummary, setOpenGenerateSummary] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    // const [quizzes, setQuizzes] = useState<StoredQuiz[]>([]);
    // const [flashcards, setFlashcards] = useState<StoredFlashcard[]>([]);
    const { generateDataWithAI, cancelDataGenerationWithAI, isCancelled } =
        useGenerateWithAI();
    const [error, setError] = useState("");
    const [dataToDelete, setDataToDelete] = useState<DataToDeleteTypes>({
        id: "",
        type: "",
    });
    const dispatch = useAppDispatch();

    const cancelSummaryGeneration = () => {
        cancelDataGenerationWithAI();
        setIsGenerating(false);
        setOpenGenerateSummary(false);
    };

    return (
        <section
            style={{
                scrollbarColor: "hsl(var(--border)) transparent",
            }}
            className={cn(
                `max-w-screen fixed bottom-0 left-0 top-0 z-[50] w-full max-w-full bg-background pt-16 shadow-[4px_0px_3px_rgba(0,0,0,0.3)] transition-all md:max-w-[600px]`,
                !showSidebar && "-translate-x-full",
                (dataToDelete.id || openGenerateSummary) && "z-[150]",
            )}
        >
            <div className="flex max-h-screen flex-col gap-5 overflow-x-auto overflow-y-auto pb-28">
                <div className="flex flex-col pb-2">
                    <QuizList setDataToDelete={setDataToDelete} />
                    <FlashcardList setDataToDelete={setDataToDelete} />
                </div>
                <Summary
                    isGenerating={isGenerating}
                    setOpenGenerateSummary={setOpenGenerateSummary}
                    setDataToDelete={setDataToDelete}
                    cancelSummaryGeneration={cancelSummaryGeneration}
                    error={error}
                />
            </div>

            {openGenerateSummary && (
                <GenerateSummary
                    setIsGenerating={setIsGenerating}
                    setOpenGenerateSummary={setOpenGenerateSummary}
                    isGenerating={isGenerating}
                    generateDataWithAI={generateDataWithAI}
                    setError={setError}
                    isCancelled={isCancelled}
                />
            )}
            {dataToDelete.id && (
                <Popup
                    //TODO : Make message dynamic
                    message={`Are you sure you want to delete this ${dataToDelete.type}`}
                    cancelBtnFunc={() => setDataToDelete({ id: "", type: "" })}
                    executeBtnLabel="Delete"
                    executeBtnFunc={() => {
                        switch (dataToDelete.type) {
                            case "quiz":
                                dispatch(
                                    deleteOneSetOfQuizzes(dataToDelete.id),
                                );
                                break;
                            case "flashcard":
                                dispatch(
                                    deleteOneSetOfFlashcards(dataToDelete.id),
                                );
                                break;
                            case "summary":
                                dispatch(deleteOneSummary(dataToDelete.id));
                                break;
                            default:
                                break;
                        }
                        setDataToDelete({ id: "", type: "" });
                    }}
                />
            )}
        </section>
    );
};

export default Sidebar;
