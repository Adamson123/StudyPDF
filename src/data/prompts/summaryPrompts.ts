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

✅ *Bold* or _italicize_ the most important **terms, variables, and numbers**  
❌ DO NOT use any LaTeX syntax like \`$$\`, \`\\frac{}\`, or \`a^2\`  
❌ DO NOT use Markdown code blocks to wrap math  
✅ ONLY use **real math symbols** like:  
π, √, ∑, ∫, ×, ÷, ≠, ≤, ≥, ∞, ≈, Δ, ∆, ∂, θ, α, β, etc.

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
- List **every math equation** in the text using only symbols, no LaTeX.

#### 🔣 Math Formatting Rules (REAL SYMBOLS ONLY):
✅ Use plain symbols like this:

- Area of circle: A = πr²  
- Slope: m = (y₂ − y₁) ÷ (x₂ − x₁)  
- Vector: **v** = ai + bj  
- Magnitude: |r| = √(a² + b² + c²)  
- Pythagoras: a² + b² = c²  
- Force: F = ma  
- Average: 𝑥̄ = (x₁ + x₂ + x₃) ÷ n

❌ DO NOT use:
- \`$$ ... $$\`  
- \`\\frac{}\`  
- \`\\sqrt{}\`  
- Markdown math blocks  
✅ ONLY use: symbols like \`√\`, \`²\`, \`₁\`, \`θ\`, \`÷\`, etc.

---

### 📌 5. You Should Be Able To:
End each topic with a list of questions the student should be able to answer:
- Define important terms
- Compare differences
- List types, steps, components
- Recall dates, people, formulas
- Explain short processes
- Solve math/numerical problems

---

✅ Markdown output must be well-formatted  
✅ Use simple, beginner-level English  
✅ NO fill-in-the-blank, NO open-ended or opinion questions  
✅ DO NOT skip small points — extract everything  
✅ Stay within each topic — no mixing or reordering  
✅ **ALL math MUST use real, readable symbols** (like π, ×, √, ≥)  
✅ NO LaTeX, NO dollar signs, NO math block code fences  
✅ Send math as natural symbols everyone can read 👌

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
