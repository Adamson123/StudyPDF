import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SummaryCard = () => {
  const [expand, setExpand] = useState(false);

  const markdown = `

> **Note:** This space will be used for PDF summaries and key points in the future. 

### Welcome to StudyPDF 🚀

StudyPDF helps you learn smarter from your PDFs by generating quizzes, flashcards, and summaries using AI.

##### Features
- Fast PDF rendering ⚡
- Easy to use 🧠
- Beautiful interface 💅
- Generate quizzes and flashcards from your PDFs
- Persistent storage for your study materials

##### Future Roadmap
- PDF summarization and key points extraction for exam prep
- Chat with your PDF using AI
- Search for text within your PDF
- Draw boxes on a PDF to capture and extract specific parts
- Choose between Gemini, OpenAI, or your own custom AI API
- Use a database (not just local storage) for quizzes and flashcards
- Ongoing bug fixes and improvements

##### Team

| Name | Role        |
|------|-------------|
| Adam | Lead Dev    |
| You  | Contributor |

Stay tuned for more features!
`;
  return (
    <div>
      <h3 className="p-2 text-lg font-semibold">GST104 Pg 1-3 Summary</h3>
      <div
        className={cn(
          `markdown relative flex flex-col gap-2 overflow-hidden rounded-md bg-gray-900 p-4`,
          expand ? "max-h-max" : "max-h-64",
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {markdown}
        </ReactMarkdown>
        {!expand && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        )}
        <button
          onClick={() => setExpand(!expand)}
          className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-1 text-sm"
        >
          Expand <ChevronDown />
        </button>
      </div>
    </div>
  );
};

export default SummaryCard;
