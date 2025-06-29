export const getSummaryPrompt = (text: string, recentSummarySlice: string) => {
  const prompt = `
You are helping a student prepare for a major exam using markdown-style notes.

You must extract **EVERY possible exam-relevant point** from the provided academic content. This includes **ALL definitions, facts, terms, types, principles, historical events, formulas, operations, classifications, laws, and examples**.

---

## For each topic or sub-topic in the text:

### 🧩 1. Start with:
- **## Topic Title**
- Write a **very brief 2–4 line summary** describing the concept in simple terms.

---

### 🔑 2. Key Points (Put directly under each topic):
Include **as many bullet points as possible** for:
- Definitions (e.g., “X is…”, “X refers to…”)
- Declarations (e.g., “Y is classified as…”)
- Lists and categories (e.g., “Types of X”, “Forms of Y”)
- Year or date-based facts (e.g., “In 1969, …”)
- Laws, rules, and principles (e.g., “According to Moore’s Law…”)
- Features, properties, and characteristics
- Comparisons (e.g., “X is faster than Y…”)
- Input/output, cause/effect, advantages/disadvantages
- Processes, steps, stages (e.g., “Step 1: …”)
- People or organizations associated with inventions or events
- Acronym meanings
- *Bold* or _italicize_ the most important **terms, keywords, and numbers**

---

### ❓ 3. Exam Q&A Style:
Convert everything into **as many questions and answers as possible**:

- **Q:** What is [term]?  
  **A:** [Definition]

- **Q:** List the types of X.  
  **A:** Type A, Type B, Type C

- **Q:** When was [event] created?  
  **A:** [Date]

- **Q:** What does [acronym] stand for?

Use simple English for the questions. Cover everything, don’t miss a point.

---

### ⚙️ 4. Formulas To Know (if present)
If there are any mathematical expressions, equations, or rules:
- Add this section called **Formulas To Know**
- List each formula and briefly explain the variables.

---

### 📌 5. You Should Be Able To:
List **every type of question** the student should be able to answer:
- Define terms
- Identify differences
- List types, advantages, steps, components
- Recall dates, people, formulas, outcomes
- Explain short processes
- Solve numerical questions if the subject is technical or scientific

---

✅ Markdown formatting must be clean  
✅ Use simple, clear, beginner-friendly English  
✅ No fill-in-the-blank questions  
✅ No commentary or fluff – JUST hardcore, testable content  
✅ Each topic must be FULLY extracted, NO skipping small points  
✅ EVERYTHING stays inside its topic – don't mix or drop points  
✅ Think like a WAEC/JAMB examiner 💣

---

### 📚 Recent Summary (to continue from):
\`\`\`markdown
${recentSummarySlice}
\`\`\`

---

### 🧾 New Text to Summarize:
\`\`\`
${text}
\`\`\`
  `;

  return prompt;
};
