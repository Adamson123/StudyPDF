"use server";
import { env } from "@/env";

const generateWithAzureOpenAi = async ({
  prompt,
  text,
  abortCtrl,
}: {
  prompt: string;
  text: string;
  abortCtrl: AbortController;
}) => {
  const url = env.AZURE_OPENAI_ENDPOINT;
  const apiKey = env.AZURE_OPENAI_API_KEY;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const body = {
    messages: [
      {
        role: "user",
        content: prompt,
      },
      { role: "user", content: text },
    ],
    max_tokens: 4096,
    temperature: 0.8,
    top_p: 1,
    model: "gpt-4o",
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: abortCtrl.signal,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`❌ Error on chunk :`, data);
      return { error: "Error generating data😥" };
    }

    const output = data.choices?.[0]?.message?.content;

    return output;
  } catch (err) {
    console.error(`❌ Error on chunk :`, err);
    return { error: "Error generating data😥" };
  }
};

export default generateWithAzureOpenAi;
