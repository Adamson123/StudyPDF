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

interface SummaryTypes {
  title: string;
  content: string;
  isCompleted: boolean;
  id: string;
}
interface PdfDataTypes {
  name: string;
  url: string;
  pdfDocument: PDFDocumentProxy;
  numOfPages: number;
}

interface DataToDeleteTypes {
  id: string;
  type: "flashcard" | "quiz" | "";
}
