import { Circle } from "lucide-react";
import PageCard from "./PageCard";

const LeftSection = () => {
  return (
    <section className="fixed bottom-0 left-0 top-0 z-40 w-[350px] bg-background px-4 pt-24 shadow-[4px_0px_3px_rgba(0,0,0,0.3)]">
      {/* First section */}
      <div className="flex flex-col gap-5">
        {/*  */}
        <div className="flex w-full items-center justify-between">
          <h3 className="text-xl">Pages</h3>
          {/* Bookmarked only */}
          <div className="flex items-center gap-1 text-[10px]">
            <label htmlFor="bkOnly"> bookmarked</label>
            <Circle className="h-5 w-5 stroke-primary" id="bkOnly" />
          </div>
        </div>

        {/* Pages */}
        <div className="flex flex-col gap-2">
          <PageCard />
          <PageCard />
          <PageCard />
          <PageCard />
          <PageCard />
        </div>
      </div>
    </section>
  );
};

export default LeftSection;
