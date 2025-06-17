import "@testing-library/jest-dom"; // Adds custom matchers for DOM assertions

// Mock DOMMatrix for Node.js environment
global.DOMMatrix = class {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;

  constructor() {}
} as unknown as typeof DOMMatrix;

// Mock environment variables
process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT =
  "https://example.com/openai/deployments/gpt-4o/chat/completions?api-version=2025-01-01-preview";
process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY = "mock-api-key";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
