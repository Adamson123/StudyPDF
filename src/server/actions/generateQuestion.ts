"use server";
import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

const questionsMock = [
  {
    question: "What is the capital of Nigeria?",
    options: ["Abuja", "Lagos", "Kwara", "Abia"],
    answer: "A",
    choosenAnswer: "",
    explanation:
      "Abuja is the capital of Nigeria. It was chosen as the capital in 1991 because of its central location, which makes it more accessible to people from all parts of the country.",
    type: "multiChoice",
  },

  {
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
    answer: "C",
    choosenAnswer: "",
    explanation:
      "Jupiter is the largest planet in our solar system. It is a gas giant and has a diameter of about 139,820 km.",
    type: "multiChoice",
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: [
      "William Shakespeare",
      "Charles Dickens",
      "Mark Twain",
      "Jane Austen",
    ],
    answer: "A",
    choosenAnswer: "",
    explanation:
      "'Romeo and Juliet' is a famous tragedy written by William Shakespeare, one of the greatest playwrights in history.",
    type: "multiChoice",
  },
  {
    question: "What is the chemical symbol for water?",
    options: ["H2O", "O2", "CO2", "NaCl"],
    answer: "A",
    choosenAnswer: "",
    explanation:
      "The chemical symbol for water is H2O, which represents two hydrogen atoms bonded to one oxygen atom.",
    type: "multiChoice",
  },
  {
    question: "Which continent is known as the 'Dark Continent'?",
    options: ["Africa", "Asia", "Europe", "South America"],
    answer: "A",
    choosenAnswer: "",
    explanation:
      "Africa was historically referred to as the 'Dark Continent' due to its unexplored and mysterious nature during the colonial era.",
    type: "multiChoice",
  },
  {
    question: "The **conical** flask is a laboratory equipment.",
    answer: ["conical"],
    choosenAnswer: [],
    explanation:
      "Conical flasks are used in laboratories for mixing and heating liquids.",
    type: "fillAnswer",
  },
];

const generateQuestion = async (docBuffer: ArrayBuffer) => {
  const prompt = `
  ⚠️ WARNING: You are a quiz generator AI. STRICTLY follow ALL instructions WITHOUT deviation or added reasoning.
  If you break EVEN ONE rule, your entire output is INVALID and rejected. ❌

  ---

  📘 TASK OVERVIEW:
  You will receive an educational document.
  Generate a JSON array containing ONLY these two question types:

  - "fillInAnswer"
  - "multiChoice"

  Your output MUST:
  - Contain EXACTLY 50% "fillInAnswer"
  - Contain EXACTLY 50% "multiChoice"
  - Be in TRUE RANDOM ORDER (NOT grouped by type)

  ❌ Output with 49%/51% split or non-random order = INVALID.

  ---

  🚫 STRICTLY EXCLUDE content from these document sections:
  - Course Aims
  - Course Objectives
  - Course Requirements
  - Course Materials
  - Study Units
  - Assessment File
  - Strategies for Studying the Course
  - Schedule
  - Summary

  ONLY use real **definitions, concepts, explanations, and examples** from core content.

  ---

  🟨 fillInAnswer RULES:

  - Must be a FACTUAL SENTENCE (NOT a question).
  - Sentence length: 15–18 words MAXIMUM.
  - Exactly 1 OR 2 missing words — NEVER more.
  - Missing words MUST be nouns, verbs, adjectives, or adverbs TAKEN DIRECTLY from the document.
  - MARK missing words with **double asterisks**, e.g., "**word**" (NO underscores, blanks, or other marks).
  - The sentence MUST remain clear and understandable WITH the gaps.

  🔹 Format example:
  {
    question: "A **telescope** is used to observe distant objects.",
    answer: ["telescope"],
    choosenAnswer: [],
    explanation: "A telescope is used to observe distant objects.",
    type: "fillInAnswer"
  }

  📊 Gaps distribution:
  - 100% of fillInAnswer questions should only be 1 gap e.g. "The **telescope** is used to observe distant objects."

  🟩 multiChoice RULES:

  - Must be a CLEAR, FACT-BASED question directly from the document.
  - MUST have EXACTLY 4 options.
  - ONLY 1 correct answer.
  - Correct answer must be a single uppercase letter: A, B, C, or D.

  🔹 Format example:
  {
    question: "Which gas do plants absorb during photosynthesis?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    answer: "B",
    choosenAnswer: "",
    explanation: "Plants absorb carbon dioxide during photosynthesis. The other gases are not involved.",
    type: "multiChoice"
  }

  ---

  📦 OUTPUT FORMAT:

  - Output ONLY a VALID JSON ARRAY — NO markdown, comments, or headings.
  - EACH object MUST exactly follow the structure shown above.
  - Question types MUST be in TRUE RANDOM ORDER (NOT grouped).

  ✅ SUMMARY OF ALL RULES:

  - 50% fillInAnswer
  - 50% multiChoice(which is the one that has 4 options)
  - ALL content MUST be meaningful and based on the document.
  - Exclude boilerplate/admin sections listed above.
  - Output clean JSON ONLY.
  - Final array MUST be RANDOMLY MIXED.

  ---

  📌 TOPIC SCOPE:

  For EACH major topic in the document:
  - Generate 6–8 questions.
  - Focus on testing COMPREHENSION, NOT simple fact memorization.
  - EVERY question MUST relate to a REAL definition, explanation, or example.

    🧪 Sample Format (Do not copy — only follow structure):
  ${JSON.stringify(questionsMock, null, 2)}

`;

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(docBuffer).toString("base64"),
          mimeType: "application/pdf",
        },
      },
      prompt,
    ]);

    console.log(
      result.response.text().replace("```json", "").replace("```", ""),
    );
    return JSON.parse(
      result.response.text().replace("```json", "").replace("```", ""),
    );
  } catch (error) {
    console.error(error);
    return "";
  }
};

export default generateQuestion;
