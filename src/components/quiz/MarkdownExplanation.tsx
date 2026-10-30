import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

const MarkdownExplanation = ({ content }: { content: string }) => {
    const markdown = content
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n");

    return (
        <div className="markdown text-sm font-semibold text-gray-500">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownExplanation;
