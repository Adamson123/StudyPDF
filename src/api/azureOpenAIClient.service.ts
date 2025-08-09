import axiosClient from "@/lib/axiosClient";

const azureOpenAIClient = async ({
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
      "/azure-openai",
      { prompt, text },
      { signal: abortSignal },
    );
    return response.data;
  } catch (error) {
    console.error("Error in azure open ai client:", error);
    return { error: "Error generating data" };
  }
};

export default azureOpenAIClient;
