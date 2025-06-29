export const flashcardPrompt = `
Generate a JSON array of flashcards in the following structure:

{
  "front": "A clear question, keyword, or concept prompt.",
  "back": "A concise and informative explanation or answer.",
  "level": ""
}

Rules:
- The "level" field must be present but left as an **empty string** ("").
- Do NOT include any 'difficulty' field or any other extra fields.
- Output ONLY a valid JSON array — no intro text, no markdown, no notes.
- "front" should clearly ask a question or prompt a concept.
- "back" should provide a correct, brief explanation or answer.
- Do NOT repeat cards.
- Every card should be useful for flashcard-based studying.
- Only generate flashcards relevant to the provided topic or input.
- Make sure the JSON is valid for direct use with \`JSON.parse\`.
`;

export const getFlashcardGeneralPrompt = (amountOfQuestionsEach: number) => `  
- I will be using JSON.parse in JavaScript to parse the output, so the response must be a valid JSON array of objects.   
  
- Strictly return only a JSON array of ${amountOfQuestionsEach} flashcards. Do NOT include explanations, markdown, or any introductory or closing text.  
`;
//- Include type of sentences like Declarative, Complex, Simple, Active Voice, and Passive Voice.
