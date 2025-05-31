import Input from "@/components/ui/input";
import XButton from "@/components/ui/XButton";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { ViewerContext } from "../viewer/Viewer";

const GenerateFlashcardMenu = ({
  setOpenFlashCardMenu,
  numOfPages,
}: {
  setOpenFlashCardMenu: Dispatch<SetStateAction<boolean>>;
  numOfPages: number;
}) => {
  const [amountOfQuestions, setAmountOfQuestions] = useState<number>(10);
  const [range, setRange] = useState({ from: 1, to: numOfPages });
  const pdfURL = useContext(ViewerContext).pdfURL;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-3 shadow-md backdrop-blur-sm">
      <form className="flex max-h-screen max-w-[420px] flex-col gap-6 overflow-y-auto rounded-md border border-gray-border bg-background p-7 shadow-[0px_4px_3px_rgba(0,0,0,0.3)] md:max-w-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl">Generate Flashcards</h2>
            <h3 className="text-xs text-gray-500">
              Select the type of question
            </h3>
          </div>

          <XButton onClick={() => setOpenFlashCardMenu(false)} />
        </div>
        {/* Name */}
        <div className="space-y-1 text-center text-sm">
          <label htmlFor="name">Flashcard Name</label>
          <Input
            id="name"
            placeholder="Enter flashcard name"
            className="focus:outline-1 focus:outline-primary"
          />
        </div>

        {/* Amount of questions and range */}
        <div className="flex flex-col items-center gap-3">
          <label className="text-nowrap text-sm">Amount of question:</label>
          <Input
            onChange={(e) => setAmountOfQuestions(Number(e.target.value))}
            value={amountOfQuestions}
            type="number"
            min={10}
            max={60}
            className="focus:outline-1 focus:outline-primary"
          />
        </div>
        <div className="flex w-full flex-col items-center gap-3">
          <label className="text-nowrap text-sm">Range of pages:</label>
          <div className="flex w-full items-center gap-3">
            <Input
              type="number"
              min={1}
              max={numOfPages}
              value={range.from}
              onChange={(e) =>
                setRange({ ...range, from: Number(e.target.value) })
              }
              className="focus:outline-1 focus:outline-primary"
            />
            <span>-</span>
            <Input
              type="number"
              min={1}
              max={numOfPages}
              value={range.to}
              onChange={(e) =>
                setRange({ ...range, to: Number(e.target.value) })
              }
              className="focus:outline-1 focus:outline-primary"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default GenerateFlashcardMenu;
