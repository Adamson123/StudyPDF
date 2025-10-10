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

type QuizTypes = MultiChoiceQuestionTypes | FillAnswerTypes;
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
    type: "flashcard" | "quiz" | "summary" | "";
}

type StoredQuiz = {
    id: string;
    title: string;
    questions: QuizTypes[];
    // Add any other metadata you store per quiz, e.g., title, lastPlayed
};

type StoredFlashcard = {
    id: string;
    title: string;
    cards: FlashcardTypes[]; // Replace with your flashcard types
    // Add any other metadata you store per flashcard set, e.g., description, lastReviewed
};

type AvailableAIOptions = "gemini" | "azure-openai";

type AIOption = {
    value: AvailableAIOptions;
    name: string;
    image: string;
};
