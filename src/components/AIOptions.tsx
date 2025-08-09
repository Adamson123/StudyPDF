import { ChevronDown } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

const aiOptions: AIOption[] = [
  {
    value: "gemini",
    name: "Gemini",
    image: "/ai-images/gemini.png",
  },
  {
    value: "azure-openai",
    name: "Azure Openai",
    image: "/ai-images/azure-openai.png",
  },
];

const AIOptions = ({
  setSelectedAI,
}: {
  setSelectedAI: Dispatch<SetStateAction<AvailableAIOptions>>;
}) => {
  const [selectedOption, setSelectedOption] = useState<AIOption>({
    value: "gemini",
    name: "Gemini",
    image: "/ai-images/gemini.png",
  });
  const [openOptions, setOpenOptions] = useState(false);

  const onOptionChange = (option: AIOption) => {
    setSelectedOption(option);
    setSelectedAI(option.value);
    //  setOpenOptions(false);
  };

  return (
    <div
      onClick={() => setOpenOptions(!openOptions)}
      className="relative w-full cursor-pointer rounded bg-input p-2 outline-none"
    >
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span>{selectedOption.name}</span>
          <img
            src={selectedOption.image}
            alt={selectedOption.name + " image"}
            className="h-4 w-4 object-cover"
          />
        </div>
        <ChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${openOptions ? "rotate-180" : "rotate-0"}`}
        />
      </div>

      <ul
        className={`absolute left-0 top-[42px] w-full bg-input transition-all duration-200 ${openOptions ? "max-h-24 overflow-y-auto" : "pointer-events-none max-h-0 overflow-hidden"}`}
      >
        {aiOptions.map((option, i) => (
          <li
            className="flex cursor-pointer items-center gap-1 border-b border-gray-500 px-3 py-2 text-sm"
            key={i}
            onClick={() => onOptionChange(option)}
          >
            <span>{option.name}</span>
            <img
              src={option.image}
              alt={option.name + " image"}
              className="h-4 w-4 object-cover"
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AIOptions;
