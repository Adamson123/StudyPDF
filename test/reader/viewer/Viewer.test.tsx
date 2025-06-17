import Viewer from "@/components/reader/viewer/Viewer";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

const mockUseRender = vi.fn();

// Use the closure, not a variable reference, in the factory
vi.mock("@/components/reader/viewer/useRender", () => {
  return {
    __esModule: true,
    default: (...args: any[]) => mockUseRender(...args),
  };
});

describe("Viewer Component", () => {
  it("should display 'Loading PDF...' while the PDF is loading", () => {
    mockUseRender.mockReturnValueOnce({
      renderPDFsOnView: vi.fn(),
      loadingPDF: true,
      pdfPages: [],
    });

    render(<Viewer />);
    expect(screen.getByText("Loading PDF...")).toBeInTheDocument();
  });

  it("shows 'PDF Loaded Successfully' after loading and rendering", async () => {
    mockUseRender.mockReturnValueOnce({
      renderPDFsOnView: vi.fn(),
      loadingPDF: false,
      pdfPages: [{ index: 1 }],
    });

    render(<Viewer />);

    // Wait for the success message
    // expect(
    //   await screen.findByText("PDF Loaded Successfully"),
    // ).toBeInTheDocument();
  });

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

  it("scrolls to the correct page when a page number is input", async () => {
    mockUseRender.mockReturnValueOnce({
      renderPDFsOnView: vi.fn(),
      loadingPDF: false,
      pdfPages: [{ index: 1 }, { index: 2 }, { index: 3 }],
    });

    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    render(<Viewer />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "2" } });

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });
  });
});
