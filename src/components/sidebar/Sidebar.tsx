import QuizList from "./QuizList";

const LeftSection = ({ showSidebar }: { showSidebar: boolean }) => {
  return (
    <section
      className={`fixed bottom-0 left-0 top-0 z-40 w-[350px] bg-background px-4 pt-24 shadow-[4px_0px_3px_rgba(0,0,0,0.3)] transition-all ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}
    >
      <QuizList />
    </section>
  );
};

export default LeftSection;
