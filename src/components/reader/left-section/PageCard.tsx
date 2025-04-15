import {
  Bookmark,
  Expand,
  FileText,
  MessageCircleQuestion,
} from "lucide-react";

const PageCard = () => {
  return (
    <div className="flex w-full items-center gap-3 overflow-hidden rounded border border-gray-border pr-3">
      {/* Number */}
      <div className="flex min-h-[50px] min-w-[50px] items-center justify-center bg-primary text-xl font-bold">
        1
      </div>
      {/* Summary snip */}
      <p className="w-full text-sm">No summary...</p>
      {/*  */}
      <div className="flex items-center gap-3">
        <Expand className="h-5 w-5 fill-green-400/10 stroke-green-400" />
        <Bookmark className="h-5 w-6 fill-sky-400/10 stroke-sky-400" />
        <MessageCircleQuestion className="stroke-red-60000 h-5 w-6 cursor-pointer fill-red-400/10 stroke-red-600" />
      </div>
    </div>
  );
};

export default PageCard;
