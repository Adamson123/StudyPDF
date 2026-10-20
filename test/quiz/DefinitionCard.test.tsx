import DefinitionCard from "@/components/quiz/DefinitionCard";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("DefinitionCard", () => {
    const setQuestions = vi.fn();
    const setCurrentQuestion = vi.fn();

    it("toggles expected key points visibility while answering", () => {
        render(
            <DefinitionCard
                index={0}
                numberOfQuestions={1}
                question={{
                    question: "Define osmosis.",
                    answer: "Movement of water across a semipermeable membrane.",
                    keywords: ["water", "semipermeable membrane"],
                    choosenAnswer: "",
                    explanation: "Osmosis is passive transport of water.",
                    type: "definition",
                    isCorrect: false,
                }}
                setQuestions={setQuestions}
                setCurrentQuestion={setCurrentQuestion}
            />,
        );

        expect(screen.queryByText("Expected key points:")).toBeNull();

        fireEvent.click(
            screen.getByRole("button", { name: /show expected key points/i }),
        );
        expect(screen.getByText("Expected key points:")).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: /hide expected key points/i }),
        );
        expect(screen.queryByText("Expected key points:")).toBeNull();
    });

    it("shows matched and missing key points only when toggled on after submission", () => {
        render(
            <DefinitionCard
                index={0}
                numberOfQuestions={1}
                question={{
                    question: "Define photosynthesis.",
                    answer: "Plants use light to make glucose.",
                    keywords: ["light", "glucose"],
                    choosenAnswer: "Plants use light.",
                    explanation: "Glucose production is the key output.",
                    type: "definition",
                    isCorrect: false,
                    matchedKeywords: ["light"],
                }}
                setQuestions={setQuestions}
                setCurrentQuestion={setCurrentQuestion}
            />,
        );

        expect(screen.queryByText("Matched:")).toBeNull();
        expect(screen.queryByText("Missing:")).toBeNull();

        fireEvent.click(
            screen.getByRole("button", { name: /show expected key points/i }),
        );

        expect(screen.getByText("Matched:")).toBeInTheDocument();
        expect(screen.getByText("light")).toBeInTheDocument();
        expect(screen.getByText("Missing:")).toBeInTheDocument();
        expect(screen.getByText("glucose")).toBeInTheDocument();
    });
});
