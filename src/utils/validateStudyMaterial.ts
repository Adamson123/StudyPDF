type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;

const hasValidBaseQuestionFields = (question: UnknownRecord) =>
    isNonEmptyString(question.question) &&
    isNonEmptyString(question.explanation) &&
    typeof question.isCorrect === "boolean";

const isValidMultipleChoiceQuestion = (question: UnknownRecord) =>
    question.type === "multiChoice" &&
    hasValidBaseQuestionFields(question) &&
    Array.isArray(question.options) &&
    question.options.length === 4 &&
    question.options.every(isNonEmptyString) &&
    typeof question.answer === "string" &&
    ["A", "B", "C", "D"].includes(question.answer) &&
    typeof question.choosenAnswer === "string";

const isValidFillAnswerQuestion = (question: UnknownRecord) =>
    (question.type === "fillAnswer" || question.type === "fillInAnswer") &&
    hasValidBaseQuestionFields(question) &&
    Array.isArray(question.answer) &&
    question.answer.length > 0 &&
    question.answer.every(isNonEmptyString) &&
    Array.isArray(question.choosenAnswer) &&
    question.choosenAnswer.every(
        (answer) => typeof answer === "string",
    );

const isValidDefinitionQuestion = (question: UnknownRecord) =>
    question.type === "definition" &&
    hasValidBaseQuestionFields(question) &&
    isNonEmptyString(question.answer) &&
    Array.isArray(question.keywords) &&
    question.keywords.length > 0 &&
    question.keywords.every(isNonEmptyString) &&
    typeof question.choosenAnswer === "string" &&
    (typeof question.matchedKeywords === "undefined" ||
        (Array.isArray(question.matchedKeywords) &&
            question.matchedKeywords.every(isNonEmptyString)));

const isValidQuizQuestion = (question: unknown) => {
    if (!isRecord(question)) return false;

    return (
        isValidMultipleChoiceQuestion(question) ||
        isValidFillAnswerQuestion(question) ||
        isValidDefinitionQuestion(question)
    );
};

const hasUniqueIds = (items: UnknownRecord[]) => {
    const ids = items.map((item) => item.id);
    return ids.every(isNonEmptyString) && new Set(ids).size === ids.length;
};

const validateQuizzes = (items: UnknownRecord[]) =>
    hasUniqueIds(items) &&
    items.every(
        (item) =>
            isNonEmptyString(item.title) &&
            Array.isArray(item.questions) &&
            item.questions.length > 0 &&
            item.questions.every(isValidQuizQuestion),
    );

const validateFlashcards = (items: UnknownRecord[]) =>
    hasUniqueIds(items) &&
    items.every(
        (item) =>
            isNonEmptyString(item.title) &&
            Array.isArray(item.cards) &&
            item.cards.length > 0 &&
            item.cards.every(
                (card) =>
                    isRecord(card) &&
                    isNonEmptyString(card.front) &&
                    isNonEmptyString(card.back) &&
                    isNonEmptyString(card.level),
            ),
    );

const validateSummaries = (items: UnknownRecord[]) =>
    hasUniqueIds(items) &&
    items.every(
        (item) =>
            isNonEmptyString(item.title) &&
            isNonEmptyString(item.content) &&
            typeof item.isCompleted === "boolean",
    );

const validateStudyMaterial = (items: unknown, type: string) => {
    if (!Array.isArray(items) || items.length === 0) return false;
    if (!items.every(isRecord)) return false;

    switch (type) {
        case "Quizzes":
            return validateQuizzes(items);
        case "Flashcards":
            return validateFlashcards(items);
        case "Summaries":
            return validateSummaries(items);
        default:
            return false;
    }
};

export default validateStudyMaterial;
