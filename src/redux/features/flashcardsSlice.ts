import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FlashcardsState {
    items: StoredFlashcard[];
}
const initialState: FlashcardsState = { items: [] };

const flashcardsSlice = createSlice({
    name: "flashcards",
    initialState,
    reducers: {
        setAllFlashcards(state, action: PayloadAction<StoredFlashcard[]>) {
            state.items = action.payload;
        },
        addOneSetOfFlashcards(state, action: PayloadAction<StoredFlashcard>) {
            const exists = state.items.find((f) => f.id === action.payload.id);
            if (exists) return;
            state.items.unshift(action.payload);
        },
        addOneCard(
            state,
            action: PayloadAction<{ id: string; card: FlashcardTypes }>,
        ) {
            const flashcards = state.items.find(
                (f) => f.id === action.payload.id,
            );
            if (flashcards) flashcards.cards.unshift(action.payload.card);
        },

        addMultipleSetsOfFlashcards(
            state,
            action: PayloadAction<StoredFlashcard[]>,
        ) {
            const newFlashcards = action.payload.filter(
                (f) => !state.items.find((f2) => f2.id === f.id),
            );
            state.items = [...newFlashcards, ...state.items];
        },
        updateOneSetOfFlashcards(
            state,
            action: PayloadAction<StoredFlashcard>,
        ) {
            state.items = state.items.map((s) =>
                s.id === action.payload.id ? action.payload : s,
            );
        },
        updateOneCard(
            state,
            action: PayloadAction<{
                id: string;
                cardIndex: number;
                card: FlashcardTypes;
            }>,
        ) {
            const flashcards = state.items.find(
                (f) => f.id === action.payload.id,
            );

            if (flashcards)
                flashcards.cards = flashcards.cards.map((f, i) =>
                    i === action.payload.cardIndex ? action.payload.card : f,
                );
        },
        deleteOneSetOfFlashcards(state, action: PayloadAction<string>) {
            state.items = state.items.filter((f) => f.id !== action.payload);
        },
        deleteOneCard(
            state,
            action: PayloadAction<{ id: string; cardIndex: number }>,
        ) {
            const flashcards = state.items.find(
                (f) => f.id === action.payload.id,
            );
            if (flashcards)
                flashcards.cards = flashcards.cards.filter(
                    (_, i) => i !== action.payload.cardIndex,
                );
        },
    },
});

export const {
    setAllFlashcards,
    addMultipleSetsOfFlashcards,
    addOneSetOfFlashcards,
    deleteOneSetOfFlashcards,
    updateOneSetOfFlashcards,
    addOneCard,
    updateOneCard,
    deleteOneCard,
} = flashcardsSlice.actions;

export default flashcardsSlice.reducer;
