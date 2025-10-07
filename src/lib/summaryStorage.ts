const SUMMARY_STORAGE_KEY = "AllSummaries";

type AllStoredSummaries = SummaryTypes[];

/**
 * Retrieves all summaries from localStorage.
 */
export const getAllSummariesFromStorage = (): AllStoredSummaries => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(SUMMARY_STORAGE_KEY);
    return data ? (JSON.parse(data) as AllStoredSummaries) : [];
};

/**
 * Saves all summaries to localStorage.
 */
const saveAllSummariesToStorage = (summaries: AllStoredSummaries): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summaries));
};

/**
 * Gets a specific summary by its ID from localStorage.
 */
export const getSummaryById = (id: string): SummaryTypes | undefined => {
    const allSummaries = getAllSummariesFromStorage();
    return allSummaries.find((s) => s.id === id);
};

/**
 * Saves (adds or updates) a specific summary to localStorage.
 */
export const saveSummary = ({
    id,
    title,
    content,
    isCompleted,
}: {
    id: string;
    title: string;
    content: string;
    isCompleted: boolean;
}): void => {
    let allSummaries = getAllSummariesFromStorage();
    const summaryIndex = allSummaries.findIndex((s) => s.id === id);

    const newSummaryData: SummaryTypes = { id, title, content, isCompleted };

    if (summaryIndex > -1) {
        allSummaries[summaryIndex] = newSummaryData;
    } else {
        allSummaries.push(newSummaryData);
    }
    saveAllSummariesToStorage(allSummaries);
};

/**
 * Saves multiple summaries sets to localStorage, replacing existing ones with the same IDs.
 */

export const saveMultipleSummaries = (summaries: AllStoredSummaries) => {
    //Filter out already existing one's
    const existingSummaries = getAllSummariesFromStorage();
    const newSummaries = summaries.filter(
        (s) => !existingSummaries.find((s2) => s2.id === s.id),
    );

    saveAllSummariesToStorage([...existingSummaries, ...newSummaries]);
};

/**
 * Deletes a specific summary by its ID from localStorage.
 */
export const deleteSummaryById = (id: string): void => {
    let allSummaries = getAllSummariesFromStorage();
    allSummaries = allSummaries.filter((s) => s.id !== id);
    saveAllSummariesToStorage(allSummaries);
};

/**
 * Clears all summary data from localStorage.
 */
export const clearAllSummaryData = (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SUMMARY_STORAGE_KEY);
};
