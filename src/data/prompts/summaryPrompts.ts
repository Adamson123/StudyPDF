export const getSummaryPrompt = (text: string, recentSummarySlice: string) => {
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

  return prompt;
};
