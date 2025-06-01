interface MultiChoiceQuestionTypes {
  question: string;
  options: string[];
  answer: string;
  choosenAnswer: string;
  explanation: string;
  type: string;
  isCorrect: boolean;
}

interface FillAnswerTypes {
  question: string;
  answer: string[];
  choosenAnswer: string[];
  explanation: string;
  type: string;
  isCorrect: false;
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
