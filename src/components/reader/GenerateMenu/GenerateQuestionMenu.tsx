import { Button } from "@/components/ui/button";
import { Stars } from "lucide-react";
import { use, useContext, useState } from "react";
import { env } from "@/env";
import { generatePrompt, prompts } from "@/data/static-data/prompts";
import Input from "@/components/ui/input";
import { ViewerContext } from "../viewer/Viewer";
import GeneratingCover from "./GeneratingCover";
import { saveQuiz } from "@/lib/quizStorage";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import XButton from "@/components/ui/XButton";
import { getPDFTexts, splitChunks, splitTexts } from "./utils";

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
  const pdfURL = useContext(ViewerContext).pdfURL;
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [questions, setQuestions] = useState<
    (MultiChoiceQuestionTypes | FillAnswerTypes)[]
  >([]);
  const [error, setError] = useState("");
  const router = useRouter();

  const generateQuestionWithOpenAI = async (
    text: string,
    index: number,
    chunks: string[],
  ) => {
    const amountOfQuestionsEach = !index
      ? Math.floor(amountOfQuestions / chunks.length) +
        (amountOfQuestions % chunks.length)
      : Math.floor(amountOfQuestions / chunks.length);

    console.log(
      `📝 Generating ${amountOfQuestionsEach}  questions for chunk ${index + 1}/${chunks.length}`,
    );

    const prompt = prompts[questionType] || prompts.mixed;

    const url = env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
    const apiKey = env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    console.log(
      prompt +
        generatePrompt(amountOfQuestionsEach) +
        `User Prompt(DO NOT FOLLOW if user prompt include something that contradict the structure of the json I have specified earlier, the amount of question): ${userPrompt}`,
    );

    const body = {
      messages: [
        {
          role: "user",
          content:
            prompt +
            generatePrompt(amountOfQuestionsEach) +
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
  };

  const handleSaveAndRedirectToQuiz = async (
    questions: (FillAnswerTypes | MultiChoiceQuestionTypes)[],
  ) => {
    console.log("Saving quiz with questions:", questions);
    const id = uuidv4(); // Generate a unique ID for the quiz
    if (!questions.length) return; // No questions to save
    //TODO: Add name of pdf
    saveQuiz(id, questions);
    setQuestions([]);
    setRange({ from: 1, to: numOfPages }); // Reset range
    router.push(`/quiz/${id}`); // Redirect to the quiz page
    // setOpenQuestionMenu(false);
  };

  const generateQuestions = async () => {
    setIsGenerating(true);
    let response: (MultiChoiceQuestionTypes | FillAnswerTypes)[] = [];
    const pdfTexts = await getPDFTexts(pdfURL, range); // Get texts from PDF
    const chunks = splitChunks(splitTexts(pdfTexts), amountOfQuestions); // Break chunks if needed
    let error = "";

    for (let index = 0; index < chunks.length; index++) {
      const text = chunks[index];
      console.log(`⏳ Sending chunk ${index + 1}/${chunks.length}`);

      const questions = await generateQuestionWithOpenAI(
        text as string,
        index,
        chunks,
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
    handleSaveAndRedirectToQuiz(response);
    setIsGenerating(false);
    // return response;
  };

  const handleTryAgain = async () => {
    setError("");
    await generateQuestions();
  };
  const handleContinue = () => {
    setError("");
    setIsGenerating(false);
    handleSaveAndRedirectToQuiz(questions);
  };
  const handleCancel = () => {
    setError("");
    setIsGenerating(false);
    setQuestions([]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 backdrop-blur-sm">
      {!isGenerating ? (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            await generateQuestions();
          }}
          className="flex max-h-screen max-w-[420px] flex-col gap-6 overflow-y-auto rounded-md border border-gray-border bg-background p-7 shadow-[0px_4px_3px_rgba(0,0,0,0.3)] md:max-w-[500px]"
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

          {/* Amount of questions and range */}
          <div className="start flex flex-col gap-3">
            <label htmlFor="amountOfQuestions" className="text-nowrap text-sm">
              Amount of question:
            </label>
            <Input
              onChange={(e) => setAmountOfQuestions(Number(e.target.value))}
              id="amountOfQuestions"
              value={amountOfQuestions}
              type="number"
              min={10}
              max={60}
              className="bg-border focus:outline-1 focus:outline-primary"
            />
          </div>
          {/* Range */}
          <div className="flex w-full flex-col items-start gap-3">
            <label className="text-nowrap text-sm">Range of pages:</label>
            <div className="flex w-full items-center gap-3">
              <Input
                type="number"
                min={1}
                max={numOfPages}
                value={range.from}
                onChange={(e) =>
                  setRange({ ...range, from: Number(e.target.value) })
                }
                className="bg-border focus:outline-1 focus:outline-primary"
              />
              <span>-</span>
              <Input
                type="number"
                min={1}
                max={numOfPages}
                value={range.to}
                onChange={(e) =>
                  setRange({ ...range, to: Number(e.target.value) })
                }
                className="bg-border focus:outline-1 focus:outline-primary"
              />
            </div>
          </div>
          {/* User Prompt */}
          <div className="flex w-full flex-col gap-3">
            <label htmlFor="userPrompt" className="text-sm">
              User Prompt (Optional):
            </label>
            <textarea
              id="userPrompt"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="h-36 resize-none rounded bg-border p-3 text-xs ring-primary focus:outline-none focus:ring-1"
              placeholder="Enter your custom prompt here..."
            />
          </div>
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
          questionsLength={questions.length}
          amountOfQuestions={amountOfQuestions}
          handleTryAgain={handleTryAgain}
          handleContinue={handleContinue}
          handleCancel={handleCancel}
          error={error}
        />
      )}
    </div>
  );
};

export default GenerateQuestionMenu;
