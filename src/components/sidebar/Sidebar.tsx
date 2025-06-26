import FlashcardList from "./FlashcardList";
import QuizList from "./QuizList";
import Summary from "./Summary";

const LeftSection = ({ showSidebar }: { showSidebar: boolean }) => {
  return (
    <section
      style={{
        scrollbarColor: "hsl(var(--border)) transparent",
      }}
      className={`fixed bottom-0 left-0 top-0 z-40 min-w-[400px] overflow-x-auto overflow-y-auto bg-background px-4 pt-24 shadow-[4px_0px_3px_rgba(0,0,0,0.3)] transition-all ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex flex-col gap-5">
        <Summary />
        <div className="border- flex flex-col gap-2 pt-5">
          <QuizList />
          <FlashcardList />
        </div>
      </div>
    </section>
  );
};

export default LeftSection;
