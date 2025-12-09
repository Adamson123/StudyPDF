import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const clientSignal = request.signal;

  try {
    const data = await request.json();
    const { prompt, text } = data;

    const genAI = new GoogleGenerativeAI("AIzaSyDPZgM38X_Pk0IvEufzJ5R8cxbqbtvD_2E");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const result = await model.generateContent(
      [
        {
          text,
        },
        prompt,
      ],
      { signal: clientSignal },
    );
    const textResponse = result.response.text();
    return new NextResponse(textResponse, { status: 200 });
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Data generation cancelled in gemini by client");
      return new NextResponse("Request aborted", { status: 499 });
    }
    console.error("Gemini API error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
