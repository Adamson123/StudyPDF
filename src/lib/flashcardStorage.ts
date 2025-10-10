// const LOCAL_STORAGE_KEY = "AllFlashcards"; // Or your existing key, e.g., "flashcards"

// type AllStoredFlashcards = StoredFlashcard[];

// /**
//  * Retrieves all flashcards from localStorage.
//  */
// export const getAllFlashcardsFromStorage = (): AllStoredFlashcards => {
//     if (typeof window === "undefined") return [];
//     const data = localStorage.getItem(LOCAL_STORAGE_KEY);
//     return data ? (JSON.parse(data) as AllStoredFlashcards) : [];
// };

// /**
//  * Saves all flashcards to localStorage.
//  */
// const saveAllFlashcardsToStorage = (flashcards: AllStoredFlashcards): void => {
//     if (typeof window === "undefined") return;
//     localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(flashcards));
// };

// /**
//  * Gets a specific flashcard set by its ID from localStorage.
//  */
// export const getFlashcardById = (id: string): StoredFlashcard | undefined => {
//     const allFlashcards = getAllFlashcardsFromStorage();
//     const flashcardSet = allFlashcards.find((f) => f.id === id);
//     return flashcardSet;
// };

// /**
//  * Saves (adds or updates) a specific flashcard set to localStorage.
//  */
// export const saveFlashcard = ({
//     id,
//     title,
//     cardsToSave,
// }: {
//     id: string;
//     title: string;
//     cardsToSave: FlashcardTypes[];
// }): void => {
//     let allFlashcards = getAllFlashcardsFromStorage();
//     const flashcardIndex = allFlashcards.findIndex((f) => f.id === id);

//     const newFlashcardData: StoredFlashcard = {
//         title,
//         id,
//         cards: cardsToSave,
//     };

//     if (flashcardIndex > -1) {
//         allFlashcards[flashcardIndex] = newFlashcardData;
//     } else {
//         allFlashcards.push(newFlashcardData);
//     }
//     saveAllFlashcardsToStorage(allFlashcards);
// };

// /**
//  * Saves multiple flashcards sets to localStorage, replacing existing ones with the same IDs.
//  */

// export const saveMultipleFlashcards = (flashcards: AllStoredFlashcards) => {
//     //Filter out already existing one's
//     const existingFlashcards = getAllFlashcardsFromStorage();
//     const newFlashcards = flashcards.filter(
//         (f) => !existingFlashcards.find((f2) => f2.id === f.id),
//     );

//     saveAllFlashcardsToStorage([...existingFlashcards, ...newFlashcards]);
// };

// /**
//  * Deletes a specific flashcard set by its ID from localStorage.
//  */
// export const deleteFlashcardById = (id: string): void => {
//     let allFlashcards = getAllFlashcardsFromStorage();
//     allFlashcards = allFlashcards.filter((f) => f.id !== id);
//     saveAllFlashcardsToStorage(allFlashcards);
// };

// /**
//  * Clears all flashcard data from localStorage.
//  */
// export const clearAllFlashcardData = (): void => {
//     if (typeof window === "undefined") return;
//     localStorage.removeItem(LOCAL_STORAGE_KEY);
// };
