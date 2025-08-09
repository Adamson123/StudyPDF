import { env } from "@/env";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const clientSignal = request.signal;

  try {
    const data = await request.json();
    const { prompt, text } = data;

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

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: clientSignal,
    });

    const azureOpenAIResponse = await res.json();

    if (!res.ok) {
      console.error(`Error from openai:`, azureOpenAIResponse);
      throw new Error("Error generating data");
    }

    const textResponse = azureOpenAIResponse.choices?.[0]?.message?.content;

    return new NextResponse(textResponse, { status: 200 });
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Data generation cancelled in azure openai by client");
      return new NextResponse("Request aborted", { status: 499 });
    }
    console.error("Azure openai API error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
