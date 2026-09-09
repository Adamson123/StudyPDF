import { describe, expect, it } from "vitest";
import validateStudyMaterial, {
    getStudyMaterialValidationIssues,
} from "@/utils/validateStudyMaterial";

const validMultipleChoiceQuestion = {
    question: "Which option is correct?",
    options: ["One", "Two", "Three", "Four"],
    answer: "A",
    choosenAnswer: "",
    explanation: "One is correct.",
    type: "multiChoice",
    isCorrect: false,
};

const validDefinitionQuestion = {
    question: "Define context switching.",
    answer: "It saves a process state and loads another process state.",
    keywords: ["process", "saving", "loading", "state"],
    choosenAnswer: "",
    explanation: "The CPU changes the active process.",
    type: "definition",
    isCorrect: false,
};

describe("validateStudyMaterial", () => {
    it("accepts a valid quiz containing multiple-choice and definition questions", () => {
        expect(
            validateStudyMaterial(
                [
                    {
                        id: "quiz-1",
                        title: "Operating systems",
                        questions: [
                            validMultipleChoiceQuestion,
                            validDefinitionQuestion,
                        ],
                    },
                ],
                "Quizzes",
            ),
        ).toBe(true);
    });

    it("rejects quiz questions with invalid multiple-choice options", () => {
        expect(
            validateStudyMaterial(
                [
                    {
                        id: "quiz-1",
                        title: "Invalid quiz",
                        questions: [
                            {
                                ...validMultipleChoiceQuestion,
                                options: ["One", "Two"],
                            },
                        ],
                    },
                ],
                "Quizzes",
            ),
        ).toBe(false);
    });

    it("returns field-level errors for invalid definition questions", () => {
        const issues = getStudyMaterialValidationIssues(
            [
                {
                    id: "quiz-1",
                    title: "Invalid definition quiz",
                    questions: [
                        {
                            ...validDefinitionQuestion,
                            keywords: [],
                        },
                    ],
                },
            ],
            "Quizzes",
        );

        expect(issues).toContainEqual({
            path: "[0].questions[0].keywords",
            message: "must contain at least one expected key point",
        });
    });

    it("rejects definition questions without usable keywords", () => {
        expect(
            validateStudyMaterial(
                [
                    {
                        id: "quiz-1",
                        title: "Invalid definition quiz",
                        questions: [
                            { ...validDefinitionQuestion, keywords: [] },
                        ],
                    },
                ],
                "Quizzes",
            ),
        ).toBe(false);
    });

    it("rejects duplicate imported IDs", () => {
        const quiz = {
            id: "quiz-1",
            title: "Quiz",
            questions: [validMultipleChoiceQuestion],
        };

        expect(validateStudyMaterial([quiz, quiz], "Quizzes")).toBe(false);
    });

    it("rejects a non-array import without throwing", () => {
        expect(validateStudyMaterial("not an array", "Quizzes")).toBe(false);
    });

    it("validates required flashcard fields", () => {
        expect(
            validateStudyMaterial(
                [
                    {
                        id: "flashcard-1",
                        title: "Biology",
                        cards: [
                            {
                                front: "What is ATP?",
                                back: "Energy currency of the cell",
                                level: "easy",
                            },
                        ],
                    },
                ],
                "Flashcards",
            ),
        ).toBe(true);
    });

    it("validates required summary fields", () => {
        expect(
            validateStudyMaterial(
                [
                    {
                        id: "summary-1",
                        title: "Chapter one",
                        content: "Summary content",
                        isCompleted: false,
                    },
                ],
                "Summaries",
            ),
        ).toBe(true);
    });
});
