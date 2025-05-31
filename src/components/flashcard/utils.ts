export const getColorClass = (level: string) => {
  switch (level) {
    case "hard":
      return {
        color: "bg-red-500/10 text-red-300 hover:bg-red-500/20",
        border: "border-red-300",
      };
    case "medium":
      return {
        color: "bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20",
        border: "border-yellow-300",
      };
    case "easy":
      return {
        color: "bg-green-500/10 text-green-300 hover:bg-green-500/20",
        border: "border-green-300",
      };
    default:
      return {
        color: "bg-border/35 text-white hover:bg-border/50",
        border: "border-gray-500",
      };
  }
};
