import {
  Hash,
  PanelLeftClose,
  MessageSquareText,
  MoreVertical,
  Search,
  Square,
  PanelLeft,
  Minus,
  Plus,
  PanelLeftDashed,
  ChevronRight,
  ChevronsRight,
  Star,
  SquareDashed,
} from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import Input from "../ui/input";

const Header = ({
  setShowLeftSection,
  showLeftSection,
  incrementScale,
  decrementScale,
  numOfPages,
}: {
  setShowLeftSection: Dispatch<SetStateAction<boolean>>;
  showLeftSection: boolean;
  incrementScale: () => void;
  decrementScale: () => void;
  numOfPages: number;
}) => {
  return (
    <div className="fixed left-0 right-0 top-0 z-50 flex w-full items-center justify-between gap-3 bg-background px-3 py-[7px] shadow-[0px_4px_3px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-3">
        {/* Left section toggle */}
        <PanelLeftDashed
          onClick={() => setShowLeftSection((prev) => !prev)}
          strokeWidth={"1.2"}
          className={`h-6 w-6 cursor-pointer ${showLeftSection ? "stroke-primary" : "stroke-white"}`}
        />

        <div className="flex h-7 items-center gap-2 border-l border-gray-border pl-3">
          <Search className="h-[18px] w-[18px]" />{" "}
          <Input type="number" className="h-8 w-10 bg-gray-100/5" />/
          {numOfPages}
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
        <SquareDashed className="h-[18px] w-[18px]" />
        <Star className="h-[18px] w-[18px]" />
        {/* Info Icon */}
        <MessageSquareText className="h-[18px] w-[18px]" />
        <ChevronsRight className="h-6 w-6" />
      </div>
    </div>
  );
};

export default Header;
