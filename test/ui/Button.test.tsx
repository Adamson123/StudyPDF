// filepath: c:\Users\Admin\StudyPDF\test\ui\Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button"; // Alias should still work

describe("Button Component", () => {
  it("should render with the correct text", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeDefined();
  });

  it("should call onClick prop when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText("Click Me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
