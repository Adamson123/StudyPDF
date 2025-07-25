import {
  MessageSquareText,
  Search,
  Minus,
  Plus,
  PanelLeftDashed,
  ChevronsRight,
  Stars,
  File,
  FileQuestion,
  LucideFileStack,
  LucideFileInput,
} from "lucide-react";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import Input from "../../ui/input";
import { MessageType } from "../viewer/anotation/comment/Message";
import GenerateQuestionMenu from "../generateWithAiMenus/GenerateQuestionMenu";
import GenerateFlashcardMenu from "../generateWithAiMenus/GenerateFlashcardMenu";
import PDFPage from "../viewer/pdfPage";
import debouncedHandler from "@/utils/debounceHandler";
import GenerateSummaryQuestionMenu from "../generateWithAiMenus/GenerateSummaryQuestionMenu";
import GenerateMenu from "./GenerateMenu";

const Header = ({
  setShowSidebar,
  showSidebar,
  incrementScale,
  decrementScale,
  numOfPages,
  pdfsContainer,
  setSelectionBoxMode,
  setPdfInfo,
  setMessage,
  renderPDFsOnView,
  pdfPages,
}: {
  setShowSidebar: Dispatch<SetStateAction<boolean>>;
  showSidebar: boolean;
  incrementScale: () => void;
  decrementScale: () => void;
  numOfPages: number;
  pdfsContainer: RefObject<HTMLDivElement>;
  setSelectionBoxMode: Dispatch<SetStateAction<boolean>>;
  setPdfInfo: Dispatch<SetStateAction<{ url: string; name: string }>>;
  setMessage: Dispatch<SetStateAction<MessageType>>;
  renderPDFsOnView: (pdfPages: PDFPage[]) => Promise<void>;
  pdfPages: PDFPage[];
}) => {
  const [pageNum, setPageNum] = useState("1");
  const [onPageNumInput, setOnPageNumInput] = useState(false);
  const [openGenerationMenu, setOpenGenerationMenu] = useState(false);
  //TODO: put into one state object
  const [openQuestionMenu, setOpenQuestionMenu] = useState(false);
  const [openFlashCardMenu, setOpenFlashCardMenu] = useState(false);
  const [openSummaryMenu, setOpenSummaryMenu] = useState(false);

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

    let scrollTimeoutId: NodeJS.Timeout | any = null;

    const debouncedFunc = debouncedHandler(
      () => renderPDFsOnView(pdfPages),
      scrollTimeoutId,
      200,
    );

    debouncedFunc();
    //setPageNum(value);
  };

  useEffect(() => {
    const updatePageNumOnScroll = async () => {
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

      for (let index = 0; index < pages.length; index++) {
        const page = pages[index] as HTMLDivElement;
        const rect = page.getBoundingClientRect();

        if (rect.top < window.innerHeight && rect.bottom > 0) {
          currentPageNum = index + 1;

          pagePos.push({
            index: currentPageNum,
            bottom: rect.bottom,
            top: rect.top,
          });

          //  break;
        }
        if (pagePos.length >= 2) {
          break;
        }
      }

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

      await renderPDFsOnView(pdfPages);
      setPageNum(currentPageNum.toString());
    };

    let scrollTimeoutId: NodeJS.Timeout | any = null;

    const debouncedFunc = debouncedHandler(
      updatePageNumOnScroll,
      scrollTimeoutId,
    );

    const handleScrollEnd = () => {
      setOnPageNumInput(false); // Reset flag when scrolling stops
      clearTimeout(scrollTimeoutId); // Clear any pending scroll timeout
      updatePageNumOnScroll(); // Ensure final state is rendered
    };

    window.addEventListener("scroll", debouncedFunc);
    window.addEventListener("scrollend", handleScrollEnd);
    return () => {
      window.removeEventListener("scroll", debouncedFunc);
      window.removeEventListener("scrollend", handleScrollEnd);
    };
  }, [onPageNumInput, pdfPages]);

  const handlePdfSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileURL = URL.createObjectURL(file);
    setPdfInfo({ url: fileURL, name: file.name });
    setMessage({ text: "Loading PDF...", autoTaminate: false });
    setPageNum("1");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-[100] flex w-full items-center justify-between gap-3 bg-background px-3 py-[7px] shadow-[0px_4px_3px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-3">
        {/* Left section toggle */}
        <PanelLeftDashed
          onClick={() => setShowSidebar((prev) => !prev)}
          strokeWidth={"1.2"}
          className={`h-[1.40rem] w-[1.40rem] cursor-pointer ${showSidebar && "stroke-primary"}`}
        />

        <div className="flex h-7 items-center gap-2 border-l border-gray-border pl-3 text-xs">
          <Search className="h-[17px] w-[17px]" />{" "}
          <Input
            id="page-input"
            value={pageNum}
            onChange={handlePageNumChange}
            type="number"
            className="h-8 w-10 bg-gray-100/5"
          />
          /{numOfPages}
        </div>
      </div>
      {/* Middle section */}
      <div className="flex items-center">
        <button
          onClick={decrementScale}
          className="flex h-8 w-9 cursor-pointer items-center justify-center rounded-l border border-r-[3px] border-r-gray-border bg-gray-border"
        >
          <Minus className="h-5 w-5" />
        </button>

        <button
          onClick={incrementScale}
          className="flex h-8 w-9 cursor-pointer items-center justify-center rounded-r bg-gray-border"
        >
          <Plus className="h-5 w-5" />
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
        {/* <MessageSquareText className="h-[17px] w-[17px]" /> */}

        <div className="relative flex h-[17px] w-[17px] cursor-pointer items-center justify-center">
          <LucideFileInput className="pointer-events-none absolute inset-0 h-full w-full cursor-pointer" />
          <Input
            onChange={handlePdfSelection}
            type="file"
            accept="application/pdf"
            className="h-full w-full cursor-pointer opacity-0"
            id="pdf-file-input"
          />
        </div>
        {/* generateMenu */}
        <div
          onBlur={() => setOpenGenerationMenu(false)}
          onClick={() => setOpenGenerationMenu(!openGenerationMenu)}
          tabIndex={0}
          className="relative flex h-8 w-9 cursor-pointer items-center justify-center rounded border border-gray-border bg-gray-border"
        >
          <Stars className="h-[18px] w-[18px] cursor-pointer" />
          {openGenerationMenu && (
            <GenerateMenu
              setOpenQuestionMenu={setOpenQuestionMenu}
              setOpenFlashCardMenu={setOpenFlashCardMenu}
              setOpenSummaryMenu={setOpenSummaryMenu}
            />
          )}
        </div>

        <ChevronsRight className="h-6 w-6" />
      </div>
      {openQuestionMenu && (
        <GenerateQuestionMenu
          setOpenQuestionMenu={setOpenQuestionMenu}
          numOfPages={numOfPages}
        />
      )}
      {openSummaryMenu && (
        <GenerateSummaryQuestionMenu setOpenSummaryMenu={setOpenSummaryMenu} />
      )}
      {openFlashCardMenu && (
        <GenerateFlashcardMenu
          setOpenFlashCardMenu={setOpenFlashCardMenu}
          numOfPages={numOfPages}
        />
      )}
    </header>
  );
};

export default Header;
