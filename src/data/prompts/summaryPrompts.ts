export const getSummaryPrompt = (text: string, recentSummarySlice: string) => {
  const prompt = `
You are helping a student prepare for a major exam using clean, markdown-style notes.

You must extract **EVERY possible exam-relevant point** from the academic text. This includes **ALL**:
- Definitions
- Facts
- Terms
- Types & categories
- Classifications
- Historical events
- Formulas
- Laws, rules, and principles
- Procedures, operations, or steps
- Examples and comparisons

---

## For each topic or sub-topic:

### 🧩 1. Start with:
- **## Topic Title**
- A **2–4 line summary** describing the concept simply and clearly.

---

### 🔑 2. Key Points (under each topic):
Include **as many bullet points as possible** for:
- Definitions (e.g. “X is…”, “X refers to…”)
- Declarations (e.g. “Y is classified as…”)
- Categories (e.g. “Types of X”, “Forms of Y”)
- Year/date events (e.g. “In 1945, …”)
- Rules, laws, and principles (e.g. “According to Newton’s First Law…”)
- Features, comparisons, cause-effect
- Advantages/disadvantages
- Processes, stages, steps
- Acronyms and what they mean
- People or orgs associated with major inventions, events, or discoveries
- Real-world or descriptive sentences that illustrate or reinforce a definition

✅ *Bold* or _italicize_ the most important **terms, variables, and numbers**  
❌ DO NOT use double parentheses like \`(( x ))\` — they're invalid.  
❌ DO NOT format math like \`( r = ai + bj )\` — it will not render.  
✅ DO format **ALL math and variables using LaTeX in new lines** (see next section).

---

### ❓ 3. Exam Q&A Format:
For every fact or formula, convert into as many simple Q&A as possible:

- **Q:** What is [term]?  
  **A:** [Definition]

- **Q:** List the types of [X].  
  **A:** Type A, Type B, Type C

- **Q:** What does [acronym] stand for?  
  **A:** [Expanded acronym]

- **Q:** When was [event] created?  
  **A:** [Date]

✅ Use **simple, beginner English**.  
✅ Avoid overly technical phrasing.

---

### ⚙️ 4. Formulas To Know (if present):
- Add a **“Formulas To Know”** section.
- List **every math equation** in the text.

#### 🔣 Math Formatting Rules (STRICT NEW LINE MODE):
⚠️ **ALL math formulas must appear on a new line using block LaTeX only. No inline LaTeX. EVER.**

✅ Always use this format:

\`\`\`markdown
$$
a^2 + b^2 = c^2
$$
\`\`\`

✅ Examples:

- Subscripts:
\`\`\`markdown
$$
x_1,\ y_2,\ A_Y
$$
\`\`\`

- Fractions:
\`\`\`markdown
$$
\\frac{y_2 - y_1}{x_2 - x_1}
$$
\`\`\`

- Vectors:
\`\`\`markdown
$$
\\mathbf{v} = ai + bj
$$
\`\`\`

- Square roots and powers:
\`\`\`markdown
$$
|r| = \\sqrt{a^2 + b^2 + c^2}
$$
\`\`\`

❌ DO NOT use \`\x = 5 \\`  
❌ DO NOT use \`(x = 5)\`

✅ Correct Example:
\`\`\`markdown
$$
(x - h)^2 + (y - k)^2 = r^2
$$
$$
m = \\frac{y_2 - y_1}{x_2 - x_1}
$$
$$
\\mathbf{r} = ai + bj + ck
$$
$$
|PQ| = \\sqrt{5^2 + 2^2 + 4^2}
$$
\`\`\`

---

### 📌 5. You Should Be Able To:
End each topic with a checklist of things the student should be able to do:

- Define important terms
- Compare differences
- List types, steps, components
- Recall dates, people, formulas
- Explain short processes
- Solve math/numerical problems (if applicable)

---

✅ Markdown output must be clean and readable  
✅ Use simple, beginner-friendly English  
✅ NO fill-in-the-blanks, NO open-ended or opinion-based questions  
✅ DO NOT skip any small detail — extract all  
✅ Stay inside each topic’s scope — no jumping around  
✅ **ALL math MUST be rendered using block-style LaTeX only**  
✅ Think like an exam-setter: “How can I turn this into a test question?”

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
