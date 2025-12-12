import { env } from "@/env";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const clientSignal = request.signal;

    try {
        const data = await request.json();
        const { prompt, text } = data;

        const apiKey = env.GEMINI_API_KEY;
        console.log(apiKey);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: text }, { text: prompt }],
                    },
                ],
            }),
            signal: clientSignal,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API error:", errorData);
            return new NextResponse("API Error", { status: response.status });
        }

        const result = await response.json();

        const textResponse = result.candidates[0].content.parts[0].text;

        return new NextResponse(textResponse, { status: 200 });
    } catch (error: any) {
        if (error.name === "AbortError" || clientSignal.aborted) {
            console.log("Data generation cancelled in gemini by client");
            return new NextResponse("Request aborted", { status: 499 });
        }
        console.error("Gemini API error:", error);
        return new NextResponse("Server error", { status: 500 });
    }
}
