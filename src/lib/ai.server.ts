import type { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

export class AiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Msg = { role: "system" | "user"; content: string };

async function callGateway(messages: Msg[]): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiError("The thinking engine is not configured.", 401);

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = "The table could not be reached. Try again in a moment.";
    if (res.status === 429) message = "Too many requests right now. Give it a few seconds.";
    if (res.status === 402)
      message = "This workspace is out of AI credits. Add credits to keep thinking.";
    if (res.status === 403) message = "AI access is blocked for this workspace.";
    console.error("AI gateway error", res.status, text.slice(0, 500));
    throw new AiError(message, res.status);
  }

  const json = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return json.choices?.[0]?.message?.content ?? "";
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new AiError("The table returned something unreadable.", 500);
  }
}

export async function generateStructured<T>(
  schema: z.ZodType<T>,
  system: string,
  user: string,
): Promise<T> {
  let lastIssue = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const messages: Msg[] = [
      { role: "system", content: system },
      {
        role: "user",
        content: attempt === 0 ? user : `${user}\n\nYour previous reply was invalid: ${lastIssue}\nReturn valid JSON only, matching the required shape exactly.`,
      },
    ];
    const raw = await callGateway(messages);
    try {
      const parsed = schema.safeParse(extractJson(raw));
      if (parsed.success) return parsed.data;
      lastIssue = parsed.error.issues
        .slice(0, 6)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
    } catch (err) {
      if (err instanceof AiError && err.status !== 500) throw err;
      lastIssue = "response was not valid JSON";
    }
  }
  throw new AiError("The table could not organise its thoughts. Try again.", 500);
}

export const BASE_PROMPT = `You are one participant in "Borrowed Brain", a structured decision roundtable.

Rules that override everything else:
- Stay faithful to your assigned worldview. You are a way of thinking, not a personality act.
- Never disagree for entertainment. Only disagree where you genuinely reason differently.
- Concede strong arguments openly. Change your position when the argument warrants it.
- Clearly separate facts you were given from assumptions you are making.
- State uncertainty explicitly. Never invent details the user did not provide.
- Be concise and concrete. Prefer specifics over abstractions.
- You are a reasoning lens, not a licensed professional. Never claim credentials.
- Write in plain language, second person to the user. No headings, no markdown.
Return JSON only. No prose outside the JSON.`;
