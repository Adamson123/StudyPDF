import "@/styles/markdown.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const Summary = () => {
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
    <div className="markdown prose dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default Summary;
