import {
  Search,
  Minus,
  Plus,
  PanelLeftDashed,
  ChevronsRight,
  Stars,
  LucideFileInput,
} from "lucide-react";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import Input from "../../ui/input";
import { MessageType } from "../viewer/anotation/comment/Message";
import GenerateQuestionMenu from "../generateWithAiMenus/GenerateQuestionMenu";
import GenerateFlashcardMenu from "../generateWithAiMenus/GenerateFlashcardMenu";
import PDFPage from "../viewer/pdfPage";
import debouncedHandler from "@/utils/debounceHandler";
import GenerateMenu from "./GenerateMenu";
import throttle from "@/utils/throttle";

/**
 * @param setShowSidebar - Function to toggle the visibility of the sidebar.
 * @param showSidebar - Boolean indicating whether the sidebar is currently shown.
 * @param incrementScale - Function to increase the scale of the PDF viewer.
 * @param decrementScale - Function to decrease the scale of the PDF viewer.
 * @param numOfPages - Total number of pages in the PDF document.
 * @param pdfsContainer - Ref to the container holding the PDF pages.
 * @param setSelectionBoxMode - Function to toggle the selection box mode.
 * @param setPdfInfo - Function to set the PDF information (URL and name).
 * @param setMessage - Function to set messages for the user interface.
 * @param renderPDFsOnView - Function to render the PDF pages on view.
 * @param pdfPages - Array of PDFPage objects representing the pages of the PDF document.
 * @param param0 - Object containing various state setters and values for the header component.
 * @returns JSX.Element
 */
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
  // const onPageNumInput = useRef(false);
  const [openGenerationMenu, setOpenGenerationMenu] = useState(false);
  //TODO: put into one state object
  const [openQuestionMenu, setOpenQuestionMenu] = useState(false);
  const [openFlashCardMenu, setOpenFlashCardMenu] = useState(false);

  const handlePageNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //  setOnPageNumInput(true);
    //   onPageNumInput.current = true;
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
  };

  useEffect(() => {
    /**
     * Updates the current page number based on the user's scroll position.
     *
     * This function calculates which PDF page is currently in view by checking the
     * position of each page relative to the viewport. If multiple pages are partially
     * visible, it determines the page with the larger visible portion and sets it as
     * the current page. The function also triggers rendering of PDFs in view and updates
     * the page number state.
     *
     * @async
     * @returns {Promise<void>} Resolves when the page number is updated and PDFs in view are rendered.
     *
     * @remarks
     * - If `onPageNumInput` is true, the function exits early without performing any updates.
     * - The function assumes that each page is represented by an element with the class `pdfContainer`.
     * - The `pdfsContainer` ref must point to a valid HTMLDivElement containing the PDF pages.
     *
     * @see renderPDFsOnView
     * @see setPageNum
     */
    const updatePageNumOnScroll = async () => {
      //   if (onPageNumInput.current) return;
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

      setPageNum(currentPageNum.toString());
      await renderPDFsOnView(pdfPages);
    };

    let scrollTimeoutId: NodeJS.Timeout | any = null;

    // const debouncedFunc = debouncedHandler(
    //   updatePageNumOnScroll,
    //   scrollTimeoutId,
    //   500,
    // );
    const throttleFunc = throttle(updatePageNumOnScroll, 20);

    window.addEventListener("scroll", throttleFunc);
    window.addEventListener("scrollend", throttleFunc);
    return () => {
      window.removeEventListener("scroll", throttleFunc);
      window.removeEventListener("scrollend", throttleFunc);
    };
  }, [pdfPages]);

  const handlePdfSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileURL = URL.createObjectURL(file);
    setPdfInfo({ url: fileURL, name: file.name });
    setMessage({ text: "Loading PDF...", autoTaminate: false });
    setPageNum("1");
    window.scrollTo(0, 0);
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
