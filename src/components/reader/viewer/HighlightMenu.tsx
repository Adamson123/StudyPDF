import Input from "@/components/ui/input";
import { Trash } from "lucide-react";
import {
  ChangeEvent,
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

const HighlightMenu = ({
  highlightClass,
  pdfsContainer,
  setHighlightClass,
}: {
  highlightClass: string;
  setHighlightClass: Dispatch<SetStateAction<string>>;
  pdfsContainer: RefObject<HTMLDivElement>;
}) => {
  const highlightMenuRef = useRef<HTMLDivElement | null>(null);
  const [highlightColor, setHighlightColor] = useState("");

  useEffect(() => {
    const highlightMenuElement = highlightMenuRef.current as HTMLDivElement;
    const pdfsContainerElement = pdfsContainer.current as HTMLDivElement;
    if (!highlightClass) return;
    const highlights = pdfsContainerElement.querySelectorAll<HTMLSpanElement>(
      "." + highlightClass,
    )!;
    const firstHighlight = highlights[0] as HTMLSpanElement;
    let lowestLeft = firstHighlight.getBoundingClientRect().left;

    const type = firstHighlight.classList.value.split(" ")[0];
    if (type === "bgColor") {
      setHighlightColor(firstHighlight.style.backgroundColor);
    } else {
      //TODO: Fix bug of red always, we will use dataset next time
      setHighlightColor(firstHighlight.style.borderBottomColor);
      firstHighlight.style.borderBottomColor =
        firstHighlight.style.borderBottomColor;
      console.log(firstHighlight.style.borderBottomColor);
    }

    const lastHighlight = highlights[highlights.length - 1] as HTMLSpanElement;
    const lastHighlightRect = lastHighlight.getBoundingClientRect();

    let highestRight = lastHighlightRect.right;

    highlights.forEach((highlight, i) => {
      // highlight.style.border = "2px solid green";
      const { right, left } = highlight.getBoundingClientRect();
      highestRight = right > highestRight ? right : highestRight;

      lowestLeft = left < lowestLeft ? left : lowestLeft;
    });

    highlightMenuElement.style.top =
      lastHighlightRect.top +
      lastHighlightRect.height +
      10 +
      window.scrollY +
      "px";

    const width =
      window.innerWidth - (window.innerWidth - highestRight + lowestLeft);

    highlightMenuElement.style.left =
      lowestLeft +
      width / 2 -
      highlightMenuElement.getBoundingClientRect().width / 2 +
      window.scrollX +
      "px";

    // console.log(
    //   lowestLeft + firstHighlight.getBoundingClientRect().width / 2,
    //   highestRight / 2,
    //   { lowestLeft, highestRight, width },
    //   lastHighlightRect.right,
    //   width,
    // );
  }, [highlightClass]);

  const deleteHighlight = () => {
    const pdfsContainerElement = pdfsContainer.current as HTMLDivElement;
    const highlights = pdfsContainerElement.querySelectorAll<HTMLSpanElement>(
      "." + highlightClass,
    )!;
    highlights.forEach((highlight, i) => {
      highlight.remove();
    });
    setHighlightClass("");
  };

  const changeHighlightsBgColor = (event: ChangeEvent<HTMLInputElement>) => {
    const pdfsContainerElement = pdfsContainer.current as HTMLDivElement;
    const highlights = pdfsContainerElement.querySelectorAll<HTMLSpanElement>(
      "." + highlightClass,
    )!;
    const type = highlights[0]?.classList.value.split(" ")[0];
    const color = event.target.value;
    highlights.forEach((highlight, i) => {
      if (type === "bgColor") {
        highlight.style.backgroundColor = color + 90;
      } else {
        highlight.style.borderBottomColor = color;
      }
    });

    setHighlightColor(color);
  };

  return (
    <div
      ref={highlightMenuRef}
      className="absolute flex items-center rounded bg-background"
    >
      <button
        onClick={deleteHighlight}
        className="border-r border-gray-border p-3"
      >
        <Trash className="mw-6 h-6" />{" "}
      </button>
      <button className="p-3">
        <div className="relative h-6 w-6 overflow-hidden rounded-full">
          <Input
            value={highlightColor}
            onChange={changeHighlightsBgColor}
            type="color"
            className="h-full w-full"
          />
          {/* Color input overlay */}
          <span
            style={{
              backgroundColor: highlightColor,
            }}
            className="pointer-events-none absolute inset-0 rounded-full"
          ></span>
        </div>
      </button>
    </div>
  );
};

export default HighlightMenu;
