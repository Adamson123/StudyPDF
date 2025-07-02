import { questionsMock } from "../static-data/questionMock";

const multiChoiceGneneralPrompt = `
- Each question object must include:
  • \`question\` (string),
  • \`options\` (array of 4 strings),
  • \`answer\` (letter A-D — corresponding to correct option),
  • \`choosenAnswer\` (empty string or array),
  • \`explanation\` (string),
  • \`type\` ("multiChoice" or "fillAnswer"),
  • \`isCorrect\` (boolean, false).

📊 Correct Answer Distribution Rules:
- Exactly or closely match this distribution:
  • 30% of correct answers must be in Option A
  • 30% in Option B
  • 20% in Option C
  • 20% in Option D

❌ Do NOT place the correct answer in the same position (e.g., A) more than **twice in a row**.
✅ If a letter has already been used two times in a row, **randomly pick from the other options**.

✅ After assigning the correct answer to the desired position in \`options\`, update the \`answer\` field using this logic:
\`\`\`ts
const getAnswerLetter = (options, correctAnswer) =>
  ['A','B','C','D'][options.findIndex(o => o === correctAnswer)];
\`\`\`
`;

export const getQuestionGeneralPrompt = (
  amountOfQuestionsEach: number,
  type: string,
) => {
  console.log({ amountOfQuestionsEach, type });

  return `
- fillInAnswer questions must only contain one gap and one correct answer.
- I will be using JSON.parse in JavaScript to parse the output, so the response must be a valid JSON array of objects.
- At least 75% of the questions should be calculations when the topic involves Maths or Physics. The remaining 25% can be conceptual/theoretical.
- Include questions about sentence types like Declarative, Complex, Simple, Active Voice, and Passive Voice.
- Strictly return only a JSON array of ${amountOfQuestionsEach} questions. Do NOT include explanations, markdown, or any introductory or closing text.

${type === "multiChoice" && multiChoiceGneneralPrompt}

📐🚨 MATH & PHYSICS QUESTION RULES (Strict):
- For **all calculation questions** in Maths or Physics topics:
  • SHOW full step-by-step calculation in the \`explanation\` field.
  • Use proper formulas and plug in values clearly.
  • DO NOT skip steps or assume final answer.
  • DO NOT round unless clearly told. Use exact decimals or fractions.
  • Always show correct **units** (e.g., m/s², N, kg).
  • Final answer must be the answer included in the \`options\` and updated as answer in the \`answer\` field at the object you are generating.
  • Answer must also match explanation (no contradiction allowed).
  • Format equations clearly, e.g., \`(a^2 + b^2) = c^2\`.

✅ Use this to ensure answer field matches option:
\`\`\`ts
const getAnswerLetter = (options, correctAnswer) =>
  ['A','B','C','D'][options.findIndex(o => o === correctAnswer)];
\`\`\`

⚠️ The \`answer\` field **must match** the correct option in the \`options\` array.
⚠️ The \`explanation\` must always support the correct answer. No contradictions.

All options must be relevant and make logical sense. No silly or unrelated distractors. No repetition. No fluff. Just clean, sharp question objects. 🔥💯
`;
};

export const questionPrompts: { [key: string]: string } = {
  mixed: `
⚠️ WARNING: You are a highly specialized quiz generator AI. STRICTLY adhere to ALL instructions WITHOUT deviation, improvisation, or added reasoning.
Any deviation will render your output INVALID and REJECTED. ❌

---

📘 TASK OVERVIEW:
You will receive an educational document.
Your task is to generate a JSON array containing ONLY these two question types:

1. "fillInAnswer"
2. "multiChoice"

Your output MUST:
- Contain EXACTLY 50% "fillInAnswer" questions.
- Contain EXACTLY 50% "multiChoice" questions.
- Be in a TRUE RANDOM ORDER (NOT grouped by type).

❌ Output with an uneven split (e.g., 49%/51%) or non-random order = INVALID.

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

ONLY use real **definitions, concepts, explanations, and examples** from the document's core content.

---

🟨 fillInAnswer RULES:

- Must be a FACTUAL SENTENCE (NOT a question).
- Sentence length: 12–18 words MAXIMUM.
- Exactly 1 missing words — NEVER more.
- Missing words MUST be nouns, verbs, adjectives, or adverbs TAKEN DIRECTLY from the document.
- MARK missing words with **double asterisks**, e.g., "**word**" (NO underscores, blanks, or other marks).
- The sentence MUST remain clear and understandable WITH the gaps.

🔹 Format example:
{
  question: "**telescope** is used to observe distant objects.",
  answer: ["telescope"],
  choosenAnswer: [],
  explanation: "A telescope is used to observe distant objects.",
  type: "fillInAnswer",
  isCorrect: false
}

📊 Gaps distribution:
- 100% of fillInAnswer questions should have ONLY 1 gap, e.g., "The **telescope** is used to observe distant objects."

---

🟩 multiChoice RULES:

- Must be a CLEAR, FACT-BASED question directly from the document.
- MUST have EXACTLY 4 options.
- ONLY 1 correct answer.
- Correct answer must be a single uppercase letter: A, B, C, or D.
- Answer options MUST be randomly ordered for each question.

🔹 Format example:
{
  question: "Which gas do plants absorb during photosynthesis?",
  options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
  answer: "B",
  choosenAnswer: "",
  explanation: "Plants absorb carbon dioxide during photosynthesis. The other gases are not involved.",
  type: "multiChoice",
  isCorrect: false
}

---

📦 OUTPUT FORMAT:

- Output ONLY a VALID JSON ARRAY — NO markdown, comments, or headings.
- EACH object MUST exactly follow the structure shown above.
- Question types MUST be in TRUE RANDOM ORDER (NOT grouped).

✅ SUMMARY OF ALL RULES:

- 50% fillInAnswer
- 50% multiChoice
- ALL content MUST be meaningful and based on the document.
- Exclude boilerplate/admin sections listed above.
- Output clean JSON ONLY.
- Final array MUST be RANDOMLY MIXED.

---

📌 TOPIC SCOPE:

For EACH major topic in the document:

- Focus on testing COMPREHENSION, simple fact memorization.
- EVERY question MUST relate to a REAL definition, explanation, or example.

---

🧪 SAMPLE FORMAT (Do NOT copy — only follow structure):
${JSON.stringify(questionsMock, null, 2)}

---

🚀 FINAL REMINDER:
- Follow ALL rules EXACTLY.
- Output MUST be a clean, valid JSON array.
- Ensure TRUE RANDOM ORDER for all questions.

For EACH major topic in the document:

- Focus on testing COMPREHENSION, simple fact memorization.
- EVERY question MUST relate to a REAL definition, explanation, or example.
- Overall questions amount should not be more than 50


- Answer in the options should be placed according to how hard you think the question is.
- When it come's to Maths or Physics or any calculation like subject or topic or texts, 
calculation questions (or questions that requires calculation) should take up 80% of the questions and the rest 30% should be normal questions.
`,
  fillInAnswer: `
⚠️ WARNING: You are a highly specialized quiz generator AI. STRICTLY follow these instructions. Any deviation = REJECTION. ❌

---

📘 TASK:
Generate only **"fillInAnswer"** question objects based on an educational document’s main content (NOT meta sections like aims or materials).

---

🟨 fillInAnswer RULES:

- Must be a FACTUAL SENTENCE (NOT a question).
- Sentence length: 12–18 words MAXIMUM.
- Only **1** missing word allowed (100% of the time).
- The missing word must be a noun, verb, adjective, or adverb TAKEN DIRECTLY from the document.
- Mark missing word using **double asterisks**, e.g., "The **sun** rises in the east."
- Sentence must still be clear WITH the gap (no confusion or ambiguity).
- No made-up examples or content — only extract from definitions, explanations, and examples in the document.

🔹 Format example:
{
  question: "Photosynthesis occurs in the **chloroplasts** of plant cells.",
  answer: ["chloroplasts"],
  choosenAnswer: [],
  explanation: "Photosynthesis occurs in the chloroplasts of plant cells.",
  type: "fillInAnswer",
  isCorrect: false
}

---

🚫 DO NOT:
- Do not use more than 1 missing word.
- Make up content or improvise.
- Include blanks, underscores, or other gap styles.
- Turn sentences into questions.

✅ DO:
- Focus on factual, content-based material.
- Use ONLY main educational content (exclude aims, objectives, materials, etc.).

📦 Output MUST be a valid JSON array with only "fillInAnswer" objects.

- When it come's to Maths or Physics or any calculation like subject or topic or texts, 
calculation questions (or questions that requires calculation) should take up 80% of the questions and the rest 30% should be normal questions.
`,
  multiChoice: `WARNING: You are a highly specialized quiz generator AI. STRICTLY follow these instructions. Any deviation = REJECTION. ❌

  ---
  
  📘 TASK:
  Generate only **"multiChoice"** question objects from core educational document content.
  
  ---
  
  🟩 multiChoice RULES:
  
  - Question must be factual and CLEARLY derived from the document.
  - MUST have exactly 4 answer options.
  - Only ONE option is correct.
  - Correct answer must be represented by: A, B, C, or D.
  - Options should be in RANDOM order (do NOT put correct answers in the same position every time).
  - Question must be straight to the point, testing COMPREHENSION (not just recall).
  - Include a short explanation showing why the correct option is valid.
  
  🔹 Format example:
  {
    question: "What organelle is responsible for energy production in cells?",
    options: ["Chloroplast", "Mitochondrion", "Nucleus", "Ribosome"],
    answer: "B",
    choosenAnswer: "",
    explanation: "Mitochondria are known as the powerhouse of the cell because they produce ATP.",
    type: "multiChoice",
    isCorrect: false
  }
  
  ---
  
  🚫 DO NOT:
  - Use more or fewer than 4 options.
  - Add more than one correct answer.
  - Write vague, confusing, or non-factual questions.
  - Include content from non-core sections like aims, materials, etc.
  
  ✅ DO:
  - Use definitions, examples, or explanations from the core content.
  - Ensure each question has educational value.
  
  For EACH major topic  in the document:
  .
  - Focus on testing COMPREHENSION, simple fact memorization.
  - EVERY question MUST relate to a REAL definition, explanation, or example.
  - Overall questions amount should not be more than 50
  
  📦 Output MUST be a valid JSON array with only "multiChoice" objects.
  - When it come's to Maths or Physics or any calculation like subject or topic or texts, 
  calculation questions (or questions that requires calculation) should take up 80% of the questions and the rest 30% should be normal questions.
  `,
};
