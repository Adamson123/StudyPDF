import { questionsMock } from "./questionMock";

// export const getQuestionGeneralPrompt = (amountOfQuestionsEach: number) => `
// - fillInAnswer questions must only contain one gap and one correct answer.
// - I will be using JSON.parse in JavaScript to parse the output, so the response must be a valid JSON array of objects.
// - At least 75% of the questions should be calculations when the topic involves Maths or Physics. The remaining 25% can be conceptual/theoretical.
// - Include questions about sentence types like Declarative, Complex, Simple, Active Voice, and Passive Voice.
// - Strictly return only a JSON array of ${amountOfQuestionsEach} questions. Do NOT include explanations, markdown, or any introductory or closing text.
// - Each question object must include: question, options (array of 4 strings), answer (letter A-D), choosenAnswer (empty string or array), explanation, type (multiChoice or fillAnswer), and isCorrect (false).
// - For multiple-choice questions, use difficulty-based answer randomization:
//   • If the question is **Easy**, place the correct answer randomly in **Option A or B**.
//   • If the question is **Medium**, place it randomly in **Option B or C**.
//   • If the question is **Hard**, place it randomly in **Option C or D**.
// - Assign difficulty levels based on how complex or calculative the question is. You may optionally include a "difficulty" field to clarify.
// - Avoid repetition of correct answer positions throughout the question set. Spread answers across A, B, C, and D as much as possible.
// - All options should be relevant and logical distractors. No silly or unrelated choices.
// - Make sure you are asking questions that are relevant to the text provided only. The questions should be based strictly on the texts only.
// - ⚠️ After randomizing the position of the correct answer, make sure the \`answer\` field is updated to reflect the **correct letter (A-D)** based on its new position in the \`options\` array.
// - Use this exact function to determine the correct answer field:
//   const getAnswerLetter = (options, correctAnswer) => ['A','B','C','D'][options.findIndex(o => o === correctAnswer)];
// - Make sure the \`answer\` value relates with the \`explanation\` field value.

// `;

const multiChoiceGneneralPrompt = `
- Each question object must include:
  • \`question\` (string),
  • \`options\` (array of 4 strings),
  • \`answer\` (letter A-D — corresponding to correct option),
  • \`choosenAnswer\` (empty string or array),
  • \`explanation\` (string),
  • \`type\` ("multiChoice" or "fillAnswer"),
  • \`isCorrect\` (boolean, false).

🎯 **Crafting Plausible Distractors:**
- Distractor options should be plausible and tempting to students who have an incomplete understanding or common misconceptions about the topic.
- Avoid distractors that are obviously incorrect, irrelevant to the question's context, or humorous.
- Each distractor should ideally represent a specific common error or misunderstanding.
- All options (including the correct answer and distractors) should be grammatically consistent with the question stem and of similar length and complexity.

📊 Correct Answer Distribution Rules:
- Exactly or closely match this distribution:
  • 30% of correct answers must be in Option A
  • 30% in Option B
  • 20% in Option C
  • 20% in Option D

❌ Do NOT place the correct answer in the same position (e.g., A) more than **twice in a row**.
✅ If a letter has already been used two times in a row, **randomly pick from the other options**.
Strive for a good variety in correct answer positions throughout the entire set of questions, not just locally.

🔢 **Numerical Question Guidance**: For questions involving numerical data, calculations, or variables:
  - Ensure numbers and variables are realistic for the context.
  - Avoid values leading to trivial answers, overly complex calculations (unless specified by difficulty), or mathematical errors like division by zero.
  - Distractor options should also be plausible and not easily identifiable as incorrect due to numerical absurdity.

🧠 **Higher-Order Thinking**:
- Aim to create questions that assess not just recall, but also understanding, application, analysis, and evaluation.
- Encourage critical thinking by asking 'why,' 'how,' 'compare,' 'what if,' or 'predict,' where appropriate for the topic.
- Vary the cognitive skills tested, drawing from different levels of understanding (e.g., from simple recall to application and analysis).

🌍 **Scenario-Based & Application Questions:**
- Where appropriate, frame some questions within brief real-world or hypothetical scenarios to test application of knowledge.
- Scenarios must be concise, directly relevant to the concept, and avoid excessive complexity or cognitive load unrelated to the core question.
- Example: Instead of 'Define X', present a mini-case and ask how X applies, or what is the outcome based on X.
- The question must still clearly test a specific concept, with the scenario providing context.

🤔 **Optional Justification Prompt:**
- For some questions (e.g., 25-50% of them, or as you deem appropriate to enhance learning), include an optional string field named \`justification_prompt\`.
- This prompt should encourage the user to reflect on their choice. Examples:
    - 'Briefly explain why you chose this answer.'
    - 'Why is the correct answer the most appropriate, and what makes one of the distractors incorrect?'
    - For Fill-in-the-Blank: 'How does this term fit into the broader concept discussed in the sentence?'
- If no justification prompt is generated for a particular question, this field can be omitted or be an empty string.

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
- MARK missing words with ____ (four underscores), e.g., "A ____ is used".
- Focus on missing words that represent key concepts or important details from the text, rather than trivial or overly common words. The sentence should encapsulate a significant piece of information.
- The sentence MUST remain clear and understandable WITH the gaps.

🤔 **Optional Justification Prompt:**
- For some questions (e.g., 25-50% of them), include an optional string field named \`justification_prompt\`.
- This prompt should encourage the user to reflect on their choice. E.g., 'How does this term fit into the broader concept discussed in the sentence?'
- If omitted, the field can be left out or be an empty string.

🔹 Format example:
{
  question: "A ____ is used to observe distant objects.",
  answer: ["telescope"],
  choosenAnswer: [],
  explanation: "A telescope is used to observe distant objects.",
  type: "fillInAnswer",
  isCorrect: false,
  justification_prompt: "Explain the role of the missing word in this context."
}

📊 Gaps distribution:
- 100% of fillInAnswer questions should have ONLY 1 gap, e.g., "The ____ is used to observe distant objects."

---

🟩 multiChoice RULES:

- Must be a CLEAR, FACT-BASED question directly from the document.
- MUST have EXACTLY 4 options.
- ONLY 1 correct answer.
- Correct answer must be a single uppercase letter: A, B, C, or D.
- Answer options MUST be randomly ordered for each question.

🎯 **Crafting Plausible Distractors:**
- Distractor options should be plausible and tempting to students who have an incomplete understanding or common misconceptions about the topic.
- Avoid distractors that are obviously incorrect, irrelevant to the question's context, or humorous.
- Each distractor should ideally represent a specific common error or misunderstanding.
- All options (including the correct answer and distractors) should be grammatically consistent with the question stem and of similar length and complexity.

🔢 **Numerical Question Guidance**: For questions involving numerical data, calculations, or variables:
  - Ensure numbers and variables are realistic for the context.
  - Avoid values leading to trivial answers, overly complex calculations (unless specified by difficulty), or mathematical errors like division by zero.
  - Distractor options should also be plausible and not easily identifiable as incorrect due to numerical absurdity.

🧠 **Higher-Order Thinking**:
- Aim to create questions that assess not just recall, but also understanding, application, analysis, and evaluation.
- Encourage critical thinking by asking 'why,' 'how,' 'compare,' 'what if,' or 'predict,' where appropriate for the topic.
- Vary the cognitive skills tested, drawing from different levels of understanding (e.g., from simple recall to application and analysis).

🌍 **Scenario-Based & Application Questions:**
- Where appropriate, frame some questions within brief real-world or hypothetical scenarios to test application of knowledge.
- Scenarios must be concise, directly relevant to the concept, and avoid excessive complexity or cognitive load unrelated to the core question.
- Example: Instead of 'Define X', present a mini-case and ask how X applies, or what is the outcome based on X.
- The question must still clearly test a specific concept, with the scenario providing context.

🤔 **Optional Justification Prompt:**
- For some questions (e.g., 25-50% of them), include an optional string field named \`justification_prompt\`.
- This prompt should encourage the user to reflect on their choice. E.g., 'Why is this answer correct and another option incorrect?'
- If omitted, the field can be left out or be an empty string.

🔹 Format example:
{
  question: "Which gas do plants absorb during photosynthesis?",
  options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
  answer: "B",
  choosenAnswer: "",
  explanation: "Plants absorb carbon dioxide during photosynthesis. The other gases are not involved.",
  type: "multiChoice",
  isCorrect: false,
  justification_prompt: "Why do you think this is the best answer?"
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
- Mark missing word using ____ (four underscores), e.g., "The ____ rises in the east."
- Focus on missing words that represent key concepts or important details from the text, rather than trivial or overly common words. The sentence should encapsulate a significant piece of information.
- Sentence must still be clear WITH the gap (no confusion or ambiguity).
- No made-up examples or content — only extract from definitions, explanations, and examples in the document.

🤔 **Optional Justification Prompt:**
- For some questions (e.g., 25-50% of them), include an optional string field named \`justification_prompt\`.
- This prompt should encourage the user to reflect on their choice. E.g., 'How does this term fit into the broader concept discussed in the sentence?'
- If omitted, the field can be left out or be an empty string.

🔹 Format example:
{
  question: "Photosynthesis occurs in the ____ of plant cells.",
  answer: ["chloroplasts"],
  choosenAnswer: [],
  explanation: "Photosynthesis occurs in the chloroplasts of plant cells.",
  type: "fillInAnswer",
  isCorrect: false,
  justification_prompt: "Explain the role of the missing word in this context."
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

🎯 **Crafting Plausible Distractors:**
- Distractor options should be plausible and tempting to students who have an incomplete understanding or common misconceptions about the topic.
- Avoid distractors that are obviously incorrect, irrelevant to the question's context, or humorous.
- Each distractor should ideally represent a specific common error or misunderstanding.
- All options (including the correct answer and distractors) should be grammatically consistent with the question stem and of similar length and complexity.

🔢 **Numerical Question Guidance**: For questions involving numerical data, calculations, or variables:
  - Ensure numbers and variables are realistic for the context.
  - Avoid values leading to trivial answers, overly complex calculations (unless specified by difficulty), or mathematical errors like division by zero.
  - Distractor options should also be plausible and not easily identifiable as incorrect due to numerical absurdity.

🧠 **Higher-Order Thinking**:
- Aim to create questions that assess not just recall, but also understanding, application, analysis, and evaluation.
- Encourage critical thinking by asking 'why,' 'how,' 'compare,' 'what if,' or 'predict,' where appropriate for the topic.
- Vary the cognitive skills tested, drawing from different levels of understanding (e.g., from simple recall to application and analysis).

🌍 **Scenario-Based & Application Questions:**
- Where appropriate, frame some questions within brief real-world or hypothetical scenarios to test application of knowledge.
- Scenarios must be concise, directly relevant to the concept, and avoid excessive complexity or cognitive load unrelated to the core question.
- Example: Instead of 'Define X', present a mini-case and ask how X applies, or what is the outcome based on X.
- The question must still clearly test a specific concept, with the scenario providing context.

🤔 **Optional Justification Prompt:**
- For some questions (e.g., 25-50% of them), include an optional string field named \`justification_prompt\`.
- This prompt should encourage the user to reflect on their choice. E.g., 'Why is this answer correct and another option incorrect?'
- If omitted, the field can be left out or be an empty string.
  
  🔹 Format example:
  {
    question: "What organelle is responsible for energy production in cells?",
    options: ["Chloroplast", "Mitochondrion", "Nucleus", "Ribosome"],
    answer: "B",
    choosenAnswer: "",
    explanation: "Mitochondria are known as the powerhouse of the cell because they produce ATP.",
    type: "multiChoice",
    isCorrect: false,
    justification_prompt: "Why do you think this is the best answer?"
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
