const parseAIJsonResponse = (response: string): any => {
  const startIndex = response.indexOf("[");
  if (startIndex === -1) {
    throw new Error("💥 No opening '[' found in the response!");
  }

  let openBrackets = 0;
  let endIndex = -1;

  for (let i = startIndex; i < response.length; i++) {
    if (response[i] === "[") openBrackets++;
    if (response[i] === "]") openBrackets--;

    if (openBrackets === 0) {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    throw new Error("💥 Couldn't find the matching closing ']' for the array.");
  }

  const jsonSlice = response.slice(startIndex, endIndex + 1);

  let parsed;
  try {
    console.log("🧪 JSON slice:", jsonSlice);
    parsed = JSON.parse(jsonSlice);
  } catch (err) {
    console.error("💥 Failed to parse JSON:");
    throw err;
  }

  return parsed;
};

export default parseAIJsonResponse;
