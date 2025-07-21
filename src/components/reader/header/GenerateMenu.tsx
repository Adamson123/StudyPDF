import { File, FileQuestion, LucideFileStack } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

const GenerateMenu = ({
  setOpenQuestionMenu,
  setOpenFlashCardMenu,
  setOpenSummaryMenu,
}: {
  setOpenQuestionMenu: Dispatch<SetStateAction<boolean>>;
  setOpenFlashCardMenu: Dispatch<SetStateAction<boolean>>;
  setOpenSummaryMenu: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="absolute right-0 top-10 z-[100] flex flex-col text-nowrap rounded-md border border-gray-border bg-background text-sm shadow-[0px_4px_3px_rgba(0,0,0,0.3)]">
      <div
        onClick={() => setOpenQuestionMenu(true)}
        className="flex cursor-pointer items-center gap-2 p-3 hover:bg-gray-100/10"
      >
        <FileQuestion />
        Generate questions
      </div>
      {/* TODO: Remove in the future */}
      <div
        onClick={() => setOpenSummaryMenu(true)}
        className="flex cursor-pointer items-center gap-2 p-3 hover:bg-gray-100/10"
      >
        <File />
        Generate questions (experimental)
      </div>
      <div
        onClick={() => setOpenFlashCardMenu(true)}
        className="flex cursor-pointer items-center gap-2 p-3 hover:bg-gray-100/10"
      >
        <LucideFileStack />
        Generate flashcards
      </div>
    </div>
  );
};

export default GenerateMenu;
