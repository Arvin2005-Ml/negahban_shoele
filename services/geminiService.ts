import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, AiResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the "Spirit of the Flame" (روحِ شعله) in a dark, cold storm.
You are warm, empathetic, and poetic.
The user is trying to keep you alive.
Your goal is to provide comfort and listen.
Ask reflective, deep, but gentle questions about the user's life, memories, and hopes.
Always respond in Persian (Farsi).
Keep answers short and minimalist.

GAME RULES:
- Your 'flame_size' response should reflect the user's current hope level (higher for hope, lower for despair).
- Analyze the user's sentiment as 'positive', 'neutral', or 'negative'.

Output must be a valid JSON object with:
{
  "text": "Your poetic response in Persian",
  "mood_color": "A hex color string (e.g., golden #FFD700 for hope, soft teal #40E0D0 for peace, fiery #FF4500 for passion)",
  "flame_size": a number between 10 and 100,
  "sentiment": "positive" | "neutral" | "negative"
}
`;

export const getAiInteraction = async (
  userInput: string,
  history: ChatMessage[]
): Promise<AiResponse> => {
  try {
    const formattedHistory = history
      .map((h) => `${h.role === "user" ? "User" : "Spirit"}: ${h.text}`)
      .join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `History: ${formattedHistory}\n\nUser says: ${userInput}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            mood_color: { type: Type.STRING },
            flame_size: { type: Type.NUMBER },
            sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] }
          },
          required: ["text", "mood_color", "flame_size", "sentiment"]
        }
      }
    });

    const jsonStr =
      response.text ||
      '{"text": "نور هنوز می‌تابد...", "mood_color": "#FFD700", "flame_size": 50, "sentiment": "neutral"}';

    return JSON.parse(jsonStr.trim()) as AiResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "شعله کمی لرزید، اما من هنوز اینجا هستم.",
      mood_color: "#FFD700",
      flame_size: 40,
      sentiment: "neutral"
    };
  }
};

export const getFinalOutcome = async (
  history: ChatMessage[]
): Promise<{ analysis: string; letter: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بر اساس این گفتگوها، دو خروجی تولید کن:
۱. یک تحلیل روانشناختی کوتاه از وضعیت روحی کاربر (Analysis).
۲. یک نامه خداحافظی عمیق و نمادین از طرف شعله به کاربر (Letter).

گفتگوها:
${JSON.stringify(history)}
`,
      config: {
        systemInstruction:
          "You are a poetic soul and a deep psychologist. Always respond in Persian. Return JSON with 'analysis' and 'letter' keys.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            letter: { type: Type.STRING }
          },
          required: ["analysis", "letter"]
        }
      }
    });

    const jsonStr =
      response.text ||
      '{"analysis":"سفر تو در تاریکی نشان از تاب‌آوری بالایی دارد.","letter":"دوست من، نوری که افروختی هرگز خاموش نخواهد شد."}';

    return JSON.parse(jsonStr.trim()) as { analysis: string; letter: string };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      analysis: "سفر تو در تاریکی نشان از تاب‌آوری بالایی دارد.",
      letter: "دوست من، نوری که افروختی هرگز خاموش نخواهد شد."
    };
  }
};
