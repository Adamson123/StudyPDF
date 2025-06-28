import "@/styles/markdown.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Button } from "../../ui/button";
import { Circle, RefreshCcw } from "lucide-react";
import useGenerateDataWithOpenAI from "@/hooks/useGenerateDataWithOpenAI";
import { getPDFTexts, splitTexts } from "@/utils/pdfTextUtils";
import { useContext, useState } from "react";
import { ViewerContext } from "../../reader/viewer/Viewer";
import { cn } from "@/lib/utils";
import { replace } from "node_modules/cypress/types/lodash";

const Summary = () => {
  const [summary, setSummary] = useState("");
  const { pdfInfo } = useContext(ViewerContext);
  const { generateDataWithOpenAI, isGenerating, setIsGenerating } =
    useGenerateDataWithOpenAI();

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

  const generateSummary = async () => {
    setSummary("")
    const pdfTexts = await getPDFTexts(pdfInfo.url);
    const splittedTexts = splitTexts(pdfTexts);

    for (let index = 0; index < splittedTexts.length; index++) {
      const text = splittedTexts[index] as string;
      const recentSummarySlice = summary.slice(-1000);
      const prompt = `
You are an expert at summarizing study materials into exam-ready, clean, structured README-style markdown.

**Your mission for each chunk:**

1. Detect each **topic or subtopic** and start with:
 ## Topic Title  
 (If the text lists “types,” make sure to include a sub-list and definitions for each type.)

2. **Summary:** Write a 3–5 sentence overview under that heading.

3. **Key Points (under the same heading):**
 - Extract as **many key‑point sentences** as possible.
 - A sentence counts as key if it:
   - Contains a **definition** (“X is…”, “refers to…”)
   - Mentions a **year or date**
   - States a **fact**, **property**, **cause/effect**, or **comparison**
   - Introduces a **term**, **principle**, or **concept**
 - In each key‑point sentence, **bold** the important keyword(s) only if there's one.

4. **Equations** (if present):
 - Add a sub-section **Equations:** and list them clearly (e.g. \`\( E = mc^2 )\`).

✅ Use **bullet-pointed**, **concise**, **visual** markdown.  
✅ Use **simple**, **beginner-friendly** English.  
✅ Place each Key Points section **directly under its topic heading**—no floating around.

---

### Context – recent snippet:
\`\`\`markdown
${recentSummarySlice}
\`\`\`

### New Text to Summarize:
\`\`\`
${text}
\`\`\`
`;
      const response = await generateDataWithOpenAI({
        text,
        prompt,
        expect: "stringResponse",
        arrayLength: splittedTexts.length,
        index,
      });

      if (response.error) {
        alert("Error");
        break;
      }

      setSummary(summary + response.replace("```markdown", ""));
    }

    setIsGenerating(false);
  };

  const generateBtnLabel = isGenerating
    ? "Generating Summary..."
    : "Re-generate Summary";
  return (
    <div className="flex flex-col gap-3 px-4 pb-5">
      <div className="self-center rounded-lg bg-primary/55 p-1">
        <Button onClick={generateSummary} className="p-5">
          {summary || isGenerating ? generateBtnLabel : "Generate Summary"}
          <RefreshCcw className={cn(isGenerating && "animate-spin")} />
        </Button>
      </div>
      <div className="markdown flex flex-col gap-2">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {summary || markdown}
        </ReactMarkdown>
      </div>
      {isGenerating && <RefreshCcw className="animate-spin self-center" />}
    </div>
  );
};

export default Summary;
