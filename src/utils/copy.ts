// Fallback copy using temporary textarea
const fallbackCopy = (text: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    console.log("Fallback: text copied");
    alert("Text copied to clipboard!");
  } catch (err) {
    console.error("Fallback failed:", err);
  }
  document.body.removeChild(textarea);
};

const copy = (text: string) => {
  if (!text) return console.warn("❌ No text provided to copy.");

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("✅ Text copied to clipboard");
        alert("Text copied to clipboard!");
        // TODO: show a success toast or popup here
      })
      .catch((err) => {
        console.error("❌ Failed to copy text:", err);
      });
  } else {
    fallbackCopy(text);
  }
};

export default copy;
