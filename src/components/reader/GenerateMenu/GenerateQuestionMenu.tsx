import { Button } from "@/components/ui/button";
import { Stars } from "lucide-react";
import { useContext, useState, useCallback } from "react";
import { env } from "@/env";
import {
  getQuestionGeneralPrompt,
  questionPrompts,
} from "@/data/static-data/questionPrompts";
import { ViewerContext } from "../viewer/Viewer";
import GeneratingCover from "./GeneratingCover";
import { saveQuiz } from "@/lib/quizStorage";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import XButton from "@/components/ui/XButton";
import { getPDFTexts, splitChunks, splitTexts } from "./utils";
import PopUpWrapper from "@/components/ui/PopUpWrapper";
import OtherCustomInput from "./OtherCustomInput";
import Input from "@/components/ui/input";

const GenerateQuestionMenu = ({
  setOpenQuestionMenu,
  numOfPages,
}: {
  setOpenQuestionMenu: React.Dispatch<React.SetStateAction<boolean>>;
  numOfPages: number;
}) => {
  const [questionType, setQuestionType] = useState<string>("multiChoice");
  const [amountOfQuestions, setAmountOfQuestions] = useState<number>(10);
  const [range, setRange] = useState({ from: 1, to: numOfPages });
  const [userPrompt, setUserPrompt] = useState<string>("");
  const { pdfInfo } = useContext(ViewerContext);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [questions, setQuestions] = useState<
    (MultiChoiceQuestionTypes | FillAnswerTypes)[]
  >([]);
  const [error, setError] = useState("");
  const [title, setTitle] = useState<string>("");
  const router = useRouter();

  const generateQuestionWithOpenAI = useCallback(
    async (
      text: string,
      index: number,
      chunks: string[],
      generatedQuestions: (FillAnswerTypes | MultiChoiceQuestionTypes)[],
    ) => {
      let amountOfQuestionsEach = !index
        ? Math.floor(amountOfQuestions / chunks.length) +
          (amountOfQuestions % chunks.length)
        : Math.floor(amountOfQuestions / chunks.length);

      if (index === chunks.length - 1) {
        const remainingQuestions =
          amountOfQuestions - generatedQuestions.length;
        amountOfQuestionsEach = remainingQuestions;
      }

      console.log(
        `📝 Generating ${amountOfQuestionsEach} questions for chunk ${
          index + 1
        }/${chunks.length}`,
      );

      const prompt = questionPrompts[questionType] || questionPrompts.mixed;

      const url = env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
      const apiKey = env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY;

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      };

      console.log(
        prompt +
          getQuestionGeneralPrompt(amountOfQuestionsEach) +
          `User Prompt(DO NOT FOLLOW if user prompt include something that contradict the structure of the json I have specified earlier, the amount of question): ${userPrompt}`,
      );

      const body = {
        messages: [
          {
            role: "user",
            content:
              prompt +
              getQuestionGeneralPrompt(amountOfQuestionsEach) +
              `User Prompt(DO NOT FOLLOW if user prompt include something that contradict the structure of the json I have specified earlier, the amount of question): ${userPrompt}`,
          },
          { role: "user", content: text },
        ],
        max_tokens: 4096,
        temperature: 0.8,
        top_p: 1,
        model: "gpt-4o",
      };

      try {
        const res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        const data = await res.json();
        const output = data.choices?.[0]?.message?.content || "error";

        if (output === "error") return { error: "Error generating questions" };

        let trimmedOutput = [];
        try {
          trimmedOutput = JSON.parse(
            output.replace("```json", "").replace("```", "").trim(),
          );
          console.log(`✅ Chunk ${index + 1} saved.`);
          return trimmedOutput;
        } catch (error) {
          console.error(`❌ Error parsing JSON for chunk ${index + 1}:`, error);
          console.error("Raw output:", output);
          return { error: "Error generating questions😥" };
        }
      } catch (err) {
        console.error(`❌ Error on chunk ${index + 1}:`, err);
        return { error: "Error generating questions😥" };
      }
    },
    [amountOfQuestions, questionType, userPrompt, questions.length],
  );

  const handleSaveAndRedirectToQuiz = useCallback(
    async (questions: (FillAnswerTypes | MultiChoiceQuestionTypes)[]) => {
      console.log("Saving quiz with questions:", questions);
      const id = uuidv4(); // Generate a unique ID for the quiz
      if (!questions.length) return; // No questions to save
      console.log({ id, title });
      saveQuiz({ id, title, questionsToSave: questions });
      setQuestions([]);
      setRange({ from: 1, to: numOfPages }); // Reset range
      router.push(`/quiz/${id}`); // Redirect to the quiz page
      // setOpenQuestionMenu(false);
    },
    [pdfInfo.name, numOfPages, router, title],
  );

  const generateQuestions = useCallback(async () => {
    setIsGenerating(true);
    let response: (MultiChoiceQuestionTypes | FillAnswerTypes)[] = [];
    const pdfTexts = await getPDFTexts(pdfInfo.url, range); // Get texts from PDF
    const chunks = splitChunks(splitTexts(pdfTexts), amountOfQuestions); // Break chunks if needed
    let error = "";

    for (let index = 0; index < chunks.length; index++) {
      const text = chunks[index];
      console.log(`⏳ Sending chunk ${index + 1}/${chunks.length}`);

      const questions = await generateQuestionWithOpenAI(
        text as string,
        index,
        chunks,
        response,
      );
      if (!questions.error && questions.length) {
        // Skip if no questions generated
        response = response.length ? [...response, ...questions] : questions;
        setQuestions(response);
      }

      if (questions.error) error = "error";

      if (index < chunks.length - 1) {
        console.log("Sleeping for 5 seconds to avoid rate limits...");
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    if (error) {
      if (response.length) {
        setError("An Error occured while generating questions");
      } else {
        setError("Error generating questions");
      }
      return;
    }

    console.log(response);
    await handleSaveAndRedirectToQuiz(response);
    setIsGenerating(false);
    // return response;
  }, [
    amountOfQuestions,
    generateQuestionWithOpenAI,
    handleSaveAndRedirectToQuiz,
    pdfInfo.url,
    range,
  ]);

  const handleTryAgain = useCallback(async () => {
    setError("");
    await generateQuestions();
  }, [generateQuestions]);

  const handleContinue = useCallback(() => {
    setError("");
    setIsGenerating(false);
    handleSaveAndRedirectToQuiz(questions);
  }, [handleSaveAndRedirectToQuiz, questions]);

  const handleCancel = useCallback(() => {
    setError("");
    setIsGenerating(false);
    setQuestions([]);
  }, []);

  return (
    <PopUpWrapper>
      {!isGenerating ? (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            await generateQuestions();
          }}
          style={{
            scrollbarColor: "hsl(var(--border)) transparent",
          }}
          className="flex max-h-screen w-full max-w-[500px] flex-col gap-6 overflow-y-auto rounded-md border border-gray-border bg-background p-7 shadow-[0px_4px_3px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl">Generate Questions</h2>
              <h3 className="text-xs text-gray-500">
                Select the type of question
              </h3>
            </div>

            <XButton onClick={() => setOpenQuestionMenu(false)} />
          </div>
          {/* Name */}
          <div className="space-y-1 text-sm">
            <label htmlFor="name">Quiz Name</label>
            <Input
              onChange={(event) => setTitle(event.target.value)}
              id="name"
              placeholder="Enter quiz name"
              className="bg-border focus:outline-1 focus:outline-primary"
              value={title}
              required
            />
          </div>
          {/* Options */}
          <div className="flex flex-col gap-3">
            {[
              {
                type: "multiChoice",
                label: "Multi-Choice",
                description: "Generate multiple choice questions from the PDF.",
              },
              {
                type: "fillInAnswer",
                label: "Fill-In-Gap",
                description: "Generate fill-in-gap questions from the PDF.",
              },
              {
                type: "mixed",
                label: "Mixed",
                description:
                  "Generate Multi-Choice and fill-in-gap questions from the PDF.",
              },
            ].map((option, i) => (
              <div
                key={i}
                className={`cursor-pointer rounded-md border p-4 ${questionType === option.type ? "border-primary" : "border-gray-border"}`}
                onClick={() => setQuestionType(option.type)}
              >
                <h4 className="text-sm">{option.label}</h4>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            ))}
          </div>

          <OtherCustomInput
            amountOfData={amountOfQuestions}
            setAmountOfData={setAmountOfQuestions}
            numOfPages={numOfPages}
            range={range}
            setRange={setRange}
            setUserPrompt={setUserPrompt}
            userPrompt={userPrompt}
            type="question"
          />
          {/* Geneerate Button */}
          <Button type="submit" className="flex items-center">
            Generate Questions <Stars />
          </Button>
          <div className="text-center text-[11px] text-gray-500">
            AI might make mistakes, so some answers in the generated questions
            could be incorrect. While the explanations might be accurate, it's
            always a good idea to verify the answers through additional
            research.
          </div>
        </form>
      ) : (
        <GeneratingCover
          dataLength={questions.length}
          amountOfData={amountOfQuestions}
          handleTryAgain={handleTryAgain}
          handleContinue={handleContinue}
          handleCancel={handleCancel}
          error={error}
          type="question"
        />
      )}
    </PopUpWrapper>
  );
};

export default GenerateQuestionMenu;
