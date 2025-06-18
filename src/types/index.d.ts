interface MultiChoiceQuestionTypes {
  question: string;
  options: string[];
  answer: string;
  choosenAnswer: string;
  explanation: string;
  type: string;
  isCorrect: boolean;
  justification_prompt?: string;
}

interface FillAnswerTypes {
  question: string;
  answer: string[];
  choosenAnswer: string[];
  explanation: string;
  type: string;
  isCorrect: false;
  justification_prompt?: string;
}
interface FlashcardTypes {
  front: string;
  back: string;
  level: string;
}
interface PdfInfoTypes {
  name: string;
  url: string;
}
interface DataToDeleteTypes {
  id: string;
  type: "flashcard" | "quiz" | "";
}
