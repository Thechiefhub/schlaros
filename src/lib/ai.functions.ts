import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

const Input = z.object({
  system: z.string().optional(),
  prompt: z.string().min(1),
  json: z.boolean().optional(),
  model: z.string().optional(),
});

export const generateAI = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY. Please provide your Gemini API Key in Settings.");
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const targetModel = data.model && !data.model.includes("gemini-1.5") && !data.model.includes("gemini-2.0")
      ? data.model
      : "gemini-3.8-flash";

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: data.prompt,
      config: {
        systemInstruction: data.system,
        responseMimeType: data.json ? "application/json" : undefined,
      },
    });

    const content = response.text || "";
    let parsed: unknown = null;

    if (data.json) {
      try {
        parsed = JSON.parse(content);
      } catch {
        const m = content.match(/\{[\s\S]*\}/);
        if (m) {
          try {
            parsed = JSON.parse(m[0]);
          } catch {
            throw new Error("AI returned invalid JSON structure");
          }
        } else {
          throw new Error("AI did not output a valid JSON block");
        }
      }
    }

    return { text: content, json: data.json ? JSON.stringify(parsed) : null };
  });
