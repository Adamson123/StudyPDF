import Quiz from "@/components/reader/quiz/Quiz";

const QuizPage = async ({ params }: { params: { id: string } }) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Quiz docId={params.id} />
    </div>
  );
};

export default QuizPage;
