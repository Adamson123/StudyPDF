export const splitTextIntoChunksBySize = (
  pdfString: string[],
  chunkSize = 30000,
) => {
  const chunks: string[] = [];
  let chunk = "";

  for (let para of pdfString) {
    if ((chunk + para).length > chunkSize) {
      chunks.push(chunk);
      chunk = "";
    }
    chunk += para + "\n";
  }
  if (chunk) chunks.push(chunk);
  return chunks;
};

/**
 * Splits an array of text chunks into smaller chunks if the total number of questions
 * exceeds the maximum allowed per chunk. This function ensures that the chunks are
 * divided evenly to accommodate the specified number of questions.
 *
 * @param chunks - An array of strings representing the text chunks to be split.
 * @param amountOfQuestions - The total number of questions to be distributed across the chunks.
 * @returns A new array of strings with the adjusted chunks.
 *
 * @remarks
 * - The maximum number of questions allowed per chunk is defined as `maxQuestionsPerChunk`.
 * - If the total number of questions divided by the maximum allowed per chunk is less than
 *   the number of chunks, the original chunks are returned without modification.
 * - The function splits each chunk into two parts (first half and second half) and adds
 *   them to the new chunks array.
 *
 * @example
 * ```typescript
 * const chunks = ["chunk1", "chunk2"];
 * const amountOfQuestions = 50;
 * const result = splitChunksByQuestionLimitByQuestionLimit(chunks, amountOfQuestions);
 * console.log(result); // Outputs the adjusted chunks
 * ```
 */
export const splitChunksByQuestionLimit = (
  chunks: string[],
  amountOfQuestions: number,
) => {
  const maxQuestionsPerChunk = 15; // Maximum questions allowed per chunk

  // If the total number of questions divided by the max allowed per chunk is less than the number of chunks, return the original chunks
  if (amountOfQuestions / maxQuestionsPerChunk < chunks.length) return chunks;

  const numOfsplitsNeeded = Math.ceil(amountOfQuestions / maxQuestionsPerChunk); // Calculate the number of splits needed

  const newChunks: string[] = []; // Array to store the newly split chunks

  let textIndexToSplit = 0; // Index to track which chunk to split
  for (let index = 0; index < numOfsplitsNeeded; index++) {
    if (textIndexToSplit <= chunks.length - 1) {
      const texts = chunks[textIndexToSplit] as string; // Get the current chunk to split

      // Split the chunk into two parts: first half and second half
      const firstTextPart = texts.substring(0, texts.length / 2);
      const secTextPart = texts.substring(texts.length / 2);

      // Add the split parts to the new chunks array
      newChunks.push(firstTextPart, secTextPart);

      textIndexToSplit++; // Move to the next chunk
    } else {
      // If all chunks have been processed, reset the chunks array to the new chunks
      chunks = newChunks;
      textIndexToSplit = 0; // Reset the index for further processing
    }
  }

  // Log the number of new chunks created compared to the original chunks
  console.log(
    `New chunks created: new:${newChunks.length} old:${chunks.length}`,
  );

  return newChunks; // Return the newly created chunks
};

//export const splitTextPlaceholder = () => {};

export const splitTextSummaryByQuestionLimit = () => {};
