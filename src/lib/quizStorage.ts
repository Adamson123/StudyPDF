const LOCAL_STORAGE_KEY = "AllQuizzes"; // Or your existing key, e.g., "questions"

type StoredQuiz = {
  id: string;
  title: string;
  questions: (MultiChoiceQuestionTypes | FillAnswerTypes)[];
  // Add any other metadata you store per quiz, e.g., title, lastPlayed
};

type AllStoredQuizzes = StoredQuiz[];

/**
 * Retrieves all quizzes from localStorage.
 */
const getAllQuizzesFromStorage = (): AllStoredQuizzes => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? (JSON.parse(data) as AllStoredQuizzes) : [];
};

/**
 * Saves all quizzes to localStorage.
 */
const saveAllQuizzesToStorage = (quizzes: AllStoredQuizzes): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quizzes));
};

/**
 * Gets a specific quiz by its ID from localStorage.
 */
export const getQuizById = (
  id: string,
): (MultiChoiceQuestionTypes | FillAnswerTypes)[] | undefined => {
  const allQuizzes = getAllQuizzesFromStorage();
  const quiz = allQuizzes.find((q) => q.id === id);
  return quiz?.questions;
};

/**
 * Saves (adds or updates) a specific quiz to localStorage.
 */
export const saveQuiz = (
  {
    id,
    title,
    questionsToSave,
  }: {
    id: string;
    title: string;
    questionsToSave: (MultiChoiceQuestionTypes | FillAnswerTypes)[];
  },
  // title?: string, // Optional: if you want to save other metadata
): void => {
  let allQuizzes = getAllQuizzesFromStorage();
  const quizIndex = allQuizzes.findIndex((q) => q.id === id);

  const newQuizData: StoredQuiz = {
    title,
    id,
    questions: questionsToSave,
    // title: title || `Quiz ${id}`, // Example title
  };

  if (quizIndex > -1) {
    allQuizzes[quizIndex] = newQuizData;
  } else {
    allQuizzes.push(newQuizData);
  }
  saveAllQuizzesToStorage(allQuizzes);
};

/**
 * Deletes a specific quiz by its ID from localStorage.
 */
export const deleteQuizById = (id: string): void => {
  let allQuizzes = getAllQuizzesFromStorage();
  allQuizzes = allQuizzes.filter((q) => q.id !== id);
  saveAllQuizzesToStorage(allQuizzes);
};

/**
 * Clears all quiz data from localStorage.
 */
export const clearAllQuizData = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};
