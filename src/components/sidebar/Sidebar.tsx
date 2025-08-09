import { useEffect, useState } from "react";
import FlashcardList from "./FlashcardList";
import QuizList from "./QuizList";
import GenerateSummary from "./summary/GenerateSummary";
import Summary from "./summary/Summary";
import {
  deleteSummaryById,
  getAllSummariesFromStorage,
} from "@/lib/summaryStorage";
import Popup from "../ui/Popup";
import { deleteQuizById, getAllQuizzesFromStorage } from "@/lib/quizStorage";
import {
  deleteFlashcardById,
  getAllFlashcardsFromStorage,
} from "@/lib/flashcardStorage";
import { cn } from "@/lib/utils";
import useGenerateWithAI from "@/hooks/useGenerateWithAI";

const Sidebar = ({ showSidebar }: { showSidebar: boolean }) => {
  const [openGenerateSummary, setOpenGenerateSummary] = useState(false);
  //TODO:Remove this state
  const [summary, setSummary] = useState({ title: "", content: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizzes, setQuizzes] = useState<StoredQuiz[]>([]);
  const [flashcards, setFlashcards] = useState<StoredFlashcard[]>([]);
  const [summaries, setSummaries] = useState<SummaryTypes[]>([]);
  const {
    generateDataWithOpenAI,
    cancelDataGenerationWithOpenAI,
    isCancelled,
  } = useGenerateWithAI();
  const [error, setError] = useState("");
  const [dataToDelete, setDataToDelete] = useState<DataToDeleteTypes>({
    id: "",
    type: "",
  });

  //Get All data from localStorage and set it to state
  // This effect runs once when the component mounts to initialize state with stored data
  useEffect(() => {
    const storedSummaries = getAllSummariesFromStorage();
    const storedQuizzes = getAllQuizzesFromStorage();
    const storedFlashcarfs = getAllFlashcardsFromStorage();

    if (storedSummaries) {
      setSummaries(storedSummaries);
    }

    if (storedQuizzes) {
      setQuizzes(storedQuizzes);
    }

    if (storedFlashcarfs) {
      setFlashcards(storedFlashcarfs);
    }
  }, []);

  const cancelSummaryGeneration = () => {
    cancelDataGenerationWithOpenAI();
    setIsGenerating(false);
    setOpenGenerateSummary(false);
    setSummary({ title: "", content: "" });
    setSummaries(getAllSummariesFromStorage());
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
          <QuizList
            dataToDelete={dataToDelete}
            setDataToDelete={setDataToDelete}
            quizzes={quizzes}
          />
          <FlashcardList
            dataToDelete={dataToDelete}
            setDataToDelete={setDataToDelete}
            flashcards={flashcards}
          />
        </div>
        <Summary
          isGenerating={isGenerating}
          setOpenGenerateSummary={setOpenGenerateSummary}
          summaries={summaries}
          setDataToDelete={setDataToDelete}
          cancelSummaryGeneration={cancelSummaryGeneration}
          error={error}
        />
      </div>

      {openGenerateSummary && (
        <GenerateSummary
          setIsGenerating={setIsGenerating}
          setSummary={setSummary}
          summary={summary}
          setOpenGenerateSummary={setOpenGenerateSummary}
          setSummaries={setSummaries}
          isGenerating={isGenerating}
          generateDataWithOpenAI={generateDataWithOpenAI}
          setError={setError}
          isCancelled={isCancelled}
        />
      )}
      {dataToDelete.id && (
        <Popup
          message="Are you sure you want to delete this quiz"
          cancelBtnFunc={() => setDataToDelete({ id: "", type: "" })}
          executeBtnLabel="Delete"
          executeBtnFunc={() => {
            switch (dataToDelete.type) {
              case "quiz":
                deleteQuizById(dataToDelete.id);
                setQuizzes(getAllQuizzesFromStorage());
                break;
              case "flashcard":
                deleteFlashcardById(dataToDelete.id);
                setFlashcards(getAllFlashcardsFromStorage());
                break;
              case "summary":
                deleteSummaryById(dataToDelete.id);
                setSummaries(getAllSummariesFromStorage());
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
