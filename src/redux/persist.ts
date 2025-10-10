export type PersistState = {
    summaries: { items: SummaryTypes[] };
    flashcards: { items: StoredFlashcard[] };
    quizzes: { items: StoredQuiz[] };
};

const STORAGE_KEY = "studyState_v1";

export function loadState(): Partial<PersistState> | undefined {
    if (typeof window === "undefined") return;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);

        // Migrate legacy shape where summaries was an array
        if (Array.isArray(parsed?.summaries)) {
            return {
                summaries: { items: parsed.summaries as SummaryTypes[] },
                quizzes: {
                    items: parsed.quizzes as StoredQuiz[],
                },
                flashcards: { items: parsed.flashcards as StoredFlashcard[] },
            };
        }

        // Already in the new shape
        if (parsed?.summaries?.items) {
            return parsed as PersistState;
        }

        return;
    } catch {
        return;
    }
}

let saveTimeout: number | undefined;
export function scheduleSave(state: PersistState) {
    if (saveTimeout) window.clearTimeout(saveTimeout);
    saveTimeout = window.setTimeout(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            console.error("Failed to save state to localStorage");
        }
    }, 200);
}
