import {
  MessageSquareText,
  Search,
  Minus,
  Plus,
  PanelLeftDashed,
  ChevronsRight,
  Star,
  SquareDashed,
  Stars,
  File,
  FileQuestion,
  LucideFileStack,
} from "lucide-react";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import Input from "../ui/input";
import { MessageType } from "./viewer/Message";
import GenerateQuestionMenu from "./GenerateMenu/GenerateQuestionMenu";

const GenerateMenu = ({
  setOpenQuestionMenu,
}: {
  setOpenQuestionMenu: Dispatch<SetStateAction<boolean>>;
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
      <div className="flex cursor-pointer items-center gap-2 p-3 hover:bg-gray-100/10">
        <LucideFileStack />
        Generate flashcards
      </div>
    </div>
  );
};

const Header = ({
  setShowLeftSection,
  showLeftSection,
  incrementScale,
  decrementScale,
  numOfPages,
  pdfsContainer,
  setSelectionBoxMode,
  setPdfURL,
  setMessage,
}: {
  setShowLeftSection: Dispatch<SetStateAction<boolean>>;
  showLeftSection: boolean;
  incrementScale: () => void;
  decrementScale: () => void;
  numOfPages: number;
  pdfsContainer: RefObject<HTMLDivElement>;
  setSelectionBoxMode: Dispatch<SetStateAction<boolean>>;
  setPdfURL: Dispatch<SetStateAction<string>>;
  setMessage: Dispatch<SetStateAction<MessageType>>;
}) => {
  const [pageNum, setPageNum] = useState("1");
  const [onPageNumInput, setOnPageNumInput] = useState(false);
  const [openQuestionMenu, setOpenQuestionMenu] = useState(false);
  const [openFlashCardMenu, setOpenFlashCardMenu] = useState(false);

  const handlePageNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOnPageNumInput(true);
    const value = e.target.value;

    if (Number(value) <= numOfPages) {
      setPageNum(value);
      const page = pdfsContainer.current?.querySelector(
        `#pdfContainer-${value}`,
      ) as HTMLDivElement;
      if (!page) return;
      // Scroll to the page
      page.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }

    //setPageNum(value);
  };
  useEffect(() => {
    const updatePagNumOnScroll = () => {
      if (onPageNumInput) return;
      const pdfsContainerElement = pdfsContainer.current as HTMLDivElement;
      if (!pdfsContainerElement) return;
      const pages = pdfsContainerElement.querySelectorAll(".pdfContainer");
      if (!pages.length) return;

      let currentPageNum = 1;

      interface PagePos {
        index: number;
        top: number;
        bottom: number;
      }

      const pagePos: PagePos[] = [];

      pages.forEach((page, index) => {
        const rect = page.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          currentPageNum = index + 1;

          pagePos.push({
            index: currentPageNum,
            bottom: rect.bottom,
            top: rect.top,
          });
          return;
        }
      });

      if (pagePos.length > 1) {
        const firstPage = pagePos[0] as PagePos;
        const secondPage = pagePos[1] as PagePos;

        const remainOfFirstInView = firstPage.bottom;
        const remainOfSecondInView = window.innerHeight - secondPage.top;

        if (remainOfFirstInView > remainOfSecondInView) {
          currentPageNum = firstPage.index;
        } else {
          currentPageNum = secondPage.index;
        }
      }

      setPageNum(currentPageNum.toString());
    };

    const updatePagNumOnScrollEnd = () => {
      setOnPageNumInput(false);
    };

    window.addEventListener("scroll", updatePagNumOnScroll);
    window.addEventListener("scrollend", updatePagNumOnScrollEnd);
    return () => {
      window.removeEventListener("scroll", updatePagNumOnScroll);
      window.removeEventListener("scrollend", updatePagNumOnScrollEnd);
    };
  }, [onPageNumInput]);

  const handlePdfSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileURL = URL.createObjectURL(file);
    setPdfURL(fileURL);
    setMessage({ text: "Loading PDF...", autoTaminate: false });
    setPageNum("1");
  };

  return (
    <div className="fixed left-0 right-0 top-0 z-[100] flex w-full items-center justify-between gap-3 bg-background px-3 py-[7px] shadow-[0px_4px_3px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-3">
        {/* Left section toggle */}
        <PanelLeftDashed
          onClick={() => setShowLeftSection((prev) => !prev)}
          strokeWidth={"1.2"}
          className={`h-6 w-6 cursor-pointer ${showLeftSection ? "stroke-primary" : "stroke-white"}`}
        />

        <div className="flex h-7 items-center gap-2 border-l border-gray-border pl-3">
          <Search className="h-[18px] w-[18px]" />{" "}
          <Input
            value={pageNum}
            onChange={handlePageNumChange}
            type="number"
            className="text-md h-8 w-10 bg-gray-100/5"
          />
          /{numOfPages}
        </div>
      </div>
      {/* Middle section */}
      <div className="flex items-center">
        <button
          onClick={decrementScale}
          className="flex h-8 w-9 cursor-pointer items-center justify-center rounded-l border border-r-[3px] bg-gray-border"
        >
          <Minus className="h-6 w-6" />
        </button>

        <button
          onClick={incrementScale}
          className="flex h-8 w-9 cursor-pointer items-center justify-center rounded-r bg-gray-border"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
      {/* Right section */}
      <div className="flex items-center gap-[15px]">
        {/* <div className="relative">
          <Square className="h-5 w-5" />
          <Hash className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2" />
        </div> */}
        {/* <SquareDashed
          onClick={() => setSelectionBoxMode((prev) => !prev)}
          className="h-[18px] w-[18px]"
        /> */}

        {/* <Star className="h-[18px] w-[18px]" /> */}
        <MessageSquareText className="h-[18px] w-[18px]" />

        <div className="relative flex h-[18px] w-[18px] cursor-pointer items-center justify-center">
          <File className="pointer-events-none absolute inset-0 h-full w-full cursor-pointer" />
          <Input
            onChange={handlePdfSelection}
            type="file"
            accept="application/pdf"
            className="h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <div
          tabIndex={0}
          className="generateMenu relative flex h-8 w-9 cursor-pointer items-center justify-center rounded border border-gray-border bg-gray-border"
        >
          <Stars className="h-[18px] w-[18px] cursor-pointer" />
          <GenerateMenu setOpenQuestionMenu={setOpenQuestionMenu} />
        </div>

        <ChevronsRight className="h-6 w-6" />
      </div>
      {openQuestionMenu && (
        <GenerateQuestionMenu
          setOpenQuestionMenu={setOpenQuestionMenu}
          numOfPages={numOfPages}
        />
      )}
    </div>
  );
};

export default Header;
