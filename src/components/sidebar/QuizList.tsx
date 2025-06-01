import { deleteQuizById, getAllQuizzesFromStorage } from "@/lib/quizStorage";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Popup from "../ui/Popup";

const QuizList = () => {
  const [openDropDown, setOpenDropDown] = useState(false);
  const [quizIdToDelete, setQuizIdToDelete] = useState("");
  const router = useRouter();
  const quizzes = useMemo(getAllQuizzesFromStorage, [quizIdToDelete]);

  return (
    <div className="flex flex-col gap-1">
      <h2
        onClick={() => setOpenDropDown(!openDropDown)}
        className="flex cursor-pointer items-center justify-between rounded border p-2"
      >
        Quizzes{" "}
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
        {quizzes.map((quiz, i) => (
          <div
            onClick={() => router.push(`/quiz/${quiz.id}`)}
            key={i}
            className="flex cursor-pointer items-center justify-between rounded border border-primary bg-primary/15 p-3 text-xs transition-colors hover:bg-primary/70"
          >
            <span className="overflow-hidden text-nowrap">
              {quiz.title || quiz.id}
            </span>
            <Trash2
              onClick={(e) => {
                e.stopPropagation(); // Prevents the click from propagating to the parent div
                setQuizIdToDelete(quiz.id); // Set the quiz ID to show the popup for deletion confirmation
              }}
              className="h-5 w-5 cursor-pointer stroke-primary hover:fill-primary"
            />
          </div>
        ))}
      </div>
      {quizIdToDelete && (
        <Popup
          message="Are you sure you want to delete this quiz"
          cancelBtnFunc={() => setQuizIdToDelete("")}
          executeBtnLabel="Delete"
          executeBtnFunc={() => {
            deleteQuizById(quizIdToDelete);
            setQuizIdToDelete("");
          }}
        />
      )}
    </div>
  );
};

export default QuizList;
