import axiosClient from "@/lib/axiosClient";

const geminiClient = async ({
  prompt,
  text,
  abortSignal,
}: {
  prompt: string;
  text: string;
  abortSignal: AbortSignal;
}) => {
  try {
    const response = await axiosClient.post(
      "/gemini",
      { prompt, text },
      { signal: abortSignal },
    );
    return response.data;
  } catch (error) {
    console.error("Error in Gemini client:", error);
    return { error: "Error generating data" };
  }
};

export default geminiClient;
