import Viewer from "@/components/reader/viewer/Viewer";
import { render, screen } from "@testing-library/react";
import { expect, vi } from "vitest";

const mockUseRender = vi.fn();

// Use the closure, not a variable reference, in the factory
vi.mock("@/components/reader/viewer/useRender", () => {
  return {
    __esModule: true,
    default: (...args: any[]) => mockUseRender(...args),
  };
});

describe("Viewer Component", () => {
  it("detects the correct number of pdf pages", () => {
    mockUseRender.mockReturnValueOnce({
      renderPDFsOnView: vi.fn(),
      loadingPDF: false,
      pdfPages: [
        { index: 1 },
        { index: 2 },
        { index: 3 },
        { index: 4 },
        { index: 5 },
      ],
    });

    render(<Viewer />);
    expect(screen.getByText("/5")).toBeInTheDocument();
  });
});
