import { useState } from "react";
import FlashcardList from "./FlashcardList";
import QuizList from "./QuizList";
import GenerateSummary from "./summary/GenerateSummary";
import Summary from "./summary/Summary";

const LeftSection = ({ showSidebar }: { showSidebar: boolean }) => {
  const [openGenerateSummary, setOpenGenerateSummary] = useState(false);

  return (
    <section
      style={{
        scrollbarColor: "hsl(var(--border)) transparent",
      }}
      className={`fixed bottom-0 left-0 top-0 z-40 max-w-full bg-background pt-16 shadow-[4px_0px_3px_rgba(0,0,0,0.3)] transition-all md:max-w-[600px] ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex max-h-screen flex-col gap-5 overflow-x-auto overflow-y-auto pb-28">
        <div className="flex flex-col pb-2">
          <QuizList />
          <FlashcardList />
        </div>
        <Summary setOpenGenerateSummary={setOpenGenerateSummary} />
      </div>

      {openGenerateSummary && (
        <GenerateSummary setOpenGenerateSummary={setOpenGenerateSummary} />
      )}
    </section>
  );
};

export default LeftSection;
