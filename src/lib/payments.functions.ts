import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const envSchema = z.enum(["sandbox", "live"]);

export const resolvePaddlePrice = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ priceId: z.string().min(1), environment: envSchema }).parse(d))
  .handler(async ({ data }) => {
    const { gatewayFetch } = await import("./paddle.server");
    const res = await gatewayFetch(data.environment, `/prices?external_id=${encodeURIComponent(data.priceId)}`);
    const result = (await res.json()) as { data?: Array<{ id: string }> };
    if (!result.data?.length) throw new Error("Price not found");
    return result.data[0]!.id;
  });

function weekStart(): string {
  const now = new Date();
  const day = (now.getUTCDay() + 6) % 7; // Monday = 0
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day));
  return monday.toISOString().slice(0, 10);
}

export type Entitlement = {
  pro: boolean;
  used: number;
  limit: number;
  remaining: number;
  status: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  priceId: string | null;
};

const FREE_LIMIT = 3;

/** Reads the signed-in user's plan and this week's Roundtable usage. */
export const getEntitlement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ environment: envSchema }).parse(d))
  .handler(async ({ data, context }): Promise<Entitlement> => {
    const { data: subs } = await context.supabase
      .from("subscriptions")
      .select("status,current_period_end,cancel_at_period_end,price_id")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1);

    const sub = subs?.[0] ?? null;
    const end = sub?.current_period_end ? new Date(sub.current_period_end).getTime() : null;
    const stillInPeriod = end === null || end > Date.now();
    const pro = !!sub && stillInPeriod && ["active", "trialing", "past_due", "canceled"].includes(sub.status);

    const { data: usage } = await context.supabase
      .from("roundtable_usage")
      .select("count")
      .eq("user_id", context.userId)
      .eq("week_start", weekStart())
      .maybeSingle();

    const used = usage?.count ?? 0;
    return {
      pro,
      used,
      limit: FREE_LIMIT,
      remaining: pro ? Number.POSITIVE_INFINITY : Math.max(0, FREE_LIMIT - used),
      status: sub?.status ?? null,
      cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
      currentPeriodEnd: sub?.current_period_end ?? null,
      priceId: sub?.price_id ?? null,
    };
  });

/** Records one Roundtable run; throws when a free user is out of runs this week. */
export const consumeRoundtable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ environment: envSchema }).parse(d))
  .handler(async ({ data, context }) => {
    const ent = await getEntitlement({ data });
    if (ent.pro) return { allowed: true as const, remaining: Number.POSITIVE_INFINITY };
    if (ent.remaining <= 0) throw new Error("LIMIT_REACHED");

    const week = weekStart();
    const { error } = await context.supabase
      .from("roundtable_usage")
      .upsert(
        { user_id: context.userId, week_start: week, count: ent.used + 1, updated_at: new Date().toISOString() },
        { onConflict: "user_id,week_start" },
      );
    if (error) throw new Error(error.message);
    return { allowed: true as const, remaining: Math.max(0, ent.limit - (ent.used + 1)) };
  });

/** Opens Paddle's hosted customer portal for the signed-in subscriber. */
export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ environment: envSchema }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: subs } = await context.supabase
      .from("subscriptions")
      .select("paddle_customer_id,paddle_subscription_id")
      .eq("user_id", context.userId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1);

    const sub = subs?.[0];
    if (!sub) throw new Error("No subscription found");

    const { gatewayFetch } = await import("./paddle.server");
    const res = await gatewayFetch(data.environment, `/customers/${sub.paddle_customer_id}/portal-sessions`, {
      method: "POST",
      body: JSON.stringify({ subscription_ids: [sub.paddle_subscription_id] }),
    });
    const json = (await res.json()) as { data?: { urls?: { general?: { overview?: string } } } };
    const url = json.data?.urls?.general?.overview;
    if (!url) throw new Error("Could not open the billing portal");
    return url;
  });
