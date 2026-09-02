export type PaddleEnv = "sandbox" | "live";

const GATEWAY = "https://gateway.lovable.dev/paddle";

function connectionKey(env: PaddleEnv): string {
  const key = env === "live" ? process.env["PADDLE_LIVE_API_KEY"] : process.env["PADDLE_SANDBOX_API_KEY"];
  if (!key) throw new Error(`Missing Paddle connection key for ${env}`);
  return key;
}

export async function gatewayFetch(env: PaddleEnv, path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": process.env["LOVABLE_API_KEY"] ?? "",
      "X-Connection-Api-Key": connectionKey(env),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Paddle gateway error", res.status, text.slice(0, 500));
    throw new Error(`Paddle request failed (${res.status})`);
  }
  return res;
}

function webhookSecret(env: PaddleEnv): string {
  const secret =
    env === "live" ? process.env["PAYMENTS_LIVE_WEBHOOK_SECRET"] : process.env["PAYMENTS_SANDBOX_WEBHOOK_SECRET"];
  if (!secret) throw new Error(`Missing Paddle webhook secret for ${env}`);
  return secret;
}

function toCamel(input: unknown): unknown {
  if (Array.isArray(input)) return input.map(toCamel);
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      out[k.replace(/_([a-z0-9])/g, (_m, c: string) => c.toUpperCase())] = toCamel(v);
    }
    return out;
  }
  return input;
}

export const EventName = {
  SubscriptionCreated: "subscription.created",
  SubscriptionUpdated: "subscription.updated",
  SubscriptionCanceled: "subscription.canceled",
  TransactionCompleted: "transaction.completed",
  TransactionPaymentFailed: "transaction.payment_failed",
} as const;

export type PaddleEvent = { eventType: string; data: any };

/** Verifies the Paddle-Signature header (HMAC-SHA256 over `${ts}:${rawBody}`). */
export async function verifyWebhook(req: Request, env: PaddleEnv): Promise<PaddleEvent> {
  const header = req.headers.get("paddle-signature");
  const raw = await req.text();
  if (!header) throw new Error("Missing Paddle-Signature header");

  const parts = Object.fromEntries(
    header.split(";").map((p) => {
      const idx = p.indexOf("=");
      return [p.slice(0, idx), p.slice(idx + 1)];
    }),
  ) as Record<string, string>;

  const ts = parts["ts"];
  const h1 = parts["h1"];
  if (!ts || !h1) throw new Error("Malformed Paddle-Signature header");

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(webhookSecret(env)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(`${ts}:${raw}`));
  const expected = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (expected.length !== h1.length) throw new Error("Invalid Paddle signature");
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ h1.charCodeAt(i);
  if (diff !== 0) throw new Error("Invalid Paddle signature");

  const parsed = JSON.parse(raw) as { event_type: string; data: unknown };
  return { eventType: parsed.event_type, data: toCamel(parsed.data) };
}
