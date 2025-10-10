import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface QuizzesState {
    items: StoredQuiz[];
}
const initialState: QuizzesState = { items: [] };

const quizzesSlice = createSlice({
    name: "quizzes",
    initialState,
    reducers: {
        setAllQuizzes(state, action: PayloadAction<StoredQuiz[]>) {
            state.items = action.payload;
        },
        addMultipleSetsOfQuizzes(state, action: PayloadAction<StoredQuiz[]>) {
            const newOnes = action.payload.filter(
                (q) => !state.items.find((x) => x.id === q.id),
            );
            state.items = [...state.items, ...newOnes];
        },
        addOneSetOfQuizzes(state, action: PayloadAction<StoredQuiz>) {
            const exists = state.items.find((q) => q.id === action.payload.id);
            if (exists) return;
            state.items.unshift(action.payload);
        },
        updateOneSetOfQuizzes(state, action: PayloadAction<StoredQuiz>) {
            state.items = state.items.map((q) =>
                q.id === action.payload.id ? action.payload : q,
            );
        },
        deleteOneSetOfQuizzes(state, action: PayloadAction<string>) {
            state.items = state.items.filter((q) => q.id !== action.payload);
        },
    },
});

export const {
    setAllQuizzes,
    addMultipleSetsOfQuizzes,
    addOneSetOfQuizzes,
    updateOneSetOfQuizzes,
    deleteOneSetOfQuizzes,
} = quizzesSlice.actions;

export default quizzesSlice.reducer;
