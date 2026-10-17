import FillAnswerCard from "@/components/quiz/FillAnswerCard";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

describe("FillAnswerCard", () => {
    const baseQuestion: FillAnswerTypes = {
        question: "The _____ fox jumps _____ the log.",
        answer: ["quick", "over"],
        explanation: "Common pangram fragment.",
        choosenAnswer: [],
        type: "fill",
        isCorrect: false,
    };

    it("outlines submitted blanks by correctness and shows correct answers per blank", () => {
        render(
            <FillAnswerCard
                index={0}
                numberOfQuestions={1}
                question={{
                    ...baseQuestion,
                    choosenAnswer: ["  QUICK ", "under"],
                }}
                setQuestions={vi.fn()}
                setCurrentQuestion={vi.fn()}
            />,
        );

        const inputs = screen.getAllByRole("textbox");
        expect(inputs.length).toBe(2);
        expect(inputs[0]?.className).toContain("border-green-500");
        expect(inputs[1]?.className).toContain("border-red-500");

        expect(screen.queryByText("quick")).toBeTruthy();
        expect(screen.queryByText("over")).toBeTruthy();
    });

    it("syncs input values when choosenAnswer changes", () => {
        const { rerender } = render(
            <FillAnswerCard
                index={0}
                numberOfQuestions={1}
                question={baseQuestion}
                setQuestions={vi.fn()}
                setCurrentQuestion={vi.fn()}
            />,
        );

        rerender(
            <FillAnswerCard
                index={0}
                numberOfQuestions={1}
                question={{
                    ...baseQuestion,
                    choosenAnswer: ["first", ""],
                }}
                setQuestions={vi.fn()}
                setCurrentQuestion={vi.fn()}
            />,
        );

        const inputs = screen.getAllByRole("textbox");
        expect((inputs[0] as HTMLInputElement).value).toBe("first");
        expect((inputs[1] as HTMLInputElement).value).toBe("");
    });
});
