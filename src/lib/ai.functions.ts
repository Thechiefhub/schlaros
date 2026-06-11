import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  system: z.string().optional(),
  prompt: z.string().min(1),
  json: z.boolean().optional(),
  model: z.string().optional(),
});

export const generateAI = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const messages = [
      ...(data.system ? [{ role: "system", content: data.system }] : []),
      { role: "user", content: data.prompt },
    ];

    const body: Record<string, unknown> = {
      model: data.model ?? "google/gemini-3-flash-preview",
      messages,
    };
    if (data.json) body.response_format = { type: "json_object" };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 429) throw new Error("Rate limit hit. Try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please top up your workspace.");
      throw new Error(`AI error ${res.status}: ${text.slice(0, 200)}`);
    }
    const out = await res.json();
    const content: string = out?.choices?.[0]?.message?.content ?? "";
    if (data.json) {
      try {
        return { data: JSON.parse(content) as unknown, raw: content };
      } catch {
        // try to extract JSON
        const m = content.match(/\{[\s\S]*\}/);
        if (m) return { data: JSON.parse(m[0]) as unknown, raw: content };
        throw new Error("AI returned invalid JSON");
      }
    }
    return { data: content, raw: content };
  });
