import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SummariesState {
    items: SummaryTypes[];
}
const initialState: SummariesState = { items: [] };

const summariesSlice = createSlice({
    name: "summaries",
    initialState,
    reducers: {
        setAllSummaries(state, action: PayloadAction<SummaryTypes[]>) {
            state.items = action.payload;
        },
        addOneSummary(state, action: PayloadAction<SummaryTypes>) {
            const exists = state.items.find((s) => s.id === action.payload.id);
            if (exists) return;
            state.items.push(action.payload);
        },
        addMultipleSummaries(state, action: PayloadAction<SummaryTypes[]>) {
            const newSummaries = action.payload.filter(
                (s) => !state.items.find((s2) => s2.id === s.id),
            );
            state.items = [...state.items, ...newSummaries];
        },
        updateOneSummary(state, action: PayloadAction<SummaryTypes>) {
            state.items = state.items.map((s) =>
                s.id === action.payload.id ? action.payload : s,
            );
        },
        deleteOneSummary(state, action: PayloadAction<string>) {
            state.items = state.items.filter((s) => s.id !== action.payload);
        },
    },
});

export const {
    addMultipleSummaries,
    addOneSummary,
    deleteOneSummary,
    setAllSummaries,
    updateOneSummary,
} = summariesSlice.actions;

export default summariesSlice.reducer;
