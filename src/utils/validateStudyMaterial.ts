type UnknownRecord = Record<string, unknown>;

export type ValidationIssue = {
    path: string;
    message: string;
};

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;

const addRequiredStringIssue = (
    value: unknown,
    path: string,
    issues: ValidationIssue[],
) => {
    if (!isNonEmptyString(value)) {
        issues.push({ path, message: "must be a non-empty string" });
    }
};

const addBooleanIssue = (
    value: unknown,
    path: string,
    issues: ValidationIssue[],
) => {
    if (typeof value !== "boolean") {
        issues.push({ path, message: "must be true or false" });
    }
};

const validateQuestionBase = (
    question: UnknownRecord,
    path: string,
    issues: ValidationIssue[],
) => {
    addRequiredStringIssue(question.question, `${path}.question`, issues);
    addRequiredStringIssue(
        question.explanation,
        `${path}.explanation`,
        issues,
    );
    addBooleanIssue(question.isCorrect, `${path}.isCorrect`, issues);
};

const validateMultipleChoiceQuestion = (
    question: UnknownRecord,
    path: string,
    issues: ValidationIssue[],
) => {
    validateQuestionBase(question, path, issues);

    if (!Array.isArray(question.options) || question.options.length !== 4) {
        issues.push({
            path: `${path}.options`,
            message: "must contain exactly four options",
        });
    } else {
        question.options.forEach((option, index) =>
            addRequiredStringIssue(
                option,
                `${path}.options[${index}]`,
                issues,
            ),
        );
    }

    if (
        typeof question.answer !== "string" ||
        !["A", "B", "C", "D"].includes(question.answer)
    ) {
        issues.push({
            path: `${path}.answer`,
            message: 'must be one of "A", "B", "C", or "D"',
        });
    }

    if (typeof question.choosenAnswer !== "string") {
        issues.push({
            path: `${path}.choosenAnswer`,
            message: "must be a string",
        });
    }
};

const validateFillAnswerQuestion = (
    question: UnknownRecord,
    path: string,
    issues: ValidationIssue[],
) => {
    validateQuestionBase(question, path, issues);

    if (!Array.isArray(question.answer) || question.answer.length === 0) {
        issues.push({
            path: `${path}.answer`,
            message: "must contain at least one answer",
        });
    } else {
        question.answer.forEach((answer, index) =>
            addRequiredStringIssue(answer, `${path}.answer[${index}]`, issues),
        );
    }

    if (!Array.isArray(question.choosenAnswer)) {
        issues.push({
            path: `${path}.choosenAnswer`,
            message: "must be an array",
        });
    } else {
        question.choosenAnswer.forEach((answer, index) => {
            if (typeof answer !== "string") {
                issues.push({
                    path: `${path}.choosenAnswer[${index}]`,
                    message: "must be a string",
                });
            }
        });
    }
};

const validateDefinitionQuestion = (
    question: UnknownRecord,
    path: string,
    issues: ValidationIssue[],
) => {
    validateQuestionBase(question, path, issues);
    addRequiredStringIssue(question.answer, `${path}.answer`, issues);

    if (!Array.isArray(question.keywords) || question.keywords.length === 0) {
        issues.push({
            path: `${path}.keywords`,
            message: "must contain at least one expected key point",
        });
    } else {
        question.keywords.forEach((keyword, index) =>
            addRequiredStringIssue(
                keyword,
                `${path}.keywords[${index}]`,
                issues,
            ),
        );
    }

    if (typeof question.choosenAnswer !== "string") {
        issues.push({
            path: `${path}.choosenAnswer`,
            message: "must be a string",
        });
    }

    if (typeof question.matchedKeywords !== "undefined") {
        if (!Array.isArray(question.matchedKeywords)) {
            issues.push({
                path: `${path}.matchedKeywords`,
                message: "must be an array when provided",
            });
        } else {
            question.matchedKeywords.forEach((keyword, index) =>
                addRequiredStringIssue(
                    keyword,
                    `${path}.matchedKeywords[${index}]`,
                    issues,
                ),
            );
        }
    }
};

const validateQuizQuestion = (
    question: unknown,
    path: string,
    issues: ValidationIssue[],
) => {
    if (!isRecord(question)) {
        issues.push({ path, message: "must be an object" });
        return;
    }

    switch (question.type) {
        case "multiChoice":
            validateMultipleChoiceQuestion(question, path, issues);
            return;
        case "fillAnswer":
        case "fillInAnswer":
            validateFillAnswerQuestion(question, path, issues);
            return;
        case "definition":
            validateDefinitionQuestion(question, path, issues);
            return;
        default:
            issues.push({
                path: `${path}.type`,
                message:
                    'must be "multiChoice", "fillAnswer", "fillInAnswer", or "definition"',
            });
    }
};

const validateIds = (items: UnknownRecord[], issues: ValidationIssue[]) => {
    const seenIds = new Set<string>();

    items.forEach((item, index) => {
        const path = `[${index}].id`;
        if (!isNonEmptyString(item.id)) {
            issues.push({ path, message: "must be a non-empty string" });
            return;
        }

        if (seenIds.has(item.id)) {
            issues.push({ path, message: `duplicates ID "${item.id}"` });
            return;
        }

        seenIds.add(item.id);
    });
};

const validateQuizzes = (items: UnknownRecord[], issues: ValidationIssue[]) => {
    items.forEach((item, index) => {
        const path = `[${index}]`;
        addRequiredStringIssue(item.title, `${path}.title`, issues);

        if (!Array.isArray(item.questions) || item.questions.length === 0) {
            issues.push({
                path: `${path}.questions`,
                message: "must contain at least one question",
            });
            return;
        }

        item.questions.forEach((question, questionIndex) =>
            validateQuizQuestion(
                question,
                `${path}.questions[${questionIndex}]`,
                issues,
            ),
        );
    });
};

const validateFlashcards = (
    items: UnknownRecord[],
    issues: ValidationIssue[],
) => {
    items.forEach((item, index) => {
        const path = `[${index}]`;
        addRequiredStringIssue(item.title, `${path}.title`, issues);

        if (!Array.isArray(item.cards) || item.cards.length === 0) {
            issues.push({
                path: `${path}.cards`,
                message: "must contain at least one flashcard",
            });
            return;
        }

        item.cards.forEach((card, cardIndex) => {
            const cardPath = `${path}.cards[${cardIndex}]`;
            if (!isRecord(card)) {
                issues.push({ path: cardPath, message: "must be an object" });
                return;
            }

            addRequiredStringIssue(card.front, `${cardPath}.front`, issues);
            addRequiredStringIssue(card.back, `${cardPath}.back`, issues);
            addRequiredStringIssue(card.level, `${cardPath}.level`, issues);
        });
    });
};

const validateSummaries = (
    items: UnknownRecord[],
    issues: ValidationIssue[],
) => {
    items.forEach((item, index) => {
        const path = `[${index}]`;
        addRequiredStringIssue(item.title, `${path}.title`, issues);
        addRequiredStringIssue(item.content, `${path}.content`, issues);
        addBooleanIssue(item.isCompleted, `${path}.isCompleted`, issues);
    });
};

export const getStudyMaterialValidationIssues = (
    items: unknown,
    type: string,
): ValidationIssue[] => {
    if (!Array.isArray(items)) {
        return [{ path: "$", message: "must be a JSON array" }];
    }

    if (items.length === 0) {
        return [{ path: "$", message: "must not be empty" }];
    }

    const issues: ValidationIssue[] = [];
    const records: UnknownRecord[] = [];

    items.forEach((item, index) => {
        if (!isRecord(item)) {
            issues.push({ path: `[${index}]`, message: "must be an object" });
            return;
        }

        records.push(item);
    });

    if (issues.length > 0) return issues;

    validateIds(records, issues);

    switch (type) {
        case "Quizzes":
            validateQuizzes(records, issues);
            break;
        case "Flashcards":
            validateFlashcards(records, issues);
            break;
        case "Summaries":
            validateSummaries(records, issues);
            break;
        default:
            issues.push({ path: "$", message: `unsupported import type "${type}"` });
    }

    return issues;
};

const validateStudyMaterial = (items: unknown, type: string) =>
    getStudyMaterialValidationIssues(items, type).length === 0;

export default validateStudyMaterial;
