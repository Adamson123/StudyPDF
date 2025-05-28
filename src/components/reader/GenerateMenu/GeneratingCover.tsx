import { Button } from "@/components/ui/button";
import { Stars } from "lucide-react";
import React from "react";

const GeneratingCover = ({
  amountOfQuestions,
  questionsLength,
  handleTryAgain,
  handleContinue,
  handleCancel,
  error,
}: {
  amountOfQuestions: number;
  questionsLength: number;
  handleTryAgain: () => void;
  handleContinue: () => void;
  handleCancel: () => void;
  error: string;
}) => {
  return (
    <div className="flex flex-col items-center gap-6 rounded-md border border-gray-border bg-background p-7 py-10 shadow-[0px_4px_3px_rgba(0,0,0,0.3)]">
      {error ? (
        <span className="text-7xl">😥</span>
      ) : (
        <Stars className="h-20 w-20 animate-pulse" />
      )}
      {/*  */}
      <div className="space-y-1 text-center">
        <h2 className="text-3xl font-bold">
          {error ? (
            <span className="text-red-500">{error}</span>
          ) : (
            "Generating questons..."
          )}
        </h2>
        <p className="w-[400px] text-center text-sm text-gray-500">
          {error
            ? `${error}. Please try again.`
            : `This may take a while, depending on the number of pages and the
        complexity of the content.`}
        </p>
      </div>
      {/*  */}
      <p className="text-2xl">
        {questionsLength}/{amountOfQuestions}
      </p>
      {/*  */}
      {error && (
        <div className="flex flex-col items-center gap-2 text-sm">
          {/* <p className="text-red-500">{error}</p>{" "} */}
          <div className="flex gap-5">
            <Button
              className="bg-white text-black hover:bg-gray-300"
              onClick={handleTryAgain}
            >
              Try again
            </Button>
            <Button
              onClick={handleCancel}
              className="bg-red-600 hover:bg-red-500"
            >
              Cancel
            </Button>
          </div>
          {questionsLength ? (
            <p
              onClick={handleContinue}
              className="cursor-pointer underline hover:text-primary"
            >
              Continue with {questionsLength} questions
            </p>
          ) : (
            ""
          )}
        </div>
      )}
    </div>
  );
};

export default GeneratingCover;
