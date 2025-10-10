import { configureStore } from "@reduxjs/toolkit";
import summaries from "./features/summariesSlice";
import quizzes from "./features/quizzesSlice";
import flashcards from "./features/flashcardsSlice";
import { loadState, PersistState, scheduleSave } from "./persist";

const preloaded = typeof window !== "undefined" ? loadState() : undefined;

export const store = configureStore({
    reducer: { summaries, flashcards, quizzes },
    preloadedState: preloaded as PersistState,
});

//The last saved state, to avoid saving too often
let last = "";
// Subscribe to store changes and save to localStorage
store.subscribe(() => {
    const s = store.getState();
    const toPersist = {
        summaries: s.summaries,
        flashcards: s.flashcards,
        quizzes: s.quizzes,
    };
    const json = JSON.stringify(toPersist);

    if (json !== last) {
        last = json;
        if (typeof window !== "undefined") scheduleSave(toPersist);
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
