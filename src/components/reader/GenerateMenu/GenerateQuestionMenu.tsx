import { Button } from "@/components/ui/button";
import { Stars, X } from "lucide-react";
import { useContext, useState } from "react";
import { createPDFPage, getPDFDocument } from "../viewer/utils";
import { env } from "@/env";
import { MultiChoiceQuestionTypes } from "../quiz/MultiChoiceCard";
import { FillAnswerCardTypes } from "../quiz/FillAnswerCard";
import { prompts } from "@/data/static-data/prompts";
import Input from "@/components/ui/input";
import { ViewerContext } from "../viewer/Viewer";
import GeneratingCover from "./GeneratingCover";

const splitTexts = (pdfString: string[], chunkSize = 30000) => {
  //const paragraphs = (text.match(/[^]+?(?:\n\s*\n|$)/g) || []) as string[]; // split by paragraphs and handle null
  const chunks: string[] = [];
  let chunk = "";

  for (let para of pdfString) {
    if ((chunk + para).length > chunkSize) {
      chunks.push(chunk);
      chunk = "";
    }
    chunk += para + "\n";
  }
  if (chunk) chunks.push(chunk);
  return chunks;
};

const GenerateQuestionMenu = ({
  setOpenQuestionMenu,
  handleAiQuestionGeneration,

  numOfPages,
}: {
  setOpenQuestionMenu: React.Dispatch<React.SetStateAction<boolean>>;
  handleAiQuestionGeneration: (
    callback: () => Promise<
      (MultiChoiceQuestionTypes | FillAnswerCardTypes)[] | undefined
    >,
  ) => void;

  numOfPages: number;
}) => {
  const [questionType, setQuestionType] = useState<string>("multiChoice");
  const [amountOfQuestions, setAmountOfQuestions] = useState<number>(10);
  const [range, setRange] = useState({ from: 1, to: numOfPages });
  const pdfURL = useContext(ViewerContext).pdfURL;
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [questions, setQuestions] = useState<
    (MultiChoiceQuestionTypes | FillAnswerCardTypes)[]
  >([]);
  const [error, setError] = useState("");

  const getPDFTexts = async () => {
    //TODO: Remove another getPDFDocument
    //TODO:Change variable name render array

    const pdfDocument = await getPDFDocument(pdfURL);
    const renderArray: any[] = [];
    for (let index = range.from - 1; index < range.to; index++) {
      const renderer = async () => {
        const pdfPage = await createPDFPage(pdfDocument, index + 1);
        const text = await pdfPage.getTextContent();
        return text.items.map((item: any) => item.str).join("\n");
      };
      renderArray.push(renderer());
    }

    const pdfTexts = await Promise.all(renderArray);
    return pdfTexts;
  };

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

    const generatePrompt = `
    - fillInAnswer questions should only have one gap and answer
    - I will using JSON.parse in javascript to parse the output so make sure it is a valid JSON array of objects
    - When it come's to Maths or Physics or any calculation like subject or topic or texts, calculation question should take up 75% of the questions and the rest 30% should be normal questions.
    - You will Also Generate  questions on sentences like Declarative Sentence, Complex Sentence, Simple Sentence, Active Voice, or Passive Voice 
    - Strictly return only a JSON array of ${amountOfQuestionsEach} amount of questions don't return any other text like "Here are the questions" or "I have generated the following questions or \`\`\`json" or \`\`\` or \`\`\` `;
    const body = {
      messages: [
        { role: "user", content: prompt + generatePrompt },
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

      if (output === "error") return;

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

  const generateQuestions = async () => {
    setIsGenerating(true);
    let response: (MultiChoiceQuestionTypes | FillAnswerCardTypes)[] = [];
    const pdfTexts = await getPDFTexts();
    const chunks = splitTexts(pdfTexts);
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

    //  console.log(response);

    if (error) {
      if (response.length) {
        setError("An Error occured while generating questions");
      } else {
        setError("Error generating questions");
      }
      return;
    }

    setIsGenerating(false);
    return response;
  };

  const handleTryAgain = () => {
    setError("");
    handleAiQuestionGeneration(generateQuestions);
  };
  const handleContinue = () => {
    setError("");
    handleAiQuestionGeneration(async () => {
      return questions;
    });
  };
  const handleCancel = () => {
    setError("");
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-sm">
      {!isGenerating ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleAiQuestionGeneration(generateQuestions);
          }}
          className="flex flex-col gap-6 rounded-md border border-gray-border bg-background p-7 shadow-[0px_4px_3px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl">Generate Questions</h2>
              <h3 className="text-sm text-gray-500">
                Select the type of question
              </h3>
            </div>

            <button
              onClick={() => setOpenQuestionMenu(false)}
              className="rounded-full border border-gray-border p-2 hover:bg-gray-100/10"
            >
              <X className="h-4 w-4" />
            </button>
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

          {/* TODO We will adding the pages it should generate from and the amount of questions it should generate */}
          <div className="flex flex-col items-center gap-3">
            <label className="text-nowrap text-sm">Amount of question:</label>
            <Input
              onChange={(e) => setAmountOfQuestions(Number(e.target.value))}
              value={amountOfQuestions}
              type="number"
              min={10}
              max={60}
              className="focus:outline-1 focus:outline-primary"
            />
          </div>
          <div className="flex w-full flex-col items-center gap-3">
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
                className="focus:outline-1 focus:outline-primary"
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
                className="focus:outline-1 focus:outline-primary"
              />
            </div>
          </div>

          <Button type="submit" className="flex items-center">
            Generate Questions <Stars />
          </Button>
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
