import {
  Hash,
  MenuSquare,
  MessageSquareText,
  MoreVertical,
  Search,
  Square,
} from "lucide-react";
import { Dispatch, SetStateAction } from "react";

const Header = ({
  setShowLeftSection,
}: {
  setShowLeftSection: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="fixed top-0 z-50 flex w-full items-center justify-between gap-3 bg-background p-3 shadow-[0px_4px_3px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-3">
        {/* Left section toggle */}
        <MenuSquare
          onClick={() => setShowLeftSection((prev) => !prev)}
          strokeWidth={"1.2"}
          className="h-6 w-6 cursor-pointer"
        />
        {/* Document Name */}
        <div className="flex h-7 items-center border-l border-gray-border pl-3">
          <h2 className="text-md">Document Name</h2>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <Search strokeWidth={"1.2"} />
        <div className="relative">
          <Square strokeWidth={"1.2"} />
          <Hash className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <MessageSquareText strokeWidth={"1.2"} />
        <MoreVertical strokeWidth={"1.2"} />
      </div>
    </div>
  );
};

export default Header;
