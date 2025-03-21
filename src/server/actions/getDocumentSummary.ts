"use server";
import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

const getDocumentSummary = async (docBuffer: ArrayBuffer) => {
  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(docBuffer).toString("base64"),
          mimeType: "application/pdf",
        },
      },
      `Summarize this document while ensuring the following:
    
    1. **Context Preservation**: The summary must accurately represent key terms, ideas, and arguments exactly as they appear in the document.
    
    2. **Page-Specific Summaries**: Provide a **clear and structured summary for each page** in this format:
       
       **Page 1**
       // Summary here
       
       **Page 2**
       // Summary here
  
       (Continue this pattern for all pages.)
    
    3. **Deep Comprehension**: The summary should be detailed enough that if a user highlights any word, phrase, or sentence and requests an explanation, the AI can provide an accurate interpretation based strictly on the document’s content.
    
    4. **Attention to Images and Visual Elements**: If a page contains images, diagrams, graphs, or tables, describe them briefly, explaining their relevance to the text. If an image contains text, extract and summarize its key message.
    
    5. **Maintain Technical Accuracy**: Preserve the accuracy of specialized terminology, equations, or references without oversimplifying or misrepresenting their meaning.
    
    6. **Logical Flow**: Summaries should follow the structure of the original document to ensure coherence when users navigate through different sections.
  
    7. **Quote Key Phrases When Necessary**: If certain phrases, definitions, or statements are crucial, include them verbatim in the summary to ensure precise explanations.
  
    8. **Ensure Image Awareness**: If an image significantly contributes to understanding a section, describe its purpose and relation to the surrounding text.
  
    **The AI must ensure that any explanation given for a highlighted text or image aligns perfectly with the summary and the document's original context.**`,
    ]);

    return result.response.text();
  } catch (error) {
    console.error(error);
    return "";
  }
};

export default getDocumentSummary;
