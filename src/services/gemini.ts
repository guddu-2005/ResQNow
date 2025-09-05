import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function askGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
